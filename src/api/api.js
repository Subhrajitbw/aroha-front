// utils/api.js - Enhanced API client with automatic token refresh
import useAuthStore from '../stores/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

// Create enhanced fetch wrapper
const createApiClient = () => {
  let isRefreshing = false;
  let refreshPromise = null;

  const apiCall = async (url, options = {}) => {
    const { accessToken } = useAuthStore.getState();
    
    // Add default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header if token exists
    if (accessToken) {
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }

    const config = {
      ...options,
      headers: defaultHeaders,
      credentials: 'include',
    };

    try {
      let response = await fetch(`${API_BASE_URL}${url}`, config);
      
      // Handle token expiration
      if (response.status === 401 && accessToken && !isRefreshing) {
        // Prevent multiple simultaneous refresh attempts
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = useAuthStore.getState().refreshToken();
        }

        const refreshResult = await refreshPromise;
        
        if (refreshResult.success) {
          // Retry original request with new token
          config.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
          response = await fetch(`${API_BASE_URL}${url}`, config);
        } else {
          // Refresh failed, redirect to login
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Authentication failed');
        }
        
        isRefreshing = false;
        refreshPromise = null;
      }

      return response;
    } catch (error) {
      if (isRefreshing) {
        isRefreshing = false;
        refreshPromise = null;
      }
      throw error;
    }
  };

  return {
    get: (url, options) => apiCall(url, { method: 'GET', ...options }),
    post: (url, data, options) => apiCall(url, { 
      method: 'POST', 
      body: JSON.stringify(data),
      ...options 
    }),
    put: (url, data, options) => apiCall(url, { 
      method: 'PUT', 
      body: JSON.stringify(data),
      ...options 
    }),
    delete: (url, options) => apiCall(url, { method: 'DELETE', ...options }),
    patch: (url, data, options) => apiCall(url, { 
      method: 'PATCH', 
      body: JSON.stringify(data),
      ...options 
    }),
  };
};

export const api = createApiClient();
export default api;