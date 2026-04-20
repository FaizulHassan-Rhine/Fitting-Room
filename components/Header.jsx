"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { getWalletBalance } from "@/lib/walletStorage";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(200);
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const cartItemCount = getTotalItems();
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.type) {
      case "brand":
        return "/dashboard/brand";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/browse";
    }
  };

  // Load credit balance - only for consumers
  useEffect(() => {
    const loadBalance = () => {
      if (user && user.type === "consumer") {
        const balance = getWalletBalance(user.email, "user");
        setCreditBalance(balance || 200);
      } else {
        // Don't show tokens for non-consumers or unauthenticated users
        setCreditBalance(null);
      }
    };

    loadBalance();

    // Listen for credit updates
    const handleStorageChange = (e) => {
      if (e.key?.startsWith("vto_wallet_") || e.key === "brand_credits") {
        loadBalance();
      }
    };

    const handleCreditsUpdate = () => {
      loadBalance();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("creditsUpdated", handleCreditsUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const target = event.target;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setUserMenuOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(target)) setLanguageMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => pathname === path;
  const isDashboardActive = pathname.startsWith("/dashboard");

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-white text-gray-900 shadow-sm border border-gray-200/80"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
    }`;

  const dashboardLinkClass = `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isDashboardActive ? "bg-white text-gray-900 shadow-sm border border-gray-200/80" : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
  }`;

  return (
    <header className="bg-light-gray sticky top-0 z-50 border-b border-gray-200/80 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 sm:h-[4.25rem] relative">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-800 transition-colors">
              <span className="text-white text-sm sm:text-base font-bold">F</span>
            </div>
            <span className="hidden sm:inline text-lg font-bold text-gray-900 tracking-tight">The Fitting Room</span>
            <span className="sm:hidden text-base font-bold text-gray-900">Fitting Room</span>
          </Link>

          {/* Desktop Navigation - Centered, with icons */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              <Link href="/browse" className={`flex items-center gap-2 ${navLinkClass("/browse")}`} title="Product">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span>Product</span>
              </Link>
              <Link href="/brands" className={`flex items-center gap-2 ${navLinkClass("/brands")}`} title="Brand">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span>Brand</span>
              </Link>
              <Link href="/about" className={`flex items-center gap-2 ${navLinkClass("/about")}`} title="About">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>About</span>
              </Link>
              <Link href="/api" className={`flex items-center gap-2 ${navLinkClass("/api")}`} title="API">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <span>API</span>
              </Link>
              {isAuthenticated && (
                <Link href={getDashboardLink()} className={`flex items-center gap-2 ${dashboardLinkClass}`} title="Dashboard">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Globe, Auth, Credits */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Language dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                aria-label="Language"
                aria-expanded={languageMenuOpen}
                className="flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors p-2.5 rounded-lg hover:bg-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${languageMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {languageMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1.5">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</p>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguageMenuOpen(false);
                        // Optional: store selection, switch locale
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                      <span className="text-white text-xs font-medium">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-800 font-medium max-w-[140px] truncate">
                      {user?.name || user?.email || "User"}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-base font-medium">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {user?.name || "User"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account
                      </Link>
                      <Link
                        href="/security"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Login &amp; Security
                      </Link>
                      <Link
                        href="/billing"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Billing &amp; Subscription
                      </Link>


                      {/* Separator */}
                      <div className="border-t border-gray-100 my-1.5"></div>

                      {/* Sign Out */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-gray-500 hover:text-black transition-colors px-3 py-1.5">
                  Login
                </Link>
                <Link href="/auth/register" className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Credit Balance - Right side of user info - Only show for consumers */}
            {creditBalance !== null && user?.type === "consumer" && (
              <Link
                href="/dashboard/user/wallet"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                title="View Wallet"
              >
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {creditBalance.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600">
                  Tokens
                </span>
              </Link>
            )}
          </div>

          {/* Mobile: Menu button */}
          <div className="md:hidden flex items-center gap-1 ml-auto">
            <button
              className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 space-y-0.5 border-t border-gray-200 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <Link
              href="/browse"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link
              href="/brands"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Brand
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/api"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              API
            </Link>
            {isAuthenticated && (
              <Link
                href={getDashboardLink()}
                className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 my-1.5"></div>
                {/* User info */}
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                </div>
                {/* Credit Balance in Mobile Menu - Only show for consumers */}
                {creditBalance !== null && user?.type === "consumer" && (
                  <Link
                    href="/dashboard/user/wallet"
                    className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Tokens</span>
                    </div>
                    <span className="font-semibold text-gray-900">{creditBalance.toLocaleString()}</span>
                  </Link>
                )}
                <div className="border-t border-gray-200 my-1.5"></div>
                <Link
                  href="/account"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/security"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login & Security
                </Link>
                <Link
                  href="/billing"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Billing & Subscription
                </Link>
                <div className="border-t border-gray-200 my-1.5"></div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 my-1.5"></div>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-black rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block mx-3 mt-2 py-2 text-sm bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
