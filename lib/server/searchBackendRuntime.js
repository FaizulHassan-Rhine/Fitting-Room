import { createRequire } from "module";

const require = createRequire(import.meta.url);

const connectDB = require("../../search-backend/src/config/db");
const searchService = require("../../search-backend/src/services/searchService");
const Product = require("../../search-backend/src/models/Product");
const { success, error, notFound } = require("../../search-backend/src/utils/apiResponse");
const { CACHE_PREFIX, CACHE_TTL } = require("../../search-backend/src/config/constants");
const cacheService = require("../../search-backend/src/services/cacheService");
const {
  buildFlattenProductsStages,
  buildSafePriceNumberExpr,
} = require("../../search-backend/src/utils/productAggregation");

function getRequestMeta(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : request.headers.get("x-real-ip");
  return {
    ip: ip || null,
    userAgent: request.headers.get("user-agent") || null,
  };
}

function withJsonHeaders(headers = {}) {
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

function urlToSlug(url) {
  return url?.split("/").filter(Boolean).pop() || "";
}

const rateLimitStore = globalThis.__nextApiRateLimitStore || new Map();
if (!globalThis.__nextApiRateLimitStore) {
  globalThis.__nextApiRateLimitStore = rateLimitStore;
}

function getRateLimitConfig() {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "", 10) || 60_000;
  const max = parseInt(process.env.RATE_LIMIT_MAX || "", 10) || 100;
  return { windowMs, max };
}

function enforceRateLimit(request) {
  const { windowMs, max } = getRateLimitConfig();
  const { ip } = getRequestMeta(request);
  const key = ip || "unknown";
  const now = Date.now();

  const existing = rateLimitStore.get(key);
  let bucket =
    !existing || now - existing.windowStart >= windowMs
      ? { windowStart: now, count: 0 }
      : existing;

  if (bucket.count >= max) {
    const resetMs = Math.max(0, bucket.windowStart + windowMs - now);
    const resetSeconds = Math.ceil(resetMs / 1000);
    return {
      limited: true,
      headers: {
        "RateLimit-Limit": String(max),
        "RateLimit-Remaining": "0",
        "RateLimit-Reset": String(resetSeconds),
      },
      retryAfterSeconds: resetSeconds,
    };
  }

  bucket.count += 1;
  rateLimitStore.set(key, bucket);

  // Opportunistic cleanup for old buckets to keep memory bounded.
  if (rateLimitStore.size > 5000) {
    const staleBefore = now - windowMs;
    for (const [bucketKey, value] of rateLimitStore) {
      if (value.windowStart < staleBefore) {
        rateLimitStore.delete(bucketKey);
      }
    }
  }

  return {
    limited: false,
    headers: {
      "RateLimit-Limit": String(max),
      "RateLimit-Remaining": String(Math.max(0, max - bucket.count)),
      "RateLimit-Reset": String(Math.ceil((bucket.windowStart + windowMs - now) / 1000)),
    },
    retryAfterSeconds: 0,
  };
}

export {
  connectDB,
  searchService,
  Product,
  success,
  error,
  notFound,
  CACHE_PREFIX,
  CACHE_TTL,
  cacheService,
  buildFlattenProductsStages,
  buildSafePriceNumberExpr,
  getRequestMeta,
  withJsonHeaders,
  urlToSlug,
  enforceRateLimit,
};
