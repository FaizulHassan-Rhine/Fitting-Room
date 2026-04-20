import { getProducts } from "./productStorage";

/**
 * Generate subdomain slug from brand name
 */
export function generateSubdomainSlug(brandName) {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const BRANDS_STORAGE_KEY = "vto_brands";
const BRAND_METRICS_KEY = "vto_brand_metrics";

/**
 * Get all brands
 */
export function getBrands() {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(BRANDS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  
  return [];
}

/**
 * Get brand by ID
 */
export function getBrandById(brandId) {
  const brands = getBrands();
  return brands.find(b => b.id === brandId) || null;
}

/**
 * Create or update brand
 */
export function saveBrand(brand) {
  const brands = getBrands();
  const existingIndex = brands.findIndex(b => b.id === brand.id || b.email === brand.email);
  
  const brandData = {
    ...brand,
    popularity: 0,
    demand: 0,
    sales: 0,
    tryOnFrequency: 0,
  };
  
  if (existingIndex >= 0) {
    // Preserve metrics when updating
    brandData.popularity = brands[existingIndex].popularity;
    brandData.demand = brands[existingIndex].demand;
    brandData.sales = brands[existingIndex].sales;
    brandData.tryOnFrequency = brands[existingIndex].tryOnFrequency;
    brands[existingIndex] = brandData;
  } else {
    brands.push(brandData);
  }
  
  localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
  return brandData;
}

/**
 * Update brand metrics
 */
export function updateBrandMetrics(brandId, metrics) {
  const brands = getBrands();
  const brand = brands.find(b => b.id === brandId);
  
  if (brand) {
    if (metrics.popularity !== undefined) brand.popularity = metrics.popularity;
    if (metrics.demand !== undefined) brand.demand = metrics.demand;
    if (metrics.sales !== undefined) brand.sales = metrics.sales;
    if (metrics.tryOnFrequency !== undefined) brand.tryOnFrequency = metrics.tryOnFrequency;
    
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
  }
}

/**
 * Increment brand metric
 */
export function incrementBrandMetric(brandId, metric, amount = 1) {
  const brands = getBrands();
  const brand = brands.find(b => b.id === brandId);
  
  if (brand) {
    brand[metric] = (brand[metric] || 0) + amount;
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brands));
  }
}

/**
 * Get brand metrics from products
 */
export function calculateBrandMetricsFromProducts() {
  const products = getProducts();
  const brands = getBrands();
  
  // Calculate metrics from products
  const brandStats = {};
  
  products.forEach(product => {
    if (!brandStats[product.brand]) {
      brandStats[product.brand] = {
        popularity: 0,
        demand: 0,
        sales: 0,
        tryOnFrequency: 0,
      };
    }
    
    // Aggregate metrics
    brandStats[product.brand].popularity += product.views || 0;
    brandStats[product.brand].tryOnFrequency += product.tryOns || 0;
    // Demand could be based on search queries, wishlist adds, etc.
    // Sales would come from actual purchase data
  });
  
  // Update brand metrics
  brands.forEach(brand => {
    const stats = brandStats[brand.name];
    if (stats) {
      updateBrandMetrics(brand.id, stats);
    }
  });
}

/**
 * Get brand by name
 */
export function getBrandByName(brandName) {
  const brands = getBrands();
  return brands.find(b => b.name.toLowerCase() === brandName.toLowerCase()) || null;
}

/**
 * Resolve brand by URL slug or ID (e.g. "premium-wear" or registered brand id).
 * Use for /brands/[slug] so both product-page links (slug) and Discover links (id/slug) work.
 */
export function getBrandBySlugOrId(slugOrId) {
  const byId = getBrandById(slugOrId);
  if (byId) return byId;
  const all = getAllBrandsForDiscover();
  const slugLower = slugOrId.toLowerCase().trim();
  return all.find(b => generateSubdomainSlug(b.name) === slugLower || b.id.toLowerCase() === slugLower) || null;
}

/**
 * Get all brands for Discover page: registered brands + any brand name that appears on products.
 * So "all brands" includes both registered accounts and brands that only exist as product labels.
 */
export function getAllBrandsForDiscover() {
  const registered = getBrands();
  const products = getProducts();
  const registeredNames = new Set(registered.map(b => b.name.toLowerCase()));
  const metricsFromProducts = new Map();
  products.forEach(p => {
    if (!p.brand?.trim()) return;
    const key = p.brand.trim().toLowerCase();
    const prev = metricsFromProducts.get(key) || { popularity: 0, tryOnFrequency: 0 };
    metricsFromProducts.set(key, {
      popularity: prev.popularity + (p.views || 0),
      tryOnFrequency: prev.tryOnFrequency + (p.tryOns || 0),
    });
  });
  const result = [];
  registered.forEach(b => {
    const key = b.name.toLowerCase();
    const stats = metricsFromProducts.get(key);
    result.push({
      ...b,
      popularity: stats ? stats.popularity : b.popularity,
      tryOnFrequency: stats ? stats.tryOnFrequency : b.tryOnFrequency,
    });
  });
  metricsFromProducts.forEach((stats, key) => {
    if (registeredNames.has(key)) return;
    const name = products.find(p => p.brand?.trim().toLowerCase() === key)?.brand?.trim() || key;
    result.push({
      id: generateSubdomainSlug(name) || name,
      name,
      email: "",
      createdAt: new Date().toISOString(),
      popularity: stats.popularity,
      demand: 0,
      sales: 0,
      tryOnFrequency: stats.tryOnFrequency,
    });
  });
  return result;
}

