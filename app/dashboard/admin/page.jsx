"use client";

import { useState, useEffect } from "react";
import { getAdminSettings, updateAdminSettings } from "@/lib/adminSettings";
import { getRankingWeights, setRankingWeights, RankingWeights } from "@/lib/brandRanking";

// Mock data
const mockStats = {
  totalBrands: 45,
  totalProducts: 234,
  totalUsers: 1567,
  pendingApprovals: 8,
};

const mockBrands = [
  { id: 1, name: "Urban Style", status: "approved", products: 12, joined: "2026-01-15" },
  { id: 2, name: "Fashion House", status: "pending", products: 0, joined: "2026-01-20" },
  { id: 3, name: "Denim Co", status: "approved", products: 8, joined: "2026-01-10" },
];

const mockCategories = [
  { id: 1, name: "T-Shirts", productCount: 45, requiresVerification: false },
  { id: 2, name: "Jeans", productCount: 32, requiresVerification: false },
  { id: 3, name: "Bikini", productCount: 12, requiresVerification: true },
  { id: 4, name: "Lingerie", productCount: 18, requiresVerification: true },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentHandling, setPaymentHandling] = useState("vto-platform");
  const [subdomainEnabled, setSubdomainEnabled] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [rankingWeights, setRankingWeightsState] = useState({
    popularity: 0.25,
    demand: 0.25,
    sales: 0.30,
    tryOnFrequency: 0.20,
  });

  useEffect(() => {
    const settings = getAdminSettings();
    setPaymentHandling(settings.paymentHandling);
    setSubdomainEnabled(settings.subdomainEnabled);
    const weights = getRankingWeights();
    setRankingWeightsState(weights);
  }, []);

  const handlePaymentHandlingChange = (value) => {
    setPaymentHandling(value);
    updateAdminSettings({ paymentHandling: value });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSubdomainToggle = (enabled) => {
    setSubdomainEnabled(enabled);
    updateAdminSettings({ subdomainEnabled: enabled });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleRankingWeightChange = (key, value) => {
    const newWeights = { ...rankingWeights, [key]: value };
    setRankingWeightsState(newWeights);
  };

  const handleSaveRankingWeights = () => {
    try {
      setRankingWeights(rankingWeights);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error) {
      alert("Error: Weights must sum to 1.0");
    }
  };

  const getTotalWeight = () => {
    return rankingWeights.popularity + rankingWeights.demand + rankingWeights.sales + rankingWeights.tryOnFrequency;
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-medium-gray">Manage the platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-medium-gray overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-b-2 border-black text-black"
                : "text-medium-gray hover:text-black"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("brands")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "brands"
                ? "border-b-2 border-black text-black"
                : "text-medium-gray hover:text-black"
            }`}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "categories"
                ? "border-b-2 border-black text-black"
                : "text-medium-gray hover:text-black"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "users"
                ? "border-b-2 border-black text-black"
                : "text-medium-gray hover:text-black"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "border-b-2 border-black text-black"
                : "text-medium-gray hover:text-black"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <p className="text-medium-gray text-sm mb-2">Total Brands</p>
                <p className="text-3xl font-bold">{mockStats.totalBrands}</p>
              </div>
              <div className="card">
                <p className="text-medium-gray text-sm mb-2">Total Products</p>
                <p className="text-3xl font-bold">{mockStats.totalProducts}</p>
              </div>
              <div className="card">
                <p className="text-medium-gray text-sm mb-2">Total Users</p>
                <p className="text-3xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="card">
                <p className="text-medium-gray text-sm mb-2">Pending Approvals</p>
                <p className="text-3xl font-bold text-medium-gray">{mockStats.pendingApprovals}</p>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Pending Brand Approvals</h2>
              <div className="space-y-3">
                {mockBrands
                  .filter((brand) => brand.status === "pending")
                  .map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-4 bg-light-gray rounded-sm">
                      <div>
                        <h3 className="font-semibold">{brand.name}</h3>
                        <p className="text-sm text-medium-gray">Joined: {brand.joined}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-primary text-sm">Approve</button>
                        <button className="btn btn-secondary text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "brands" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Brands</h2>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-gray">
                      <th className="text-left py-3 px-4">Brand Name</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Products</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBrands.map((brand) => (
                      <tr key={brand.id} className="border-b border-light-gray">
                        <td className="py-3 px-4 font-medium">{brand.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-sm ${
                              brand.status === "approved"
                                ? "bg-black text-white"
                                : "bg-light-gray text-medium-gray"
                            }`}
                          >
                            {brand.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-medium-gray">{brand.products}</td>
                        <td className="py-3 px-4 text-medium-gray">{brand.joined}</td>
                        <td className="py-3 px-4">
                          <button className="text-sm hover:underline mr-3">View</button>
                          {brand.status === "approved" ? (
                            <button className="text-sm hover:underline text-medium-gray">Suspend</button>
                          ) : (
                            <button className="text-sm hover:underline">Approve</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Categories</h2>
              <button className="btn btn-primary">Add Category</button>
            </div>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-light-gray">
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Products</th>
                      <th className="text-left py-3 px-4">Verification Required</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCategories.map((category) => (
                      <tr key={category.id} className="border-b border-light-gray">
                        <td className="py-3 px-4 font-medium">{category.name}</td>
                        <td className="py-3 px-4 text-medium-gray">{category.productCount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-sm ${
                              category.requiresVerification
                                ? "bg-black text-white"
                                : "bg-light-gray text-medium-gray"
                            }`}
                          >
                            {category.requiresVerification ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-sm hover:underline mr-3">Edit</button>
                          <button className="text-sm hover:underline text-medium-gray">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-3">Sensitive Category Management</h3>
              <p className="text-medium-gray mb-4">
                Categories marked as &quot;Verification Required&quot; will require users to verify their account
                before they can try on products from these categories.
              </p>
              <p className="text-sm text-medium-gray">
                Examples: Bikini, Lingerie, Innerwear
              </p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-medium-gray">
                User management features including consumer accounts, verification status, and activity monitoring
                will be available here.
              </p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Platform Settings</h2>
              
              {settingsSaved && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">✓ Settings saved successfully</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Subdomain Feature Toggle */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Brand Subdomain Feature</h3>
                  <p className="text-medium-gray text-sm mb-4">
                    Enable or disable the brand subdomain feature. When enabled, each brand can have their own
                    subdomain (e.g., brandname.vto.ai) with custom branding and product listings.
                  </p>
                  
                  <div className="flex items-center gap-4 p-4 border-2 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={subdomainEnabled}
                        onChange={(e) => handleSubdomainToggle(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold">Enable Brand Subdomains</div>
                        <p className="text-sm text-medium-gray">
                          Brands will have access to custom subdomains (brandname.vto.ai)
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {subdomainEnabled && (
                    <div className="mt-4 p-4 bg-light-gray rounded-lg">
                      <p className="text-sm text-medium-gray">
                        <strong>Note:</strong> Subdomains allow brands to showcase their products, brand information,
                        and use brand-specific payment processing (if enabled in Payment Routing settings).
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Handling Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Payment Routing</h3>
                  <p className="text-medium-gray text-sm mb-4">
                    Configure how payments are handled when users purchase products from The Fitting Room section.
                  </p>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentHandling"
                        value="brand"
                        checked={paymentHandling === "brand"}
                        onChange={() => handlePaymentHandlingChange("brand")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Payment handled by Brand</div>
                        <p className="text-sm text-medium-gray">
                          Users will be redirected to the brand&apos;s payment system when purchasing from The Fitting Room.
                          The brand handles all payment processing and fulfillment.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentHandling"
                        value="vto-platform"
                        checked={paymentHandling === "vto-platform"}
                        onChange={() => handlePaymentHandlingChange("vto-platform")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Payment handled by Platform</div>
                        <p className="text-sm text-medium-gray">
                          The Fitting Room platform handles payment processing. Users complete checkout through the platform,
                          and orders are forwarded to brands for fulfillment.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Brand Ranking Weights */}
                <div className="mt-8 pt-8 border-t border-light-gray">
                  <h3 className="text-xl font-semibold mb-3">Brand Ranking Algorithm</h3>
                  <p className="text-medium-gray text-sm mb-4">
                    Configure the weights for brand ranking algorithm. These weights determine how brands are ranked
                    in search results based on popularity, demand, sales, and fitting room frequency.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Popularity Weight: {rankingWeights.popularity.toFixed(2)} ({(rankingWeights.popularity * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rankingWeights.popularity}
                        onChange={(e) => handleRankingWeightChange("popularity", parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-medium-gray mt-1">
                        Based on views, followers, and brand engagement
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Demand Weight: {rankingWeights.demand.toFixed(2)} ({(rankingWeights.demand * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rankingWeights.demand}
                        onChange={(e) => handleRankingWeightChange("demand", parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-medium-gray mt-1">
                        Based on search queries, wishlist adds, and interest signals
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Sales Weight: {rankingWeights.sales.toFixed(2)} ({(rankingWeights.sales * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rankingWeights.sales}
                        onChange={(e) => handleRankingWeightChange("sales", parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-medium-gray mt-1">
                        Based on total sales count and revenue
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Try-On Frequency Weight: {rankingWeights.tryOnFrequency.toFixed(2)} ({(rankingWeights.tryOnFrequency * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rankingWeights.tryOnFrequency}
                        onChange={(e) => handleRankingWeightChange("tryOnFrequency", parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-medium-gray mt-1">
                        Based on number of fitting room sessions
                      </p>
                    </div>

                    <div className="pt-4 border-t border-light-gray">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Total Weight:</span>
                        <span className={`font-bold ${Math.abs(getTotalWeight() - 1.0) < 0.01 ? "text-green-600" : "text-red-600"}`}>
                          {getTotalWeight().toFixed(2)} / 1.00
                        </span>
                      </div>
                      {Math.abs(getTotalWeight() - 1.0) >= 0.01 && (
                        <p className="text-sm text-red-600 mb-4">
                          ⚠️ Weights must sum to 1.0. Current total: {getTotalWeight().toFixed(2)}
                        </p>
                      )}
                      <button
                        onClick={handleSaveRankingWeights}
                        disabled={Math.abs(getTotalWeight() - 1.0) >= 0.01}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Ranking Weights
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

