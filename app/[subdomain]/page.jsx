"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getBrandFromSubdomain, getBrandProducts } from "@/lib/subdomainUtils";
import { getProductUrl, getProducts } from "@/lib/productStorage";
import { getAdminSettings, getPaymentHandling } from "@/lib/adminSettings";
import { useCart } from "@/lib/CartContext";
import ProductChatModal from "@/components/ProductChatModal";
import { getUserPhotos } from "@/lib/photoStorage";

export default function BrandSubdomainPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [subdomainEnabled, setSubdomainEnabled] = useState(true);
  const [chatProduct, setChatProduct] = useState(null);

  useEffect(() => {
    // Check if subdomain feature is enabled
    const settings = getAdminSettings();
    setSubdomainEnabled(settings.subdomainEnabled);

    if (!settings.subdomainEnabled) {
      // Redirect to main site if subdomain is disabled
      window.location.href = "/"; 
      return;
    }

    // For development: check query param or localStorage
    const devSubdomain = searchParams?.get("subdomain") || localStorage.getItem("dev_subdomain");
    if (devSubdomain && typeof window !== "undefined") {
      localStorage.setItem("dev_subdomain", devSubdomain);
    }

    const brandData = getBrandFromSubdomain();
    if (brandData) {
      setBrand(brandData);
      const brandProducts = getBrandProducts(brandData);
      setProducts(brandProducts);
    } else {
      // If no brand found, show message or redirect
      console.log("No brand found for subdomain");
    }
  }, [searchParams]);

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

  if (!subdomainEnabled) {
    return null; // Will redirect
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-medium-gray mb-6">
            The brand for this subdomain could not be found.
          </p>
          <Link href="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const paymentHandling = getPaymentHandling();
  const brandPaymentEnabled = paymentHandling === "brand";

  return (
    <div className="min-h-screen bg-white">
        <ProductChatModal
          isOpen={!!chatProduct}
          onClose={() => setChatProduct(null)}
          product={chatProduct}
        />
        
        {/* Hero Section */}
        <section className="bg-light-gray py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-24 w-24 mx-auto mb-6 object-contain"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{brand.name}</h1>
              {brand.description && (
                <p className="text-xl text-medium-gray max-w-2xl mx-auto mb-6">
                  {brand.description}
                </p>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-medium-gray hover:text-black transition-colors inline-flex items-center gap-2"
                >
                  Visit Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8">Our Products</h2>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-medium-gray text-lg">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group card hover:shadow-lg transition-shadow"
                  >
                    <Link href={getProductUrl(product)}>
                      {product.images && product.images.length > 0 && (
                        <div className="aspect-square overflow-hidden mb-4 bg-light-gray rounded-sm">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-medium-gray mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleTryOn(e, product.id)}
                        className="flex-1 btn btn-secondary text-sm py-2"
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
                        className="btn btn-secondary text-sm py-2 px-3"
                        title="Ask Questions"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Payment Info Section */}
        {brandPaymentEnabled && (
          <section className="bg-light-gray py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="card max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
                <p className="text-medium-gray mb-6">
                  Payments for {brand.name} products are processed directly through our brand payment system.
                  You&apos;ll be redirected to our secure checkout when you make a purchase.
                </p>
                <div className="flex items-center gap-2 text-sm text-medium-gray">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Brand Info Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">About {brand.name}</h3>
                {brand.description ? (
                  <p className="text-medium-gray">{brand.description}</p>
                ) : (
                  <p className="text-medium-gray">
                    Welcome to {brand.name}. We offer quality products with fitting room technology
                    to help you make confident purchase decisions.
                  </p>
                )}
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-2 text-medium-gray">
                  {brand.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${brand.email}`} className="hover:text-black transition-colors">
                        {brand.email}
                      </a>
                    </div>
                  )}
                  {brand.website && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black transition-colors"
                      >
                        {brand.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
