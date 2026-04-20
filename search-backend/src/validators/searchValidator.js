const { query } = require('express-validator');
const { SEARCH, PAGINATION } = require('../config/constants');

// Sort options available for the Yellow Clothing dataset
const SORT_OPTIONS = ['relevance', 'price_asc', 'price_desc', 'newest'];

const searchValidator = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: SEARCH.MAX_QUERY_LENGTH })
    .withMessage(`Query must not exceed ${SEARCH.MAX_QUERY_LENGTH} characters`),

  query('brandName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('brandName too long'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a non-negative number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a non-negative number'),

  query('sort')
    .optional()
    .isIn(SORT_OPTIONS)
    .withMessage(`sort must be one of: ${SORT_OPTIONS.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),

  query('fields')
    .optional()
    .isString()
    .withMessage('fields must be a comma-separated string'),
];

const autocompleteValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ max: 100 })
    .withMessage('Query must not exceed 100 characters'),
];

module.exports = { searchValidator, autocompleteValidator };
