// src/stores/useMenuStore.js
import { create } from 'zustand';

export const useMenuStore = create((set, get) => ({
  isOpen: false,
  currentSection: 0,
  isAppReady: false,
  navThemeOverride: null, // "dark" | "light" | null — instant theme override from frontpage
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setCurrentSection: (val) => set({ currentSection: val }),
  setAppReady: (val) => set({ isAppReady: val }),
  setNavThemeOverride: (val) => set({ navThemeOverride: val }),
  // Derived: scrolled if past first section
  get isScrolled() { return get().currentSection > 0; },
}));
