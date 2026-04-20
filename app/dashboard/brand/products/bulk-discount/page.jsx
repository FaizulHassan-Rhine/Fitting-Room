"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getProducts, updateProduct, calculateSpecialPrice, getCurrencySymbol } from "@/lib/productStorage";

export default function BulkDiscountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && user.type === "brand") {
      loadProducts();
    }
  }, [user]);

  const loadProducts = () => {
    const allProducts = getProducts();
    const brandProducts = allProducts.filter(
      (p) => p.brand === (user?.brandName || user?.name)
    );
    setProducts(brandProducts);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleApplyDiscount = () => {
    if (!discountType || !discountValue || selectedProducts.length === 0) {
      alert("Please select products and set discount details");
      return;
    }

    const discountVal = parseFloat(discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      alert("Please enter a valid discount value");
      return;
    }

    setApplying(true);

    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (product && !product.hidePrice) {
        const symbol = getCurrencySymbol(product.currency || "USD");
        const priceNum = product.price.replace(/[^0-9.]/g, "");
        
        const specialPrice = calculateSpecialPrice(
          priceNum,
          discountType,
          discountVal,
          symbol
        );

        if (specialPrice) {
          updateProduct(productId, {
            specialPrice,
            discountType,
            discountValue: discountVal,
          });
        }
      }
    });

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/brand");
    }, 2000);
  };

  if (!user || user.type !== "brand") {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-medium-gray mb-6">
            You need to be logged in as a brand to access this page.
          </p>
          <Link href="/auth/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Discounts Applied!</h2>
          <p className="text-medium-gray">Updated {selectedProducts.length} product(s)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/brand"
            className="inline-flex items-center text-medium-gray hover:text-black mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Bulk Apply Discounts</h1>
          <p className="text-medium-gray mt-2">Select multiple products and apply discounts in one go</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products Selection */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Select Products</h2>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-black hover:underline"
                >
                  {selectedProducts.length === products.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-medium-gray mb-4">No products found</p>
                  <Link href="/dashboard/brand/products/new" className="btn btn-primary">
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedProducts.includes(product.id)
                          ? "border-black bg-gray-50"
                          : "border-light-gray hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-5 h-5"
                      />
                      <img
                        src={product.images?.[0] || product.image || "/placeholder-product.jpg"}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.title}</h3>
                        <p className="text-sm text-medium-gray">{product.category}</p>
                        {!product.hidePrice && (
                          <p className="text-sm font-medium mt-1">
                            {product.specialPrice ? (
                              <>
                                <span className="line-through text-gray-500 mr-2">{product.price}</span>
                                <span className="text-green-600">{product.specialPrice}</span>
                              </>
                            ) : (
                              <span>{product.price}</span>
                            )}
                          </p>
                        )}
                      </div>
                      {product.hidePrice && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          Price Hidden
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {selectedProducts.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    {selectedProducts.length} product(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Discount Settings */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-bold mb-4">Discount Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    Discount Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="input"
                  >
                    <option value="">Select type</option>
                    <option value="amount">Fixed Amount Off</option>
                    <option value="percentage">Percentage Off</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    Discount Value <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {discountType === "amount" && <span className="text-lg font-medium">$</span>}
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="input flex-1"
                      placeholder={discountType === "percentage" ? "10" : "10.00"}
                      step="0.01"
                      min="0"
                    />
                    {discountType === "percentage" && <span className="text-lg font-medium">%</span>}
                  </div>
                  <p className="text-xs text-medium-gray mt-1">
                    {discountType === "percentage" 
                      ? "e.g., 20 for 20% off" 
                      : "e.g., 10 for $10 off"}
                  </p>
                </div>

                {/* Preview */}
                {discountType && discountValue && selectedProducts.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">Preview:</p>
                    <p className="text-xs text-green-700">
                      {discountType === "percentage" 
                        ? `${discountValue}% off on ${selectedProducts.length} product(s)`
                        : `$${discountValue} off on ${selectedProducts.length} product(s)`}
                    </p>
                  </div>
                )}

                {/* Warning */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Note:</p>
                      <p className="text-xs text-amber-700 mt-1">
                        This will override any existing discounts on the selected products. Products with hidden prices will be skipped.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApplyDiscount}
                  disabled={!discountType || !discountValue || selectedProducts.length === 0 || applying}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Applying..." : `Apply to ${selectedProducts.length} Product(s)`}
                </button>

                <Link href="/dashboard/brand" className="btn btn-secondary w-full block text-center">
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






