// stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

// Cookie utilities with development-friendly settings
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
};

const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? 'secure;' : '';
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${secureFlag} samesite=lax`;
};

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  
  const isProduction = window.location.protocol === 'https:';
  const secureFlag = isProduction ? 'secure;' : '';
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; ${secureFlag} samesite=lax`;
};

// Development fallback to localStorage if needed
const useLocalStorage = import.meta.env.DEV;

const getToken = () => {
  if (useLocalStorage) {
    return localStorage.getItem('accessToken');
  }
  return getCookie('accessToken');
};

const setToken = (token) => {
  if (useLocalStorage) {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  } else {
    if (token) {
      setCookie('accessToken', token, 7);
    } else {
      deleteCookie('accessToken');
    }
  }
};

// Helper function to check if token exists and is valid format
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  // Basic JWT format check (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  // Check if token is not expired by decoding payload (basic check)
  try {
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
};

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastActivity: null,
      isInitialized: false,

      // Core auth setters
      setAuth: (token, user) => {
        // Only set auth if token is valid
        if (!isValidToken(token)) {
          console.warn('⚠️ Invalid token provided to setAuth');
          get().clearAuth();
          return;
        }
        
        // Store token using appropriate method
        setToken(token);
          
        set({
          accessToken: token,
          user: user ?? null,
          isAuthenticated: true,
          error: null,
          lastActivity: Date.now(),
        });
      },

      clearAuth: () => {
        // Clear token from storage
        setToken(null);
        
        // Call logout endpoint to clear httpOnly refresh token (only if we have a token)
        const currentToken = get().accessToken;
        if (currentToken) {
          fetch(`${API_BASE_URL}/auth/logout`, { 
            method: 'POST', 
            credentials: 'include',
            headers: { Authorization: `Bearer ${currentToken}` }
          }).catch(() => {});
        }
        
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          lastActivity: null,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // ✅ NEW: Method to mark initialization as complete without auth calls
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      // Role and permission helpers
      hasRole: (roleName) => get().user?.role?.name === roleName,
      hasPermission: (permission) => get().user?.role?.permissions?.includes(permission) || false,
      hasAnyRole: (roles) => roles.some((r) => get().user?.role?.name === r),

      // Email/password authentication
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(credentials),
          });
          const data = await res.json();
          if (res.ok && data.success && data.accessToken) {
            get().setAuth(data.accessToken, data.user);
            set({ isLoading: false });
            return { success: true, user: data.user };
          }
          set({ isLoading: false, error: data.message });
          return { success: false, message: data.message || 'Login failed' };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false, error: 'Network error. Please try again.' });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData),
          });
          const data = await res.json();
          if (res.ok && data.success && data.accessToken) {
            get().setAuth(data.accessToken, data.user);
            set({ isLoading: false });
            return { success: true, user: data.user };
          }
          set({ isLoading: false, error: data.message });
          return { success: false, message: data.message || 'Registration failed' };
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false, error: 'Network error. Please try again.' });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      // Social authentication helpers
      handleGoogleCredential: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ credential }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.accessToken) {
            get().setAuth(data.accessToken, data.user);
            set({ isLoading: false });
            return { success: true, user: data.user };
          }
          set({ isLoading: false, error: data.message });
          return { success: false, message: data.message || 'Google authentication failed' };
        } catch (error) {
          console.error('Google auth error:', error);
          set({ isLoading: false, error: 'Network error. Please try again.' });
          return { success: false, message: 'Google authentication failed' };
        }
      },

      handleFacebookToken: async (accessToken, userID) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE_URL}/auth/facebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ accessToken, userID }),
          });
          const data = await res.json();
          if (res.ok && data.success && (data.accessToken || data.token)) {
            get().setAuth(data.accessToken || data.token, data.user);
            set({ isLoading: false });
            return { success: true, user: data.user };
          }
          set({ isLoading: false, error: data.message });
          return { success: false, message: data.message || 'Facebook authentication failed' };
        } catch (error) {
          console.error('Facebook auth error:', error);
          set({ isLoading: false, error: 'Network error. Please try again.' });
          return { success: false, message: 'Facebook authentication failed' };
        }
      },

      // Session management
      logout: async () => {
        set({ isLoading: true });
        const currentToken = get().accessToken;
        
        // Only call logout API if we have a valid token
        if (currentToken && isValidToken(currentToken)) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              headers: { Authorization: `Bearer ${currentToken}` },
            });
          } catch (error) {
            console.error('Logout API error:', error);
          }
        }
        
        get().clearAuth();
        set({ isLoading: false });
      },

      // Refresh token using httpOnly cookie
      refreshToken: async () => {
        console.log('🔄 Attempting token refresh...');
        try {
          const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.accessToken && isValidToken(data.accessToken)) {
              console.log('✅ Token refreshed successfully');
              get().setAuth(data.accessToken, data.user ?? get().user);
              return { success: true, accessToken: data.accessToken };
            }
          }
          
          console.log('❌ Token refresh failed - clearing auth');
          get().clearAuth();
          return { success: false, message: 'Session expired' };
        } catch (error) {
          console.error('Token refresh error:', error);
          get().clearAuth();
          return { success: false, message: 'Token refresh failed' };
        }
      },

      getCurrentUser: async () => {
        const token = get().accessToken;
        
        // Don't make API call if no token or invalid token
        if (!token || !isValidToken(token)) {
          console.log('❌ No valid token for getCurrentUser');
          return { success: false, message: 'No valid token' };
        }

        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              set({ user: data.user, error: null });
              return { success: true, user: data.user };
            }
          }
          
          // If unauthorized, try to refresh token
          if (res.status === 401) {
            console.log('🔄 Token expired, attempting refresh...');
            const refreshResult = await get().refreshToken();
            if (refreshResult.success) {
              // Recursively call getCurrentUser with new token
              return get().getCurrentUser();
            }
          }
          
          return { success: false, message: 'Failed to get user' };
        } catch (error) {
          console.error('getCurrentUser error:', error);
          return { success: false, message: 'Network error' };
        }
      },

      // ✅ UPDATED: More intelligent initialization
      initializeAuth: async () => {
        if (get().isInitialized) {
          console.log('🔄 Auth already initialized, skipping...');
          return;
        }
        
        console.log('🔄 Initializing authentication...');
        set({ isLoading: true, isInitialized: true });
        
        // Try stored token first
        const storedToken = getToken();
        console.log('📄 Stored token:', storedToken ? 'Found' : 'Not found');
        
        if (storedToken && isValidToken(storedToken)) {
          console.log('✅ Valid token found in storage');
          set({ accessToken: storedToken, isAuthenticated: true });
          
          // Try to get current user with stored token
          const userResult = await get().getCurrentUser();
          if (userResult.success) {
            console.log('✅ Auth restored from stored token');
            set({ 
              isLoading: false, 
              lastActivity: Date.now() 
            });
            return;
          }
          console.log('❌ Stored token invalid, trying refresh...');
        } else if (storedToken) {
          console.log('❌ Invalid token format, clearing...');
          setToken(null); // Clear invalid token
        }
        
        // Try refresh token if stored token failed or doesn't exist
        console.log('🔄 Attempting refresh token...');
        const refreshResult = await get().refreshToken();
        if (refreshResult.success) {
          console.log('✅ Auth restored from refresh token');
          // Get user info with new token
          await get().getCurrentUser();
          set({ isLoading: false });
        } else {
          console.log('❌ No valid authentication found');
          // No valid authentication, ensure clean state
          set({ 
            isAuthenticated: false, 
            isLoading: false, 
            accessToken: null, 
            user: null 
          });
        }
      },

      // ✅ NEW: Skip initialization when no tokens exist
      skipInitialization: () => {
        console.log('⏭️ Skipping auth initialization - no tokens detected');
        set({ 
          isInitialized: true, 
          isLoading: false,
          isAuthenticated: false, 
          accessToken: null, 
          user: null,
          error: null,
          lastActivity: null
        });
      },

      // Activity tracking for auto-logout
      checkActivity: () => {
        const { lastActivity, isAuthenticated } = get();
        
        // Only check activity if user is authenticated
        if (!isAuthenticated) return true;
        
        const now = Date.now();
        const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
        if (lastActivity && now - lastActivity > maxInactiveTime) {
          console.log('⏰ User inactive for too long, logging out');
          get().clearAuth();
          return false;
        }
        return true;
      },

      updateActivity: () => {
        // Only update activity if authenticated
        if (get().isAuthenticated) {
          set({ lastActivity: Date.now() });
        }
      },

      // ✅ NEW: Helper methods for token detection
      hasStoredAccessToken: () => {
        const token = getToken();
        return token && isValidToken(token);
      },

      hasAnyStoredToken: () => {
        // Check access token
        const accessToken = getToken();
        if (accessToken) return true;

        // Check for refresh token cookies (common names)
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          return cookies.some(cookie => {
            const trimmed = cookie.trim();
            return trimmed.startsWith('refreshToken=') || 
                   trimmed.startsWith('refresh_token=') ||
                   trimmed.startsWith('jwt=') ||
                   trimmed.startsWith('rt=');
          });
        }
        
        return false;
      },

      // ✅ NEW: Reset store to initial state
      resetStore: () => {
        setToken(null);
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          lastActivity: null,
          isInitialized: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user info and activity for UX
        user: state.user,
        lastActivity: state.lastActivity,
        // Don't persist tokens, auth state, or initialization status
      }),
    }
  )
);

// Activity tracking - only track if authenticated
if (typeof window !== 'undefined') {
  const trackActivity = () => {
    const { isAuthenticated, updateActivity, checkActivity } = useAuthStore.getState();
    if (isAuthenticated) {
      // Check if user is still active before updating
      if (checkActivity()) {
        updateActivity();
      }
    }
  };
  
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach((evt) =>
    document.addEventListener(evt, trackActivity, { passive: true })
  );
}

export default useAuthStore;
