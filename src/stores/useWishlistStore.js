import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false, // Track hydration status

      setHasHydrated: (state) => set({ isHydrated: state }),

      toggleWishlist: (product) => {
        const { items } = get();
        const productId = product.id || product._id || product.handle;
        if (!productId) return;

        const exists = items.find((item) => (item.id || item._id || item.handle) === productId);

        if (exists) {
          set({ items: items.filter((item) => (item.id || item._id || item.handle) !== productId) });
        } else {
          set({ items: [...items, product] });
        }
      },

      isInWishlist: (productId) => {
        if (!productId) return false;
        return get().items.some((item) => (item.id || item._id || item.handle) === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "aroha-sanctuary-storage", // Unique name for long-term persistence
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
