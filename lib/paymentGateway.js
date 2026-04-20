/**
 * Detect user location and select appropriate payment gateway
 * SSLCommerz for Bangladesh and some Asian countries
 * Stripe for international/other regions
 */
export function detectPaymentGateway() {
  if (typeof window === "undefined") {
    return "stripe"; // Default to Stripe for SSR
  }

  // Try to get location from browser
  const country = localStorage.getItem("user_country") || "";
  
  // Countries where SSLCommerz is preferred
  const sslcommerzCountries = [
    "BD", // Bangladesh
    "PK", // Pakistan
    "IN", // India (if supported)
  ];

  if (sslcommerzCountries.includes(country.toUpperCase())) {
    return "sslcommerz";
  }

  // Default to Stripe for international
  return "stripe";
}

/**
 * Set user country (can be called after geolocation detection)
 */
export function setUserCountry(countryCode) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_country", countryCode);
  }
}

/**
 * Initialize payment with selected gateway
 */
export async function initializePayment(
  request,
  gateway
) {
  const selectedGateway = gateway || detectPaymentGateway();

  if (selectedGateway === "sslcommerz") {
    return initializeSSLCommerzPayment(request);
  } else {
    return initializeStripePayment(request);
  }
}

/**
 * Initialize SSLCommerz payment
 */
async function initializeSSLCommerzPayment(
  request
) {
  try {
    // In production, this would call your backend API
    // which then calls SSLCommerz API
    
    // For demo purposes, we'll simulate the payment URL
    const paymentId = `ssl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store payment session
    if (typeof window !== "undefined") {
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
        ...request,
        gateway: "sslcommerz",
        paymentId,
        timestamp: new Date().toISOString(),
      }));
    }

    // In production, this would be the actual SSLCommerz checkout URL
    // Example: https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?...
    const paymentUrl = `/payment/sslcommerz/checkout?payment_id=${paymentId}`;

    return {
      success: true,
      gateway: "sslcommerz",
      paymentUrl,
      paymentId,
    };
  } catch (error) {
    return {
      success: false,
      gateway: "sslcommerz",
      error: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

/**
 * Initialize Stripe payment
 */
async function initializeStripePayment(
  request
) {
  try {
    // In production, this would call your backend API
    // which creates a Stripe Checkout Session
    
    const paymentId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store payment session
    if (typeof window !== "undefined") {
      localStorage.setItem(`payment_${paymentId}`, JSON.stringify({
        ...request,
        gateway: "stripe",
        paymentId,
        timestamp: new Date().toISOString(),
      }));
    }

    // In production, this would be the actual Stripe Checkout URL
    // Example: https://checkout.stripe.com/pay/cs_...
    const paymentUrl = `/payment/stripe/checkout?payment_id=${paymentId}`;

    return {
      success: true,
      gateway: "stripe",
      paymentUrl,
      paymentId,
    };
  } catch (error) {
    return {
      success: false,
      gateway: "stripe",
      error: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

/**
 * Get payment session data
 */
export function getPaymentSession(paymentId) {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(`payment_${paymentId}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear payment session
 */
export function clearPaymentSession(paymentId) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`payment_${paymentId}`);
  }
}

