// src/hooks/useCategoryHoverEffects.js
import { useCallback } from "react";
import gsap from "gsap";

export const useCategoryHoverEffects = () => {
  const handleCTAHover = useCallback((e, isEntering) => {
    const button = e.currentTarget;
    const icon = button.querySelector(".cta-icon");

    if (isEntering) {
      gsap.to(button, {
        scale: 1.02,
        y: -1,
        duration: 0.15,
        ease: "power2.out",
      });
      if (icon) {
        gsap.to(icon, { x: 2, duration: 0.15, ease: "power2.out" });
      }
    } else {
      gsap.to(button, { scale: 1, y: 0, duration: 0.15, ease: "power2.out" });
      if (icon) {
        gsap.to(icon, { x: 0, duration: 0.15, ease: "power2.out" });
      }
    }
  }, []);

  const handleViewAllHover = useCallback((e, isEntering) => {
    const button = e.currentTarget;
    const icon = button.querySelector(".view-all-icon");
    const text = button.querySelector(".view-all-text");

    if (isEntering) {
      gsap.to(button, {
        scale: 1.05,
        y: -2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        duration: 0.2,
        ease: "power2.out",
      });
      if (icon) {
        gsap.to(icon, {
          rotation: 90,
          scale: 1.1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
      if (text) {
        gsap.to(text, { x: 2, duration: 0.2, ease: "power2.out" });
      }
    } else {
      gsap.to(button, {
        scale: 1,
        y: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        duration: 0.2,
        ease: "power2.out",
      });
      if (icon) {
        gsap.to(icon, {
          rotation: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
      if (text) {
        gsap.to(text, { x: 0, duration: 0.2, ease: "power2.out" });
      }
    }
  }, []);

  return {
    handleCTAHover,
    handleViewAllHover,
  };
};
