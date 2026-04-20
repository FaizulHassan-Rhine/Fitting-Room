"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import BrandHeader from "@/components/BrandHeader";
import Footer from "@/components/Footer";
import LocationDetector from "@/components/LocationDetector";
import NavigationLoader from "@/components/NavigationLoader";
import { isBrandSubdomain, getBrandFromSubdomain } from "@/lib/subdomainUtils";
import { getAdminSettings } from "@/lib/adminSettings";

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const [showBrandHeader, setShowBrandHeader] = useState(false);
  const [isSubdomainRoute, setIsSubdomainRoute] = useState(false);

  useEffect(() => {
    const settings = getAdminSettings();
    
    // Account-related routes should always use regular layout (not subdomain layout)
    // These routes should show Header, not BrandHeader
    const accountRoutes = ['/account', '/security', '/billing', '/notifications', '/dashboard'];
    const isAccountRoute = accountRoutes.some(route => pathname?.startsWith(route));
    
    // Check if we're on a subdomain route (dynamic [subdomain] route)
    // In Next.js, this would be a path like /brandname or detected via subdomain
    // But exclude account routes even if on subdomain
    const isSubdomain = settings.subdomainEnabled && isBrandSubdomain() && !isAccountRoute;
    setIsSubdomainRoute(isSubdomain);
    
    if (isSubdomain) {
      const brand = getBrandFromSubdomain();
      setShowBrandHeader(!!brand);
    } else {
      setShowBrandHeader(false);
    }
  }, [pathname]);

  // Don't render header/footer for subdomain routes - they have their own layout
  if (isSubdomainRoute) {
    return (
      <>
        <NavigationLoader />
        <LocationDetector />
        {children}
      </>
    );
  }

  return (
    <>
      <NavigationLoader />
      <LocationDetector />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
