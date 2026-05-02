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
 * Helper to get cart ID from cookies (server) or localStorage (client)
 */
export const getCartId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("cart_id");
  }
  // On server, we would use cookies() from next/headers
  // but we can't import it here directly as this is a shared lib.
  // We'll pass it from components when needed.
  return null;
};
