"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrands, generateSubdomainSlug } from "@/lib/brandStorage";
import { getActiveProducts, getProductUrl } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import ProductChatModal from "@/components/ProductChatModal";
import { getUserPhotos } from "@/lib/photoStorage";
import { Home, Shirt, ShoppingBag, ShirtIcon, Layers, Footprints, Grid3x3 } from "lucide-react";

const categories = [
  { name: "All", icon: Grid3x3 },
  { name: "T-Shirts", icon: Shirt },
  { name: "Jeans", icon: ShoppingBag },
  { name: "Dresses", icon: ShirtIcon },
  { name: "Jackets", icon: Layers },
  { name: "Shoes", icon: Footprints },
];

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatProduct, setChatProduct] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [trendingSlideIndex, setTrendingSlideIndex] = useState(0);

  useEffect(() => {
    const storedBrands = getBrands();
    const allProducts = getActiveProducts();
    setBrands(storedBrands.slice(0, 8));
    setProducts(allProducts);
    
    // Load recent searches
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('home-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setSearchFocused(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Save to recent searches
      const updated = [searchQuery.trim(), ...recentSearches.filter(s => s !== searchQuery.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    // Save to recent searches
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      setShowSearchDropdown(false);
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchDropdown(false);
  };
  
  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };
  
  // Get search suggestions from products and brands
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return { products: [], brands: [] };
    const query = searchQuery.toLowerCase();
    const productSuggestions = new Set();
    const brandSuggestions = new Set();
    
    // Add product titles and categories
    products.forEach(product => {
      if (product.title.toLowerCase().includes(query)) {
        productSuggestions.add(product.title);
      }
      if (product.category?.toLowerCase().includes(query)) {
        productSuggestions.add(product.category);
      }
    });
    
    // Add brand names from brands array
    brands.forEach(brand => {
      if (brand.name.toLowerCase().includes(query)) {
        brandSuggestions.add(brand.name);
      }
    });
    
    // Also check product brands
    products.forEach(product => {
      if (product.brand && product.brand.toLowerCase().includes(query)) {
        brandSuggestions.add(product.brand);
      }
    });
    
    return {
      products: Array.from(productSuggestions).slice(0, 5),
      brands: Array.from(brandSuggestions).slice(0, 5)
    };
  };
  
  const searchSuggestions = getSearchSuggestions();
  const popularSearches = ["T-Shirts", "Dresses", "Jeans", "Jackets"];

  const trendingProducts = products.slice(0, 12); // Show more products for carousel
  
  // Calculate visible products for trending carousel
  const itemsPerPage = 4;
  const maxSlideIndex = Math.max(0, Math.ceil(trendingProducts.length / itemsPerPage) - 1);
  const visibleTrendingProducts = trendingProducts.slice(
    trendingSlideIndex * itemsPerPage,
    (trendingSlideIndex + 1) * itemsPerPage
  );
  
  const handleTrendingPrev = () => {
    setTrendingSlideIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleTrendingNext = () => {
    setTrendingSlideIndex((prev) => Math.min(maxSlideIndex, prev + 1));
  };

  const handleTryOn = (productId) => {
    // Check if user has existing photos
    const savedPhotos = getUserPhotos();
    
    // If user has photos, set the last used photo (or the first available photo)
    if (savedPhotos.length > 0) {
      const lastUsedPhoto = localStorage.getItem("vto_last_used_photo");
      
      // Use last used photo if it exists and is still in saved photos, otherwise use first photo
      const photoToUse = lastUsedPhoto && savedPhotos.some(p => p.imageData === lastUsedPhoto)
        ? lastUsedPhoto
        : savedPhotos[0].imageData;
      
      localStorage.setItem("vto_last_used_photo", photoToUse);
    }
    
    localStorage.setItem("tryOnProductId", productId.toString());
    router.push("/try-on");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ProductChatModal
        isOpen={!!chatProduct}
        onClose={() => setChatProduct(null)}
        product={chatProduct}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
        <div className="relative z-10">
          <div className="py-16 sm:py-20 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
              {/* Large Centered Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 text-center mb-4 tracking-tight">
                Discover Your Style
              </h1>
              <p className="text-center text-gray-500 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
                Find your perfect look with try-on
              </p>
              
              {/* Search Bar */}
              <div className="max-w-3xl mx-auto relative mb-14">
                <form onSubmit={handleSearch}>
                  <div className="relative rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200/80 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-gray-300 transition-all">
                    <input
                      id="home-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setSearchFocused(true);
                        setShowSearchDropdown(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setSearchFocused(false);
                          setShowSearchDropdown(false);
                        }, 200);
                      }}
                      placeholder="Search for products, brands, and styles..."
                      className="w-full px-6 py-4 sm:py-5 pl-14 pr-40 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none text-base font-medium transition-all bg-transparent"
                    />
                    
                    {/* Search Icon */}
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Right Side Controls */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                          title="Clear search"
                        >
                          <svg className="w-5 h-5 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-black transition-all shadow-sm"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
                
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
                  {/* Brands Section */}
                  {searchQuery && searchSuggestions.brands.length > 0 && (
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                        Brands
                      </h4>
                      <div className="space-y-1">
                        {searchSuggestions.brands.map((brand, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              router.push(`/browse?brand=${encodeURIComponent(brand)}`);
                              setSearchQuery("");
                              setShowSearchDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm text-gray-700 group-hover:text-black font-medium">
                              {brand}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Products & Categories Suggestions */}
                  {searchQuery && searchSuggestions.products.length > 0 && (
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                        Suggestions
                      </h4>
                      <div className="space-y-1">
                        {searchSuggestions.products.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchQuery(suggestion)}
                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm text-gray-700 group-hover:text-black font-medium">
                              {suggestion}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Searches */}
                  {!searchQuery && recentSearches.length > 0 && (
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Recent Searches
                        </h4>
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem("recentSearches");
                          }}
                          className="text-xs text-gray-600 hover:text-black font-semibold transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 group"
                          >
                            <button
                              onClick={() => handleSearchQuery(search)}
                              className="flex-1 text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-3"
                            >
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-all">
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-black">
                                {search}
                              </span>
                            </button>
                            <button
                              onClick={() => removeRecentSearch(search)}
                              className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove"
                            >
                              <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Searches */}
                  {!searchQuery && (
                    <div className="p-5">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        Popular Searches
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((popular, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchQuery(popular)}
                            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-black hover:text-white hover:border-black text-gray-700 rounded-md transition-all font-medium text-sm"
                          >
                            {popular}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* No Results */}
                  {searchQuery && searchSuggestions.brands.length === 0 && searchSuggestions.products.length === 0 && (
                    <div className="p-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">No suggestions found</p>
                      <p className="text-xs text-gray-500">Try searching with different keywords</p>
                    </div>
                  )}
                  </div>
                )}
              </div>
              
              {/* Experience Try-On Section */}
              <div className="max-w-3xl mx-auto text-center space-y-8 mt-16 pt-12 border-t border-gray-200/80">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                  Experience Try-On
                </h2>
                
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  See exactly how clothes look on you before making a purchase. No more sizing doubts, no more returns—just confidence in every purchase.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link 
                    href="/brands/search" 
                    className="group flex items-center gap-2 bg-black text-white border-2 border-black px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition-all"
                  >
                    Show Brands
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Features */}
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 pt-6">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="font-medium text-sm sm:text-base">Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="font-medium text-sm sm:text-base">Perfect Fit</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="font-medium text-sm sm:text-base">No Returns Needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories - Premium Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 pt-8 " >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-sm">Discover your perfect style</p>
          </div>
          <Link 
            href="/browse" 
            className="group flex items-center gap-2 bg-white text-black border-2 border-black px-6 py-3 rounded-md font-semibold hover:bg-black hover:text-white hover:border-white transition-all"
          >
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.name}
                href={`/browse?category=${category.name}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-300"
              >
                <div className="flex flex-col items-center gap-3 p-5">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                    <IconComponent className="w-7 h-7 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-black transition-colors">
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trending Products - Premium Design */}
      {trendingProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900">
                Trending Now
              </h2>
              <p className="text-gray-600 text-sm">Most popular this week</p>
            </div>
            <Link 
              href="/browse?filter=trending" 
              className="group flex items-center gap-2 bg-white text-black border-2 border-black px-6 py-3 rounded-md font-semibold hover:bg-black hover:text-white hover:border-white transition-all"
            >
              See All
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Products Grid with Navigation */}
          <div className="relative">
            {/* Left Arrow */}
            {trendingProducts.length > itemsPerPage && trendingSlideIndex > 0 && (
              <button
                onClick={handleTrendingPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
                aria-label="Previous products"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleTrendingProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-300"
              >
                <Link href={getProductUrl(product)} className="block">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src={product.images?.[0] || product.image || '/placeholder-product.jpg'} 
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target;
                        if (target.src !== '/placeholder-product.jpg') {
                          target.src = '/placeholder-product.jpg';
                        }
                      }}
                    />
                    {product.specialPrice && (
                      <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 rounded-md flex items-center justify-center text-xs font-semibold shadow-md">
                        Sale
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link href={getProductUrl(product)} className="block">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">{product.title}</h3>
                  </Link>
                  <Link
                    href={`/ip/${generateSubdomainSlug(product.brand)}`}
                    className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
                  >
                    {(() => {
                      const brands = getBrands();
                      const brandData = brands.find(b => b.name === product.brand);
                      
                      // Get logo from brand data or generate from online source
                      let brandLogo = brandData?.logo;
                      
                      // If no logo in brand data, try to get from website
                      if (!brandLogo && brandData?.website) {
                        try {
                          const url = new URL(brandData.website);
                          brandLogo = `https://logo.clearbit.com/${url.hostname}`;
                        } catch (e) {
                          // Invalid URL, try direct domain
                          brandLogo = `https://logo.clearbit.com/${brandData.website.replace(/^https?:\/\//, '').split('/')[0]}`;
                        }
                      }
                      
                      // If still no logo, try to construct from brand name
                      if (!brandLogo) {
                        // Try common domain patterns
                        const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '');
                        brandLogo = `https://logo.clearbit.com/${brandSlug}.com`;
                      }
                      
                      return (
                        <>
                          <img 
                            src={brandLogo} 
                            alt={product.brand}
                            className="w-4 h-4 object-contain rounded-sm"
                            onError={(e) => {
                              const target = e.target;
                              // Try alternative logo source
                              const brandSlug = product.brand.toLowerCase().replace(/\s+/g, '');
                              const alternatives = [
                                `https://www.google.com/s2/favicons?domain=${brandSlug}.com&sz=64`,
                                `https://logo.clearbit.com/${brandSlug}.io`,
                                `https://logo.clearbit.com/${brandSlug}.co`,
                              ];
                              
                              let attempts = parseInt(target.dataset.attempts || '0');
                              if (attempts < alternatives.length) {
                                target.src = alternatives[attempts];
                                target.dataset.attempts = (attempts + 1).toString();
                              } else {
                                // If all attempts fail, hide the image
                                target.style.display = 'none';
                              }
                            }}
                            data-attempts="0"
                          />
                          <span>{product.brand}</span>
                        </>
                      );
                    })()}
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end pt-1">
                      <Link
                        href={getProductUrl(product)}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setChatProduct(product);
                        }}
                        className="w-9 h-9 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-all"
                        title="Ask Questions"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right Arrow */}
            {trendingProducts.length > itemsPerPage && trendingSlideIndex < maxSlideIndex && (
              <button
                onClick={handleTrendingNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-200"
                aria-label="Next products"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* CTA Section - Minimal Design */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Main Heading */}
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Ready to Transform Your Shopping Experience?
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Step into the future of fashion with our AI-powered fitting room. See exactly how clothes look on you before making a purchase. No more sizing doubts, no more returns—just confidence in every purchase.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              href="/browse"
              className="group flex items-center gap-2 bg-black text-white border-2 border-black px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition-all"
            >
              Try Fitting Room
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/brands/search"
              className="group flex items-center gap-2 bg-white text-black border-2 border-black px-8 py-3 rounded-md font-semibold hover:bg-black hover:text-white transition-all"
            >
              Browse All Brands
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 0.33s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        kbd {
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
}
