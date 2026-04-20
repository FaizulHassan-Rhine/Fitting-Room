"use client";

import { usePathname } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import Footer from "@/components/Footer";

export default function SubdomainLayout({ children }) {
  const pathname = usePathname();
  
  // Account-related routes should not use this layout
  // They should use the regular layout instead
  const accountRoutes = ['/account', '/security', '/billing', '/notifications', '/dashboard'];
  const isAccountRoute = accountRoutes.some(route => pathname?.startsWith(route));
  
  // If this is an account route, don't render BrandHeader
  // The regular layout will handle it
  if (isAccountRoute) {
    return <>{children}</>;
  }
  
  return (
    <>
      <BrandHeader />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
