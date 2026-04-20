const SETTINGS_KEY = "vto_admin_settings";

export function getAdminSettings() {
  if (typeof window === "undefined") {
    return { paymentHandling: "vto-platform", subdomainEnabled: true };
  }
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    const defaultSettings = { 
      paymentHandling: "vto-platform",
      subdomainEnabled: true 
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  const parsed = JSON.parse(stored);
  // Ensure subdomainEnabled exists for backward compatibility
  if (parsed.subdomainEnabled === undefined) {
    parsed.subdomainEnabled = true;
  }
  return parsed;
}

export function updateAdminSettings(settings) {
  if (typeof window === "undefined") return;
  const current = getAdminSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

export function getPaymentHandling() {
  return getAdminSettings().paymentHandling;
}

