"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getProductUrl, getCurrencySymbol } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import { generateSubdomainSlug, getBrands } from "@/lib/brandStorage";
import ProductChatModal from "@/components/ProductChatModal";
import UserPhotosModal from "@/components/UserPhotosModal";
import { getUserPhotos, saveUserPhoto, setLastUsedPhotoId } from "@/lib/photoStorage";
import { compressImage } from "@/lib/imageCompression";

const categories = ["All", "T-Shirts", "Jeans", "Dresses", "Jackets", "Shoes"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

const SEARCH_API_ROUTE = "/api/v1/search";
const PAGE_SIZE = 50;
const LIVE_REFRESH_MS = 12000;

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [apiError, setApiError] = useState("");
  const [imageLoaded, setImageLoaded] = useState({});
  const [showTryOnChooser, setShowTryOnChooser] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [pendingTryOnProductId, setPendingTryOnProductId] = useState(null);
  const [isUploadingTryOnPhoto, setIsUploadingTryOnPhoto] = useState(false);
  const uploadInputRef = useRef(null);
  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);

  useEffect(() => {
    setReady(true);
    
    // Load recent searches
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setSearchFocused(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortDropdown]);
  
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");
    
    if (brandParam) {
      setSelectedBrand(decodeURIComponent(brandParam));
    }
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
    if (categoryParam && categoryParam !== "All") {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
  }, [searchParams]);

  const startTryOnNavigation = (productId) => {
    if (!productId) return;
    localStorage.setItem("tryOnProductId", productId.toString());
    router.push("/try-on");
  };

  const handleTryOn = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingTryOnProductId(productId);
    setShowTryOnChooser(true);
  };

  const handleSelectPreviousImage = () => {
    const savedPhotos = getUserPhotos();
    if (savedPhotos.length === 0) {
      // No saved photos yet — take user to upload flow directly
      setShowTryOnChooser(false);
      uploadInputRef.current?.click();
      return;
    }
    setShowTryOnChooser(false);
    setShowPhotosModal(true);
  };

  const handleUploadNewImageClick = () => {
    setShowTryOnChooser(false);
    uploadInputRef.current?.click();
  };

  const handleTryOnFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingTryOnProductId) return;

    try {
      setIsUploadingTryOnPhoto(true);
      const compressedImageData = await compressImage(file);
      const savedPhoto = saveUserPhoto(compressedImageData);
      setLastUsedPhotoId(savedPhoto.id);
      localStorage.setItem("vto_last_used_photo", compressedImageData);
      startTryOnNavigation(pendingTryOnProductId);
    } catch (error) {
      console.error("Try-on photo upload failed:", error);
      alert("Failed to process image. Please try another photo.");
    } finally {
      setIsUploadingTryOnPhoto(false);
      // allow selecting same file again
      e.target.value = "";
    }
  };

  const handleChooseSavedPhoto = (imageData) => {
    if (!pendingTryOnProductId) return;
    const savedPhotos = getUserPhotos();
    const selectedPhoto = savedPhotos.find((p) => p.imageData === imageData);
    if (selectedPhoto) {
      setLastUsedPhotoId(selectedPhoto.id);
    }
    localStorage.setItem("vto_last_used_photo", imageData);
    setShowPhotosModal(false);
    startTryOnNavigation(pendingTryOnProductId);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0];
    addToCart({ ...product, selectedSize: defaultSize });
  };

  const mapApiProduct = (p, idx, page) => {
    const slug = p.url?.split("/").filter(Boolean).pop() || "";
    const stableFallbackId = p.url || slug || `${p.title || "product"}-${idx}`;
    return {
      id: p._id || stableFallbackId,
      title: p.title || "Untitled Product",
      description: p.description || "",
      brand: p.brandName || "Unknown Brand",
      price: `${getCurrencySymbol(p.currency || "BDT")}${p.price ?? ""}`,
      rawPrice: p.price,
      currency: p.currency || "BDT",
      images: Array.isArray(p.images) ? p.images : [],
      image: Array.isArray(p.images) ? p.images[0] : undefined,
      url: p.url,
      slug,
      category: p.category || "All",
      sizes: Array.isArray(p.sizes) ? p.sizes : ["M"],
      status: "active",
    };
  };

  const mergeUniqueProducts = (previous, next) => {
    const byId = new Map(previous.map((item) => [item.id, item]));
    next.forEach((item) => byId.set(item.id, item));
    return Array.from(byId.values());
  };

  // Reset pagination whenever query/sort/brand changes.
  useEffect(() => {
    if (!ready) return;
    setCurrentPage(1);
    setHasNextPage(true);
    setProducts([]);
    setImageLoaded({});
    setApiError("");
    loadMoreLockRef.current = false;
  }, [ready, searchQuery, selectedBrand, sortBy]);

  // Load products page-by-page from backend search API.
  useEffect(() => {
    if (!ready) return;
    if (currentPage > 1 && !hasNextPage) return;

    const isFirstPage = currentPage === 1;

    if (isFirstPage) {
      setLoadingProducts(true);
    } else {
      setIsFetchingMore(true);
    }
    setApiError("");

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (selectedBrand) params.set("brandName", selectedBrand);

        const sortMap = {
          relevance: "relevance",
          priceLow: "price_asc",
          priceHigh: "price_desc",
          newest: "newest",
        };
        params.set("sort", sortMap[sortBy] || "relevance");
        params.set("page", String(currentPage));
        params.set("limit", String(PAGE_SIZE));

        const fetchPage = async () => {
          const res = await fetch(`${SEARCH_API_ROUTE}?${params.toString()}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });

          const payload = await res.json().catch(() => null);
          if (!res.ok) {
            const message = payload?.message || `Search API failed (${res.status})`;
            const err = new Error(message);
            err.status = res.status;
            throw err;
          }
          return payload;
        };

        let json;
        try {
          json = await fetchPage();
        } catch (err) {
          // Retry once for transient 5xx backend hiccups.
          if (err.name === "AbortError") throw err;
          if ((err.status || 0) >= 500) {
            await new Promise((resolve) => setTimeout(resolve, 350));
            json = await fetchPage();
          } else {
            throw err;
          }
        }

        const apiItems = Array.isArray(json?.data?.data) ? json.data.data : [];
        const mapped = apiItems.map((p, idx) => mapApiProduct(p, idx, currentPage));
        const pageInfo = json?.data?.pagination;
        const nextPageAvailable =
          typeof pageInfo?.hasNext === "boolean" ? pageInfo.hasNext : apiItems.length >= PAGE_SIZE;

        setHasNextPage(nextPageAvailable);
        setProducts((prev) => (isFirstPage ? mapped : mergeUniqueProducts(prev, mapped)));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load products from search API:", err);
        setApiError(
          isFirstPage
            ? "Live API unavailable. No database results loaded."
            : "Couldn't load more products. Scroll again to retry."
        );
        if (isFirstPage) {
          setProducts([]);
          setImageLoaded({});
          setHasNextPage(false);
        }
      } finally {
        setLoadingProducts(false);
        setIsFetchingMore(false);
        loadMoreLockRef.current = false;
      }
    }, isFirstPage ? 300 : 0);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [ready, currentPage, searchQuery, selectedBrand, sortBy, hasNextPage]);

  // Auto-fetch the next page before users hit the bottom.
  useEffect(() => {
    if (!ready || loadingProducts || isFetchingMore || !hasNextPage) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loadMoreLockRef.current) return;
        loadMoreLockRef.current = true;
        setCurrentPage((prev) => prev + 1);
      },
      { rootMargin: "500px 0px", threshold: 0.01 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [ready, loadingProducts, isFetchingMore, hasNextPage]);

  // Live refresh visible catalog data without a full page reload.
  // Uses live=1 so backend bypasses cache and reflects DB inserts/deletes quickly.
  useEffect(() => {
    if (!ready) return;

    const intervalId = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      if (loadingProducts || isFetchingMore) return;

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (selectedBrand) params.set("brandName", selectedBrand);

        const sortMap = {
          relevance: "relevance",
          priceLow: "price_asc",
          priceHigh: "price_desc",
          newest: "newest",
        };
        params.set("sort", sortMap[sortBy] || "relevance");
        params.set("page", "1");
        // API max limit is 100; refresh up to the first visible 100 for stability.
        const refreshLimit = Math.min(Math.max(products.length, PAGE_SIZE), 100);
        params.set("limit", String(refreshLimit));
        params.set("live", "1");

        const res = await fetch(`${SEARCH_API_ROUTE}?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;

        const json = await res.json();
        const apiItems = Array.isArray(json?.data?.data) ? json.data.data : [];
        const refreshed = apiItems.map((p, idx) => mapApiProduct(p, idx, 1));

        if (refreshed.length > 0) {
          setProducts(refreshed);
          setApiError("");
          const pageInfo = json?.data?.pagination;
          if (typeof pageInfo?.hasNext === "boolean") {
            setHasNextPage(pageInfo.hasNext);
          }
        }
      } catch {
        // Silent refresh should never interrupt browsing.
      }
    }, LIVE_REFRESH_MS);

    return () => clearInterval(intervalId);
  }, [
    ready,
    searchQuery,
    selectedBrand,
    sortBy,
    loadingProducts,
    isFetchingMore,
    products.length,
  ]);

  // Show a floating "scroll to top" button after user scrolls down.
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();

  let filteredProducts = products.filter((product) => {
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSize = !selectedSize || (product.sizes || []).includes(selectedSize);
    // Search filtering is handled by backend API; keep local filter stable during fetch.
    return matchesBrand && matchesCategory && matchesSize;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "priceLow":
        const priceA = parseFloat(a.specialPrice || a.price || "0");
        const priceB = parseFloat(b.specialPrice || b.price || "0");
        return priceA - priceB;
      case "priceHigh":
        const priceHighA = parseFloat(a.specialPrice || a.price || "0");
        const priceHighB = parseFloat(b.specialPrice || b.price || "0");
        return priceHighB - priceHighA;
      case "newest":
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedBrand(null);
    setSelectedCategory("All");
    setSelectedSize(null);
    setSearchQuery("");
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
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
    localStorage.setItem("recentSearches", JSON.stringify(updated));
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
      if (product.brand.toLowerCase().includes(query)) {
        suggestions.add(product.brand);
      }
      if (product.category?.toLowerCase().includes(query)) {
        suggestions.add(product.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  };
  
  const searchSuggestions = getSearchSuggestions();
  const popularSearches = ["T-Shirts", "Dresses", "Jeans", "Jackets"];
  const showSkeletons = loadingProducts && products.length === 0;

  const activeFiltersCount = [selectedBrand, selectedCategory !== "All", selectedSize].filter(Boolean).length;

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleTryOnFileSelected}
        className="hidden"
      />
      
      <ProductChatModal
        isOpen={!!chatProduct}
        onClose={() => setChatProduct(null)}
        product={chatProduct}
      />

      <UserPhotosModal
        isOpen={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
        onSelectPhoto={handleChooseSavedPhoto}
        currentPhoto={null}
      />

      {showTryOnChooser && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTryOnChooser(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Photo for Try-On</h3>
              <p className="text-sm text-gray-500 mt-1">
                Use an existing photo or upload a new one.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleUploadNewImageClick}
                disabled={isUploadingTryOnPhoto}
                className="w-full h-11 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {isUploadingTryOnPhoto ? "Processing..." : "Upload New Image"}
              </button>
              <button
                onClick={handleSelectPreviousImage}
                className="w-full h-11 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors"
              >
                Select Previous Image
              </button>
            </div>

            <button
              onClick={() => setShowTryOnChooser(false)}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-1">Discover</h1>
                <p className="text-sm text-gray-500">
                  {loadingProducts ? "Loading..." : `${filteredProducts.length} items available`}
                </p>
                {apiError && (
                  <p className="text-xs text-orange-600 mt-1">{apiError}</p>
                )}
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
                id="main-search-input"
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
                placeholder="Search products, brands, styles..."
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
                          onClick={() => handleSearch(suggestion)}
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
                          localStorage.removeItem("recentSearches");
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
                            onClick={() => handleSearch(search)}
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
                          onClick={() => handleSearch(popular)}
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

      {/* Apple-like subtle progress line while searching */}
      <div className="h-0.5 bg-gray-100 overflow-hidden">
        <div
          className={`h-full bg-black transition-all duration-500 ease-out ${
            loadingProducts ? "w-full opacity-100 animate-pulseSoft" : "w-0 opacity-0"
          }`}
        />
      </div>

      {/* Professional Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-black text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-black underline transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 relative">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Sort by</span>
              <div className="relative sort-dropdown-container">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-6 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-black transition-all duration-200 flex items-center gap-2"
                >
                  {sortOptions.find(opt => opt.value === sortBy)?.label || "Relevance"}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg z-20 min-w-[200px]">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                          sortBy === option.value
                            ? "bg-black text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="py-6 space-y-6 animate-fadeIn">
              {/* Category Filter */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-black"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Brand</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                      !selectedBrand
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-black"
                    }`}
                  >
                    All Brands
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                      className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                        selectedBrand === brand
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-black"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`w-14 h-14 text-sm font-semibold transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && !showFilters && (
            <div className="py-3 flex flex-wrap gap-2">
              {selectedCategory !== "All" && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  {selectedCategory}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {selectedBrand && (
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  {selectedBrand}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {selectedSize && (
                <button
                  onClick={() => setSelectedSize(null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  Size {selectedSize}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-6">
          {/* Products Grid */}
          <div className="flex-1">
            {showSkeletons ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200"
                  >
                    <div className="aspect-[4/3] bg-gray-100 shimmer" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded shimmer" />
                      <div className="h-3 bg-gray-100 rounded w-2/3 shimmer" />
                      <div className="h-9 mt-2 bg-gray-100 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadingProducts && filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-white">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-500 mb-8 font-light">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200 will-change-transform"
                  >
                    <Link href={product.url || getProductUrl(product)} className="block">
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                        {!imageLoaded[product.id] && (
                          <div className="absolute inset-0 shimmer" />
                        )}
                        <img 
                          src={product.images?.[0] || product.image || '/placeholder-product.jpg'} 
                          alt={product.title}
                          className={`w-full h-full object-contain group-hover:scale-105 transition-all duration-700 ${
                            imageLoaded[product.id] ? "opacity-100 blur-0" : "opacity-0 blur-sm"
                          }`}
                          onLoad={() => {
                            setImageLoaded((prev) => ({ ...prev, [product.id]: true }));
                          }}
                          onError={(e) => {
                            const target = e.target;
                            if (target.src !== '/placeholder-product.jpg') {
                              target.src = '/placeholder-product.jpg';
                            }
                            setImageLoaded((prev) => ({ ...prev, [product.id]: true }));
                          }}
                        />
                        {product.specialPrice && (
                          <div className="absolute top-3 right-3 bg-black text-white px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-md tracking-wide">
                            SALE
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4 space-y-3">
                      <Link href={product.url || getProductUrl(product)} className="block">
                        <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-black transition-colors">
                          {product.title}
                        </h3>
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

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Price</span>
                          <span className="text-base font-semibold text-gray-900">
                            {product.price || `${getCurrencySymbol(product.currency || "BDT")}0`}
                          </span>
                        </div>
                        <Link
                          href={product.url || getProductUrl(product)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-black transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h4m0 0v4m0-4L8 16" />
                          </svg>
                          Details
                        </Link>
                      </div>

                      {/* Professional action bar */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          onClick={(e) => handleTryOn(e, product.id)}
                          className="h-9 rounded-lg bg-indigo-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-500 transition-colors"
                          title="Try-On"
                          aria-label="Try-On"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.75h4.5l1.5 3H8.25l1.5-3zM8.25 6.75h7.5l1.5 12h-10.5l1.5-12z" />
                          </svg>
                          Try-On
                        </button>

                        <Link
                          href={product.url || getProductUrl(product)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-9 rounded-lg bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                          title="View Product"
                          aria-label="View Product"
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
                          className="h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          title="Ask Questions"
                          aria-label="Ask Questions"
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
                <div ref={loadMoreRef} className="py-8 flex items-center justify-center">
                  {isFetchingMore ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" aria-hidden />
                      Loading more products...
                    </div>
                  ) : hasNextPage ? (
                    <span className="text-xs text-gray-400">Scroll to load more</span>
                  ) : (
                    <span className="text-xs text-gray-400">You have reached the end</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-black text-white shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
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
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(243, 244, 246, 0.9) 25%,
            rgba(229, 231, 235, 0.95) 37%,
            rgba(243, 244, 246, 0.9) 63%
          );
          background-size: 800px 100%;
          animation: shimmer 1.15s infinite linear;
        }
        @keyframes pulseSoft {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .animate-pulseSoft {
          animation: pulseSoft 1.2s ease-in-out infinite;
        }
        
        kbd {
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
}

