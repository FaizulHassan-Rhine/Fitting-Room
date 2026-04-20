const mongoose = require('mongoose');

/**
 * Schema matches the real Yellow Clothing dataset already in MongoDB.
 *
 * Supported document shapes:
 * {
 *   // Shape A (domains wrapper):
 *   domains: [
 *     {
 *       domain: "https://www.yellowclothing.net",
 *       total_products: 772,
 *       products: [ { url, title, brandName, ... } ]
 *     }
 *   ],
 *
 *   // Shape B (root wrapper):
 *   domain: "https://www.yellowclothing.net",
 *   total_products: 772,
 *   products: [ { url, title, brandName, ... } ]
 *
 *   // Shape C (flat):
 *   url: "https://www.yellowclothing.net/products/w-ethnic-2-pcs-98",
 *   title: "Relaxed fit Printed Two-Piece Ethnic Set",
 *   ...
 * }
 *
 * strict: false — any extra fields scraped from the site pass through without errors.
 */

const productSchema = new mongoose.Schema(
  {
    url:         { type: String, trim: true },
    title:       { type: String, trim: true },
    description: { type: String, trim: true },
    brandName:   { type: String, trim: true },
    brandUrl:    { type: String, trim: true },
    price:       { type: String },  // "3795.0" — kept as string to match source data
    currency:    { type: String, default: 'BDT' },
    images:      [{ type: String }],
  },
  {
    // Collection name is already 'products' in MongoDB
    collection: 'products',
    // Allow fields not listed above (future scraper additions won't throw)
    strict: false,
    timestamps: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Single text index that supports both flat and wrapper (products[]) shapes.
// MongoDB allows only ONE text index per collection.
productSchema.index(
  {
    title: 'text',
    description: 'text',
    brandName: 'text',
    'products.title': 'text',
    'products.description': 'text',
    'products.brandName': 'text',
  },
  {
    weights: {
      title: 10,
      brandName: 5,
      description: 1,
      'products.title': 10,
      'products.brandName': 5,
      'products.description': 1,
    },
    name: 'product_text_idx',
  }
);

// Fast brand filter
productSchema.index({ brandName: 1 });

// Fast URL-based product lookup (used by the detail endpoint)
productSchema.index({ url: 1 });

// Lookup indexes for wrapper-shape collections (products array)
productSchema.index({ 'products.brandName': 1 });
productSchema.index({ 'products.url': 1 });
productSchema.index({ 'domains.products.brandName': 1 });
productSchema.index({ 'domains.products.url': 1 });

// ─── Static helper ─────────────────────────────────────────────────────────────

/**
 * Extract the slug (last URL path segment) from a product URL.
 * "https://www.yellowclothing.net/products/w-ethnic-2-pcs-98" → "w-ethnic-2-pcs-98"
 */
productSchema.statics.slugFromUrl = function (url) {
  if (!url) return '';
  return url.split('/').filter(Boolean).pop();
};

module.exports = mongoose.model('Product', productSchema);
