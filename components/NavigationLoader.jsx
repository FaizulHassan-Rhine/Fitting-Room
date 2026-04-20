"use client";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Hide loader when pathname has changed (page loaded)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Show loader immediately when user clicks a same-origin link (capture phase + flushSync)
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          flushSync(() => setIsNavigating(true));
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="w-14 h-14 rounded-full border-4 border-light-gray border-t-black animate-spin"
        aria-hidden
      />
    </div>
  );
}

