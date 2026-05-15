import Medusa from "@medusajs/js-sdk";

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

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
    ...options,
    headers: {
      "x-publishable-key": publishableKey,
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
