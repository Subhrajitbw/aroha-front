import { useState, useEffect, useMemo } from "react";
import { useMenuStore } from "../stores/useMenuStore";

export const useNavTheming = (navRef, variant, pathname, isMobile) => {
  const currentSection = useMenuStore((state) => state.currentSection);
  const navThemeOverride = useMenuStore((state) => state.navThemeOverride);
  const [localScrolled, setLocalScrolled] = useState(false);
  // Kept for API compatibility — NavBar calls setThemeFrozen when mega menu opens
  const [themeFrozen, setThemeFrozen] = useState(false);

  const scrolled = localScrolled || currentSection > 0;

  useEffect(() => {
    const handleScroll = () => setLocalScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme priority: explicit override (set per-section by FrontpageClient) > variant prop
  const effectiveTheme = navThemeOverride || (variant === "dark" ? "dark" : "light");

  const colors = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          navTextColor: "text-neutral-100",
          navHoverColor: "hover:text-neutral-300",
          logoColor: "text-white",
        };
      }
      return {
        navTextColor: "text-neutral-900",
        navHoverColor: "hover:text-neutral-700",
        logoColor: "text-neutral-900",
      };
    }
    return {
      navTextColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
      navHoverColor: effectiveTheme === "light" ? "hover:text-neutral-700" : "hover:text-neutral-300",
      logoColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
    };
  }, [scrolled, effectiveTheme]);

  const floatingStyles = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          ...(isMobile
            ? {
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }
            : {
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }),
          boxShadow: isMobile
            ? "0 4px 20px rgba(0, 0, 0, 0.05)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 16px rgba(0, 0, 0, 0.1)",
        };
      }
      return {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        ...(isMobile
          ? {
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            }
          : {
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }),
        boxShadow: isMobile
          ? "0 4px 20px rgba(0, 0, 0, 0.02)"
          : "0 8px 32px rgba(255, 255, 255, 0.15), 0 2px 16px rgba(255, 255, 255, 0.1)",
      };
    }
    return {
      backgroundColor: "transparent",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  }, [scrolled, effectiveTheme, isMobile]);

  const floatingPosition = useMemo(() => {
    if (scrolled) {
      return !isMobile ? "top-3 left-4 right-4" : "top-0 left-0 right-0";
    }
    return "top-0 left-0 right-0";
  }, [scrolled, isMobile]);

  return {
    scrolled,
    effectiveTheme,
    colorAnalysis: null,
    colors,
    floatingStyles,
    floatingPosition,
    setThemeFrozen
  };
};
