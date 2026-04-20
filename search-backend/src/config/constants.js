module.exports = {
  CACHE_PREFIX: {
    SEARCH: 'search:',
    PRODUCT: 'product:',
    AUTOCOMPLETE: 'ac:',
    FACETS: 'facets:',
  },

  CACHE_TTL: {
    SEARCH: parseInt(process.env.CACHE_TTL_SEARCH, 10) || 300,           // 5 min
    PRODUCT: parseInt(process.env.CACHE_TTL_PRODUCT, 10) || 600,         // 10 min
    AUTOCOMPLETE: parseInt(process.env.CACHE_TTL_AUTOCOMPLETE, 10) || 3600, // 1 hr
    FACETS: 300,                                                           // 5 min
    TRENDING: 300,
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  SEARCH: {
    MIN_QUERY_LENGTH: 1,
    MAX_QUERY_LENGTH: 200,
  },

  SORT_OPTIONS: ['relevance', 'price_asc', 'price_desc', 'newest'],
};
