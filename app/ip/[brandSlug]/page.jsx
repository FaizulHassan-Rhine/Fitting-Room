"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBrandBySlugOrId } from "@/lib/brandStorage";
import { getActiveProducts, getProductUrl } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import ProductChatModal from "@/components/ProductChatModal";
import { getUserPhotos } from "@/lib/photoStorage";

export default function BrandIPPage() {
  const params = useParams();
  const router = useRouter();
  const brandSlug = params.brandSlug;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [resolved, setResolved] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const b = getBrandBySlugOrId(brandSlug);
    setBrand(b);
    if (b) {
      const all = getActiveProducts();
      setProducts(all.filter((p) => p.brand?.trim().toLowerCase() === b.name.trim().toLowerCase()));
    } else {
      setProducts([]);
    }
    setResolved(true);
    
    // Load recent searches
    const saved = localStorage.getItem("brandProductRecentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('brand-product-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setSearchFocused(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [brandSlug]);

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("brandProductRecentSearches", JSON.stringify(updated));
      setShowSearchDropdown(false);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchDropdown(false);
  };
  
  const removeRecentSearch = (searchToRemove) => {
    const updated = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem("brandProductRecentSearches", JSON.stringify(updated));
  };
  
  // Get search suggestions from products
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    
    products.forEach(product => {
      if (product.title.toLowerCase().includes(query)) {
        suggestions.add(product.title);
      }
      if (product.category?.toLowerCase().includes(query)) {
        suggestions.add(product.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };
  
  const searchSuggestions = getSearchSuggestions();
  const popularSearches = ["T-Shirts", "Dresses", "New Arrivals", "Sale"];

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTryOn = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0];
    addToCart({ ...product, selectedSize: defaultSize });
  };

  if (!resolved) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  if (resolved && !brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The brand you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link 
            href="/brands/search" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
          >
            Browse All Brands
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductChatModal
        isOpen={!!chatProduct}
        onClose={() => setChatProduct(null)}
        product={chatProduct}
      />
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
          {/* Back Button */}
          <Link 
            href="/brands/search"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Brands</span>
          </Link>

          <div className="text-center text-white">
            {/* Brand Logo */}
            {brand?.logo ? (
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-32 w-32 object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl"></div>
                  <div className="relative bg-white/95 backdrop-blur-md p-12 rounded-3xl shadow-2xl">
                    <span className="text-7xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {brand?.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Brand Name */}
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight drop-shadow-lg">
              {brand?.name}
            </h1>
            
            {/* Description */}
            {brand?.description && (
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
                {brand.description}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white hover:text-purple-600 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Visit Website</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl">
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-bold">{products.length} Products Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="relative">
            <div className="relative group">
              <input
                id="brand-product-search-input"
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
                placeholder={`Search in ${brand?.name} products...`}
                className="w-full px-6 py-5 pl-14 pr-32 text-base rounded-xl border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              />
              
              {/* Search Icon */}
              <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                searchFocused ? 'text-black scale-110' : 'text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Right Side Icons */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Clear search"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">
                  <kbd>⌘</kbd>
                  <kbd>K</kbd>
                </div>
              </div>
            </div>
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
                {/* Search Suggestions */}
                {searchQuery && searchSuggestions.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                      Suggestions
                    </h4>
                    <div className="space-y-1">
                      {searchSuggestions.map((suggestion, idx) => (
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
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Recent Searches
                      </h4>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("brandProductRecentSearches");
                        }}
                        className="text-xs text-gray-500 hover:text-black transition-colors"
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
                            className="flex-1 text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700 group-hover:text-black">
                              {search}
                            </span>
                          </button>
                          <button
                            onClick={() => removeRecentSearch(search)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all"
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="p-4">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                      Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((popular, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchQuery(popular)}
                          className="px-4 py-2 bg-gray-50 hover:bg-black hover:text-white text-sm text-gray-700 rounded-full transition-all duration-200 font-medium"
                        >
                          {popular}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No Results */}
                {searchQuery && searchSuggestions.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No suggestions found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Our Products
                </h2>
                <p className="text-gray-600 text-sm">
                  {filteredProducts.length} of {products.length} items {searchQuery && 'found'}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="group flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-gray-900 mb-2">
                {products.length === 0 ? 'No Products Available' : 'No Products Found'}
              </h3>
              <p className="text-gray-500 mb-8 font-light">
                {products.length === 0 
                  ? "This brand hasn't added any products yet." 
                  : 'Try adjusting your search or clear filters'}
              </p>
              {products.length === 0 ? (
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors rounded-xl"
                >
                  Browse All Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors rounded-xl"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105"
                >
                  <Link href={getProductUrl(product)} className="block">
                    {/* Product Image */}
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target;
                            if (target.src !== '/placeholder-product.jpg') {
                              target.src = '/placeholder-product.jpg';
                            }
                          }}
                        />
                      )}
                      
                      {/* Sale Badge */}
                      {product.specialPrice && (
                        <div className="absolute top-3 right-3 bg-gradient-to-br from-orange-500 to-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    <Link href={getProductUrl(product)} className="block">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {/* Price and Action Buttons on Same Row */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Price */}
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTryOn(e, product.id);
                          }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md"
                          title="Try-On"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setChatProduct(product);
                          }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md"
                          title="Ask Questions"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* About Card */}
            <div className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl p-[2px]">
                <div className="w-full h-full bg-white rounded-2xl"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    About {brand?.name}
                  </h3>
                </div>
                {brand?.description ? (
                  <p className="text-gray-700 leading-relaxed text-base">
                    {brand.description}
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-base">
                    Welcome to {brand?.name}. We offer quality products with fitting room technology
                    to help you make confident purchase decisions.
                  </p>
                )}

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Try-On</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Quality Products</span>
                  </div>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            
            {/* Contact & Social Media Card */}
            <div className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl p-[2px]">
                <div className="w-full h-full bg-white rounded-2xl"></div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Get in Touch
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Email */}
                  <a 
                    href={`mailto:${brand?.email || 'contact@example.com'}`}
                    className="group/link flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all"
                  >
                    <div className="p-3 bg-white rounded-lg shadow-sm group-hover/link:shadow-md transition-shadow">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Email</div>
                      <div className="text-sm font-bold text-gray-900 group-hover/link:text-blue-600 transition-colors truncate">
                        {brand?.email || 'contact@example.com'}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover/link:text-blue-600 group-hover/link:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all"
                  >
                    <div className="p-3 bg-white rounded-lg shadow-sm group-hover/link:shadow-md transition-shadow">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">WhatsApp</div>
                      <div className="text-sm font-bold text-gray-900 group-hover/link:text-green-600 transition-colors">
                        Chat with us
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover/link:text-green-600 group-hover/link:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Social Media Links */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Follow Us</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Facebook */}
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105"
                      >
                        <svg className="w-5 h-5 text-blue-600 group-hover/social:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-sm font-bold text-blue-700 group-hover/social:text-white transition-colors">Facebook</span>
                      </a>

                      {/* Instagram */}
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-100 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all hover:scale-105"
                      >
                        <svg className="w-5 h-5 text-pink-600 group-hover/social:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                        </svg>
                        <span className="text-sm font-bold text-pink-700 group-hover/social:text-white transition-colors">Instagram</span>
                      </a>

                      {/* Twitter/X */}
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-900 hover:to-black transition-all hover:scale-105"
                      >
                        <svg className="w-5 h-5 text-gray-700 group-hover/social:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-sm font-bold text-gray-700 group-hover/social:text-white transition-colors">Twitter</span>
                      </a>

                      {/* LinkedIn */}
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
                      >
                        <svg className="w-5 h-5 text-blue-700 group-hover/social:text-white transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="text-sm font-bold text-blue-800 group-hover/social:text-white transition-colors">LinkedIn</span>
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  {brand?.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all mt-3"
                    >
                      <div className="p-3 bg-white rounded-lg shadow-sm group-hover/link:shadow-md transition-shadow">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Website</div>
                        <div className="text-sm font-bold text-gray-900 group-hover/link:text-purple-600 transition-colors truncate">
                          {brand.website}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover/link:text-purple-600 group-hover/link:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
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
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        kbd {
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
}

