// hooks/useKeyboardShortcuts.js
import { useEffect } from "react";

export const useKeyboardShortcuts = (openSearch) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isCmdF = isMac && e.metaKey && e.key === "f";
      const isCtrlF = !isMac && e.ctrlKey && e.key === "f";
      if (isCmdF || isCtrlF) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);
};
