const router = require('express').Router();
const searchController = require('../../controllers/searchController');
const { searchValidator, autocompleteValidator } = require('../../validators/searchValidator');
const { searchRateLimiter } = require('../../middleware/rateLimiter');

// GET /api/v1/search?q=sneakers&category=footwear&sort=relevance&page=1&limit=20
router.get('/', searchRateLimiter, searchValidator, searchController.searchProducts);

// GET /api/v1/search/autocomplete?q=sneak
router.get('/autocomplete', autocompleteValidator, searchController.autocomplete);

// GET /api/v1/search/trending?limit=10
router.get('/trending', searchController.trending);

module.exports = router;
