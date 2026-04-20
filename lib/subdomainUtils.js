import { getBrandByName, getBrandById, getBrands } from "./brandStorage";
import { getProducts } from "./productStorage";

/**
 * Extract subdomain from hostname
 * Example: brandname.vto.ai -> brandname
 */
export function getSubdomainFromHost() {
  if (typeof window === "undefined") return null;
  
  const hostname = window.location.hostname;
  
  // Remove port if present
  const hostWithoutPort = hostname.split(":")[0];
  
  // Check if it's a subdomain format (e.g., brandname.vto.ai)
  const parts = hostWithoutPort.split(".");
  
  // For localhost development, check for subdomain.localhost
  if (hostWithoutPort.includes("localhost")) {
    const localhostParts = hostWithoutPort.split(".");
    if (localhostParts.length > 1 && localhostParts[0] !== "localhost") {
      return localhostParts[0];
    }
    // For development, allow query param or localStorage override
    const urlParams = new URLSearchParams(window.location.search);
    const subdomainParam = urlParams.get("subdomain");
    if (subdomainParam) {
      return subdomainParam;
    }
    // Check localStorage for development override
    const devSubdomain = localStorage.getItem("dev_subdomain");
    if (devSubdomain) {
      return devSubdomain;
    }
    return null;
  }
  
  // Skip known hosting platform domains where the project name is NOT a brand subdomain
  // e.g., vto-rose.vercel.app, myapp.netlify.app, myapp.railway.app
  const knownPlatformDomains = ["vercel.app", "netlify.app", "railway.app", "herokuapp.com"];
  const isKnownPlatform = knownPlatformDomains.some(domain => hostWithoutPort.endsWith(domain));
  
  if (isKnownPlatform) {
    // On platform domains like vercel.app, the format is projectname.vercel.app (3 parts)
    // A real brand subdomain would be brand.projectname.vercel.app (4+ parts)
    if (parts.length >= 4) {
      return parts[0];
    }
    return null;
  }

  // For custom domains: brandname.vto.ai or brandname.example.com
  // Minimum 3 parts means there's a subdomain (sub.domain.tld)
  if (parts.length >= 3) {
    // First part is subdomain
    return parts[0];
  }
  
  return null;
}

/**
 * Get brand from subdomain
 */
export function getBrandFromSubdomain() {
  const subdomain = getSubdomainFromHost();
  if (!subdomain) return null;
  
  // Get all brands and find by subdomain match
  const brands = getBrands();
  
  // Try to find brand by subdomain field
  const brandBySubdomain = brands.find(b => 
    b.subdomain?.toLowerCase() === subdomain.toLowerCase()
  );
  if (brandBySubdomain) {
    return brandBySubdomain;
  }
  
  // Try to find brand by name (subdomain should match brand name slug)
  const brandName = subdomain.replace(/-/g, " "); // Convert slug to name
  const brand = getBrandByName(brandName);
  
  if (brand) {
    return brand;
  }
  
  // Try direct match with subdomain as ID
  const brandById = getBrandById(subdomain);
  if (brandById) {
    return brandById;
  }
  
  return null;
}

/**
 * Check if current request is on a brand subdomain
 */
export function isBrandSubdomain() {
  return getSubdomainFromHost() !== null;
}

/**
 * Get brand products for subdomain
 */
export function getBrandProducts(brand) {
  const allProducts = getProducts();
  return allProducts.filter(product => 
    product.brand.toLowerCase() === brand.name.toLowerCase() && 
    product.status === "active"
  );
}

/**
 * Generate subdomain URL for a brand
 */
export function getBrandSubdomainUrl(brandName) {
  const slug = brandName.toLowerCase().replace(/\s+/g, "-");
  if (typeof window === "undefined") {
    return `https://${slug}.vto.ai`;
  }
  
  const hostname = window.location.hostname;
  if (hostname.includes("localhost")) {
    // For development
    return `${window.location.origin}?subdomain=${slug}`;
  }
  
  return `https://${slug}.vto.ai`;
}

