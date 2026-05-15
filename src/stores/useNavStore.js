import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * useNavStore
 * Caches navigation data (categories, mega menu content)
 * and persists it to localStorage to prevent heavy re-fetching on every NavBar mount.
 */
export const useNavStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'aroha-nav-cache',
      storage: createJSONStorage(() => localStorage),
      // Only persist the data, not the loading states
      partialize: (state) => ({ 
        navItems: state.navItems, 
        megaMenuContent: state.megaMenuContent 
      }),
    }
  )
);
