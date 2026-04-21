import Medusa from "@medusajs/js-sdk";

/**
 * Medusa Client Initialization
 * Configured for Medusa v2.13+ with JWT authentication.
 *
 * IMPORTANT: The SDK automatically injects the publishableKey as
 * the header "x-publishable-api-key" (not "x-publishable-key").
 * Do NOT manually override sdk.client.config.headers — doing so
 * can replace the SDK's correct header with the wrong key name.
 */
export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000",
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  auth: {
    type: "jwt",
  },
});

// Auto-initialize token from localStorage on boot
const savedToken = localStorage.getItem('medusa_auth_token');
if (savedToken) {
  sdk.client.setToken(savedToken);
}
