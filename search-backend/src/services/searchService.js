const Product    = require('../models/Product');
const SearchLog  = require('../models/SearchLog');
const cacheService = require('./cacheService');
const { CACHE_PREFIX, CACHE_TTL, PAGINATION } = require('../config/constants');
const { buildFlattenProductsStages, buildSafePriceNumberExpr } = require('../utils/productAggregation');

// ─────────────────────────────────────────────────────────────────────────────
// Main Search
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full search using an aggregation pipeline.
 *
 * WHY aggregation instead of Model.find():
 *   The `price` field is stored as a STRING ("3795.0") in the source data.
 *   Aggregation lets us inject { $addFields: { priceNum: { $toDouble: '$price' } } }
 *   so we can do numeric range filtering and price-based sorting correctly.
 *
 * Performance:
 *   - $text match uses the text index (O(log n))
 *   - $facet runs count + data + facets in a single DB round-trip
 *   - Results are lean (no Mongoose hydration) via aggregation
 *   - Two-layer cache wraps the whole thing
 */
async function search(params, meta = {}) {
  const liveFlag = String(params?.live ?? '').toLowerCase();
  const bypassCache = liveFlag === '1' || liveFlag === 'true' || liveFlag === 'yes';
  const cacheParams = { ...params };
  delete cacheParams.live;

  const {
    q         = '',
    brandName,
    minPrice,
    maxPrice,
    sort      = 'relevance',
    page      = PAGINATION.DEFAULT_PAGE,
    limit     = PAGINATION.DEFAULT_LIMIT,
    fields,
  } = params;

  const startMs  = Date.now();
  const cacheKey = cacheService.buildKey(CACHE_PREFIX.SEARCH, cacheParams);

  // ── Cache check ────────────────────────────────────────────────────────────
  if (!bypassCache) {
    const { data: cached, layer } = await cacheService.get(cacheKey);
    if (cached) {
      _logSearch({ query: q, resultsCount: cached.pagination.total, cacheHit: true, cacheLayer: layer, responseTimeMs: Date.now() - startMs, ...meta });
      return { ...cached, cached: true, cacheLayer: layer };
    }
  }

  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip     = (pageNum - 1) * limitNum;
  const hasText  = q && q.trim().length > 0;

  // ── Build pipeline ─────────────────────────────────────────────────────────
  const pipeline = [...buildFlattenProductsStages()];

  // 1) Base filters
  const baseMatch = {};
  if (brandName) baseMatch.brandName = { $regex: new RegExp(`^${_escapeRegex(brandName)}$`, 'i') };
  pipeline.push({ $match: baseMatch });

  // 2) Dynamic full search (brandName/title/description, any token match)
  if (hasText) {
    const normalizedQuery = q.trim();
    const queryRegex = new RegExp(_escapeRegex(normalizedQuery), 'i');
    const queryTokens = _tokenizeQuery(normalizedQuery);
    const tokenRegexes = queryTokens.map((t) => new RegExp(`\\b${_escapeRegex(t)}`, 'i'));

    // Early prune before scoring for better performance on large collections.
    pipeline.push({
      $match: {
        $or: [
          { title: queryRegex },
          { brandName: queryRegex },
          { description: queryRegex },
          ...tokenRegexes.flatMap((regex) => ([
            { title: regex },
            { brandName: regex },
            { description: regex },
          ])),
        ],
      },
    });

    // Weighted relevance scoring:
    // - exact brand/title match gets highest score
    // - phrase containment next
    // - each token contributes additional score
    pipeline.push({
      $addFields: {
        _score: _buildDynamicScoreExpr(normalizedQuery, tokenRegexes),
      },
    });

    pipeline.push({ $match: { _score: { $gt: 0 } } });
  }

  // 3) Convert string price → numeric for filtering and sorting
  pipeline.push({ $addFields: { priceNum: buildSafePriceNumberExpr('$price') } });

  // 4) Price range filter (requires priceNum from step 3)
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter = {};
    if (minPrice !== undefined) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = parseFloat(maxPrice);
    pipeline.push({ $match: { priceNum: priceFilter } });
  }

  // 5) Sort
  pipeline.push({ $sort: _buildSort(sort, hasText) });

  // 6) $facet: run data + total count + brand facets in one round-trip
  const projection = _buildProjection(fields);

  pipeline.push({
    $facet: {
      data:   [{ $skip: skip }, { $limit: limitNum }, { $project: projection }],
      total:  [{ $count: 'count' }],
      brands: [
        { $group: { _id: '$brandName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ],
      priceRanges: [
        {
          $bucket: {
            groupBy: '$priceNum',
            boundaries: [0, 500, 1000, 2000, 3000, 5000, 10000],
            default: '10000+',
            output: { count: { $sum: 1 } },
          },
        },
      ],
    },
  });

  const [result] = await Product.aggregate(pipeline);

  const total        = result?.total?.[0]?.count ?? 0;
  const responseTimeMs = Date.now() - startMs;

  const response = {
    data: result?.data ?? [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
    facets: {
      brands:      result?.brands      ?? [],
      priceRanges: result?.priceRanges ?? [],
    },
    meta: {
      query: q || null,
      sort,
      responseTimeMs,
      cached: false,
    },
  };

  await cacheService.set(cacheKey, response, CACHE_TTL.SEARCH);
  _logSearch({ query: q, resultsCount: total, filters: { brandName, minPrice, maxPrice }, sort, page: pageNum, cacheHit: false, responseTimeMs, ...meta });

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// Autocomplete
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prefix-match autocomplete on the `title` field.
 * Anchored regex (^query) is fast when there is an index on title
 * (the text index covers it well enough for this scale).
 */
async function autocomplete(q) {
  if (!q || q.trim().length < 2) return [];

  const normalized = q.trim().toLowerCase();
  const cacheKey   = cacheService.buildKey(CACHE_PREFIX.AUTOCOMPLETE, { q: normalized });

  const { data: cached } = await cacheService.get(cacheKey);
  if (cached) return cached;

  const escaped = _escapeRegex(normalized);
  const containsRegex = new RegExp(escaped, 'i');
  const startsRegex = new RegExp(`^${escaped}`, 'i');

  const hits = await Product.aggregate([
    ...buildFlattenProductsStages(),
    {
      $match: {
        $or: [{ title: containsRegex }, { brandName: containsRegex }],
      },
    },
    {
      $addFields: {
        _acScore: {
          $add: [
            { $cond: [{ $regexMatch: { input: { $ifNull: ['$title', ''] }, regex: startsRegex } }, 30, 0] },
            { $cond: [{ $regexMatch: { input: { $ifNull: ['$brandName', ''] }, regex: startsRegex } }, 20, 0] },
            { $cond: [{ $regexMatch: { input: { $ifNull: ['$title', ''] }, regex: containsRegex } }, 10, 0] },
            { $cond: [{ $regexMatch: { input: { $ifNull: ['$brandName', ''] }, regex: containsRegex } }, 8, 0] },
          ],
        },
      },
    },
    { $sort: { _acScore: -1, _id: -1 } },
    { $limit: 8 },
    { $project: { title: 1, url: 1, brandName: 1, price: 1, currency: 1, images: { $slice: ['$images', 1] }, _id: 0 } },
  ]);

  const suggestions = hits.map((h) => ({
    label:     h.title,
    slug:      Product.slugFromUrl ? Product.slugFromUrl(h.url) : h.url?.split('/').pop(),
    brandName: h.brandName,
    price:     h.price,
    currency:  h.currency || 'BDT',
    image:     h.images?.[0] || null,
  }));

  await cacheService.set(cacheKey, suggestions, CACHE_TTL.AUTOCOMPLETE);
  return suggestions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trending
// ─────────────────────────────────────────────────────────────────────────────

async function getTrending(limit = 10) {
  const n        = Math.min(parseInt(limit, 10) || 10, 50);
  const cacheKey = `${CACHE_PREFIX.SEARCH}trending:${n}`;

  const { data: cached } = await cacheService.get(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: since }, query: { $ne: '' } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: n },
    { $project: { _id: 0, query: '$_id', count: 1 } },
  ]);

  await cacheService.set(cacheKey, trending, CACHE_TTL.TRENDING);
  return trending;
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

function _buildSort(sort, hasText) {
  const map = {
    relevance:  hasText ? { _score: -1 } : { _id: -1 },
    price_asc:  { priceNum: 1 },
    price_desc: { priceNum: -1 },
    newest:     { _id: -1 },
  };
  return map[sort] || map.relevance;
}

function _buildProjection(fields) {
  // Default — lightweight for list views, one image only
  const defaults = {
    title: 1, url: 1, brandName: 1,
    price: 1, currency: 1,
    images: { $slice: ['$images', 1] },
    description: 1,
    _id: 1,
  };

  if (!fields) return defaults;

  return fields.split(',').reduce((acc, f) => {
    acc[f.trim()] = 1;
    return acc;
  }, {});
}

function _escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _tokenizeQuery(query) {
  if (!query) return [];
  return [...new Set(
    query
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2)
      .slice(0, 8)
  )];
}

function _field(field) {
  return { $ifNull: [field, ''] };
}

function _scoreCond(regex, field, weight) {
  return {
    $cond: [
      { $regexMatch: { input: _field(field), regex } },
      weight,
      0,
    ],
  };
}

function _buildDynamicScoreExpr(query, tokenRegexes) {
  const escaped = _escapeRegex(query);
  const exactRegex = new RegExp(`^${escaped}$`, 'i');
  const phraseRegex = new RegExp(escaped, 'i');

  return {
    $add: [
      // Exact high-confidence matches
      _scoreCond(exactRegex, '$brandName', 120),
      _scoreCond(exactRegex, '$title', 110),

      // Full query phrase matches
      _scoreCond(phraseRegex, '$title', 70),
      _scoreCond(phraseRegex, '$brandName', 60),
      _scoreCond(phraseRegex, '$description', 25),

      // Any token match (dynamic word-level relevance)
      ...tokenRegexes.map((r) => _scoreCond(r, '$title', 20)),
      ...tokenRegexes.map((r) => _scoreCond(r, '$brandName', 18)),
      ...tokenRegexes.map((r) => _scoreCond(r, '$description', 8)),
    ],
  };
}

async function _logSearch(data) {
  try {
    if (data.query) await SearchLog.create(data);
  } catch {
    // Analytics — never block the main flow
  }
}

module.exports = { search, autocomplete, getTrending };
