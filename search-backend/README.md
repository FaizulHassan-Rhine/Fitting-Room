# Search Backend — Express.js + MongoDB + Upstash Redis

High-performance, production-ready search API built for speed, scalability, and mobile-first efficiency.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Cache L1 | NodeCache (in-process memory) |
| Cache L2 | Upstash Redis (HTTP, serverless-safe) |
| Deployment | Vercel (serverless) |
| Validation | express-validator |
| Security | Helmet + CORS + Rate Limiting |
| Compression | gzip via `compression` |

---

## Project Structure

```
search-backend/
├── api/
│   └── index.js             # Vercel entry point + local dev server
├── src/
│   ├── app.js               # Express app (middleware, routes, error handling)
│   ├── config/
│   │   ├── db.js            # Mongoose connection (serverless-cached)
│   │   ├── cache.js         # NodeCache (L1) + Upstash Redis (L2)
│   │   └── constants.js     # TTL, pagination, sort options
│   ├── controllers/
│   │   ├── searchController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── errorHandler.js  # Global error + 404 handler
│   │   └── rateLimiter.js   # Global + per-endpoint rate limiting
│   ├── models/
│   │   ├── Product.js       # Product schema with text + compound indexes
│   │   └── SearchLog.js     # Search analytics (auto-expires after 30 days)
│   ├── routes/
│   │   ├── index.js
│   │   └── v1/
│   │       ├── searchRoutes.js
│   │       └── productRoutes.js
│   ├── services/
│   │   ├── cacheService.js  # Two-layer cache (get/set/del/buildKey)
│   │   └── searchService.js # Core search, autocomplete, trending
│   ├── utils/
│   │   ├── apiResponse.js   # Standardised response envelope
│   │   ├── logger.js        # Structured logger (JSON in prod)
│   │   └── seeder.js        # Seeds 200 dummy products
│   └── validators/
│       └── searchValidator.js
├── .env.example
├── .gitignore
├── package.json
└── vercel.json
```

---

## Quick Start (Local)

### 1. Clone & Install

```bash
cd search-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/searchdb
# Optional — leave blank to use in-memory cache only
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 3. Seed the Database

```bash
npm run seed
```

Seeds 200 realistic dummy products across 8 categories.  
To wipe and reseed: `npm run seed:clear && npm run seed`

### 4. Start the Dev Server

```bash
npm run dev
```

Server starts at **http://localhost:5000**

---

## All API Endpoints

Base URL (local): `http://localhost:5000/api/v1`

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Full-text search with filters + pagination |
| GET | `/search/autocomplete` | Prefix autocomplete suggestions |
| GET | `/search/trending` | Top searches in the last 7 days |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products with basic filters |
| GET | `/products/featured` | Featured products |
| GET | `/products/categories` | All categories with counts |
| GET | `/products/:slug` | Single product by slug |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

---

## Postman — Full Test Collection

Import the requests below or create them manually.

### 1. Health Check
```
GET http://localhost:5000/health
```

---

### 2. Search — Basic
```
GET http://localhost:5000/api/v1/search?q=shoes
```

**Response includes:** `data[]`, `pagination`, `facets`, `meta.responseTimeMs`

---

### 3. Search — Full Filters
```
GET http://localhost:5000/api/v1/search
    ?q=laptop
    &category=electronics
    &brand=TechNova
    &minPrice=100
    &maxPrice=1000
    &minRating=3.5
    &inStock=true
    &sort=price_asc
    &page=1
    &limit=10
```

**Sort options:** `relevance` | `price_asc` | `price_desc` | `rating` | `newest` | `popular`

---

### 4. Search — No Keyword (browse all)
```
GET http://localhost:5000/api/v1/search?sort=popular&limit=20
```

---

### 5. Search — Specific fields only (lighter payload)
```
GET http://localhost:5000/api/v1/search?q=jacket&fields=name,slug,price,rating
```

---

### 6. Autocomplete
```
GET http://localhost:5000/api/v1/search/autocomplete?q=sn
```

Returns up to 8 prefix-matched suggestions.

---

### 7. Trending Searches
```
GET http://localhost:5000/api/v1/search/trending?limit=10
```

---

### 8. List Products
```
GET http://localhost:5000/api/v1/products?page=1&limit=20
GET http://localhost:5000/api/v1/products?category=electronics
GET http://localhost:5000/api/v1/products?brand=TechNova&inStock=true
```

---

### 9. Featured Products
```
GET http://localhost:5000/api/v1/products/featured
```

---

### 10. Categories
```
GET http://localhost:5000/api/v1/products/categories
```

---

### 11. Single Product
```
GET http://localhost:5000/api/v1/products/<slug>
```

Get a slug from the seed output, e.g. `technova-ultra-laptop-g5-3`

---

## Response Headers to Check

| Header | Meaning |
|--------|---------|
| `X-Cache: MISS` | Result came from MongoDB |
| `X-Cache: HIT-L1` | Served from in-memory cache |
| `X-Cache: HIT-L2` | Served from Upstash Redis |
| `X-Response-Time` | Total request time in ms |
| `RateLimit-Remaining` | How many requests left this window |

---

## Performance Architecture

### MongoDB Indexes
- **Text index** on `name`, `tags`, `brand`, `shortDescription`, `description` with custom weights — name matches score 10x higher than description
- **Compound indexes** for every common filter + sort combination
- **TTL index** on SearchLog (auto-deletes after 30 days)
- **Covered queries** — projections match index fields to avoid document fetches

### Caching (Two Layers)
```
Request → L1 (memory, ~60s) → L2 (Redis, 5-60 min) → MongoDB
```
- Cache keys are deterministic + sorted (same params = same key regardless of order)
- Facets, autocomplete, and trending each have separate TTLs
- `delByPrefix()` for targeted cache invalidation after updates

### Query Optimizations
- `.lean()` on all read queries — 30% faster, skips Mongoose document hydration
- `$slice: 1` on images — sends only first image in list views (huge bandwidth saving)
- `Promise.all()` for count + results + facets — all run in parallel
- Async search logging — `_logSearch` is fire-and-forget, never blocks response

### Mobile / Network Optimizations
- `compression` middleware — gzip reduces JSON payloads ~70%
- CORS `maxAge: 86400` — browsers cache preflight 24h, cuts OPTIONS round-trips
- Lightweight default projection for list views
- `stale-while-revalidate` cache headers — browser serves stale while fetching fresh

---

## Deploying to Vercel

### 1. Push to Git

```bash
git add .
git commit -m "search backend"
git push
```

### 2. Import project in Vercel
- Go to [vercel.com](https://vercel.com) → New Project
- Import your repo
- Set **Root Directory** to `search-backend`

### 3. Add Environment Variables in Vercel Dashboard

```
MONGODB_URI         = your Atlas URI
UPSTASH_REDIS_REST_URL   = your Upstash URL
UPSTASH_REDIS_REST_TOKEN = your Upstash token
NODE_ENV            = production
API_PREFIX          = /api/v1
ALLOWED_ORIGINS     = https://yourdomain.com
```

### 4. Deploy
Vercel auto-detects `vercel.json` and deploys `api/index.js` as a serverless function.

---

## MongoDB Atlas Setup Tips

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` in Network Access (required for Vercel dynamic IPs)
3. Create a database user with `readWrite` on your DB
4. Use the connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/searchdb`
5. After seeding, go to Atlas → Collections → Products → Indexes to confirm all indexes were created

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ | — | MongoDB Atlas connection string |
| `UPSTASH_REDIS_REST_URL` | Optional | — | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | — | Upstash Redis token |
| `PORT` | Optional | 5000 | Local dev port |
| `NODE_ENV` | Optional | development | `development` / `production` |
| `API_PREFIX` | Optional | /api/v1 | API route prefix |
| `ALLOWED_ORIGINS` | Optional | * | Comma-separated CORS origins |
| `CACHE_TTL_SEARCH` | Optional | 300 | Search cache TTL (seconds) |
| `CACHE_TTL_PRODUCT` | Optional | 600 | Product cache TTL (seconds) |
| `CACHE_TTL_AUTOCOMPLETE` | Optional | 3600 | Autocomplete cache TTL (seconds) |
| `RATE_LIMIT_WINDOW_MS` | Optional | 60000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | Optional | 100 | Max requests per window |
