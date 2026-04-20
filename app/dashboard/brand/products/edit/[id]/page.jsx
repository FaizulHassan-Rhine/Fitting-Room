"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getProducts, updateProduct, calculateSpecialPrice, CURRENCIES, getCurrencySymbol } from "@/lib/productStorage";

const categories = ["T-Shirts", "Jeans", "Dresses", "Jackets", "Shoes", "Accessories"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const productId = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    newCategory: "",
    price: "",
    specialPrice: "",
    currency: "USD",
    discountType: "",
    discountValue: "",
    hidePrice: false,
    hideAvailability: false,
    tryOnLimit: "",
  });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [success, setSuccess] = useState(false);

  const currentBrandName = user?.brandName || user?.name || "Demo Brand";

  useEffect(() => {
    const products = getProducts();
    const product = products.find((p) => p.id === productId);
    // Only allow editing products that belong to this brand
    const isOwnProduct = product && product.brand?.toLowerCase() === currentBrandName?.toLowerCase();

    if (isOwnProduct && product) {
      setFormData({
        title: product.title,
        description: product.description,
        category: product.category,
        newCategory: "",
        price: product.price.replace(/[^0-9.]/g, "") || product.price,
        specialPrice: product.specialPrice?.replace(/[^0-9.]/g, "") || product.specialPrice || "",
        currency: product.currency || "USD",
        discountType: product.discountType || "",
        discountValue: product.discountValue?.toString() || "",
        hidePrice: product.hidePrice,
        hideAvailability: product.hideAvailability,
        tryOnLimit: product.tryOnLimit?.toString() || "",
      });
      setSelectedSizes(product.sizes || []);
      setProductImages(product.images || []);
    } else {
      router.push("/dashboard/brand");
    }
    setLoading(false);
  }, [productId, router, currentBrandName]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedSizes.length === 0) {
      alert("Please select at least one size");
      return;
    }

    if (productImages.length === 0) {
      alert("Please add at least one product image");
      return;
    }

    // Require price when price is visible to customers
    if (!formData.hidePrice) {
      const priceTrimmed = (formData.price || "").trim();
      const priceNum = parseFloat(priceTrimmed.replace(/[^0-9.]/g, ""));
      if (!priceTrimmed || isNaN(priceNum) || priceNum <= 0) {
        alert("Please enter a valid price. You can hide the price from customers if needed.");
        return;
      }
    }

    const category = formData.category === "new" ? formData.newCategory : formData.category;
    const symbol = getCurrencySymbol(formData.currency);

    // Calculate final special price if discount is provided
    let finalSpecialPrice = formData.specialPrice;
    if (formData.discountType && formData.discountValue && formData.price) {
      const discountValueNum = parseFloat(formData.discountValue);
      if (!isNaN(discountValueNum) && discountValueNum > 0) {
        const calculated = calculateSpecialPrice(
          formData.price,
          formData.discountType,
          discountValueNum,
          symbol
        );
        if (calculated) {
          finalSpecialPrice = calculated;
        }
      }
    }

    const priceNum = formData.price.trim().replace(/[^0-9.]/g, "");
    const specialNum = finalSpecialPrice?.trim().replace(/[^0-9.]/g, "");

    updateProduct(productId, {
      title: formData.title,
      description: formData.description,
      category,
      price: priceNum ? `${symbol}${priceNum}` : formData.price,
      specialPrice: specialNum ? `${symbol}${specialNum}` : undefined,
      currency: formData.currency,
      discountType: formData.discountType || undefined,
      discountValue: formData.discountValue ? parseFloat(formData.discountValue) : undefined,
      hidePrice: formData.hidePrice,
      hideAvailability: formData.hideAvailability,
      sizes: selectedSizes,
      images: productImages,
      tryOnLimit: formData.tryOnLimit ? parseInt(formData.tryOnLimit, 10) : undefined,
    });

    setSuccess(true);
    window.dispatchEvent(new Event('productsUpdated'));
    setTimeout(() => {
      router.push("/dashboard/brand");
    }, 2000);
  };

  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const updatedFormData = { ...formData, [target.name]: value };
    setFormData(updatedFormData);

    if (target.name === "price" || target.name === "discountType" || target.name === "discountValue" || target.name === "currency") {
      calculateSpecialPriceFromDiscount(updatedFormData);
    }
  };

  const calculateSpecialPriceFromDiscount = (data) => {
    if (data.discountType && data.discountValue && data.price) {
      const discountValueNum = parseFloat(data.discountValue);
      const symbol = getCurrencySymbol(data.currency);
      if (!isNaN(discountValueNum) && discountValueNum > 0) {
        const calculated = calculateSpecialPrice(
          data.price,
          data.discountType,
          discountValueNum,
          symbol
        );
        if (calculated) {
          const numOnly = calculated.replace(/[^0-9.]/g, "");
          setFormData((prev) => ({ ...prev, specialPrice: numOnly }));
        } else {
          setFormData((prev) => ({ ...prev, specialPrice: "" }));
        }
      } else {
        setFormData((prev) => ({ ...prev, specialPrice: "" }));
      }
    } else if (!data.discountType || !data.discountValue) {
      setFormData((prev) => ({ ...prev, specialPrice: "" }));
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleImageFileUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageData = reader.result;
            setProductImages((prev) => [...prev, imageData]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProductImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const handleRemoveImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Link href="/dashboard/brand" className="text-medium-gray hover:text-black mb-4 inline-block transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2 slide-up">Edit Product</h1>
          <p className="text-medium-gray slide-up" style={{animationDelay: '0.1s'}}>Update the product details below</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-black text-white rounded-sm fade-in">
            ✓ Product updated successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="new">+ Add New Category</option>
                </select>
              </div>

              {formData.category === "new" && (
                <div>
                  <label htmlFor="newCategory" className="block text-sm font-medium mb-2">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    id="newCategory"
                    name="newCategory"
                    value={formData.newCategory}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Available Sizes *</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`py-3 rounded-sm transition-colors ${
                    selectedSizes.includes(size)
                      ? "bg-black text-white"
                      : "bg-light-gray text-medium-gray hover:bg-medium-gray hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSizes.length === 0 && (
              <p className="text-sm text-medium-gray mt-2">Please select at least one size</p>
            )}
          </div>

          {/* Pricing */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Pricing</h2>

            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <div className="w-full sm:w-auto min-w-[140px]">
                  <label htmlFor="currency" className="block text-sm font-medium mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="input pr-8"
                    disabled={formData.hidePrice}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Price {!formData.hidePrice && <span className="text-red-600">*</span>}
                  </label>
                  <div className="flex rounded-sm border border-medium-gray focus-within:ring-2 focus-within:ring-black focus-within:ring-opacity-20 focus-within:border-black">
                    <span className="flex items-center px-3 bg-light-gray text-medium-gray border-r border-medium-gray rounded-l-sm">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="29.99"
                      className="input border-0 rounded-l-none focus:ring-0"
                      disabled={formData.hidePrice}
                    />
                  </div>
                  {!formData.hidePrice && (
                    <p className="text-xs text-medium-gray mt-1">Required to save. Uncheck &quot;Hide price&quot; to show prices.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="specialPrice" className="block text-sm font-medium mb-2">
                    Special Price {formData.discountType && formData.discountValue && (
                      <span className="text-xs text-gray-500 font-normal">(Auto-calculated)</span>
                    )}
                  </label>
                  <div className="flex rounded-sm border border-medium-gray focus-within:ring-2 focus-within:ring-black focus-within:ring-opacity-20 focus-within:border-black">
                    <span className="flex items-center px-3 bg-light-gray text-medium-gray border-r border-medium-gray rounded-l-sm">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <input
                      type="text"
                      id="specialPrice"
                      name="specialPrice"
                      value={formData.specialPrice}
                      onChange={handleChange}
                      placeholder="19.99"
                      className="input border-0 rounded-l-none focus:ring-0"
                      disabled={formData.hidePrice || !!(formData.discountType && formData.discountValue)}
                      readOnly={!!(formData.discountType && formData.discountValue)}
                    />
                  </div>
                </div>
              </div>

              {/* Discount Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3">Discount (Optional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="discountType" className="block text-sm font-medium mb-2">
                      Discount Type
                    </label>
                    <select
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="input"
                      disabled={formData.hidePrice}
                    >
                      <option value="">None</option>
                      <option value="amount">Fixed Amount ($)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  {formData.discountType && (
                    <div>
                      <label htmlFor="discountValue" className="block text-sm font-medium mb-2">
                        Discount Value
                        {formData.discountType === "percentage" && <span className="text-xs text-gray-500"> (0-100)</span>}
                      </label>
                      <input
                        type="number"
                        id="discountValue"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        placeholder={formData.discountType === "amount" ? "10.00" : "25"}
                        min="0"
                        max={formData.discountType === "percentage" ? "100" : undefined}
                        step={formData.discountType === "amount" ? "0.01" : "1"}
                        className="input"
                        disabled={formData.hidePrice}
                      />
                    </div>
                  )}
                </div>
                {formData.discountType && formData.discountValue && formData.specialPrice && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Calculated Special Price:</strong> {formData.specialPrice}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hidePrice"
                    checked={formData.hidePrice}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Hide price from customers</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hideAvailability"
                    checked={formData.hideAvailability}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Hide product placement/availability</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Product Images *</h2>
            
            {/* Image Upload Methods */}
            <div className="space-y-4 mb-4">
              {/* File Upload */}
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileUpload}
                  className="input"
                />
                <p className="text-xs text-medium-gray mt-1">You can select multiple images at once</p>
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="image-url" className="block text-sm font-medium mb-2">
                  Add Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="image-url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="btn btn-secondary whitespace-nowrap"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Image Preview Grid */}
            {productImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">Uploaded Images ({productImages.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-light-gray rounded-sm overflow-hidden">
                        <img
                          src={img}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target;
                            if (target.parentElement) {
                              target.parentElement.innerHTML = 
                                '<div class="w-full h-full flex items-center justify-center text-xs text-medium-gray">Invalid image</div>';
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productImages.length === 0 && (
              <p className="text-sm text-medium-gray">No images added yet. Please add at least one image.</p>
            )}
          </div>

          {/* Try-On Limit */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Try-On Settings</h2>
            <div>
              <label htmlFor="tryOnLimit" className="block text-sm font-medium mb-2">
                Try-On Limit (Per User)
              </label>
              <input
                type="number"
                id="tryOnLimit"
                name="tryOnLimit"
                value={formData.tryOnLimit}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                min="1"
                className="input"
              />
              <p className="text-xs text-medium-gray mt-1">
                Limit the number of fitting room attempts per user for this product. Leave empty for unlimited.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
              Update Product
            </button>
            <Link href="/dashboard/brand" className="btn btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

