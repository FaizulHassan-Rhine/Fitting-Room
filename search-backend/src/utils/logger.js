/**
 * Minimal structured logger.
 * In production (Vercel) logs go to stdout and are captured by the platform.
 * In development coloured output is used via morgan; this utility covers
 * application-level events that morgan doesn't handle.
 */

const isDev = process.env.NODE_ENV !== 'production';

function info(message, meta = {}) {
  log('INFO', message, meta);
}

function warn(message, meta = {}) {
  log('WARN', message, meta);
}

function logError(message, err = null, meta = {}) {
  const extra = err ? { error: err.message, stack: isDev ? err.stack : undefined } : {};
  log('ERROR', message, { ...meta, ...extra });
}

function log(level, message, meta) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  // Structured JSON in production (easy to parse in log aggregators)
  // Human-readable in development
  if (isDev) {
    const colour = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
    console.log(`${colour}[${level}]\x1b[0m ${message}`, Object.keys(meta).length ? meta : '');
  } else {
    console.log(JSON.stringify(entry));
  }
}

module.exports = { info, warn, error: logError };
