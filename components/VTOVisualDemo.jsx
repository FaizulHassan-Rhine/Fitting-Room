"use client";

import { useState, useEffect } from "react";

export default function VTOVisualDemo() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-full h-full">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-2xl animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            LIVE DEMO
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            See The Magic In Action
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Watch how our AI transforms shopping in <span className="text-yellow-400 font-bold">3 simple steps</span>
          </p>
        </div>

        {/* Demo Selector */}
        <div className="flex justify-center gap-4 mb-12">
          {['Step 1: Upload', 'Step 2: Select', 'Step 3: Try-On'].map((label, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveDemo(index);
                setIsPlaying(false);
                setTimeout(() => setIsPlaying(true), 10000);
              }}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                activeDemo === index
                  ? 'bg-white text-purple-900 scale-110 shadow-2xl'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-sm'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Visual Demo Container */}
        <div className="relative h-[600px] md:h-[700px]">
          {/* Demo 1: Upload Photo */}
          <div className={`absolute inset-0 transition-all duration-700 ${
            activeDemo === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-2 gap-8 h-full items-center">
              {/* Left: Visual Demo */}
              <div className="relative h-full min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl overflow-hidden">
                  {/* Mock Upload Interface */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-4 border-dashed border-blue-400 flex items-center justify-center overflow-hidden group hover:border-blue-600 transition-all cursor-pointer">
                      {/* Animated Person Silhouette */}
                      <div className="relative animate-float">
                        <svg className="w-48 h-48 text-blue-400 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      {/* Upload Icon Animation */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 bg-opacity-90">
                        <div className="text-center text-white">
                          <svg className="w-20 h-20 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xl font-bold">Click to Upload</p>
                          <p className="text-sm mt-2">or drag and drop</p>
                        </div>
                      </div>

                      {/* Animated Scan Lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan"></div>
                      </div>
                    </div>
                    
                    <p className="mt-6 text-gray-600 font-medium text-center">
                      Drop your photo here or click to browse
                    </p>
                  </div>

                  {/* Video/GIF Placeholder Overlay */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    VIDEO PLACEHOLDER
                  </div>
                </div>
              </div>

              {/* Right: Instructions */}
              <div className="text-white space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold text-black shadow-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">Upload Your Photo</h3>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      Take a simple photo with your phone or upload an existing one. 
                      Our AI works with any angle, but frontal photos work best!
                    </p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Works with phone photos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Instant processing (2-3 seconds)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">100% private & secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo 2: Select Product */}
          <div className={`absolute inset-0 transition-all duration-700 ${
            activeDemo === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-2 gap-8 h-full items-center">
              {/* Left: Instructions */}
              <div className="text-white space-y-6 order-2 md:order-1">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white shadow-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">Choose Your Style</h3>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      Browse thousands of products from top brands. Click on any item 
                      to see how it looks on you instantly!
                    </p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span className="text-gray-100">1000+ brands available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Filter by style, color, size</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-100">Trending & recommended items</span>
                  </div>
                </div>
              </div>

              {/* Right: Visual Demo */}
              <div className="relative h-full min-h-[400px] order-1 md:order-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl overflow-hidden p-6">
                  {/* Mock Product Grid */}
                  <h4 className="text-2xl font-bold text-gray-800 mb-4">Trending Now</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item, idx) => (
                      <div 
                        key={item}
                        className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          idx === 0 ? 'ring-4 ring-purple-500 scale-105' : ''
                        }`}
                        style={{
                          animationDelay: `${idx * 0.1}s`
                        }}
                      >
                        {/* Mock Product Image */}
                        <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <svg className="w-20 h-20 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16,3h-3V2h-2v1H8c-1.1,0-2,0.9-2,2v2l-3,3v5h2V9l2.5-2.5V19h9V6.5L19,9v6h2v-5l-3-3V5C18,3.9,17.1,3,16,3z"/>
                          </svg>
                        </div>
                        <div className="p-3">
                          <p className="font-bold text-gray-800 text-sm">Style {item}</p>
                          <p className="text-purple-600 font-bold">$49.99</p>
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                            SELECTED
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Video/GIF Placeholder Overlay */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    VIDEO PLACEHOLDER
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo 3: Try-On Result */}
          <div className={`absolute inset-0 transition-all duration-700 ${
            activeDemo === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-2 gap-8 h-full items-center">
              {/* Left: Visual Demo - Before/After */}
              <div className="relative h-full min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl overflow-hidden">
                  {/* Before/After Comparison */}
                  <div className="absolute inset-0 grid grid-cols-2 gap-1 p-6">
                    {/* Before */}
                    <div className="relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden flex flex-col">
                      <div className="bg-gray-600 text-white text-center py-2 font-bold text-sm">
                        BEFORE
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <svg className="w-32 h-32 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* After */}
                    <div className="relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 font-bold text-sm">
                        AFTER ✨
                      </div>
                      <div className="flex-1 flex items-center justify-center relative">
                        {/* Person with outfit */}
                        <div className="relative">
                          <svg className="w-32 h-32 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {/* Sparkle effects */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-spin">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-400 animate-pulse">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Perfect Fit Badge */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        PERFECT FIT!
                      </div>
                    </div>
                  </div>

                  {/* Center Divider Arrow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-2xl z-10">
                    <svg className="w-8 h-8 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Video/GIF Placeholder Overlay */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    VIDEO PLACEHOLDER
                  </div>
                </div>
              </div>

              {/* Right: Instructions */}
              <div className="text-white space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white shadow-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-3">See Yourself!</h3>
                    <p className="text-lg text-gray-200 leading-relaxed">
                      Boom! See yourself wearing the outfit in photorealistic quality. 
                      Love it? Add to cart. Want to try more? Keep exploring!
                    </p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Results in 2-3 seconds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Photorealistic visualization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-100">Try unlimited outfits</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-black font-bold py-5 px-8 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Start Your Try-On Journey!
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-white bg-opacity-10 backdrop-blur-sm px-8 py-4 rounded-full text-white">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">2-3 sec processing</span>
            </div>
            <div className="w-px h-6 bg-white bg-opacity-30"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">100% Private</span>
            </div>
            <div className="w-px h-6 bg-white bg-opacity-30"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">100% Free</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
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
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

