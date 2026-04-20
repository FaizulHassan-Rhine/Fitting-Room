"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getActiveProducts, getProducts, updateProduct, getProductUrl } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import { getUserPhotos, saveUserPhoto, deleteUserPhoto, setLastUsedPhotoId, getLastUsedPhoto } from "@/lib/photoStorage";
import UserPhotosModal from "@/components/UserPhotosModal";
import { compressImage } from "@/lib/imageCompression";


export default function TryOnPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const { addToCart, cartItems, getTotalItems } = useCart();
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [tryOnLimitReached, setTryOnLimitReached] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [hasExistingPhotos, setHasExistingPhotos] = useState(false);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [countdown] = useState(20);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showTryOnChooser, setShowTryOnChooser] = useState(false);
  const [pendingProductSelection, setPendingProductSelection] = useState(null);
  const [photoModalPurpose, setPhotoModalPurpose] = useState("default");
  const [isChooserUploading, setIsChooserUploading] = useState(false);
  const chooserUploadInputRef = useRef(null);
  const GENERATION_DELAY_MS = 2800;

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get try-on attempts for current user and product
  const getTryOnAttempts = (productId) => {
    if (typeof window === "undefined") return 0;
    const key = `tryOnAttempts_${productId}`;
    const attempts = localStorage.getItem(key);
    return attempts ? parseInt(attempts, 10) : 0;
  };

  // Increment try-on attempts for current user and product
  const incrementTryOnAttempts = (productId) => {
    if (typeof window === "undefined") return;
    const key = `tryOnAttempts_${productId}`;
    const current = getTryOnAttempts(productId);
    localStorage.setItem(key, (current + 1).toString());
    
    // Update product try-on count
    const products = getProducts();
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateProduct(productId, { tryOns: (product.tryOns || 0) + 1 });
    }
  };

  // Check if try-on limit is reached
  const checkTryOnLimit = (product) => {
    if (!product.tryOnLimit) return false; // No limit
    const attempts = getTryOnAttempts(product.id);
    return attempts >= product.tryOnLimit;
  };

  // Load saved photos
  const loadSavedPhotos = () => {
    const existingPhotos = getUserPhotos();
    setSavedPhotos(existingPhotos);
    setHasExistingPhotos(existingPhotos.length > 0);
  };

  useEffect(() => {
    const allProductsList = getActiveProducts();
    setAllProducts(allProductsList);
    
    // Check for existing photos
    const existingPhotos = getUserPhotos();
    setSavedPhotos(existingPhotos);
    setHasExistingPhotos(existingPhotos.length > 0);
    
    // Load last used photo if available
    const lastUsedPhoto = getLastUsedPhoto();
    if (lastUsedPhoto) {
      setUploadedImage(lastUsedPhoto.imageData);
      localStorage.setItem("vto_last_used_photo", lastUsedPhoto.imageData);
    } else {
      // Fallback to old system for backward compatibility
      const oldLastUsedPhoto = localStorage.getItem("vto_last_used_photo");
      if (oldLastUsedPhoto && existingPhotos.length > 0) {
        const photoExists = existingPhotos.some(p => p.imageData === oldLastUsedPhoto);
        if (photoExists) {
          const foundPhoto = existingPhotos.find(p => p.imageData === oldLastUsedPhoto);
          if (foundPhoto) {
            setLastUsedPhotoId(foundPhoto.id);
            setUploadedImage(oldLastUsedPhoto);
          }
        }
      }
    }
    
    const productId = localStorage.getItem("tryOnProductId");
    const savedSize = localStorage.getItem("tryOnSelectedSize");
    if (savedSize) {
      setSelectedSize(savedSize);
      localStorage.removeItem("tryOnSelectedSize");
    }
    
    if (productId) {
      // When a specific product ID is provided (e.g., from brand dashboard),
      // check all products (including inactive) to allow brand testing
      const allProductsForTesting = getProducts();
      const product = allProductsForTesting.find((p) => p.id === Number(productId));
      if (product) {
        setSelectedProduct(product);
        localStorage.removeItem("tryOnProductId");
        setTryOnLimitReached(checkTryOnLimit(product));
      } else {
        // If product not found, fall back to active products
        if (allProductsList.length > 0) {
          setSelectedProduct(allProductsList[0]);
          setTryOnLimitReached(checkTryOnLimit(allProductsList[0]));
        }
      }
    } else {
      if (allProductsList.length > 0) {
        setSelectedProduct(allProductsList[0]);
        setTryOnLimitReached(checkTryOnLimit(allProductsList[0]));
      }
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setTryOnLimitReached(checkTryOnLimit(selectedProduct));
    }
  }, [selectedProduct]);

  const runTryOnFlow = async (product) => {
    if (!product || checkTryOnLimit(product)) {
      if (product) setTryOnLimitReached(true);
      return;
    }

    setIsGenerating(true);
    setTryOnResult(null);

    // Short cinematic delay so the in-place "magic" loader can play.
    await new Promise((resolve) => setTimeout(resolve, GENERATION_DELAY_MS));

    const result = await generateDummyTryOn(product);
    setTryOnResult(result);
    setIsGenerating(false);
    incrementTryOnAttempts(product.id);
    setTryOnLimitReached(checkTryOnLimit(product));
  };

  // Auto-start try-on if user arrives with both photo and product ready
  useEffect(() => {
    const shouldAutoProcess = async () => {
      if (uploadedImage && selectedProduct && !tryOnResult && !isGenerating) {
        await runTryOnFlow(selectedProduct);
      }
    };
    
    shouldAutoProcess();
  }, [uploadedImage, selectedProduct]);

  const handleProductChange = async (product) => {
    setSelectedProduct(product);
    setTryOnResult(null);
    setTryOnLimitReached(checkTryOnLimit(product));
    
    if (uploadedImage && !checkTryOnLimit(product)) {
      await runTryOnFlow(product);
    }
  };

  const handleNewPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        setUploadedImage(imageData);
        setTryOnResult(null);
        
        if (selectedProduct && !checkTryOnLimit(selectedProduct)) {
          await runTryOnFlow(selectedProduct);
        } else if (selectedProduct && checkTryOnLimit(selectedProduct)) {
          setTryOnLimitReached(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image before saving
        const compressedImageData = await compressImage(file);
        
        // Save photo to storage
        const savedPhoto = saveUserPhoto(compressedImageData);
        loadSavedPhotos();
        
        // Save as last used photo (using ID)
        setLastUsedPhotoId(savedPhoto.id);
        localStorage.setItem("vto_last_used_photo", compressedImageData);
        
        setUploadedImage(compressedImageData);
        setTryOnResult(null);
        
        if (selectedProduct && !checkTryOnLimit(selectedProduct)) {
          await runTryOnFlow(selectedProduct);
        } else if (selectedProduct && checkTryOnLimit(selectedProduct)) {
          setTryOnLimitReached(true);
        }
      } catch (error) {
        console.error("Error compressing image:", error);
        alert("Failed to process image. Please try again with a smaller image.");
      }
    }
  };

  const handleSelectSavedPhoto = async (imageData) => {
    // Find the photo by imageData to get its ID
    const selectedPhoto = savedPhotos.find(p => p.imageData === imageData);
    if (selectedPhoto) {
      setLastUsedPhotoId(selectedPhoto.id);
    }
    
    // Save as last used photo (for backward compatibility)
    localStorage.setItem("vto_last_used_photo", imageData);
    
    setUploadedImage(imageData);
    setTryOnResult(null);
    
    if (selectedProduct && !checkTryOnLimit(selectedProduct)) {
      await runTryOnFlow(selectedProduct);
    } else if (selectedProduct && checkTryOnLimit(selectedProduct)) {
      setTryOnLimitReached(true);
    }
  };

  const handleDeletePhoto = (photoId) => {
    deleteUserPhoto(photoId);
    loadSavedPhotos();
    // If deleted photo was the current one, clear it
    const deletedPhoto = savedPhotos.find(p => p.id === photoId);
    if (deletedPhoto && uploadedImage === deletedPhoto.imageData) {
      setUploadedImage(null);
      setTryOnResult(null);
    }
  };

  const generateDummyTryOn = (productArg = selectedProduct) => {
    return new Promise((resolve) => {
      if (!productArg) {
        resolve('/placeholder-product.jpg');
        return;
      }

      // Get the product image path
      const productImage = productArg.images?.[0] || productArg.image || '';
      
      // Extract filename from product image path (e.g., "/dress/dress-1.png" -> "dress-1.png")
      const filename = productImage.split('/').pop() || '';
      
      // Use the corresponding output image from /output folder
      const outputImage = filename ? `/output/${filename}` : '/placeholder-product.jpg';
      
      // Load the output image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Return the output image as data URL
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(outputImage);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const result = canvas.toDataURL('image/jpeg', 0.95);
        resolve(result);
      };
      
      img.onerror = () => {
        // If output image fails to load, fallback to the output path directly
        resolve(outputImage);
      };
      
      img.src = outputImage;
    });
  };

  const handleTryOn = async () => {
    if (!uploadedImage || !selectedProduct) return;
    
    if (checkTryOnLimit(selectedProduct)) {
      setTryOnLimitReached(true);
      return;
    }

    await runTryOnFlow(selectedProduct);
  };

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <UserPhotosModal
        isOpen={showPhotosModal}
        onClose={() => setShowPhotosModal(false)}
        onSelectPhoto={handleSelectSavedPhoto}
        currentPhoto={uploadedImage}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        {/* Compact Header - Only Back Button */}
        <div className="mb-2 sm:mb-3">
          <Link 
            href={getProductUrl(selectedProduct)} 
            className="inline-flex items-center gap-1 text-gray-600 hover:text-black transition-colors text-xs"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          {tryOnLimitReached && selectedProduct.tryOnLimit && (
            <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <strong>Limit Reached:</strong> Maximum try-ons reached.
            </div>
          )}
        </div>

        {!uploadedImage ? (
          /* Upload Section */
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-12">
              {/* Header */}
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-900 rounded-xl mb-6 shadow-sm">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                  {hasExistingPhotos ? "Your Photo Gallery" : "Start Your Try-On"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                  {hasExistingPhotos 
                    ? "Select from your saved photos or upload a new one to continue"
                    : "Upload a clear, full-body photo for the best try-on experience"
                  }
                </p>
              </div>
              
              {/* Saved Photos Grid */}
              {hasExistingPhotos && savedPhotos.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Saved Photos ({savedPhotos.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {savedPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-all shadow-sm hover:shadow-md cursor-pointer bg-white"
                        onClick={() => handleSelectSavedPhoto(photo.imageData)}
                      >
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
                          <img
                            src={photo.imageData}
                            alt={`Saved photo ${photo.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-end pb-4 gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSavedPhoto(photo.imageData);
                              }}
                              className="bg-white text-gray-700 p-2.5 rounded hover:bg-gray-900 hover:text-white transition-all shadow-md"
                              title="Use this photo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(photo.id);
                              }}
                              className="bg-white text-gray-700 p-2.5 rounded hover:bg-red-600 hover:text-white transition-all shadow-md"
                              title="Delete photo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-white text-xs font-medium">
                            {new Date(photo.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Selection Indicator */}
                        <div className="absolute top-2 right-2 bg-gray-900 text-white p-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload New Photo */}
              <div className="relative">
                <div className="border-2 border-dashed border-gray-300 rounded p-8 sm:p-10 text-center bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all duration-200 group">
                  <label htmlFor="photo-upload" className="cursor-pointer block">
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded shadow-sm group-hover:bg-gray-800 transition-colors">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <span className="inline-block bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded font-semibold text-sm sm:text-base hover:bg-gray-800 transition-colors shadow-sm">
                          {hasExistingPhotos ? "Upload New Photo" : "Choose Your Photo"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        JPG, PNG • Max 5MB • Best with full-body shots
                      </p>
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Privacy Notice:</strong> All photos are stored locally on your device. We never upload or share your photos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Preview and Recommendations */}
            {(tryOnResult || isGenerating) ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
                  {/* Left Side: Try-On Result + Try Another Product */}
                  <div className="lg:col-span-2 space-y-2">
                    {/* Try-On Result */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3">
                      {tryOnLimitReached && selectedProduct.tryOnLimit ? (
                        <div className="max-w-md mx-auto bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[200px]">
                          <div className="text-center">
                            <svg className="w-8 h-8 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-gray-700 font-medium text-sm">Try-On Limit Reached</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              All {selectedProduct.tryOnLimit} attempts used.
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Compact Output Display */
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-md border border-gray-300">
                          <div className="p-1.5 bg-white border-b border-gray-200">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 text-center">
                              {isGenerating ? "Generating Try-On..." : "Try-On Result"}
                            </h3>
                          </div>
                          <div className="p-2 sm:p-3">
                            {isGenerating ? (
                              <div className="relative w-full max-h-[400px] sm:max-h-[450px] min-h-[280px] sm:min-h-[360px] rounded-md overflow-hidden">
                                <img
                                  src={uploadedImage || ""}
                                  alt="Source"
                                  className="absolute inset-0 w-full h-full object-contain opacity-35 blur-[2px] scale-[1.02]"
                                />
                                <div className="absolute inset-0 pointer-events-none">
                                  <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-magicSweep" />
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                  <div className="w-14 h-14 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
                                  <p className="text-sm font-medium text-gray-700">Applying magic touch...</p>
                                  <p className="text-xs text-gray-500">Refining fit, texture and edges</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={tryOnResult}
                                alt="Fitting room result"
                                className="w-full h-auto max-h-[400px] sm:max-h-[450px] object-contain mx-auto"
                                style={{ maxWidth: '100%', height: 'auto' }}
                                onError={(e) => {
                                  e.target.src = uploadedImage || '';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Try Another Product - Moved to Left Side */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900">Try Another Product</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Using your current photo</p>
                        </div>
                        <Link
                          href="/browse"
                          className="text-xs text-gray-600 hover:text-black font-medium flex items-center gap-1 transition-colors"
                        >
                          View All
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      
                      <div className="relative">
                        {/* Left Arrow */}
                        <button
                          onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                          disabled={carouselIndex === 0}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Previous products"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Carousel Container */}
                        <div className="overflow-hidden px-10 sm:px-12">
                          <div 
                            className="flex gap-3 transition-transform duration-300 ease-in-out"
                            style={{ 
                              transform: `translateX(calc(-${carouselIndex * (100 / (isMobile ? 3 : 6))}% - ${carouselIndex * (isMobile ? 0.5 : 0.25)}rem))` 
                            }}
                          >
                            {allProducts
                              .filter(p => p.id !== selectedProduct?.id)
                              .map((product) => (
                                <button
                                  key={product.id}
                                  onClick={() => handleProductChange(product)}
                                  disabled={isGenerating}
                                  className="flex-shrink-0 w-[calc((100%-1rem)/3)] sm:w-[calc((100%-1.25rem)/6)] bg-white rounded-lg overflow-hidden text-left group hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 flex flex-col"
                                >
                                  <div className="aspect-square bg-gray-50 overflow-hidden relative flex-shrink-0">
                                    <img
                                      src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                                      alt={product.title}
                                      className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        const target = e.target;
                                        if (target.src !== '/placeholder-product.jpg') {
                                          target.src = '/placeholder-product.jpg';
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="p-1 flex-1 flex flex-col justify-between min-h-0">
                                    <div className="min-w-0">
                                      <p className="text-[8px] text-gray-500 uppercase tracking-wide truncate font-medium mb-0.5">{product.brand}</p>
                                      <h4 className="font-semibold text-[9px] mb-0.5 line-clamp-1 leading-tight text-gray-900 group-hover:text-black transition-colors">{product.title}</h4>
                                    </div>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                        
                        {/* Right Arrow */}
                        {(() => {
                          const filteredProducts = allProducts.filter(p => p.id !== selectedProduct?.id);
                          const productsPerView = isMobile ? 3 : 6;
                          const totalProducts = filteredProducts.length;
                          const currentStartIndex = carouselIndex * productsPerView;
                          const hasMoreProducts = currentStartIndex + productsPerView < totalProducts;
                          return (
                            <button
                              onClick={() => {
                                const maxIndex = Math.max(0, Math.ceil(totalProducts / productsPerView) - 1);
                                setCarouselIndex(Math.min(maxIndex, carouselIndex + 1));
                              }}
                              disabled={!hasMoreProducts}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Next products"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Product Info & Actions Sidebar */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3">
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-sm font-bold text-black mb-0.5">{selectedProduct.title}</h3>
                        <p className="text-xs text-gray-600">by {selectedProduct.brand}</p>
                      </div>
                      
                      {/* Disclaimer */}
                      <div className="p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="flex items-start gap-1.5">
                          <svg className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[10px] text-gray-600 leading-relaxed">
                            <strong className="text-gray-900">Disclaimer:</strong> This is a 2D fitting room visualization for preview purposes only. Actual fit and appearance may vary.
                          </p>
                        </div>
                      </div>

                      {/* Social Media Share Icons */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] text-gray-500 mb-2 font-medium">Share</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `Check out ${selectedProduct.title} by ${selectedProduct.brand} on The Fitting Room!`;
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                            }}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            aria-label="Share on Facebook"
                            title="Share on Facebook"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `Check out ${selectedProduct.title} by ${selectedProduct.brand}!`;
                              window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                            }}
                            className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                            aria-label="Share on X"
                            title="Share on X"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `${selectedProduct.title} by ${selectedProduct.brand}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'width=600,height=400');
                            }}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            aria-label="Share on WhatsApp"
                            title="Share on WhatsApp"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `${selectedProduct.title} by ${selectedProduct.brand}`;
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                            }}
                            className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
                            aria-label="Share on LinkedIn"
                            title="Share on LinkedIn"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `${selectedProduct.title} by ${selectedProduct.brand}`;
                              // Instagram doesn't have a direct share URL, so we'll copy to clipboard or open Instagram
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                                  alert('Link copied! Paste it in your Instagram story or post.');
                                });
                              } else {
                                window.open(`https://www.instagram.com/`, '_blank');
                              }
                            }}
                            className="p-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded hover:opacity-90 transition-opacity"
                            aria-label="Share on Instagram"
                            title="Share on Instagram"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const url = window.location.href;
                              const text = `${selectedProduct.title} by ${selectedProduct.brand}`;
                              // Snapchat doesn't have a direct share URL, so we'll copy to clipboard
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                                  alert('Link copied! Paste it in your Snapchat.');
                                });
                              } else {
                                window.open(`https://www.snapchat.com/`, '_blank');
                              }
                            }}
                            className="p-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors"
                            aria-label="Share on Snapchat"
                            title="Share on Snapchat"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.544-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview Only - Before Result */
              <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3">
                    {!isGenerating && (
                      <>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Preview</span>
                      </>
                    )}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Icon button to show saved photos */}
                    <button
                      onClick={() => setShowPhotosModal(true)}
                      className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                      title="View all photos"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* Icon button to upload new photo */}
                    <label
                      htmlFor="change-photo-upload"
                      className="p-2.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer shadow-sm"
                      title="Upload new photo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <input
                        id="change-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {isGenerating ? (
                    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl flex items-center justify-center min-h-[500px] shadow-sm">
                      <div className="text-center px-6 py-8">
                        {/* Countdown Timer */}
                        <div className="mb-8">
                          <div className="relative inline-block">
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle
                                cx="56"
                                cy="56"
                                r="50"
                                stroke="#E5E7EB"
                                strokeWidth="6"
                                fill="none"
                              />
                              <circle
                                cx="56"
                                cy="56"
                                r="50"
                                stroke="#1F2937"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - countdown / 20)}`}
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-4xl font-semibold text-gray-900">
                                  {countdown}
                                </div>
                                <div className="text-xs font-medium text-gray-500 mt-1">seconds</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subtle loader */}
                        <div className="flex justify-center gap-1.5 mb-8">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-64 mx-auto h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                          <div 
                            className="h-full bg-gray-900 rounded-full transition-all duration-1000"
                            style={{ width: `${((20 - countdown) / 20) * 100}%` }}
                          ></div>
                        </div>
                        
                        {/* Status messages */}
                        <div className="mt-6">
                          <div className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-700">
                              {countdown > 15 ? "Analyzing photo..." : 
                               countdown > 10 ? "Applying try-on..." : 
                               countdown > 5 ? "Finalizing details..." : 
                               "Processing complete"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Two Images Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Product Image */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Product</div>
                          <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={selectedProduct.images?.[0] || selectedProduct.image || '/placeholder-product.jpg'}
                              alt={selectedProduct.title}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target;
                                if (target.src !== '/placeholder-product.jpg') {
                                  target.src = '/placeholder-product.jpg';
                                }
                              }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-gray-600 text-center truncate">{selectedProduct.title}</div>
                        </div>

                        {/* User Uploaded Photo */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Your Photo</div>
                          <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={uploadedImage || ''}
                              alt="Uploaded photo"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = 
                                  '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Photo not available</div>';
                              }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-gray-600 text-center">Uploaded Image</div>
                        </div>
                      </div>

                      {/* Large Preview of Uploaded Photo */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-300">
                        <div className="p-4 bg-white border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900 text-center">Your Photo Preview</h3>
                        </div>
                        <div className="p-4">
                          <img
                            src={uploadedImage || ''}
                            alt="Uploaded photo"
                            className="w-full h-auto max-h-[500px] object-contain mx-auto"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = 
                                '<div class="w-full h-full flex items-center justify-center text-gray-500 py-20">Image failed to load</div>';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isGenerating && !tryOnResult && uploadedImage && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                        <p className="text-sm text-gray-700 font-medium">
                          Processing your image...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Note:</strong> This is a 2D fitting room visualization for preview purposes. Actual fit and appearance may vary.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
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
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
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
        @keyframes magicSweep {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(320%);
            opacity: 0;
          }
        }
        .animate-magicSweep {
          animation: magicSweep 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
