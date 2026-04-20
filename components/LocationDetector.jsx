"use client";

import { useEffect } from "react";
import { setUserCountry } from "@/lib/paymentGateway";

export default function LocationDetector() {
  useEffect(() => {
    // Try to detect user location
    // In production, you might use a geolocation API or IP-based detection
    const detectLocation = async () => {
      try {
        // Option 1: Use browser geolocation (requires permission)
        // navigator.geolocation.getCurrentPosition(
        //   (position) => {
        //     // Use reverse geocoding to get country
        //   },
        //   () => {
        //     // Fallback to IP-based detection
        //     detectByIP();
        //   }
        // );

        // Option 2: IP-based detection (simpler, no permission needed)
        detectByIP();
      } catch (error) {
        console.error("Location detection failed:", error);
      }
    };

    const detectByIP = async () => {
      try {
        // Call our own API route so the browser stays same-origin (no CORS issues).
        const response = await fetch("/api/location", {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Location API failed (${response.status})`);
        }
        const data = await response.json();
        
        if (data.country_code) {
          setUserCountry(data.country_code);
        }
      } catch (error) {
        // Fallback: check if country is already set
        const existingCountry = localStorage.getItem("user_country");
        if (!existingCountry) {
          // Default to US (Stripe) if detection fails
          setUserCountry("US");
        }
      }
    };

    // Only detect if country is not already set
    const existingCountry = localStorage.getItem("user_country");
    if (!existingCountry) {
      detectLocation();
    }
  }, []);

  return null; // This component doesn't render anything
}

