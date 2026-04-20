const NodeCache = require('node-cache');

// L1 — in-memory cache (fast, per-instance, ~60s lifespan)
// On Vercel each function instance has its own memory, so this acts as a
// request-burst absorber while L2 Redis handles cross-instance consistency.
const memCache = new NodeCache({
  stdTTL: 60,           // default 60 s TTL
  checkperiod: 120,     // cleanup expired keys every 2 min
  useClones: false,     // skip deep-clone for speed (we never mutate cached values)
  maxKeys: 500,         // cap memory usage
});

// L2 — Upstash Redis (HTTP-based, works perfectly with Vercel serverless)
let redisClient = null;

function getRedisClient() {
  if (redisClient) return redisClient;

  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = process.env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;

  try {
    const { Redis } = require('@upstash/redis');
    redisClient = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });
    return redisClient;
  } catch {
    console.warn('[Cache] Upstash Redis unavailable — using in-memory cache only');
    return null;
  }
}

module.exports = { memCache, getRedisClient };
