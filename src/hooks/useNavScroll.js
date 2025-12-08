// hooks/useNavScroll.js
import { useEffect } from "react";
import { gsap } from "gsap";

export const useNavScroll = (navRef, logoRef, scrolled, isDark) => {
  useEffect(() => {
    if (!navRef.current) return;

    gsap.to(navRef.current, {
      backgroundColor: scrolled
        ? isDark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)"
        : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
      borderRadius: scrolled ? "24px" : "0px",
      padding: scrolled ? "16px 24px" : "24px 16px",
      margin: scrolled ? "12px" : "2px",
      boxShadow: scrolled
        ? "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)"
        : "none",
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(logoRef.current, {
      fontSize: scrolled ? "1.75rem" : "2.5rem",
      duration: 0.4,
      ease: "power2.out",
    });
  }, [scrolled, isDark, navRef, logoRef]);
};
