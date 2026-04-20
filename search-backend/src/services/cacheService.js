const { memCache, getRedisClient } = require('../config/cache');

/**
 * Two-layer cache strategy:
 *
 *   L1 → NodeCache (in-process memory, ~60s, zero network overhead)
 *   L2 → Upstash Redis (distributed, persists across serverless instances)
 *
 * Read path:  L1 hit → return immediately
 *             L1 miss + L2 hit → warm L1, return
 *             Both miss → caller fetches from DB, then sets both layers
 *
 * Write path: always write L1 (capped to 60s) + L2 (full TTL)
 */

async function get(key) {
  // ── L1 ───────────────────────────────────────────────
  const memHit = memCache.get(key);
  if (memHit !== undefined) {
    return { data: memHit, layer: 'L1' };
  }

  // ── L2 ───────────────────────────────────────────────
  const redis = getRedisClient();
  if (redis) {
    try {
      const redisHit = await redis.get(key);
      if (redisHit !== null && redisHit !== undefined) {
        // Back-fill L1 so the next request in this instance is free
        memCache.set(key, redisHit, 60);
        return { data: redisHit, layer: 'L2' };
      }
    } catch (err) {
      console.warn(`[Cache] Redis GET failed for "${key}": ${err.message}`);
    }
  }

  return { data: null, layer: null };
}

async function set(key, value, ttl = 300) {
  // L1 — capped at 60s even when the full TTL is longer
  memCache.set(key, value, Math.min(ttl, 60));

  // L2 — full TTL
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttl });
    } catch (err) {
      console.warn(`[Cache] Redis SET failed for "${key}": ${err.message}`);
    }
  }
}

async function del(key) {
  memCache.del(key);
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      console.warn(`[Cache] Redis DEL failed for "${key}": ${err.message}`);
    }
  }
}

// Invalidate all keys matching a prefix pattern (e.g. after a product update)
async function delByPrefix(prefix) {
  const l1Keys = memCache.keys().filter((k) => k.startsWith(prefix));
  if (l1Keys.length) memCache.del(l1Keys);

  const redis = getRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length) await redis.del(...keys);
    } catch (err) {
      console.warn(`[Cache] Redis pattern DEL failed: ${err.message}`);
    }
  }
}

/**
 * Build a deterministic, sorted cache key from a params object.
 * Undefined / null / empty-string values are excluded so that
 * { q: 'shoes', page: 1 } and { page: 1, q: 'shoes' } produce the same key.
 */
function buildKey(prefix, params) {
  const clean = Object.keys(params)
    .sort()
    .reduce((acc, k) => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== '') acc[k] = v;
      return acc;
    }, {});
  return prefix + JSON.stringify(clean);
}

module.exports = { get, set, del, delByPrefix, buildKey };
