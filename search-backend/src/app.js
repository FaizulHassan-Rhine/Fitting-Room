const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const compression = require('compression');
const morgan     = require('morgan');

const connectDB  = require('./config/db');
const routes     = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { globalRateLimiter }             = require('./middleware/rateLimiter');

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
// connectDB() caches the connection — safe to call on every cold start
connectDB().catch((err) => {
  console.error('[DB] Connection failed:', err.message);
});

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowList  = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: allowList.length
      ? (origin, cb) => {
          // Allow server-to-server requests (no origin) and listed origins
          if (!origin || allowList.includes(origin)) return cb(null, true);
          cb(new Error('Not allowed by CORS'));
        }
      : '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    // Expose custom diagnostic headers to the client
    exposedHeaders: ['X-Cache', 'X-Response-Time', 'RateLimit-Limit', 'RateLimit-Remaining'],
    maxAge: 86400, // Browser can cache preflight for 24 h — cuts OPTIONS round-trips on mobile
  })
);

// ── Response compression (gzip / brotli) ─────────────────────────────────────
// Reduces JSON payload size by ~70 % — huge win for mobile networks
app.use(compression({ level: 6 }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── Response-time header ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  const t = Date.now();
  const originalWriteHead = res.writeHead;
  res.writeHead = function writeHeadWithTiming(...args) {
    if (!res.getHeader('X-Response-Time')) {
      res.setHeader('X-Response-Time', `${Date.now() - t}ms`);
    }
    return originalWriteHead.apply(this, args);
  };
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
app.use(API_PREFIX, routes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ── 404 & error handlers (must be last) ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
