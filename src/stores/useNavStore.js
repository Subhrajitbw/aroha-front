import { create } from 'zustand';

/**
 * useNavStore
 * Caches navigation data (categories, mega menu content)
 * to prevent heavy re-fetching on every NavBar mount.
 */
export const useNavStore = create((set) => ({
  navItems: [],
  megaMenuContent: {},
  isLoaded: false,
  isLoading: false,
  error: null,

  setNavData: (navItems, megaMenuContent) => set({ 
    navItems, 
    megaMenuContent, 
    isLoaded: true, 
    isLoading: false 
  }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));
