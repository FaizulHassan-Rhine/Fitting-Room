"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBrandsForDiscover, generateSubdomainSlug, getBrands } from "@/lib/brandStorage";
import { rankBrands, getRankingWeights, BrandMetrics } from "@/lib/brandRanking";

export default function BrandSearchPage() {
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [ready, setReady] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    loadBrands();
    setReady(true);
    
    // Load recent searches
    const saved = localStorage.getItem("brandRecentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('brand-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setSearchFocused(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadBrands = () => {
    const allBrands = getAllBrandsForDiscover();
    const weights = getRankingWeights();
    
    // Convert to BrandMetrics format
    const brandMetrics = allBrands.map(brand => ({
      brandId: brand.id,
      brandName: brand.name,
      popularity: brand.popularity,
      demand: brand.demand,
      sales: brand.sales,
      tryOnFrequency: brand.tryOnFrequency,
    }));
    
    // Rank brands
    const ranked = rankBrands(brandMetrics, weights);
    
    // Map back to Brand with score
    const brandsWithScore = ranked.map(rankedBrand => {
      const brand = allBrands.find(b => b.id === rankedBrand.brandId);
      return {
        ...brand,
        score: rankedBrand.score,
      };
    });
    
    setBrands(brandsWithScore);
  };

  const handleSearchQuery = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("brandRecentSearches", JSON.stringify(updated));
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
    localStorage.setItem("brandRecentSearches", JSON.stringify(updated));
  };
  
  // Get search suggestions from brands
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    
    brands.forEach(brand => {
      if (brand.name.toLowerCase().includes(query)) {
        suggestions.add(brand.name);
      }
      if (brand.description?.toLowerCase().includes(query)) {
        suggestions.add(brand.name);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };
  
  const searchSuggestions = getSearchSuggestions();
  const popularBrands = ["Premium Wear", "Urban Style", "Fashion House", "Sport Pro"];

  const filteredAndSortedBrands = brands
    .filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "popularity":
          return b.popularity - a.popularity;
        case "sales":
          return b.sales - a.sales;
        case "rank":
        default:
          return b.score - a.score;
      }
    });

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">Discover Brands</h1>
              <p className="text-lg text-gray-600">
                Explore brands and find your next favorite
              </p>
            </div>
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="relative group">
              <input
                id="brand-search-input"
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
                placeholder="Search brands..."
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
                          localStorage.removeItem("brandRecentSearches");
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
                
                {/* Popular Brands */}
                {!searchQuery && (
                  <div className="p-4">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                      Popular Brands
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popularBrands.map((popular, idx) => (
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

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-900">
                {filteredAndSortedBrands.length} {filteredAndSortedBrands.length === 1 ? 'brand' : 'brands'} found
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Sort by</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-black transition-all cursor-pointer appearance-none hover:border-gray-300"
                >
                  <option value="rank">Ranked</option>
                  <option value="name">Name</option>
                  <option value="popularity">Popularity</option>
                  <option value="sales">Sales</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Brands Grid */}
        {filteredAndSortedBrands.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Brands Found</h3>
            <p className="text-gray-500 mb-8">Try adjusting your search</p>
            <button
              onClick={clearSearch}
              className="bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-gray-800 transition-colors rounded-lg"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${generateSubdomainSlug(brand.name) || brand.id}`}
                className="group flex flex-col bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 overflow-hidden"
              >
                <div className="relative p-6">
                  {/* Brand Logo / Letter */}
                  {(() => {
                    const registeredBrands = getBrands();
                    const brandData = registeredBrands.find(b => b.name === brand.name);
                    
                    // Get logo from brand data first
                    let brandLogo = brand.logo || brandData?.logo;
                    const brandSlug = brand.name.toLowerCase().replace(/\s+/g, '');
                    
                    // If no logo in brand data, try to get from website or construct domain
                    if (!brandLogo) {
                      let domain = '';
                      
                      // Try to get domain from website
                      if (brand.website || brandData?.website) {
                        try {
                          const website = brand.website || brandData?.website || '';
                          const url = new URL(website);
                          domain = url.hostname.replace('www.', '');
                        } catch (e) {
                          const website = brand.website || brandData?.website || '';
                          domain = website.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
                        }
                      } else {
                        // Construct domain from brand name
                        domain = `${brandSlug}.com`;
                      }
                      
                      // Use Google favicon service as primary source (larger size for better quality)
                      brandLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
                    }
                    
                    return (
                      <div className="mb-4 h-24 flex items-center justify-center bg-gray-50 rounded-xl p-3">
                        <img
                          src={brandLogo}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target;
                            let attempts = parseInt(target.dataset.attempts || '0');
                            
                            // Try alternative sources
                            const alternatives = [
                              `https://logo.clearbit.com/${brandSlug}.com`,
                              `https://www.google.com/s2/favicons?domain=${brandSlug}.com&sz=128`,
                              `https://logo.clearbit.com/${brandSlug}.io`,
                              `https://logo.clearbit.com/${brandSlug}.co`,
                              `https://www.google.com/s2/favicons?domain=${brandSlug}.io&sz=128`,
                              `https://www.google.com/s2/favicons?domain=${brandSlug}.co&sz=128`,
                            ];
                            
                            if (attempts < alternatives.length) {
                              target.src = alternatives[attempts];
                              target.dataset.attempts = (attempts + 1).toString();
                            } else {
                              // If all attempts fail, show fallback
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-letter')) {
                                parent.innerHTML = `
                                  <div class="fallback-letter w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white rounded-xl flex items-center justify-center shadow-inner">
                                    <span class="text-4xl font-black text-gray-700">${brand.name.charAt(0)}</span>
                                  </div>
                                `;
                              }
                            }
                          }}
                          data-attempts="0"
                        />
                      </div>
                    );
                  })()}

                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                      {brand.description}
                    </p>
                  )}

                  {/* Social media icons */}
                  <div className="flex items-center gap-1.5 pt-4 border-t border-gray-100">
                    <button 
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" 
                      aria-label="X (Twitter)" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </button>
                    <button 
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" 
                      aria-label="Instagram" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </button>
                    <button 
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" 
                      aria-label="Facebook" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </button>
                    {brand.website ? (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all ml-auto" 
                        aria-label="Website"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </a>
                    ) : (
                      <button 
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all ml-auto" 
                        aria-label="Website"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
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

