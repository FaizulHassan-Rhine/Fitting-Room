"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { saveBrand, generateSubdomainSlug } from "./brandStorage";

const AuthContext = createContext(undefined);

// Demo accounts - stored by email for auto-detection
const DEMO_ACCOUNTS = {
  "consumer@demo.com": { password: "demo123", type: "consumer", name: "Demo Consumer" },
  "brand@demo.com": { password: "demo123", type: "brand", name: "Demo Brand" },
  "admin@demo.com": { password: "demo123", type: "admin", name: "Demo Admin" },
};

// Helper function to auto-detect user type from email or stored data
function detectUserType(email, brandInfo) {
  // Check demo accounts
  const demoAccount = DEMO_ACCOUNTS[email];
  if (demoAccount) {
    return demoAccount.type;
  }

  // Check if brand info is provided
  if (brandInfo?.brandName) {
    return "brand";
  }

  // Check stored user data
  const storedUser = localStorage.getItem("vto_user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.email === email && user.type) {
        return user.type;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Check if email domain suggests brand (admin can configure this)
  // For now, default to consumer
  return "consumer";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("vto_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const login = (email, password) => {
    // Try to find user in demo accounts
    const demoAccount = DEMO_ACCOUNTS[email];
    
    if (demoAccount && password === demoAccount.password) {
      const userData = {
        email: email,
        type: demoAccount.type,
        name: demoAccount.name,
      };
      setUser(userData);
      localStorage.setItem("vto_user", JSON.stringify(userData));
      return true;
    }

    // Check stored users (for registered accounts)
    const storedUsers = localStorage.getItem("vto_users");
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const foundUser = users.find(u => u.email === email);
        if (foundUser) {
          // In a real app, verify password hash here
          // For demo, we'll check if password matches stored password
          const storedPassword = localStorage.getItem(`vto_password_${email}`);
          if (storedPassword === password) {
            setUser(foundUser);
            localStorage.setItem("vto_user", JSON.stringify(foundUser));
            return true;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    return false;
  };

  const register = (email, password, name, brandInfo) => {
    // Check if user already exists
    const storedUsers = localStorage.getItem("vto_users");
    let users = [];
    
    if (storedUsers) {
      try {
        users = JSON.parse(storedUsers);
        if (users.some(u => u.email === email)) {
          return false; // User already exists
        }
      } catch (e) {
        // Ignore parse errors, start fresh
      }
    }

    // Auto-detect user type
    const userType = detectUserType(email, brandInfo);

    const newUser = {
      email,
      type: userType,
      name,
      ...(brandInfo && {
        brandName: brandInfo.brandName,
        website: brandInfo.website,
      }),
    };

    // Store user
    users.push(newUser);
    localStorage.setItem("vto_users", JSON.stringify(users));
    localStorage.setItem(`vto_password_${email}`, password); // In production, hash this!

    // If brand registration, create brand entry
    if (userType === "brand" && brandInfo) {
      saveBrand({
        id: email, // Use email as ID for now
        name: brandInfo.brandName,
        email: email,
        website: brandInfo.website,
        facebook: brandInfo.facebook,
        instagram: brandInfo.instagram,
        twitter: brandInfo.twitter,
        subdomain: generateSubdomainSlug(brandInfo.brandName),
        createdAt: new Date().toISOString(),
      });
    }

    // Auto-login
    setUser(newUser);
    localStorage.setItem("vto_user", JSON.stringify(newUser));

    return true;
  };

  const loginWithGoogle = async () => {
    // TODO: Implement actual Google OAuth
    // For now, return false to show it's not implemented
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vto_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
