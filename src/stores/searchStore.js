import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  isOpen: false, // 🔒 always false on reload

  open: () => {
    localStorage.setItem('isSearchOpen', 'true');
    set({ isOpen: true });
  },

  close: () => {
    localStorage.setItem('isSearchOpen', 'false');
    set({ isOpen: false });
  },

  toggle: () => {
    set((state) => {
      const next = !state.isOpen;
      localStorage.setItem('isSearchOpen', next ? 'true' : 'false');
      return { isOpen: next };
    });
  }
}));
