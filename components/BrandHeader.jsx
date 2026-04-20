"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { getBrandFromSubdomain } from "@/lib/subdomainUtils";

export default function BrandHeader() {
  const [brand, setBrand] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const brandData = getBrandFromSubdomain();
    setBrand(brandData);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getBrandLogo = () => {
    if (brand?.logo) return brand.logo;
    // Default logo - first letter of brand name
    return brand?.name?.[0]?.toUpperCase() || "B";
  };

  return (
    <header className="bg-light-gray sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {brand?.logo ? (
              <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">{getBrandLogo()}</span>
              </div>
            )}
            <span className="text-lg font-semibold text-black">{brand?.name || "Brand"}</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/" 
              className="px-3 py-2 rounded-md bg-white text-black font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/process" 
              className="px-3 py-2 text-medium-gray hover:text-black transition-colors"
            >
              Process
            </Link>
            <Link 
              href="/orders" 
              className="px-3 py-2 text-medium-gray hover:text-black transition-colors"
            >
              Orders
            </Link>
            <Link 
              href="/portfolio" 
              className="px-3 py-2 text-medium-gray hover:text-black transition-colors"
            >
              Portfolio
            </Link>
            <Link 
              href="/pricing" 
              className="px-3 py-2 text-medium-gray hover:text-black transition-colors"
            >
              Pricing
            </Link>
            
            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setResourcesMenuOpen(!resourcesMenuOpen)}
                className="px-3 py-2 text-medium-gray hover:text-black transition-colors flex items-center gap-1"
              >
                Resources
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {resourcesMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-light-gray rounded-lg shadow-lg py-2 z-50">
                  <Link href="/resources/docs" className="block px-4 py-2 text-sm text-medium-gray hover:bg-light-gray">
                    Documentation
                  </Link>
                  <Link href="/resources/guides" className="block px-4 py-2 text-sm text-medium-gray hover:bg-light-gray">
                    Guides
                  </Link>
                  <Link href="/resources/support" className="block px-4 py-2 text-sm text-medium-gray hover:bg-light-gray">
                    Support
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language/Globe Icon */}
            <button className="text-black hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center overflow-hidden">
                    {user?.email?.includes("demo") ? (
                      <span className="text-white text-xs font-medium">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "User")}&background=8b5cf6&color=fff&size=32`}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="hidden md:block text-sm text-black font-medium">
                    {user?.name || user?.email || "User"}
                  </span>
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-light-gray border border-medium-gray rounded-lg shadow-xl z-50">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-medium-gray">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user?.email?.includes("demo") ? (
                            <span className="text-white text-sm font-medium">
                              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                            </span>
                          ) : (
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "User")}&background=8b5cf6&color=fff&size=48`}
                              alt={user?.name || "User"}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-black truncate">
                            {user?.name || "User"}
                          </div>
                          <div className="text-xs text-medium-gray truncate">
                            {user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account
                      </Link>
                      <Link
                        href="/security"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Login & Security
                      </Link>
                      <Link
                        href="/notifications"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Billing & Subscription
                      </Link>
                      <Link
                        href="/integrations"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors bg-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Integrations
                      </Link>
                      <Link
                        href="/ai-models"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-medium-gray hover:bg-white transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Models
                      </Link>
                      <div className="border-t border-medium-gray my-2"></div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-medium-gray hover:text-black transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Close dropdowns when clicking outside */}
      {(userMenuOpen || resourcesMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setResourcesMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}

