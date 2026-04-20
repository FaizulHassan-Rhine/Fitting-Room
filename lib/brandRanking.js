const DEFAULT_WEIGHTS = {
  popularity: 0.25,
  demand: 0.25,
  sales: 0.30,
  tryOnFrequency: 0.20,
};

const RANKING_WEIGHTS_KEY = "admin_brand_ranking_weights";

/**
 * Get ranking weights from admin settings
 */
export function getRankingWeights() {
  if (typeof window === "undefined") return DEFAULT_WEIGHTS;
  
  const stored = localStorage.getItem(RANKING_WEIGHTS_KEY);
  if (stored) {
    try {
      const weights = JSON.parse(stored);
      // Validate weights sum to 1.0
      const sum = weights.popularity + weights.demand + weights.sales + weights.tryOnFrequency;
      if (Math.abs(sum - 1.0) < 0.01) {
        return weights;
      }
    } catch (e) {
      // Invalid stored data, use defaults
    }
  }
  
  return DEFAULT_WEIGHTS;
}

/**
 * Set ranking weights (admin only)
 */
export function setRankingWeights(weights) {
  if (typeof window === "undefined") return;
  
  // Validate weights sum to 1.0
  const sum = weights.popularity + weights.demand + weights.sales + weights.tryOnFrequency;
  if (Math.abs(sum - 1.0) >= 0.01) {
    throw new Error("Ranking weights must sum to 1.0");
  }
  
  localStorage.setItem(RANKING_WEIGHTS_KEY, JSON.stringify(weights));
}

/**
 * Calculate brand ranking score
 */
export function calculateBrandScore(metrics, weights) {
  const w = weights || getRankingWeights();
  
  // Normalize metrics to 0-1 scale (assuming max values for normalization)
  // In production, these would be based on actual data ranges
  const maxPopularity = 10000;
  const maxDemand = 5000;
  const maxSales = 1000;
  const maxTryOns = 2000;
  
  const normalizedPopularity = Math.min(metrics.popularity / maxPopularity, 1);
  const normalizedDemand = Math.min(metrics.demand / maxDemand, 1);
  const normalizedSales = Math.min(metrics.sales / maxSales, 1);
  const normalizedTryOns = Math.min(metrics.tryOnFrequency / maxTryOns, 1);
  
  // Calculate weighted score
  const score = 
    normalizedPopularity * w.popularity +
    normalizedDemand * w.demand +
    normalizedSales * w.sales +
    normalizedTryOns * w.tryOnFrequency;
  
  return score;
}

/**
 * Rank brands by their calculated scores
 */
export function rankBrands(brands, weights) {
  const scoredBrands = brands.map(brand => ({
    ...brand,
    score: calculateBrandScore(brand, weights),
  }));
  
  return scoredBrands.sort((a, b) => b.score - a.score);
}

