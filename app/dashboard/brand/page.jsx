"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getProducts, updateProduct } from "@/lib/productStorage";
import { getWalletBalance } from "@/lib/walletStorage";

export default function BrandDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam && ["overview", "credits"].includes(tabParam) 
      ? tabParam 
      : "overview"
  );
  const [products, setProducts] = useState([]);
  const [credits, setCredits] = useState(200);

  useEffect(() => {
    // Handle tab parameter from URL
    if (tabParam && ["overview", "credits"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Current brand name: use brandName for registered brands, fallback to name (e.g. Demo Brand)
  const currentBrandName = user?.brandName || user?.name || "Demo Brand";

  useEffect(() => {
    const loadProducts = () => {
      const allProducts = getProducts();
      // Only show products that belong to this brand
      const brandProducts = allProducts.filter(
        (p) => p.brand?.toLowerCase() === currentBrandName?.toLowerCase()
      );
      setProducts(brandProducts);
    };

    loadProducts();
    
    // Get credits from wallet system
    const loadCredits = () => {
      if (user) {
        const walletBalance = getWalletBalance(user.email, "brand");
        setCredits(walletBalance);
        // Sync with old system for backward compatibility
        localStorage.setItem('brand_credits', walletBalance.toString());
      } else {
        const storedCredits = localStorage.getItem('brand_credits');
        if (storedCredits) {
          setCredits(parseInt(storedCredits, 10));
        } else {
          setCredits(200);
        }
      }
    };
    
    loadCredits();
    
    // Listen for storage changes (when credits are updated from topup page)
    const handleStorageChange = (e) => {
      if (e.key === 'brand_credits') {
        loadCredits();
      } else if (e.key === 'vto_products') {
        loadProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates)
    const handleCreditsUpdate = () => {
      loadCredits();
    };
    
    const handleProductsUpdate = () => {
      loadProducts();
    };
    
    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    window.addEventListener('productsUpdated', handleProductsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('creditsUpdated', handleCreditsUpdate);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, [user, currentBrandName]);

  const handleStatusToggle = (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateProduct(productId, { status: newStatus });
    const allProducts = getProducts();
    const brandProducts = allProducts.filter(
      (p) => p.brand?.toLowerCase() === currentBrandName?.toLowerCase()
    );
    setProducts(brandProducts);
    window.dispatchEvent(new Event('productsUpdated'));
  };

  const handleTestTryOn = (productId) => {
    localStorage.setItem("tryOnProductId", productId.toString());
    window.location.href = "/try-on";
  };

  const mockBrand = {
    name: currentBrandName,
    credits: credits,
    products: products.length,
    views: products.reduce((sum, p) => sum + (p.views || 0), 0),
    tryOns: products.reduce((sum, p) => sum + (p.tryOns || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{mockBrand.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Brand Dashboard</p>
          </div>
          <Link
            href="/dashboard/brand/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === "overview"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === "credits"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Credits
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Credits Balance</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tabular-nums">{mockBrand.credits}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tabular-nums">{mockBrand.products}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Total Views</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tabular-nums">{mockBrand.views.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Try-Ons</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 tabular-nums">{mockBrand.tryOns}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/brand/products/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </Link>
                <Link
                  href="/dashboard/brand/products/bulk-discount"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Bulk Discounts
                </Link>
                <Link
                  href="/dashboard/brand/credits/topup"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Top Up Credits
                </Link>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Your Products</h2>
                <Link
                  href="/dashboard/brand/products/new"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors w-full sm:w-auto"
                >
                  Add Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Views</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Try-Ons</th>
                      <th className="text-left py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.title}</p>
                              <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusToggle(product.id, product.status)}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                                product.status === "active" ? "bg-gray-900" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                  product.status === "active" ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span className={`text-xs font-medium ${product.status === "active" ? "text-gray-900" : "text-gray-500"}`}>
                              {product.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600 tabular-nums">{product.views || 0}</td>
                        <td className="py-3.5 px-4 text-sm text-gray-600 tabular-nums">{product.tryOns || 0}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTestTryOn(product.id)}
                              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
                            >
                              Test Try-On
                            </button>
                            <Link
                              href={`/dashboard/brand/products/edit/${product.id}`}
                              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              aria-label="Edit product"
                              title="Edit product"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <p className="text-gray-500 text-sm">No products yet.</p>
                          <Link href="/dashboard/brand/products/new" className="mt-2 inline-block text-sm font-medium text-gray-900 hover:underline">
                            Add your first product →
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "credits" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Credits Balance</h2>
              <p className="text-4xl font-bold text-gray-900 tabular-nums mb-2">{mockBrand.credits}</p>
              <p className="text-sm text-gray-500 mb-6">
                Use credits to promote products, increase visibility, and access advanced analytics.
              </p>
              <Link
                href="/dashboard/brand/credits/topup"
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                Top Up Credits
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Credit Usage History</h2>
              <p className="text-sm text-gray-500">No recent transactions.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

