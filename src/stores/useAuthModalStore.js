import { create } from 'zustand';

export const useAuthModalStore = create((set, get) => ({
  // Existing state
  isOpen: false,
  mode: 'login', // 'login' | 'register' | 'forgot-password'
  redirectPath: null,

  // Enhanced state for better UX
  isLoading: false,
  error: null,
  socialProvider: null, // Track which social provider is being used

  // Enhanced actions
  open: (mode = 'login', redirectPath = null) => 
    set({ 
      isOpen: true, 
      mode, 
      redirectPath,
      error: null, // Clear any previous errors
      isLoading: false
    }),

  close: () => 
    set({ 
      isOpen: false, 
      mode: 'login', 
      redirectPath: null,
      error: null,
      isLoading: false,
      socialProvider: null
    }),

  setMode: (mode) => set({ 
    mode, 
    error: null // Clear errors when switching modes
  }),

  setRedirectPath: (path) => set({ redirectPath: path }),

  // New methods for enhanced functionality
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  setSocialProvider: (provider) => set({ socialProvider: provider }),

  // Convenience method for opening with specific social provider
  openSocialLogin: (provider, redirectPath = null) => set({
    isOpen: true,
    mode: 'login',
    redirectPath,
    socialProvider: provider,
    error: null,
    isLoading: false
  }),

  // Method to handle social login success/failure
  handleSocialResult: (success, error = null) => {
    if (success) {
      get().close(); // Close modal on success
    } else {
      set({ 
        error, 
        isLoading: false,
        socialProvider: null 
      });
    }
  }
}));
