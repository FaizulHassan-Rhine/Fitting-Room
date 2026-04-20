"use client";

import { useState, useEffect } from "react";


export default function ShoppingPreferenceModal({
  isOpen,
  onClose,
  onContinue,
}) {
  const [selectedPreference, setSelectedPreference] = useState("womenswear");

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleContinue = () => {
    onContinue(selectedPreference);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-sm max-w-md w-full p-8 fade-in">
        <h2 className="text-3xl font-bold mb-2">Select shopping preference</h2>
        <p className="text-medium-gray mb-6">Personalize your homepage to get started.</p>

        <div className="space-y-3 mb-8">
          {/* Womenswear Option */}
          <button
            onClick={() => setSelectedPreference("womenswear")}
            className={`w-full flex items-center gap-4 p-4 border-2 rounded-sm transition-all ${
              selectedPreference === "womenswear"
                ? "border-black"
                : "border-light-gray hover:border-medium-gray"
            }`}
          >
            <div className="w-16 h-16 rounded-sm overflow-hidden bg-light-gray flex-shrink-0 relative">
              {/* Placeholder for woman with beige blazer */}
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 relative">
                  {/* Hair */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-6 bg-gray-800 rounded-full"></div>
                  {/* Blazer */}
                  <div className="absolute top-4 left-0 w-full h-6 bg-yellow-100 rounded-b-full"></div>
                </div>
              </div>
            </div>
            <span className="font-semibold text-lg flex-1 text-left">Womenswear</span>
            {selectedPreference === "womenswear" && (
              <svg
                className="w-6 h-6 text-black flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Menswear Option */}
          <button
            onClick={() => setSelectedPreference("menswear")}
            className={`w-full flex items-center gap-4 p-4 border-2 rounded-sm transition-all ${
              selectedPreference === "menswear"
                ? "border-black"
                : "border-light-gray hover:border-medium-gray"
            }`}
          >
            <div className="w-16 h-16 rounded-sm overflow-hidden bg-light-gray flex-shrink-0 relative">
              {/* Placeholder for man with cream sweater */}
              <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-yellow-200 relative">
                  {/* Hair */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-4 bg-yellow-800 rounded-full"></div>
                  {/* Sweater with heart */}
                  <div className="absolute top-4 left-0 w-full h-6 bg-yellow-50 rounded-b-full">
                    <div className="absolute top-1 left-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <span className="font-semibold text-lg flex-1 text-left">Menswear</span>
            {selectedPreference === "menswear" && (
              <svg
                className="w-6 h-6 text-black flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-black text-white py-4 rounded-sm font-medium hover:bg-dark-gray transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

