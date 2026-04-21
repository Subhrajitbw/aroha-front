import { create } from "zustand";
import { sdk } from "../lib/medusaClient";

/**
 * useAuthStore
 * Production-Grade Authentication State Management
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  _promise: null, 
  _lastChecked: 0, // Cache timestamp

  // ✅ REDUNDANCY CURE: initializeAuth with Atomic Lock
  initializeAuth: async () => {
    const state = get();
    
    // If already initialized, stop.
    if (state.isInitialized) return;
    
    // If a request is already in flight, return that same promise
    if (state._promise) return state._promise;

    const promise = (async () => {
      set({ isLoading: true });
      try {
        const token = localStorage.getItem("medusa_auth_token");
        if (token) {
          // Verify JWT haven't expired before calling /me
          const isExpired = get().isTokenExpired(token);
          if (isExpired) {
            console.warn("[AuthStore] Token expired. Clearing session.");
            get().logout();
          } else {
            sdk.client.setToken(token);
            await get().getCurrentUser();
          }
        }
      } catch (err) {
        console.error("[AuthStore] Init failed:", err.message);
      } finally {
        set({ isInitialized: true, isLoading: false, _promise: null });
      }
    })();

    set({ _promise: promise });
    return promise;
  },

  // ✅ JWT GUARD: Check if the token is still valid
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  },

  // ✅ EMAIL LOGIN
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        email: credentials?.email || "",
        password: credentials?.password || "",
      };

      const res = await sdk.auth.login("customer", "emailpass", payload);
      const token = typeof res === "string" ? res : res?.token;

      if (token) {
        localStorage.setItem("medusa_auth_token", token);
        sdk.client.setToken(token);
        await get().getCurrentUser();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      set({ error: "Invalid credentials", isLoading: false });
      return { success: false };
    }
  },

  // ✅ FETCH USER (Optimized & Cached)
  getCurrentUser: async () => {
    // CACHE GUARD: Skip network if we checked in the last 60 seconds
    const now = Date.now();
    if (get().user && (now - get()._lastChecked < 60000)) {
      return { success: true, user: get().user };
    }

    try {
      // ONLY 'me' works reliably without an ID
      const { customer } = await sdk.store.customer.retrieve();
      
      if (!customer) throw new Error("No customer found");

      set({
        user: customer,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        _lastChecked: now
      });
      return { success: true, user: customer };
    } catch (err) {
      console.log("[AuthStore] Session invalid or missing profile.");
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false };
    }
  },

  // ✅ UPDATE USER
  updateUser: async (data) => {
    set({ isLoading: true });
    try {
      await sdk.store.customer.update(data);
      return await get().getCurrentUser();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false };
    }
  },

  // ✅ ADDRESS CRUD
  manageAddress: async (action, addressId, data) => {
    set({ isLoading: true });
    try {
      if (action === "add") await sdk.store.customer.addAddress({ address: data });
      if (action === "update") await sdk.store.customer.updateAddress(addressId, { address: data });
      if (action === "delete") await sdk.store.customer.deleteAddress(addressId);
      
      return await get().getCurrentUser();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false };
    }
  },

  // ✅ LOGOUT
  logout: () => {
    sdk.client.setToken(null);
    localStorage.removeItem("medusa_auth_token");
    set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
  },

  // ✅ SOCIAL LOGIN
  initiateSocialAuth: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      const origin = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const callbackUrl = `${origin}/oauth/callback`;
      const res = await sdk.auth.login("customer", provider, {
        callback_url: callbackUrl,
      });
      if (res?.location) window.location.href = res.location;
    } catch (error) {
      console.error("[AuthStore] Social Auth Error:", error);
      set({ isLoading: false, error: "Social handshake failed" });
    }
  },
}));