const Product      = require('../models/Product');
const cacheService = require('../services/cacheService');
const { success, notFound } = require('../utils/apiResponse');
const { CACHE_PREFIX, CACHE_TTL } = require('../config/constants');
const { buildFlattenProductsStages, buildSafePriceNumberExpr } = require('../utils/productAggregation');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Extract the last URL path segment → used as the product "slug"
// "https://www.yellowclothing.net/products/w-ethnic-2-pcs-98" → "w-ethnic-2-pcs-98"
function urlToSlug(url) {
  return url?.split('/').filter(Boolean).pop() || '';
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// GET /api/v1/products/:slug
// slug = last segment of the product URL, e.g. "w-ethnic-2-pcs-98"
async function getProduct(req, res, next) {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json(notFound('Product slug is required'));

    const cacheKey = `${CACHE_PREFIX.PRODUCT}${slug}`;
    const { data: cached } = await cacheService.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(success('Product found', cached));
    }

    // Match by URL tail inside flattened product stream
    const [product] = await Product.aggregate([
      ...buildFlattenProductsStages(),
      { $match: { url: { $regex: `/${slug}$`, $options: 'i' } } },
      { $limit: 1 },
    ]);

    if (!product) return res.status(404).json(notFound('Product not found'));

    // Add a convenient slug field to the response
    product.slug = slug;

    await cacheService.set(cacheKey, product, CACHE_TTL.PRODUCT);
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json(success('Product found', product));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/products?brandName=YELLOW&page=1&limit=20
async function listProducts(req, res, next) {
  try {
    const { brandName, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip     = (pageNum - 1) * limitNum;

    // Build aggregation to handle string price
    const pipeline = [...buildFlattenProductsStages()];

    const baseMatch = {};
    if (brandName) baseMatch.brandName = { $regex: new RegExp(`^${brandName}$`, 'i') };
    if (Object.keys(baseMatch).length) pipeline.push({ $match: baseMatch });

    pipeline.push({ $addFields: { priceNum: buildSafePriceNumberExpr('$price') } });

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) priceFilter.$lte = parseFloat(maxPrice);
      pipeline.push({ $match: { priceNum: priceFilter } });
    }

    pipeline.push({ $sort: { _id: -1 } });

    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limitNum },
          {
            $project: {
              title: 1, url: 1, brandName: 1,
              price: 1, currency: 1,
              images: { $slice: ['$images', 1] },
              description: 1,
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    });

    const [result] = await Product.aggregate(pipeline);
    const total    = result?.total?.[0]?.count ?? 0;

    // Attach slug to each product for easy frontend routing
    const data = (result?.data ?? []).map((p) => ({
      ...p,
      slug: urlToSlug(p.url),
    }));

    return res.status(200).json(
      success('Products fetched', {
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      })
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/products/featured  — returns first 12 products (no featured flag in data)
async function getFeatured(req, res, next) {
  try {
    const cacheKey = `${CACHE_PREFIX.PRODUCT}featured`;
    const { data: cached } = await cacheService.get(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(success('Featured products', cached));
    }

    const products = await Product.aggregate([
      ...buildFlattenProductsStages(),
      { $sort: { sourceDocumentId: -1 } },
      { $limit: 12 },
      {
        $project: {
          title: 1,
          url: 1,
          brandName: 1,
          price: 1,
          currency: 1,
          images: { $slice: ['$images', 1] },
          description: 1,
          sourceDomain: 1,
        },
      },
    ]);

    const data = products.map((p) => ({ ...p, slug: urlToSlug(p.url) }));

    await cacheService.set(cacheKey, data, CACHE_TTL.PRODUCT);
    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json(success('Featured products', data));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/products/brands  — all brand names with product counts
async function getBrands(req, res, next) {
  try {
    const cacheKey = `${CACHE_PREFIX.PRODUCT}brands`;
    const { data: cached } = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(success('Brands', cached));

    const brands = await Product.aggregate([
      ...buildFlattenProductsStages(),
      { $group: { _id: '$brandName', count: { $sum: 1 }, brandUrl: { $first: '$brandUrl' } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1, brandUrl: 1 } },
    ]);

    await cacheService.set(cacheKey, brands, CACHE_TTL.PRODUCT);
    return res.status(200).json(success('Brands', brands));
  } catch (err) {
    next(err);
  }
}

module.exports = { getProduct, listProducts, getFeatured, getBrands };
