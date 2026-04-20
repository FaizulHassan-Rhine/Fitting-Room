const { validationResult } = require('express-validator');
const searchService = require('../services/searchService');
const { success, validationError } = require('../utils/apiResponse');

// GET /api/v1/search?q=&category=&brand=&minPrice=&maxPrice=&minRating=&inStock=&sort=&page=&limit=
async function searchProducts(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(validationError(errors.array()));
    }

    const meta = {
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    };

    const result = await searchService.search(req.query, meta);

    res.set('X-Cache', result.cached ? `HIT-${result.cacheLayer}` : 'MISS');
    // Allow CDN/browser to cache for 60s, serve stale up to 5 min while revalidating
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return res.status(200).json(success('Search results fetched', result));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/search/autocomplete?q=
async function autocomplete(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json(success('Suggestions', []));
    }

    const suggestions = await searchService.autocomplete(q);

    res.set('X-Cache', 'AC');
    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json(success('Autocomplete suggestions', suggestions));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/search/trending?limit=10
async function trending(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const results = await searchService.getTrending(limit);

    res.set('Cache-Control', 'public, max-age=300');
    return res.status(200).json(success('Trending searches', results));
  } catch (err) {
    next(err);
  }
}

module.exports = { searchProducts, autocomplete, trending };
