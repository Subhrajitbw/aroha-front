import Medusa from "@medusajs/js-sdk";

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// Server-side global fetch caching interceptor for Medusa SDK requests
if (typeof window === "undefined") {
  const originalFetch = global.fetch;
  if (originalFetch && !global.__medusa_fetch_intercepted__) {
    global.__medusa_fetch_intercepted__ = true;
    global.fetch = function (url, options = {}) {
      const urlStr = typeof url === 'string' ? url : url?.toString() || '';
      
      // Protect server-side Medusa fetches from timeouts due to remote AWS RDS WAN latency
      if (urlStr.includes('/store/') || urlStr.includes('localhost:9000')) {
        options = {
          ...options,
          signal: AbortSignal.timeout(60000), // Extend body/header timeout tolerance to 60s
        };
      }

      // Target store GET requests, excluding cart/auth/customer operations
      if (
        urlStr.includes('/store/') && 
        (!options.method || options.method.toUpperCase() === 'GET') &&
        !urlStr.includes('/carts/') && 
        !urlStr.includes('/auth/') && 
        !urlStr.includes('/customers/')
      ) {
        options = {
          ...options,
          next: {
            revalidate: 60, // Cache store requests for 60 seconds
            ...options.next,
          },
        };
      }
      return originalFetch(url, options);
    };
  }
}

export const sdk = new Medusa({
  baseUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey,
  auth: {
    type: "jwt",
  },
});

// Helper for client-side token persistence
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem('medusa_auth_token');
  if (savedToken) {
    sdk.client.setToken(savedToken);
  }
}

/**
 * Helper for custom backend routes
 */
export const customFetch = async (path, options = {}) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;
  const response = await fetch(url, {
    cache: "no-store", // Ensure fresh data for custom routes
    signal: AbortSignal.timeout(60000), // Protect custom routes from remote DB timeouts
    ...options,
    headers: {
      "x-publishable-api-key": publishableKey,
      "x-publishable-key": publishableKey, // Keep legacy fallback
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Custom fetch failed: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Helper to get cart ID from cookies (server) or localStorage (client)
 */
export const getCartId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("cart_id");
  }
  return null;
};
