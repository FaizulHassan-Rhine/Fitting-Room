"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProducts, getProductUrl, parseProductIdFromSlug } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import { generateSubdomainSlug, getBrands } from "@/lib/brandStorage";
import { getUserPhotos, saveUserPhoto, setLastUsedPhotoId, getLastUsedPhoto } from "@/lib/photoStorage";
import { useAuth } from "@/lib/AuthContext";
import UserPhotosModal from "@/components/UserPhotosModal";
import { compressImage } from "@/lib/imageCompression";

const ZOOM_SCALE = 2.2;

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug;
  const [product, setProduct] = useState(null);
  const [brand, setBrand] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState({ show: false, x: 50, y: 50 });
  const mainImageRef = useRef(null);
  const thumbStripRef = useRef(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPhotoForConfirm, setSelectedPhotoForConfirm] = useState(null);

  const thumbSize = 64; // w-16; match sm:w-16
  const thumbGap = 8;
  const thumbStep = thumbSize + thumbGap;
  const images = product ? (product.images || [product.image]) : [];

  const scrollThumbs = (direction) => {
    const el = thumbStripRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * thumbStep * 2, behavior: "smooth" });
  };

  const mainImageSrc = product?.images?.[selectedImage] || product?.image || "/placeholder-product.jpg";

  const handleZoomMove = (clientX, clientY) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setZoom({ show: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleZoomEnd = () => {
    setZoom((z) => ({ ...z, show: false }));
  };

  useEffect(() => {
    const productId = parseProductIdFromSlug(slug);
    if (productId == null) {
      setProduct(null);
      setResolved(true);
      return;
    }
    const allProducts = getProducts();
    const found = allProducts.find((p) => p.id === productId);
    if (found && found.status === "inactive") {
      setProduct(null);
      setResolved(true);
      return;
    }
    if (found && /^\d+$/.test(slug)) {
      window.location.replace(getProductUrl(found));
      return;
    }
    setProduct(found);
    
    // Load brand data
    if (found && found.brand) {
      const brands = getBrands();
      const foundBrand = brands.find((b) => b.name.toLowerCase() === found.brand.toLowerCase());
      setBrand(foundBrand || null);
    }
    
    setResolved(true);
  }, [slug]);

  // Load saved photos for the try-on flow
  useEffect(() => {
    const photos = getUserPhotos();
    setSavedPhotos(photos);
  }, []);

  if (!resolved) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-medium-gray">Product not found</p>
      </div>
    );
  }

  // Open file picker directly
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload: save photo for consumer, then navigate to try-on
  const handleTryOnUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image before saving
      const compressedImageData = await compressImage(file);
      
      // Save photo for future use (especially for consumer users)
      const savedPhoto = saveUserPhoto(compressedImageData);
      
      // Store photo ID instead of full image data
      setLastUsedPhotoId(savedPhoto.id);
      localStorage.setItem("vto_last_used_photo", compressedImageData);

      // Navigate to try-on page
      const size = selectedSize || product.sizes?.[0] || "";
      localStorage.setItem("tryOnSelectedSize", size);
      localStorage.setItem("tryOnProductId", product.id.toString());
      window.location.href = "/try-on";
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image. Please try again with a smaller image.");
      setIsUploading(false);
    }
  };

  // Use a previously saved photo
  const handleUsePreviousPhoto = () => {
    // If multiple photos, show modal to select
    if (savedPhotos.length > 1) {
      setShowPhotosModal(true);
      return;
    }

    // If only one photo, show confirmation modal first
    if (savedPhotos.length === 1) {
      setSelectedPhotoForConfirm(savedPhotos[0]);
      setShowConfirmModal(true);
    }
  };

  // Confirm and proceed with try-on
  const handleConfirmTryOn = () => {
    if (!selectedPhotoForConfirm) return;
    
    setLastUsedPhotoId(selectedPhotoForConfirm.id);
    localStorage.setItem("vto_last_used_photo", selectedPhotoForConfirm.imageData);
    const size = selectedSize || product.sizes?.[0] || "";
    localStorage.setItem("tryOnSelectedSize", size);
    localStorage.setItem("tryOnProductId", product.id.toString());
    setShowConfirmModal(false);
    window.location.href = "/try-on";
  };

  // Handle photo selection from modal
  const handleSelectPhotoFromModal = (imageData) => {
    // Find the photo by imageData to get its ID
    const selectedPhoto = savedPhotos.find(p => p.imageData === imageData);
    if (selectedPhoto) {
      // Show confirmation modal with selected photo
      setSelectedPhotoForConfirm(selectedPhoto);
      setShowPhotosModal(false);
      setShowConfirmModal(true);
    }
  };

  const handleAddToCart = () => {
    const size = selectedSize || product.sizes?.[0];
    if (product.sizes?.length && !size) {
      alert("Please select a size first");
      return;
    }
    addToCart({
      ...product,
      selectedSize: size,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <UserPhotosModal
        isOpen={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
        onSelectPhoto={handleSelectPhotoFromModal}
        currentPhoto={null}
      />
      
      {/* Confirmation Modal */}
      {showConfirmModal && selectedPhotoForConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(false)}>
          <div 
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-6 rounded-t-lg flex items-center justify-between border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold mb-1">Confirm Try-On</h2>
                <p className="text-sm text-gray-300">Review your photo before proceeding</p>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Selected Photo
                </h3>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={selectedPhotoForConfirm.imageData}
                    alt="Selected photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Product Preview */}
              <div className="mb-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={product.images?.[0] || product.image || "/placeholder-product.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.title}</p>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Tips */}
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-gray-600">
                  <p className="font-semibold mb-1.5 text-gray-900">Ready to try on?</p>
                  <p className="text-gray-600">Click confirm to start the try-on process with your selected photo.</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-white hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTryOn}
                  className="flex-1 py-3 px-4 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm & Start Try-On
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm fade-in">
          <Link href="/browse" className="text-medium-gray hover:text-black transition-colors">
            Browse
          </Link>
          <span className="mx-2 text-medium-gray">/</span>
          <span className="text-black">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="slide-in-left">
            {/* Main image with hover/touch zoom */}
            <div
              ref={mainImageRef}
              className="relative aspect-square bg-light-gray mb-3 overflow-hidden rounded-sm touch-none"
              onMouseEnter={() => setZoom((z) => ({ ...z, show: true }))}
              onMouseMove={(e) => handleZoomMove(e.clientX, e.clientY)}
              onMouseLeave={handleZoomEnd}
              onTouchStart={(e) => {
                const t = e.touches[0];
                if (t) handleZoomMove(t.clientX, t.clientY);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const t = e.touches[0];
                if (t) handleZoomMove(t.clientX, t.clientY);
              }}
              onTouchEnd={handleZoomEnd}
            >
              <img
                src={mainImageSrc}
                alt={product.title}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
                onError={(e) => {
                  const target = e.target;
                  if (target.src !== "/placeholder-product.jpg") {
                    target.src = "/placeholder-product.jpg";
                  } else {
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center text-medium-gray">Image unavailable</div>';
                    }
                  }
                }}
              />
              {zoom.show && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${mainImageSrc})`,
                    backgroundSize: `${ZOOM_SCALE * 100}%`,
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </div>

            {/* Thumbnail carousel - no scrollbar, arrows + touch swipe */}
            <div className="relative flex items-center gap-1">
              {images.length > 3 && (
                <button
                  type="button"
                  aria-label="Previous images"
                  onClick={() => scrollThumbs(-1)}
                  className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white text-black hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div
                ref={thumbStripRef}
                className="thumb-slider flex flex-1 gap-2 overflow-x-auto overflow-y-hidden py-1 scroll-smooth touch-pan-x snap-x snap-mandatory min-w-0"
              >
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-sm overflow-hidden border-2 transition-all snap-start ${
                      selectedImage === index ? "border-black scale-105" : "border-gray-200 hover:border-medium-gray"
                    }`}
                  >
                    <img
                      src={img || "/placeholder-product.jpg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target;
                        if (target.src !== "/placeholder-product.jpg") {
                          target.src = "/placeholder-product.jpg";
                        } else {
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML =
                              '<div class="w-full h-full flex items-center justify-center text-[10px] text-medium-gray">N/A</div>';
                          }
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
              {images.length > 3 && (
                <button
                  type="button"
                  aria-label="Next images"
                  onClick={() => scrollThumbs(1)}
                  className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white text-black hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="slide-in-right">
            <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
            
            {/* Brand Section with Card Style */}
            <div className="mb-6 p-4 bg-light-gray rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <Link
                  href={`/ip/${generateSubdomainSlug(product.brand)}`}
                  className="flex items-center gap-3 group flex-1"
                >
                  {brand?.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300 group-hover:border-black transition-colors flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-gray-300 group-hover:border-black transition-colors flex-shrink-0 shadow-md">
                      <span className="text-2xl font-bold text-white">{product.brand.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-medium-gray uppercase tracking-wide mb-1">Brand</p>
                    <p className="text-lg font-bold text-black group-hover:text-purple-600 transition-colors mb-1">{product.brand}</p>
                    {brand?.description && (
                      <p className="text-xs text-medium-gray line-clamp-2">{brand.description}</p>
                    )}
                  </div>
                </Link>
              </div>
              
              {/* Social Links - Always show section with placeholder if empty */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-medium-gray uppercase tracking-wide mb-2">Connect with {product.brand}</p>
                <div className="flex items-center gap-2">
                  {brand?.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-black text-gray-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-200"
                      title="Visit Website"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                  ) : (
                    <div className="p-2 bg-white text-gray-300 rounded-lg border border-gray-200 opacity-50" title="Website not available">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  )}
                  
                  {brand?.facebook ? (
                    <a
                      href={brand.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-[#1877F2] text-gray-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-200"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="p-2 bg-white text-gray-300 rounded-lg border border-gray-200 opacity-50" title="Facebook not available">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  )}
                  
                  {brand?.instagram ? (
                    <a
                      href={brand.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 text-gray-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-200"
                      title="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="p-2 bg-white text-gray-300 rounded-lg border border-gray-200 opacity-50" title="Instagram not available">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  )}
                  
                  {brand?.twitter ? (
                    <a
                      href={brand.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white hover:bg-black text-gray-600 hover:text-white rounded-lg transition-all shadow-sm border border-gray-200"
                      title="Twitter/X"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  ) : (
                    <div className="p-2 bg-white text-gray-300 rounded-lg border border-gray-200 opacity-50" title="Twitter/X not available">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-medium-gray mt-2">
                  {brand?.website || brand?.facebook || brand?.instagram || brand?.twitter 
                    ? "Click icons to visit their social media" 
                    : "No social media links available yet"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-medium-gray">{product.description}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Hidden file input for photo upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleTryOnUpload}
                className="hidden"
              />

              {isUploading ? (
                <div className="w-full py-4 rounded-sm bg-black text-white flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold">Preparing your try-on experience...</span>
                </div>
              ) : savedPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Use previous photo */}
                  <button
                    onClick={handleUsePreviousPhoto}
                    className="btn btn-primary flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Try On with Saved Photo
                  </button>
                  {/* Option 2: Upload new photo */}
                  <button
                    onClick={handleUploadClick}
                    className="py-3 rounded-sm border-2 border-black text-black font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Photo to Try On
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleUploadClick}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Photo to Try On
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-light-gray space-y-3 text-sm">
              <p className="text-medium-gray">
                <strong>Category:</strong> {product.category}
              </p>
              {product.tryOnLimit && (
                <p className="text-medium-gray">
                  <strong>Try-On Limit:</strong> {product.tryOnLimit} attempt{product.tryOnLimit !== 1 ? "s" : ""} per user
                </p>
              )}
              <p className="text-medium-gray">
                <strong>Note:</strong> The Fitting Room provides a 2D representation. Actual fit may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

