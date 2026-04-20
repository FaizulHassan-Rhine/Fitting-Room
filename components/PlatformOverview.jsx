"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PlatformOverview() {
  const [currentScene, setCurrentScene] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl overflow-hidden shadow-2xl">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full text-sm font-bold mb-4 shadow-lg animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Revolutionary Shopping Experience
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight">
            Try-On Platform
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            See clothes on yourself before buying • AI-powered fitting room • Zero risk shopping
          </p>
        </div>

        {/* Animated Scene Display */}
        <div className="relative h-[400px] md:h-[500px] mb-8">
          {/* Scene 1: The Problem */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            currentScene === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="relative mb-8">
                {/* Sad Shopping Icon */}
                <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {/* X mark overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-8 border-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-gray-800">The Problem</h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                <span className="font-bold text-red-600">50% of online clothes</span> get returned because customers can't visualize how they'll look
              </p>
              <div className="mt-6 flex gap-4 text-sm text-gray-500">
                <span>❌ Wrong size</span>
                <span>❌ Bad fit</span>
                <span>❌ Disappointing look</span>
              </div>
            </div>
          </div>

          {/* Scene 2: The Solution */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            currentScene === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="relative mb-8">
                {/* Magic Wand with Sparkles */}
                <div className="w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center shadow-2xl relative">
                  <svg className="w-24 h-24 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* Sparkles */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-ping">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 text-yellow-400 animate-ping" style={{animationDelay: '0.3s'}}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="absolute top-0 right-0 w-5 h-5 text-yellow-400 animate-ping" style={{animationDelay: '0.6s'}}>
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Our AI Solution
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl font-medium">
                Upload your photo, pick any outfit, and <span className="text-purple-600 font-bold">instantly see how it looks on YOU</span>
              </p>
              <div className="mt-6 flex gap-4 text-sm font-medium text-gray-700">
                <span>⚡ Instant</span>
                <span>🎯 Accurate</span>
                <span>🔒 Private</span>
              </div>
            </div>
          </div>

          {/* Scene 3: For Shoppers */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            currentScene === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl">
                {/* Left: Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-56 h-56 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                      <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {/* Heart animation */}
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Right: Benefits */}
                <div className="text-left">
                  <h2 className="text-4xl font-bold mb-6 text-blue-600">For Shoppers</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Try Before You Buy</h3>
                        <p className="text-gray-600">See exactly how clothes look on your body</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Perfect Size Every Time</h3>
                        <p className="text-gray-600">No more guessing, no more returns</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">100% Free Forever</h3>
                        <p className="text-gray-600">Unlimited try-ons at zero cost</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scene 4: For Brands */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            currentScene === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl">
                {/* Left: Benefits */}
                <div className="text-left order-2 md:order-1">
                  <h2 className="text-4xl font-bold mb-6 text-purple-600">For Brands</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Boost Sales by 300%</h3>
                        <p className="text-gray-600">Customers are 3x more likely to buy</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Reduce Returns by 70%</h3>
                        <p className="text-gray-600">Save thousands on return costs</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">Build Customer Trust</h3>
                        <p className="text-gray-600">Transparent shopping experience</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Icon */}
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative">
                    <div className="w-56 h-56 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                      <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    {/* Money icon animation */}
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentScene(index)}
              className={`transition-all duration-300 rounded-full ${
                currentScene === index 
                  ? 'w-12 h-3 bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to scene ${index + 1}`}
            />
          ))}
        </div>

        {/* Scene Labels */}
        <div className="text-center mb-8">
          <div className="inline-flex gap-2 text-sm font-medium text-gray-600 bg-white bg-opacity-60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            {currentScene === 0 && "❌ The Problem"}
            {currentScene === 1 && "✨ Our Solution"}
            {currentScene === 2 && "👤 For Shoppers"}
            {currentScene === 3 && "🏢 For Brands"}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/try-on"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-10 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Start Shopping Free
          </Link>
          <Link 
            href="/dashboard/brand"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-10 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            Grow Your Brand
          </Link>
        </div>
      </div>
    </div>
  );
}

