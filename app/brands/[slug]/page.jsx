"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBrandBySlugOrId, generateSubdomainSlug, getBrands } from "@/lib/brandStorage";
import { getActiveProducts, getProductUrl } from "@/lib/productStorage";
import { useCart } from "@/lib/CartContext";
import ProductChatModal from "@/components/ProductChatModal";
import { getUserPhotos } from "@/lib/photoStorage";

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [resolved, setResolved] = useState(false);
  const [chatProduct, setChatProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const b = getBrandBySlugOrId(slug);
    setBrand(b);
    if (b) {
      const all = getActiveProducts();
      setProducts(all.filter((p) => p.brand?.trim().toLowerCase() === b.name.trim().toLowerCase()));
    } else {
      setProducts([]);
    }
    setResolved(true);
  }, [slug]);

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
    window.location.href = "/try-on";
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0];
    addToCart({ ...product, selectedSize: defaultSize });
  };

  if (!resolved) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin" aria-hidden />
      </div>
    );
  }

  if (resolved && !brand) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-medium-gray mb-2">Brand not found</h1>
          <p className="text-medium-gray mb-6">This brand may not exist or the link may be incorrect.</p>
          <Link href="/brands/search" className="btn btn-primary">
            Discover Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductChatModal
        isOpen={!!chatProduct}
        onClose={() => setChatProduct(null)}
        product={chatProduct}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm fade-in">
          <Link href="/brands/search" className="text-medium-gray hover:text-black transition-colors">
            Discover Brands
          </Link>
          <span className="mx-2 text-medium-gray">/</span>
          <span className="text-black">{brand?.name || 'Brand'}</span>
        </nav>

        {/* Brand header */}
        <div className="card mb-10 slide-up">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {brand?.logo && (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-sm overflow-hidden bg-light-gray flex-shrink-0">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{brand?.name}</h1>
              {brand?.description && (
                <p className="text-medium-gray mb-4 max-w-2xl">{brand.description}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-medium-gray block">Popularity</span>
                  <span className="font-semibold">{brand?.popularity?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-medium-gray block">Try-Ons</span>
                  <span className="font-semibold">{brand?.tryOnFrequency?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-medium-gray block">Sales</span>
                  <span className="font-semibold">{brand?.sales?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-medium-gray block">Demand</span>
                  <span className="font-semibold">{brand?.demand?.toLocaleString()}</span>
                </div>
              </div>
              {brand?.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm font-medium text-black hover:underline"
                >
                  Visit website →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Products */}
        <h2 className="text-xl font-bold mb-4">Products</h2>
        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-medium-gray">No products from this brand yet.</p>
            <Link href="/browse" className="btn btn-secondary mt-4 inline-block">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-300"
              >
                <Link href={getProductUrl(product)} className="block">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img
                      src={product.images?.[0] || product.image || "/placeholder-product.jpg"}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target;
                        if (target.src !== "/placeholder-product.jpg") {
                          target.src = "/placeholder-product.jpg";
                        }
                      }}
                    />
                    {product.specialPrice && (
                      <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 rounded-md flex items-center justify-center text-xs font-semibold shadow-md">
                        Sale
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link href={getProductUrl(product)} className="block">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">{product.title}</h3>
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
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end pt-1">
                    <Link
                      href={getProductUrl(product)}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-all"
                      title="View Details"
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
                      className="w-9 h-9 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-all"
                      title="Ask Questions"
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
        )}
      </div>
    </div>
  );
}

