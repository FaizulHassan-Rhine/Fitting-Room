/**
 * Standardised JSON response envelope used by every endpoint.
 *
 * Shape:
 *   { success, statusCode, message, data, timestamp }
 */

function success(message, data = null, statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

function error(message, details = null, statusCode = 500) {
  const body = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
  if (details !== null && details !== undefined) body.details = details;
  return body;
}

function validationError(errors) {
  return {
    success: false,
    statusCode: 400,
    message: 'Validation failed',
    details: errors.map((e) => ({ field: e.path || e.param, message: e.msg })),
    timestamp: new Date().toISOString(),
  };
}

function notFound(message = 'Resource not found') {
  return error(message, null, 404);
}

module.exports = { success, error, validationError, notFound };
