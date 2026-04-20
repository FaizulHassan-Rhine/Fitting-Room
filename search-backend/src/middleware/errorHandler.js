const { error } = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);
    if (err.stack) console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(error('Validation failed', messages, 400));
  }

  // Mongoose bad ObjectId cast
  if (err.name === 'CastError') {
    return res.status(400).json(error('Invalid data format', null, 400));
  }

  // Mongoose duplicate key (e.g. duplicate slug)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json(error(`Duplicate value for "${field}"`, null, 409));
  }

  // CORS rejection
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json(error('CORS not allowed', null, 403));
  }

  // JSON body parse error (payload too large / malformed)
  if (err.type === 'entity.too.large') {
    return res.status(413).json(error('Request payload too large', null, 413));
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(error('Invalid JSON body', null, 400));
  }

  // Fallthrough
  const status  = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return res.status(status).json(error(message, null, status));
}

function notFoundHandler(req, res) {
  res.status(404).json(error(`Route "${req.method} ${req.originalUrl}" not found`, null, 404));
}

module.exports = { errorHandler, notFoundHandler };
