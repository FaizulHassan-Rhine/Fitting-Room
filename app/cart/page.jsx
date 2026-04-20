"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPaymentHandling } from "@/lib/adminSettings";
import { getProducts, getProductUrl } from "@/lib/productStorage";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();
  const totalPrice = getTotalPrice();
  const [hasVTOItems, setHasVTOItems] = useState(false);

  useEffect(() => {
    // Check if any items in cart were added from VTO
    const vtoSource = localStorage.getItem("cartFromVTO");
    setHasVTOItems(vtoSource === "true");
  }, [cartItems]);

  const handleCheckout = () => {
    const paymentHandling = getPaymentHandling();
    
    // If items are from VTO and payment is handled by brand, redirect to brand
    if (hasVTOItems && paymentHandling === "brand") {
      // Get the brand from the first item
      const firstItem = cartItems[0];
      if (firstItem) {
        const products = getProducts();
        const product = products.find(p => p.id === firstItem.id);
        if (product) {
          // In production, this would redirect to brand's payment URL
          // For now, we'll show an alert
          alert(`Redirecting to ${product.brand}'s payment system...\n\nIn production, this would redirect to the brand's checkout page.`);
          // Clear VTO flag
          localStorage.removeItem("cartFromVTO");
          return;
        }
      }
    }
    
    // Otherwise, proceed with VTO platform checkout
    // In production, this would go to platform checkout
    alert("Proceeding to VTO Platform checkout...\n\nIn production, this would redirect to the platform's checkout page.");
    localStorage.removeItem("cartFromVTO");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setIsClearing(true);
      clearCart();
      setTimeout(() => setIsClearing(false), 300);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Start adding products to your cart!</p>
            <Link
              href="/browse"
              className="inline-block bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 tracking-tight">Shopping Cart</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Product Image */}
                  <Link href={getProductUrl({ id: item.id, title: item.title })} className="flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={getProductUrl({ id: item.id, title: item.title })}
                          className="text-lg sm:text-xl font-bold hover:underline block truncate"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">{item.brand}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 text-gray-400 hover:text-black transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3">
                        <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700">
                          Quantity:
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-1.5 text-sm font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold">
                          {item.price.includes("$") || item.price.includes("€") || item.price.includes("£")
                            ? item.price
                            : `$${item.price}`}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.price.replace(/[^0-9.]/g, "")} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>
              {hasVTOItems && (
                <p className="text-xs text-gray-500 text-center mb-2">
                  {getPaymentHandling() === "brand" 
                    ? "You will be redirected to the brand's payment system"
                    : "Payment will be processed by VTO Platform"}
                </p>
              )}

              <button
                onClick={() => {
                  router.push("/try-on");
                }}
                className="block w-full text-center text-gray-600 hover:text-black transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

