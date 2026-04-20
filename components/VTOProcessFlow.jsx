"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function VTOProcessFlow() {
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl shadow-xl overflow-hidden">
      {/* Visual Flow Section */}
      <div className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Steps Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-8">
            {/* Step 1: Upload Body Image */}
            <div className={`flex flex-col items-center transition-all duration-700 ${
              activeStep === 0 ? 'scale-105 opacity-100' : 'scale-100 opacity-70'
            }`}>
              <div className="relative w-52 h-52 mb-4">
                {/* Animated Upload Icon with Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 ${
                  activeStep === 0 ? 'ring-4 ring-blue-300 ring-offset-4' : ''
                }`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  <svg 
                    className={`w-28 h-28 text-white transition-all duration-700 relative z-10 ${
                      activeStep === 0 ? 'scale-110' : 'scale-100'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  
                  {/* Upload Arrow Animation */}
                  {activeStep === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className="w-12 h-12 text-white animate-bounce absolute bottom-6"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2.5} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                        />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-xl border-4 border-white">
                  1
                </div>

                {/* 25% OFF Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  25% OFF
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-800">Upload Your Photo</h3>
              <p className="text-gray-600 text-center text-sm px-2">
                Take or upload a full-body photo in seconds
              </p>
            </div>

            {/* Arrow 1 */}
            <div className="hidden md:flex items-center justify-center -mt-8">
              <div className={`transition-all duration-700 ${
                activeStep >= 1 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-30 -translate-x-4 scale-75'
              }`}>
                <svg 
                  className="w-16 h-16 text-gray-700"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            </div>

            {/* Step 2: Choose Product */}
            <div className={`flex flex-col items-center transition-all duration-700 ${
              activeStep === 1 ? 'scale-105 opacity-100' : 'scale-100 opacity-70'
            }`}>
              <div className="relative w-52 h-52 mb-4">
                {/* Animated Product Icon with Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 ${
                  activeStep === 1 ? 'ring-4 ring-purple-300 ring-offset-4' : ''
                }`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  {/* Dress Icon */}
                  <svg 
                    className={`w-28 h-28 text-white transition-all duration-700 relative z-10 ${
                      activeStep === 1 ? 'rotate-0 scale-110' : 'rotate-6 scale-100'
                    }`}
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M16,3h-3V2h-2v1H8c-1.1,0-2,0.9-2,2v2l-3,3v5h2V9l2.5-2.5V19h9V6.5L19,9v6h2v-5l-3-3V5C18,3.9,17.1,3,16,3z M10,17H9v-5h1V17z M15,17h-1v-5h1V17z"/>
                  </svg>
                  
                  {/* Click/Select Animation */}
                  {activeStep === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 border-4 border-white rounded-full animate-ping opacity-60"></div>
                      <div className="w-32 h-32 border-4 border-white rounded-full animate-ping opacity-40" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  )}
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-xl border-4 border-white">
                  2
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-800">Choose Product</h3>
              <p className="text-gray-600 text-center text-sm px-2">
                Browse thousands of trending items
              </p>
            </div>

            {/* Arrow 2 */}
            <div className="hidden md:flex items-center justify-center -mt-8">
              <div className={`transition-all duration-700 ${
                activeStep >= 2 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-30 -translate-x-4 scale-75'
              }`}>
                <svg 
                  className="w-16 h-16 text-gray-700"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            </div>

            {/* Step 3: See Result */}
            <div className={`flex flex-col items-center transition-all duration-700 ${
              activeStep === 2 ? 'scale-105 opacity-100' : 'scale-100 opacity-70'
            }`}>
              <div className="relative w-52 h-52 mb-4">
                {/* Animated Result Icon with Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-[2.5rem] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 ${
                  activeStep === 2 ? 'ring-4 ring-pink-300 ring-offset-4' : ''
                }`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                  {/* Result Preview Icon */}
                  <div className="relative z-10">
                    <svg 
                      className={`w-28 h-28 text-white transition-all duration-700 ${
                        activeStep === 2 ? 'scale-110 rotate-0' : 'scale-100 -rotate-6'
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    
                    {/* Sparkles Animation */}
                    {activeStep === 2 && (
                      <>
                        <div className="absolute -top-4 -right-4 w-5 h-5 text-yellow-300">
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-3 -left-4 w-4 h-4 text-yellow-300 animate-pulse" style={{animationDelay: '0.2s'}}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="absolute top-1/2 -left-6 w-3 h-3 text-yellow-300 animate-pulse" style={{animationDelay: '0.4s'}}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-xl border-4 border-white">
                  3
                </div>
                
                {/* Perfect Fit Badge */}
                {activeStep === 2 && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Perfect Fit
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-800">See Yourself!</h3>
              <p className="text-gray-600 text-center text-sm px-2">
                Instant AI-powered visualization
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              10,000+ happy customers
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-xl py-3 px-2 shadow-md">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-gray-700">Instant Results</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-xl py-3 px-2 shadow-md">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-gray-700">100% Private</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white bg-opacity-60 backdrop-blur-sm rounded-xl py-3 px-2 shadow-md">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-gray-700">AI-Powered</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <Link href="/try-on" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold py-4 px-10 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Try Now - It's Free!
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



