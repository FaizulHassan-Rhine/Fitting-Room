const rateLimit = require('express-rate-limit');

// Applied to every route — generous ceiling
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000, // 1 minute
  max:      parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests — please slow down and try again shortly.',
  },
});

// Stricter limit for the search endpoint (expensive queries)
const searchRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many search requests — please wait a moment.',
  },
});

module.exports = { globalRateLimiter, searchRateLimiter };
