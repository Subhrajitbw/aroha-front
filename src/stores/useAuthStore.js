// stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from '../lib/medusaClient';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Setters
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Email/password authentication (Medusa v2)
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          // Medusa v2 uses the auth module
          const { token } = await sdk.auth.login("emailpass", "customer", {
            email: credentials.email,
            password: credentials.password
          });

          if (token) {
            // After login, fetch customer details
            const { customer } = await sdk.store.customer.me();
            set({ 
              user: customer, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return { success: true, user: customer };
          }
          
          set({ isLoading: false, error: "Authentication failed" });
          return { success: false, message: "Authentication falied" };
        } catch (error) {
          console.error('Login error:', error);
          const message = error.response?.data?.message || error.message || 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Medusa v2: Create customer directly
          const { customer } = await sdk.store.customer.create({
            email: userData.email,
            password: userData.password,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          });

          if (customer) {
            // Auto login after registration
            return get().login({ email: userData.email, password: userData.password });
          }

          set({ isLoading: false, error: "Registration failed" });
          return { success: false, message: "Registration failed" };
        } catch (error) {
          console.error('Register error:', error);
          const message = error.response?.data?.message || error.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      // Social authentication (Placeholder - usually requires custom Medusa providers)
      handleGoogleCredential: async (credential) => {
        set({ error: "Google authentication unconfigured in Medusa Backend." });
        return { success: false, message: "Google authentication unconfigured" };
      },

      handleFacebookToken: async (accessToken, userID) => {
        set({ error: "Facebook authentication unconfigured in Medusa Backend." });
        return { success: false, message: "Facebook authentication unconfigured" };
      },

      // Password Recovery
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Medusa standard reset password token request
          await sdk.store.customer.generatePasswordToken({ email });
          set({ isLoading: false });
          return { success: true, message: "Reset link dispatched if identity exists." };
        } catch (error) {
          console.error('Forgot password error:', error);
          // Don't reveal if email belongs to a user for security
          set({ isLoading: false });
          return { success: true, message: "Reset link dispatched if identity exists." };
        }
      },

      resetPassword: async (email, token, password) => {
        set({ isLoading: true, error: null });
        try {
          await sdk.store.customer.resetPassword({
            email,
            token,
            password
          });
          set({ isLoading: false });
          return { success: true, message: "Credential reset successful." };
        } catch (error) {
          console.error('Reset password error:', error);
          const message = error.response?.data?.message || error.message || 'Reset unfulfilled';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // sdk.auth.logout is often not needed if using session cookies, 
          // but good practice to clear server session
          // await sdk.auth.logout(); 
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        });
      },

      getCurrentUser: async () => {
        try {
          const { customer } = await sdk.store.customer.me();
          if (customer) {
            set({ user: customer, isAuthenticated: true });
            return { success: true, user: customer };
          }
          return { success: false };
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          return { success: false };
        }
      },

      initializeAuth: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        await get().getCurrentUser();
        set({ isInitialized: true, isLoading: false });
      },

      resetStore: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isInitialized: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // We only persist the initialization status and user metadata
        // Real auth is handled by Medusa's session cookies
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export default useAuthStore;

