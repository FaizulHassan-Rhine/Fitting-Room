"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

// Syntax highlighter component for VS Code-like styling
function CodeBlock({ code, language = "json" }) {
  const [copied, setCopied] = useState(false);

  const highlightCode = (code, lang) => {
    let highlighted = code;
    
    if (lang === "json") {
      // JSON syntax highlighting - VS Code Dark+ theme colors
      // Keys (blue)
      highlighted = highlighted.replace(/"([^"]+)":/g, '<span style="color: #9CDCFE;">"$1"</span>:');
      // String values (orange)
      highlighted = highlighted.replace(/: "([^"]+)"/g, ': <span style="color: #CE9178;">"$1"</span>');
      // Boolean/null (blue keyword)
      highlighted = highlighted.replace(/: (true|false|null)\b/g, ': <span style="color: #569CD6;">$1</span>');
      // Numbers (green)
      highlighted = highlighted.replace(/: (\d+\.?\d*)/g, ': <span style="color: #B5CEA8;">$1</span>');
      // Brackets and commas (default gray)
      highlighted = highlighted.replace(/(\{|\}|\[|\]|,)/g, '<span style="color: #D4D4D4;">$1</span>');
    } else if (lang === "bash") {
      // Bash/cURL syntax highlighting
      // Commands (yellow)
      highlighted = highlighted.replace(/\b(curl|POST|GET|PUT|DELETE|PATCH|X|H|F|d)\b/g, '<span style="color: #DCDCAA;">$1</span>');
      // Flags (blue)
      highlighted = highlighted.replace(/(-[A-Za-z]|--[a-z-]+)/g, '<span style="color: #9CDCFE;">$1</span>');
      // URLs (orange)
      highlighted = highlighted.replace(/(https?:\/\/[^\s"\\]+)/g, '<span style="color: #CE9178;">$1</span>');
      // Strings (orange)
      highlighted = highlighted.replace(/("([^"]+)")/g, '<span style="color: #CE9178;">$1</span>');
      // File paths (cyan)
      highlighted = highlighted.replace(/(@\/[^\s]+)/g, '<span style="color: #4EC9B0;">$1</span>');
      // Escape sequences (gray)
      highlighted = highlighted.replace(/(\\\\)/g, '<span style="color: #808080;">$1</span>');
    } else if (lang === "http") {
      // HTTP header syntax highlighting
      // Header names (blue)
      highlighted = highlighted.replace(/([A-Z][a-zA-Z-]+):/g, '<span style="color: #9CDCFE;">$1</span>:');
      // MIME types and Bearer (orange)
      highlighted = highlighted.replace(/(Bearer|multipart\/form-data|application\/json|application\/x-www-form-urlencoded)/g, '<span style="color: #CE9178;">$1</span>');
      // API key placeholder (yellow)
      highlighted = highlighted.replace(/(YOUR_API_KEY)/g, '<span style="color: #D7BA7D;">$1</span>');
      // URLs (orange)
      highlighted = highlighted.replace(/(https?:\/\/[^\s]+)/g, '<span style="color: #CE9178;">$1</span>');
    }
    return highlighted;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="text-sm leading-relaxed overflow-x-auto" style={{ 
        backgroundColor: '#1E1E1E',
        color: '#D4D4D4',
        fontFamily: 'Consolas, "Courier New", monospace',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #3E3E3E',
        margin: 0,
        position: 'relative'
      }}>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}


export default function ApiPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("keys");
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait for user data to load from localStorage
    const checkAuth = () => {
      // Check if user is loaded from localStorage directly
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("vto_user") : null;
      
      if (!storedUser && !user) {
        // No user found, redirect to login
        setIsCheckingAuth(false);
        router.replace("/auth/login");
        return;
      }

      // If we have user data (either from context or localStorage)
      if (user || storedUser) {
        setIsCheckingAuth(false);
        
        // Parse stored user if context user is not available yet
        let currentUser = user;
        if (!currentUser && storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
          } catch (e) {
            // Invalid stored user, redirect to login
            router.replace("/auth/login");
            return;
          }
        }

        // Don't redirect non-brands, just show them a message
        // The UI will handle showing appropriate content

        // If we have a brand user, load API keys
        if (currentUser && currentUser.type === "brand") {
          loadApiKeys();
        }
      }
    };

    // Check immediately and also after a short delay to catch async user loading
    checkAuth();
    const timeout = setTimeout(checkAuth, 200);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, user, router]);

  const loadApiKeys = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(`api_keys_${user?.email}`);
    if (stored) {
      setApiKeys(JSON.parse(stored));
    }
  };

  const generateApiKey = () => {
    const prefix = "vto_";
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${prefix}${randomBytes}`;
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      alert("Please enter a key name");
      return;
    }

    setIsCreating(true);
    setTimeout(() => {
      const newKey = {
        id: Date.now().toString(),
        name: newKeyName.trim(),
        key: generateApiKey(),
        createdAt: new Date().toISOString(),
      };

      const updatedKeys = [...apiKeys, newKey];
      setApiKeys(updatedKeys);
      localStorage.setItem(`api_keys_${user?.email}`, JSON.stringify(updatedKeys));
      setNewKeyName("");
      setIsCreating(false);
    }, 500);
  };

  const handleDeleteKey = (keyId) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    const updatedKeys = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updatedKeys);
    localStorage.setItem(`api_keys_${user?.email}`, JSON.stringify(updatedKeys));
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskApiKey = (key) => {
    // Show first 7 characters (vto_xxx) and mask the rest
    if (key.length <= 10) return "•".repeat(key.length);
    return key.substring(0, 7) + "•".repeat(key.length - 7);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated && !isCheckingAuth) {
    return null; // Will redirect to login
  }

  // Allow everyone to view the page, but restrict API key management to brands

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-gray-600">Manage your API keys and integrate Try-On into your platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("keys")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === "keys"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === "docs"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Documentation
          </button>
        </div>

        {activeTab === "keys" ? (
          <div className="space-y-6">
            {/* Show message if not a brand */}
            {(!user || user.type !== "brand") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">API Key Management Restricted</h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      API key creation and management is available only for brand accounts. You can still view the API documentation below.
                    </p>
                    {!user ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push("/auth/login")}
                          className="px-4 py-2 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700 transition-colors"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => router.push("/brands/register")}
                          className="px-4 py-2 border border-yellow-600 text-yellow-900 rounded text-sm font-semibold hover:bg-yellow-50 transition-colors"
                        >
                          Register as Brand
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push("/brands/register")}
                        className="px-4 py-2 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700 transition-colors"
                      >
                        Register as Brand
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Create New Key - Only show for brands */}
            {user && user.type === "brand" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create API Key</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter key name (e.g., Production, Development)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateKey()}
                />
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName.trim()}
                  className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Key"}
                </button>
              </div>
            </div>
            )}

            {/* Existing Keys - Only show for brands */}
            {user && user.type === "brand" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your API Keys</h2>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <p>No API keys created yet</p>
                  <p className="text-sm mt-1">Create your first API key to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{apiKey.name}</h3>
                            <span className="text-xs text-gray-500">
                              Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800">
                              {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                              title={visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"}
                            >
                              {visibleKeys.has(apiKey.id) ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                              title="Copy key"
                            >
                              {copiedKey === apiKey.key ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete key"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">API Overview</h2>
              <p className="text-gray-600 mb-4">
                The Try-On API allows you to integrate our try-on technology into your platform.
                You can process images via file upload or image URL and receive the result as an image URL or base64.
              </p>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <p className="text-xs font-semibold text-gray-300">Base URL</p>
                </div>
                <CodeBlock code={`${baseUrl}/api/v1`} language="http" />
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">
                All API requests require authentication using your API key. Include your API key in the request header:
              </p>
              <CodeBlock code={`Authorization: Bearer YOUR_API_KEY`} language="http" />
            </div>

            {/* Endpoint 1: Image Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-semibold text-sm">POST</span>
                <h2 className="text-xl font-bold text-gray-900">Try-On (Image Upload)</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Upload an image file and a product image to generate a try-on result.
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Endpoint:</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">POST</p>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    </div>
                  </div>
                  <CodeBlock code={`${baseUrl}/api/v1/try-on/upload`} language="http" />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Request Headers:</p>
                <CodeBlock code={`Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY`} language="http" />
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Request Body (Form Data):</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><code className="bg-white px-2 py-0.5 rounded">user_image</code> (file, required) - User's photo</li>
                    <li><code className="bg-white px-2 py-0.5 rounded">product_image</code> (file, required) - Product image</li>
                    <li><code className="bg-white px-2 py-0.5 rounded">response_format</code> (string, optional) - "url" or "base64" (default: "url")</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Example Request (cURL):</p>
                <CodeBlock code={`curl -X POST "${baseUrl}/api/v1/try-on/upload" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "user_image=@/path/to/user.jpg" \\
  -F "product_image=@/path/to/product.jpg" \\
  -F "response_format=url"`} language="bash" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Response:</p>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "result_url": "https://example.com/result.jpg",
    "result_base64": "data:image/jpeg;base64,..."
  },
  "message": "Try-on generated successfully"
}`} language="json" />
              </div>
            </div>

            {/* Endpoint 2: Image URL */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-sm">POST</span>
                <h2 className="text-xl font-bold text-gray-900">Try-On (Image URL)</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Provide image URLs instead of uploading files directly.
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Endpoint:</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">POST</p>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    </div>
                  </div>
                  <CodeBlock code={`${baseUrl}/api/v1/try-on/url`} language="http" />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Request Headers:</p>
                <CodeBlock code={`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`} language="http" />
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Request Body (JSON):</p>
                <CodeBlock code={`{
  "user_image_url": "https://example.com/user.jpg",
  "product_image_url": "https://example.com/product.jpg",
  "response_format": "url"
}`} language="json" />
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Example Request (cURL):</p>
                <CodeBlock code={`curl -X POST "${baseUrl}/api/v1/try-on/url" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_image_url": "https://example.com/user.jpg",
    "product_image_url": "https://example.com/product.jpg",
    "response_format": "base64"
  }'`} language="bash" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Response:</p>
                <CodeBlock code={`{
  "success": true,
  "data": {
    "result_url": "https://example.com/result.jpg",
    "result_base64": "data:image/jpeg;base64,..."
  },
  "message": "Try-on generated successfully"
}`} language="json" />
              </div>
            </div>

            {/* Response Format */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Response Format</h2>
              <p className="text-gray-600 mb-4">
                The API response includes both URL and base64 formats. Use the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">response_format</code> parameter to specify your preference:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">response_format: "url"</p>
                  <p className="text-sm text-gray-600">Returns the result as a publicly accessible URL</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">response_format: "base64"</p>
                  <p className="text-sm text-gray-600">Returns the result as a base64-encoded data URL</p>
                </div>
              </div>
            </div>

            {/* Error Handling */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Error Handling</h2>
              <p className="text-gray-600 mb-4">The API returns standard HTTP status codes:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">400</span>
                  <span className="text-sm text-gray-700">Bad Request - Invalid parameters</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">401</span>
                  <span className="text-sm text-gray-700">Unauthorized - Invalid or missing API key</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">500</span>
                  <span className="text-sm text-gray-700">Internal Server Error</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

