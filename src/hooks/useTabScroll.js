// src/hooks/useTabScroll.js
import { useState, useEffect, useCallback, useRef } from "react";

export const useTabScroll = (categories, isMobile) => {
  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const tabsScrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = tabsScrollRef.current;
    if (!scrollContainer || categories.length === 0) return;

    let rafId;
    const updateScrollState = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        setShowArrows(scrollWidth > clientWidth + 2 && !isMobile);
        setAtStart(scrollLeft <= 2);
        setAtEnd(scrollLeft >= scrollWidth - clientWidth - 2);
        rafId = null;
      });
    };

    updateScrollState();
    scrollContainer.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    const handleResize = () => setTimeout(updateScrollState, 100);
    window.addEventListener("resize", handleResize, { passive: true });
    setTimeout(updateScrollState, 50);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scrollContainer.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories.length, isMobile]);

  const scrollTabs = useCallback((direction) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.7, 280);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return {
    tabsScrollRef,
    showArrows,
    atStart,
    atEnd,
    scrollTabs,
  };
};
