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
};
