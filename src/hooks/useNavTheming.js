import { useState, useEffect, useMemo } from "react";
import { useMenuStore } from "../stores/useMenuStore";

export const useNavTheming = (navRef, variant, pathname, isMobile) => {
  const currentSection = useMenuStore((state) => state.currentSection);
  const navThemeOverride = useMenuStore((state) => state.navThemeOverride);
  const [localScrolled, setLocalScrolled] = useState(false);
  // Kept for API compatibility — NavBar calls setThemeFrozen when mega menu opens
  const [themeFrozen, setThemeFrozen] = useState(false);

  const isFrontpage = pathname === "/" || pathname === "/home";
  const scrolled = localScrolled || (isFrontpage && currentSection > 0);

  useEffect(() => {
    const handleScroll = () => setLocalScrolled(window.scrollY > 25);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Theme priority: explicit override (set per-section by FrontpageClient only on frontpage) > variant prop
  const effectiveTheme = (isFrontpage && navThemeOverride) 
    ? navThemeOverride 
    : (variant === "dark" ? "dark" : "light");

  const colors = useMemo(() => {
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
  }, [effectiveTheme]);

  const floatingStyles = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          backgroundColor: "rgba(10, 10, 10, 0.75)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          ...(isMobile
            ? {
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }
            : {
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }),
          boxShadow: isMobile
            ? "0 4px 20px rgba(0, 0, 0, 0.2)"
            : "0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 16px rgba(0, 0, 0, 0.15)",
        };
      }
      return {
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        ...(isMobile
          ? {
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            }
          : {
              border: "1px solid rgba(0, 0, 0, 0.08)",
            }),
        boxShadow: isMobile
          ? "0 4px 20px rgba(0, 0, 0, 0.04)"
          : "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 16px rgba(0, 0, 0, 0.03)",
      };
    }
    
    // When not scrolled on frontpage with dark hero, keep transparent
    if (isFrontpage && effectiveTheme === "dark") {
      return {
        backgroundColor: "transparent",
      };
    }

    // On static pages or light sections before scrolling
    return {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    };
  }, [scrolled, effectiveTheme, isMobile, isFrontpage]);

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
