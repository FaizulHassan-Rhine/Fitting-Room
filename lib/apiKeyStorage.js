// API Key Storage Utility
// In production, this should use a database instead of localStorage

// Get all API keys for a brand
export function getApiKeys(email) {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(`api_keys_${email}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

// Verify API key (server-side compatible)
// In production, this should query a database
export function verifyApiKey(apiKey) {
  // For server-side verification, we need to check against stored keys
  // Since we can't access localStorage on the server, we'll need to:
  // 1. Store keys in a database in production
  // 2. For now, we'll do a basic format check
  
  if (!apiKey || !apiKey.startsWith('vto_') || apiKey.length < 20) {
    return { valid: false };
  }
  
  // In production, query database:
  // SELECT email FROM api_keys WHERE key = ? AND active = true
  
  // For now, return valid if format is correct
  // The actual verification will happen by checking the key against stored keys
  // when we have access to the user's email
  return { valid: true };
}

// Get brand email from API key (for server-side)
// In production, this should query a database
export function getBrandEmailFromApiKey(apiKey) {
  // In production, query database:
  // SELECT email FROM api_keys WHERE key = ? AND active = true
  
  // For now, we can't determine the email from just the key
  // This is a limitation of using localStorage
  // In production, use a database
  return null;
}

// Save API key
export function saveApiKey(email, apiKey) {
  if (typeof window === "undefined") return;
  
  const keys = getApiKeys(email);
  keys.push(apiKey);
  localStorage.setItem(`api_keys_${email}`, JSON.stringify(keys));
}

// Delete API key
export function deleteApiKey(email, keyId) {
  if (typeof window === "undefined") return;
  
  const keys = getApiKeys(email);
  const updatedKeys = keys.filter(k => k.id !== keyId);
  localStorage.setItem(`api_keys_${email}`, JSON.stringify(updatedKeys));
}

