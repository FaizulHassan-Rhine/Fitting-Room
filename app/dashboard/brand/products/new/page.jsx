"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { saveProduct, calculateSpecialPrice, CURRENCIES, getCurrencySymbol } from "@/lib/productStorage";

const categories = ["T-Shirts", "Jeans", "Dresses", "Jackets", "Shoes", "Accessories"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

// Demo product images
const demoImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542272454315-7d0ab97db995?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
];

// Demo API response structure (for "Import from API")
const DEMO_API_JSON = JSON.stringify({
  products: [
    {
      title: "Classic Cotton T-Shirt",
      description: "Premium cotton tee, imported via API.",
      category: "T-Shirts",
      price: "29.99",
      currency: "USD",
      sizes: ["S", "M", "L", "XL"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      ],
    },
    {
      title: "Slim Fit Jeans",
      description: "Comfortable slim fit denim.",
      category: "Jeans",
      price: "59.99",
      currency: "USD",
      sizes: ["28", "30", "32", "34"],
      images: [
        "https://images.unsplash.com/photo-1542272454315-7d0ab97db995?w=400&h=400&fit=crop",
      ],
    },
    {
      title: "Summer Dress",
      description: "Light and breezy summer dress.",
      category: "Dresses",
      price: "45.00",
      currency: "USD",
      sizes: ["XS", "S", "M", "L"],
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
      ],
    },
  ],
}, null, 2);

// Demo crawl result (for "Import from my website" – Website)
const DEMO_CRAWL_PRODUCTS = [
  {
    title: "Striped Polo Shirt",
    description: "Found on your website – classic polo.",
    category: "T-Shirts",
    price: "39.99",
    currency: "USD",
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"],
  },
  {
    title: "Running Sneakers",
    description: "Found on your website – lightweight sneakers.",
    category: "Shoes",
    price: "89.99",
    currency: "USD",
    sizes: ["8", "9", "10", "11"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
  },
];

// Demo crawl result (for "Import from my website" – Facebook Marketplace)
const DEMO_FACEBOOK_PRODUCTS = [
  {
    title: "Vintage Denim Jacket",
    description: "Listed on Facebook Marketplace – lightly used.",
    category: "Jackets",
    price: "45.00",
    currency: "USD",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"],
  },
  {
    title: "Wireless Headphones",
    description: "From Marketplace – like new in box.",
    category: "Accessories",
    price: "55.00",
    currency: "USD",
    sizes: ["One size"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
  },
  {
    title: "Summer Floral Dress",
    description: "Facebook Marketplace listing.",
    category: "Dresses",
    price: "32.00",
    currency: "USD",
    sizes: ["XS", "S", "M"],
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
  },
];


export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [addMethod, setAddMethod] = useState("manual"); // "manual" | "api" | "apiUrl" | "website"
  const [activeTab, setActiveTab] = useState("basic");
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showDiscountTypeDropdown, setShowDiscountTypeDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const discountTypeDropdownRef = useRef(null);
  const imageUploadInputRef = useRef(null);

  // Import from API
  const [apiJson, setApiJson] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiProducts, setApiProducts] = useState([]);
  const [showDemoApiModal, setShowDemoApiModal] = useState(false);
  const [selectedApiIndices, setSelectedApiIndices] = useState([]);
  const apiFileInputRef = useRef(null);

  // Get products from API URL (fetch from brand's GET product API)
  const [apiUrl, setApiUrl] = useState("/api/demo/products");
  const [apiUrlLoading, setApiUrlLoading] = useState(false);
  const [apiUrlError, setApiUrlError] = useState("");
  const [apiUrlProducts, setApiUrlProducts] = useState([]);
  const [selectedApiUrlIndices, setSelectedApiUrlIndices] = useState([]);

  // Import from website / Facebook Marketplace (crawl)
  const [crawlSource, setCrawlSource] = useState("website"); // "website" | "facebook"
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteProducts, setWebsiteProducts] = useState([]);
  const [selectedWebsiteIndices, setSelectedWebsiteIndices] = useState([]);

  // Import success (for API/website bulk add)
  const [importSuccessCount, setImportSuccessCount] = useState(0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const target = event.target;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setShowCategoryDropdown(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(target)) {
        setShowCurrencyDropdown(false);
      }
      if (discountTypeDropdownRef.current && !discountTypeDropdownRef.current.contains(target)) {
        setShowDiscountTypeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a product title");
      setActiveTab("basic");
      return;
    }

    if (!formData.category && !formData.newCategory) {
      alert("Please select or create a category");
      setActiveTab("basic");
      return;
    }

    if (productImages.length === 0) {
      alert("Please add at least one product image");
      setActiveTab("basic");
      return;
    }

    if (!formData.hidePrice) {
      const priceTrimmed = (formData.price || "").trim();
      const priceNum = parseFloat(priceTrimmed.replace(/[^0-9.]/g, ""));
      if (!priceTrimmed || isNaN(priceNum) || priceNum <= 0) {
        alert("Please enter a valid price");
        setActiveTab("pricing");
        return;
      }
    }

    if (selectedSizes.length === 0) {
      alert("Please select at least one size");
      setActiveTab("fitting-room");
      return;
    }

    const category = formData.category === "new" ? formData.newCategory : formData.category;
    const symbol = getCurrencySymbol(formData.currency);

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

    saveProduct({
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
      brand: user?.brandName || user?.name || "Demo Brand",
      tryOnLimit: formData.tryOnLimit ? parseInt(formData.tryOnLimit) : undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/brand");
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setProductImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const processImageFiles = (files) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const maxAdd = Math.max(0, 10 - productImages.length);
    const toProcess = imageFiles.slice(0, maxAdd);
    if (toProcess.length === 0) return;
    const readers = toProcess.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((dataUrls) => {
      setProductImages((prev) => [...prev, ...dataUrls.filter(Boolean)]);
    });
    if (imageFiles.length > maxAdd) {
      alert(`Added ${toProcess.length} image(s). Max 10 images total.`);
    }
  };

  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    processImageFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) processImageFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleRemoveImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseDemoImages = () => {
    setProductImages(demoImages);
  };

  const brandName = user?.brandName || user?.name || "Demo Brand";

  const mapToSaveProduct = (item) => ({
    title: item.title || "Untitled",
    description: item.description || "",
    category: item.category || "T-Shirts",
    price: item.price ? (String(item.price).replace(/[^0-9.]/g, "") ? `${getCurrencySymbol(item.currency || "USD")}${String(item.price).replace(/[^0-9.]/g, "")}` : "$0") : "$0",
    currency: item.currency || "USD",
    hidePrice: !!item.hidePrice,
    hideAvailability: !!item.hideAvailability,
    sizes: Array.isArray(item.sizes) ? item.sizes : ["M", "L"],
    images: Array.isArray(item.images) && item.images.length ? item.images : [demoImages[0]],
    brand: brandName,
    tryOnLimit: item.tryOnLimit != null ? parseInt(item.tryOnLimit, 10) : undefined,
  });

  const parseApiJson = () => {
    setApiError("");
    try {
      const parsed = JSON.parse(apiJson);
      const list = parsed.products || (Array.isArray(parsed) ? parsed : [parsed]);
      if (!list.length) {
        setApiError("No products array found. Use format: { \"products\": [ {...}, ... ] }");
        setApiProducts([]);
        return;
      }
      setApiProducts(list);
      setSelectedApiIndices(list.map((_, i) => i));
    } catch (e) {
      setApiError("Invalid JSON: " + e.message);
      setApiProducts([]);
    }
  };

  const handleApiFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setApiJson(text);
      setApiError("");
      try {
        const parsed = JSON.parse(text);
        const list = parsed.products || (Array.isArray(parsed) ? parsed : [parsed]);
        if (list.length) {
          setApiProducts(list);
          setSelectedApiIndices(list.map((_, i) => i));
        } else {
          setApiProducts([]);
          setApiError("No products array found in file.");
        }
      } catch (err) {
        setApiProducts([]);
        setApiError("Invalid JSON in file: " + err.message);
      }
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const toggleApiSelection = (index) => {
    setSelectedApiIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const addApiProductsSelected = () => {
    const toAdd = selectedApiIndices.map((i) => apiProducts[i]).filter(Boolean);
    toAdd.forEach((item) => saveProduct(mapToSaveProduct(item)));
    setImportSuccessCount(toAdd.length);
    window.dispatchEvent(new Event("productsUpdated"));
    setTimeout(() => router.push("/dashboard/brand"), 1500);
  };

  const fetchWebsiteProducts = () => {
    const trimmed = websiteUrl.trim();
    if (crawlSource === "website" && !trimmed) {
      alert("Please enter your website URL");
      return;
    }
    if (crawlSource === "facebook" && !trimmed) {
      alert("Please enter a Marketplace URL or search term");
      return;
    }
    setWebsiteLoading(true);
    setWebsiteProducts([]);
    setSelectedWebsiteIndices([]);
    const demoProducts = crawlSource === "facebook" ? DEMO_FACEBOOK_PRODUCTS : DEMO_CRAWL_PRODUCTS;
    setTimeout(() => {
      setWebsiteProducts(demoProducts);
      setSelectedWebsiteIndices(demoProducts.map((_, i) => i));
      setWebsiteLoading(false);
    }, 1500);
  };

  const selectAllWebsite = () => {
    setSelectedWebsiteIndices(websiteProducts.map((_, i) => i));
  };

  const toggleWebsiteSelection = (index) => {
    setSelectedWebsiteIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const addWebsiteProductsSelected = () => {
    const toAdd = selectedWebsiteIndices.map((i) => websiteProducts[i]).filter(Boolean);
    toAdd.forEach((item) => saveProduct(mapToSaveProduct(item)));
    setImportSuccessCount(toAdd.length);
    window.dispatchEvent(new Event("productsUpdated"));
    setTimeout(() => router.push("/dashboard/brand"), 1500);
  };

  // Get products from API URL (GET request)
  const fetchFromApiUrl = async () => {
    const url = apiUrl.trim();
    if (!url) {
      setApiUrlError("Please enter your product API URL");
      return;
    }
    setApiUrlError("");
    setApiUrlLoading(true);
    setApiUrlProducts([]);
    setSelectedApiUrlIndices([]);
    try {
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = data.products || (Array.isArray(data) ? data : []);
      if (!list.length) {
        setApiUrlError("No products in response. Expected { \"products\": [ {...}, ... ] } or an array.");
        setApiUrlLoading(false);
        return;
      }
      setApiUrlProducts(list);
      setSelectedApiUrlIndices(list.map((_, i) => i));
    } catch (err) {
      setApiUrlError(err.message || "Failed to fetch. Check URL, CORS, and that the API returns JSON with a 'products' array.");
    }
    setApiUrlLoading(false);
  };

  const toggleApiUrlSelection = (index) => {
    setSelectedApiUrlIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectAllApiUrl = () => {
    setSelectedApiUrlIndices(apiUrlProducts.map((_, i) => i));
  };

  const addApiUrlProductsSelected = () => {
    const toAdd = selectedApiUrlIndices.map((i) => apiUrlProducts[i]).filter(Boolean);
    toAdd.forEach((item) => saveProduct(mapToSaveProduct(item)));
    setImportSuccessCount(toAdd.length);
    window.dispatchEvent(new Event("productsUpdated"));
    setTimeout(() => router.push("/dashboard/brand"), 1500);
  };

  const tabs = [
    { 
      id: "basic", 
      label: "Basic Info", 
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      id: "pricing", 
      label: "Pricing & Discounts", 
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: "fitting-room", 
      label: "Fitting Room", 
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  if (!user || user.type !== "brand") {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-medium-gray mb-6">
            You need to be logged in as a brand to add products.
          </p>
          <Link href="/auth/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (success || importSuccessCount > 0) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {importSuccessCount > 0 ? `${importSuccessCount} Product(s) Added!` : "Product Added!"}
          </h2>
          <p className="text-medium-gray">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <Link
            href="/dashboard/brand"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Choose how you want to add products to your catalog</p>
        </div>

        {/* Parent tabs: Add method – primary navigation */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Add method</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden border-b border-gray-100 scrollbar-hide min-h-[3rem] items-stretch justify-center">
              {[
                { id: "manual", label: "Manual (form)" },
                { id: "api", label: "Import from API (paste JSON)" },
                { id: "apiUrl", label: "Get products from API URL" },
                { id: "website", label: "Import from my website" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAddMethod(m.id)}
                  className={`shrink-0 px-5 py-3.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
                    addMethod === m.id
                      ? "border-black text-black bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Import from API */}
        {addMethod === "api" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Import from API</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Paste JSON or upload a file</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                <p className="text-sm text-gray-600">
                  Paste your API response below or upload a .json file. Pasted JSON is parsed when you leave the field.
                </p>
              </div>
              <input
                type="file"
                ref={apiFileInputRef}
                accept=".json,application/json"
                onChange={handleApiFileUpload}
                className="hidden"
                aria-hidden="true"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDemoApiModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Demo API format
                  </button>
                  <button
                    type="button"
                    onClick={() => apiFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload JSON file
                  </button>
                </div>
                <label className="block text-xs font-medium text-gray-500 mt-1">JSON input</label>
                <textarea
                  value={apiJson}
                  onChange={(e) => { setApiJson(e.target.value); setApiError(""); }}
                  onBlur={parseApiJson}
                  placeholder='{ "products": [ { "title", "description", "category", "price", "currency", "sizes", "images" }, ... ] }'
                  rows={10}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors resize-y min-h-[200px]"
                />
                {apiError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {apiError}
                  </p>
                )}
              </div>
              {apiProducts.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Select products to add <span className="text-gray-500 font-normal">({selectedApiIndices.length} selected)</span>
                  </p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50/30 divide-y divide-gray-200 max-h-64 overflow-y-auto shadow-inner">
                    {apiProducts.map((p, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 hover:bg-white/80 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedApiIndices.includes(i)}
                          onChange={() => toggleApiSelection(i)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" onError={(e) => e.target.style.display = "none"} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900">{p.title}</span>
                          <span className="text-gray-500 text-sm ml-2">{p.category} · ${String(p.price || "").replace(/[^0-9.]/g, "") || "—"}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addApiProductsSelected}
                    disabled={selectedApiIndices.length === 0}
                    className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {selectedApiIndices.length} product(s) to catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Get products from API URL */}
        {addMethod === "apiUrl" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Get products from API URL</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Fetch products from your API endpoint</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                <p className="text-sm text-gray-600">
                  Enter your product API URL (GET). We’ll fetch and list products. Response must be JSON with a <code className="bg-gray-200/80 px-1 rounded text-gray-700">products</code> array.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDemoApiModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Demo API format
                  </button>
                </div>
               
                <label className="block text-xs font-medium text-gray-500 mt-1">API URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => { setApiUrl(e.target.value); setApiUrlError(""); }}
                    placeholder="https://your-api.com/products"
                    className="block flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={fetchFromApiUrl}
                    disabled={apiUrlLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {apiUrlLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Fetching…
                      </>
                    ) : (
                      "Fetch products"
                    )}
                  </button>
                </div>
                {apiUrlError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {apiUrlError}
                  </p>
                )}
              </div>
              {apiUrlProducts.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      Select products to add <span className="text-gray-500 font-normal">({selectedApiUrlIndices.length} of {apiUrlProducts.length} selected)</span>
                    </p>
                    <button type="button" onClick={selectAllApiUrl} className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900">
                      Select all
                    </button>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50/30 divide-y divide-gray-200 max-h-72 overflow-y-auto shadow-inner">
                    {apiUrlProducts.map((p, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 hover:bg-white/80 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedApiUrlIndices.includes(i)}
                          onChange={() => toggleApiUrlSelection(i)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" onError={(e) => e.target.style.display = "none"} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900">{p.title}</span>
                          <span className="text-gray-500 text-sm ml-2">{p.category} · ${String(p.price != null ? p.price : "").replace(/[^0-9.]/g, "") || "—"}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addApiUrlProductsSelected}
                    disabled={selectedApiUrlIndices.length === 0}
                    className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {selectedApiUrlIndices.length} product(s) to catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import from my website / Facebook Marketplace (crawl demo) */}
        {addMethod === "website" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Import from website or marketplace</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Crawl your site or Facebook Marketplace</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3">
                <p className="text-sm text-gray-600">
                  Choose a source, then enter a URL or search. We'll scan and list products. (This is a demo: we show sample results.)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Source</label>
                <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => { setCrawlSource("website"); setWebsiteUrl(""); setWebsiteProducts([]); setSelectedWebsiteIndices([]); }}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${crawlSource === "website" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Website
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCrawlSource("facebook"); setWebsiteUrl(""); setWebsiteProducts([]); setSelectedWebsiteIndices([]); }}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${crawlSource === "facebook" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Facebook Marketplace
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  {crawlSource === "website" ? "Website URL" : "Marketplace URL or search"}
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type={crawlSource === "website" ? "url" : "text"}
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder={crawlSource === "website" ? "https://yourstore.com or https://yourstore.com/collections/dresses" : "https://www.facebook.com/marketplace or search term"}
                    className="block flex-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={fetchWebsiteProducts}
                    disabled={websiteLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {websiteLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {crawlSource === "facebook" ? "Searching…" : "Scanning…"}
                      </>
                    ) : crawlSource === "facebook" ? "Search marketplace" : "Fetch products"}
                  </button>
                </div>
              </div>
            </div>
            {websiteProducts.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100 px-6 pb-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Products found – select to add <span className="text-gray-500 font-normal">({selectedWebsiteIndices.length} selected)</span>
                  </p>
                  <button type="button" onClick={selectAllWebsite} className="text-sm font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900">
                    Select all
                  </button>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50/30 divide-y divide-gray-200 max-h-72 overflow-y-auto shadow-inner">
                  {websiteProducts.map((p, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 hover:bg-white/80 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedWebsiteIndices.includes(i)}
                        onChange={() => toggleWebsiteSelection(i)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" onError={(e) => e.target.style.display = "none"} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{p.title}</span>
                        <span className="text-gray-500 text-sm ml-2">{p.category} · ${String(p.price || "").replace(/[^0-9.]/g, "") || "—"}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addWebsiteProductsSelected}
                  disabled={selectedWebsiteIndices.length === 0}
                  className="w-full sm:w-auto rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add {selectedWebsiteIndices.length} product(s) to catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo API format modal (shared by Import from API & Get products from API URL) */}
        {showDemoApiModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDemoApiModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-api-title"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 id="demo-api-title" className="text-sm font-semibold text-gray-900">Demo API format</h3>
                <button
                  type="button"
                  onClick={() => setShowDemoApiModal(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1 min-h-0">
                <pre className="text-xs font-mono text-gray-800 bg-gray-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words">
                  {DEMO_API_JSON}
                </pre>
              </div>
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDemoApiModal(false)}
                  className="btn btn-primary text-sm w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {addMethod === "manual" && (
        <form onSubmit={handleSubmit}>
          {/* Child tabs: Product details (Basic Info | Pricing | Fitting Room) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <p className="text-sm font-bold text-gray-600 px-6 pt-5 pb-2">Product details</p>
            <div className="flex overflow-x-auto overflow-y-hidden border-b border-gray-100 px-4 scrollbar-hide min-h-[2.75rem] items-stretch bg-gray-50/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 flex-1 min-w-[100px] px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 sm:p-8">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Product Information</h2>
                  
                  {/* Title */}
                  <div className="mb-5">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                      placeholder="e.g., Classic Denim Jacket"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors resize-none"
                      placeholder="Describe your product..."
                    />
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={categoryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-medium bg-white text-gray-700 flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                      >
                        <span>{formData.category || "Select a category"}</span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, category: cat }));
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                formData.category === cat
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: "new" }));
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors border-t border-gray-100 ${
                              formData.category === "new"
                                ? "bg-gray-900 text-white"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            + Create New Category
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.category === "new" && (
                    <div className="mb-6">
                      <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Category Name
                      </label>
                      <input
                        type="text"
                        id="newCategory"
                        name="newCategory"
                        value={formData.newCategory}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                        placeholder="Enter new category name"
                      />
                    </div>
                  )}
                </div>

                {/* Product Images */}
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Product Images <span className="text-red-500">*</span></h2>
                  <p className="text-sm text-gray-500 mb-5">Add at least one image via URL or upload. Max 10 images.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 flex flex-col items-center">
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1 w-full text-center">
                        Add by URL
                      </label>
                      <div className="w-full max-w-xs flex flex-col items-center">
                        <input
                          type="url"
                          id="imageUrl"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                          placeholder="https://example.com/image.jpg"
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
                          className="mt-1.5 w-full rounded-lg bg-gray-900 py-1.5 px-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && imageUploadInputRef.current?.click()}
                      onClick={() => imageUploadInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-xl border-2 border-dashed p-4 min-h-[110px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer select-none ${isDragOver ? "border-gray-900 bg-gray-50" : "border-gray-300 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50"}`}
                    >
                      <input
                        type="file"
                        ref={imageUploadInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleImageFileUpload}
                        className="hidden"
                        aria-hidden="true"
                      />
                      <svg className="w-8 h-8 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">Drag and drop images here</p>
                      <p className="text-xs text-gray-500">or click to browse</p>
                      <p className="text-xs text-gray-500">JPG, PNG, WebP. Max 10 images.</p>
                    </div>
                  </div>

                  {/* Use Demo Images – commented out
                  <button
                    type="button"
                    onClick={handleUseDemoImages}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Use Demo Images
                  </button>
                  */}

                  {productImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {productImages.length === 0 && (
                    <p className="text-sm text-gray-400 mt-3">No images added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === "pricing" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Price Settings</h2>
                  
                  {/* Currency */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                    <div className="relative" ref={currencyDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-medium bg-white text-gray-700 flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                      >
                        <span>
                          {CURRENCIES.find(c => c.code === formData.currency) 
                            ? `${CURRENCIES.find(c => c.code === formData.currency)?.label}`
                            : "Select currency"}
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {showCurrencyDropdown && (
                        <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                          {CURRENCIES.map((curr) => (
                            <button
                              key={curr.code}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, currency: curr.code }));
                                setShowCurrencyDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                formData.currency === curr.code
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {curr.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">{getCurrencySymbol(formData.currency)}</span>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="block flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="99.99"
                        disabled={formData.hidePrice}
                      />
                    </div>
                  </div>

                  {/* Hide Price Option */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hidePrice"
                        checked={formData.hidePrice}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20"
                      />
                      <span className="text-sm text-gray-700">Hide price from customers (Contact for price)</span>
                    </label>
                  </div>
                </div>

                {/* Discount Settings */}
                {!formData.hidePrice && (
                  <div className="pt-8 border-t border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Discount Settings</h2>
                    <p className="text-sm text-gray-500 mb-5">
                      Set a special price or discount for this product
                    </p>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
                      <div className="relative" ref={discountTypeDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setShowDiscountTypeDropdown(!showDiscountTypeDropdown)}
                          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-medium bg-white text-gray-700 flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                        >
                          <span>
                            {formData.discountType === "amount" 
                              ? "Fixed Amount"
                              : formData.discountType === "percentage"
                              ? "Percentage"
                              : "No Discount"}
                          </span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${showDiscountTypeDropdown ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showDiscountTypeDropdown && (
                          <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, discountType: "" }));
                                setShowDiscountTypeDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                formData.discountType === ""
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              No Discount
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, discountType: "amount" }));
                                setShowDiscountTypeDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                formData.discountType === "amount"
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              Fixed Amount
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, discountType: "percentage" }));
                                setShowDiscountTypeDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                formData.discountType === "percentage"
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              Percentage
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.discountType && (
                      <div className="mb-5">
                        <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Discount Value
                        </label>
                        <div className="flex items-center gap-2">
                          {formData.discountType === "amount" && (
                            <span className="text-sm font-medium text-gray-500">{getCurrencySymbol(formData.currency)}</span>
                          )}
                          <input
                            type="number"
                            id="discountValue"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleChange}
                            className="block flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                            placeholder={formData.discountType === "percentage" ? "10" : "10.00"}
                            step="0.01"
                            min="0"
                          />
                          {formData.discountType === "percentage" && (
                            <span className="text-sm font-medium text-gray-500">%</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Price Preview */}
                    {formData.price && formData.discountType && formData.discountValue && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Special Price Preview:</p>
                        <div className="flex items-center gap-3">
                          <span className="text-lg line-through text-gray-600">
                            {getCurrencySymbol(formData.currency)}{formData.price}
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            {calculateSpecialPrice(
                              formData.price,
                              formData.discountType,
                              parseFloat(formData.discountValue),
                              getCurrencySymbol(formData.currency)
                            )}
                          </span>
                          {formData.discountType === "percentage" && (
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                              {formData.discountValue}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bulk Discount Notice */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">Need to apply discounts to multiple products?</p>
                          <p className="text-sm text-blue-700">
                            Go to your product list and use the bulk discount feature to apply discounts to multiple products at once.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hide Availability Option */}
                <div className="pt-8 border-t border-gray-100">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hideAvailability"
                      checked={formData.hideAvailability}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20"
                    />
                    <span className="text-sm text-gray-700">Hide availability status from customers</span>
                  </label>
                </div>
              </div>
            )}

            {/* Fitting Room Tab */}
            {activeTab === "fitting-room" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Size Options <span className="text-red-500">*</span></h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Select available sizes for this product
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSizes.includes(size)
                            ? "bg-gray-900 text-white shadow-sm"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {selectedSizes.length > 0 && (
                    <p className="text-sm text-gray-500 mt-3">
                      Selected: {selectedSizes.join(", ")}
                    </p>
                  )}
                </div>

                {/* Try-On Limit */}
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-tight border-b border-gray-100 pb-2 mb-5">Fitting Room Limits</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Control how many times users can try on this product
                  </p>

                  <div>
                    <label htmlFor="tryOnLimit" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Try-On Limit (per user)
                    </label>
                    <input
                      type="number"
                      id="tryOnLimit"
                      name="tryOnLimit"
                      value={formData.tryOnLimit}
                      onChange={handleChange}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      className="block w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Limit the number of fitting room attempts per user for this product. Leave empty for unlimited.
                    </p>
                  </div>

                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">About Try-On Limits</p>
                        <p className="text-sm text-amber-700">
                          Setting limits can help manage server resources and encourage purchase decisions. Most brands leave this unlimited.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-6 pb-6 pt-4 gap-4 border-t border-gray-100 mt-6">
            <Link href="/dashboard/brand" className="btn btn-secondary text-sm">
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              {activeTab !== "basic" && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                  className="btn btn-secondary text-sm"
                >
                  ← Previous
                </button>
              )}
              {activeTab !== "fitting-room" ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }}
                  className="btn btn-primary text-sm"
                >
                  Next →
                </button>
              ) : (
                <button type="submit" className="btn btn-primary text-sm">
                  Add Product
                </button>
              )}
            </div>
          </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
