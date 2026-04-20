/** Currency options for region/currency dropdown (code + label with symbol) */
export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "BDT", symbol: "৳", label: "BDT (৳)" },
  { code: "TK", symbol: "Tk", label: "TK (Tk)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "JPY", symbol: "¥", label: "JPY (¥)" },
];

export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return "$";
  const c = CURRENCIES.find((x) => x.code === currencyCode);
  return c?.symbol ?? "$";
}

const STORAGE_KEY = "vto_products";

/**
 * Calculate special price from discount
 * @param price - Original price string (e.g., "29.99" or "$29.99")
 * @param discountType - Type of discount: "amount" or "percentage"
 * @param discountValue - Discount value (amount or percentage)
 * @param currencySymbol - Optional symbol to prefix (e.g. "$", "৳")
 * @returns Formatted special price string or undefined if invalid
 */
export function calculateSpecialPrice(
  price,
  discountType,
  discountValue,
  currencySymbol
) {
  if (!discountType || discountValue === undefined || discountValue === null) {
    return undefined;
  }

  const priceNum = parseFloat(price.replace(/[^0-9.]/g, ""));
  if (isNaN(priceNum) || priceNum <= 0) {
    return undefined;
  }

  let specialPriceNum;
  if (discountType === "amount") {
    specialPriceNum = Math.max(0, priceNum - discountValue);
  } else {
    if (discountValue < 0 || discountValue > 100) return undefined;
    specialPriceNum = priceNum * (1 - discountValue / 100);
  }

  const formatted = specialPriceNum.toFixed(2);
  const symbol = currencySymbol ?? (price.replace(/[0-9.]/g, "").trim() || "$");
  return symbol ? `${symbol}${formatted}` : formatted;
}

export function getProducts() {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getDefaultProducts();
  
  const products = JSON.parse(stored);
  const defaultProductsData = getDefaultProductsData();
  
  // Update existing products with new images from default products (migration)
  let updated = false;
  const updatedProducts = products.map((product) => {
    const defaultProduct = defaultProductsData.find((dp) => dp.id === product.id);
    if (defaultProduct && defaultProduct.images && defaultProduct.images[0]?.startsWith('/dress/')) {
      // Check if product image needs updating (not already using dress folder)
      if (!product.images?.[0]?.startsWith('/dress/')) {
        updated = true;
        return {
          ...product,
          images: defaultProduct.images,
          price: defaultProduct.price, // Also update price
        };
      }
    }
    return product;
  });
  
  // Add any new default products that don't exist
  defaultProductsData.forEach((defaultProduct) => {
    if (!updatedProducts.find((p) => p.id === defaultProduct.id)) {
      updatedProducts.push(defaultProduct);
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  }
  
  return products;
}

export function getActiveProducts() {
  return getProducts().filter((p) => p.status === "active");
}

export function saveProduct(product) {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: "active",
    views: 0,
    tryOns: 0,
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return newProduct;
}

export function updateProduct(id, updates) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}

export function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

function getDefaultProductsData() {
  return [
    {
      id: 1,
      title: "Black T-Shirt",
      brand: "Urban Style",
      description: "A timeless classic white t-shirt made from premium cotton. Perfect for everyday wear.",
      price: "$29.99",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      images: ["/dress/t-shirt-1.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 234,
      tryOns: 89,
    },
    {
      id: 2,
      title: "Slim Fit Jeans",
      brand: "Denim Co",
      description: "Modern slim fit jeans with stretch fabric for comfort and style.",
      price: "$79.99",
      category: "Jeans",
      sizes: ["M", "L", "XL"],
      images: ["/dress/jeans.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 456,
      tryOns: 123,
    },
    {
      id: 3,
      title: "Summer Dress",
      brand: "Fashion House",
      description: "Lightweight and breezy summer dress perfect for warm weather.",
      price: "$59.99",
      category: "Dresses",
      sizes: ["XS", "S", "M", "L"],
      images: ["/dress/dress-1.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 345,
      tryOns: 98,
    },
    {
      id: 4,
      title: "Elegant Evening Dress",
      brand: "Premium Wear",
      description: "Stunning evening dress perfect for special occasions.",
      price: "$199.99",
      category: "Dresses",
      sizes: ["S", "M", "L", "XL"],
      images: ["/dress/dress-2.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 567,
      tryOns: 178,
    },
    {
      id: 5,
      title: "Casual Summer Dress",
      brand: "Fashion House",
      description: "Comfortable and stylish casual dress for everyday wear.",
      price: "$49.99",
      category: "Dresses",
      sizes: ["XS", "S", "M", "L"],
      images: ["/dress/dress-3.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 289,
      tryOns: 76,
    },
    {
      id: 6,
      title: "Designer Dress",
      brand: "Premium Wear",
      description: "Elegant designer dress with modern fit and style.",
      price: "$149.99",
      category: "Dresses",
      sizes: ["S", "M", "L"],
      images: ["/dress/dress-4.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 198,
      tryOns: 54,
    },
    {
      id: 7,
      title: "Classic T-Shirt",
      brand: "Urban Style",
      description: "Comfortable cotton t-shirt for casual occasions.",
      price: "$24.99",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      images: ["/dress/t-shirt-2.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 167,
      tryOns: 42,
    },
    {
      id: 8,
      title: "Premium T-Shirt",
      brand: "Urban Style",
      description: "High-quality premium t-shirt with superior comfort.",
      price: "$34.99",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      images: ["/dress/t-shirt-3.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 145,
      tryOns: 38,
    },
    {
      id: 9,
      title: "Stylish Dress",
      brand: "Fashion House",
      description: "Beautiful and stylish dress for any occasion.",
      price: "$69.99",
      category: "Dresses",
      sizes: ["XS", "S", "M", "L", "XL"],
      images: ["/dress/dress-5.png"],
      hidePrice: false,
      hideAvailability: false,
      status: "active",
      createdAt: new Date().toISOString(),
      views: 312,
      tryOns: 87,
    },
  ];
}

function getDefaultProducts() {
  const defaultProducts = getDefaultProductsData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

/** SEO-friendly slug from product title (lowercase, hyphens) */
export function getProductSlug(title, id) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base ? `${base}-${id}` : String(id);
}

/** Product URL for SEO: /product/the-product-name-123 */
export function getProductUrl(product) {
  return `/product/${getProductSlug(product.title, product.id)}`;
}

/** Parse product id from slug (e.g. "classic-white-t-shirt-1" -> 1). Supports legacy numeric slug. */
export function parseProductIdFromSlug(slug) {
  if (typeof slug !== "string" || !slug) return null;
  const num = parseInt(slug, 10);
  if (!isNaN(num) && String(num) === slug) return num;
  const lastDash = slug.lastIndexOf("-");
  if (lastDash === -1) return null;
  const tail = slug.slice(lastDash + 1);
  const id = parseInt(tail, 10);
  return isNaN(id) ? null : id;
}

