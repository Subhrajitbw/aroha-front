'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { sdk } from "@/lib/medusaClient";
import { useQuery } from "@tanstack/react-query";
import { useMenuStore } from "@/stores/useMenuStore";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

// Component Imports
import HeroSection from "../sections/HeroSection";
import ProductCarousel from "../sections/ProductCarousel";
import AboutSection from "../sections/AboutSection";
import EngagementSection from "../sections/EngagementSection";
import CategorySection from "../sections/CategorySection";
import AnimatedSection from "../sections/AnimatedSection";
import LuxuryLoadingOverlay from "../ui/LoadingOverlay";
import Footer from "../layout/Footer";

const FrontpageClient = ({ initialCollections = [], heroData = null }) => {
  // ---------------------------------------------------------
  // 1. STATE
  // ---------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  const { isOpen: isMenuOpen, setCurrentSection: setGlobalSection, setAppReady, setNavThemeOverride } = useMenuStore();

  const wrapperRef = useRef(null);
  const isAnimating = useRef(false);
  const readyRef = useRef(false);
  const animationTimerRef = useRef(null);
  const lastScrollTime = useRef(0);
  const lastWheelDelta = useRef(0);
  const isQuietPeriod = useRef(true);
  const quietTimerRef = useRef(null);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const touchSwiped = useRef(false);

  const animationDuration = 0.75; // Smooth luxury pacing
  const SCROLL_COOLDOWN = 850; // ms: absorb trackpad momentum to prevent skipping sections

  // ---------------------------------------------------------
  // 2. DATA FETCHING (TANSTACK QUERY)
  // ---------------------------------------------------------
  const { data: collections = initialCollections } = useQuery({
    queryKey: ['frontpage-collections'],
    queryFn: async () => {
      const { collections: fetchedCollections } = await sdk.store.collection.list({
        limit: 3,
        fields: "id,title,handle,metadata"
      });
      return fetchedCollections || [];
    },
    initialData: initialCollections
  });

  // ---------------------------------------------------------
  // 3. SCROLL & LAYOUT LOGIC
  // ---------------------------------------------------------
  const sectionRef = useRef(0); // Ref for immediate access in listeners

  // Deterministic theme map: returns "dark" or "light" for each section index
  // Layout: [Hero, Category, Carousel, ...Collections, About, Engagement, Footer]
  const getThemeForSection = useCallback((index) => {
    const totalSections = 6 + collections.length;
    if (index === 0) return "dark";           // Hero: stone-950 + video
    if (index === 1) return "light";          // CategorySection: #fdfbf9
    if (index === 2) return "light";          // ProductCarousel: #fdfbf9
    // Dynamic collections (indices 3 to 2+collections.length): dark bg images
    if (index >= 3 && index < 3 + collections.length) return "dark";
    // Static sections after collections
    const staticIndex = index - 3 - collections.length;
    if (staticIndex === 0) return "light";    // AboutSection: #efe8e0
    if (staticIndex === 1) return "light";    // EngagementSection: white
    if (staticIndex === 2) return "dark";     // Footer: stone-900
    return "light"; // fallback
  }, [collections.length]);

  // Setup --vh CSS variable for mobile browsers
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  // Lock body scroll — we handle everything via transforms
  useLockBodyScroll(true);

  useEffect(() => {
    // Set initial theme for hero
    setNavThemeOverride("dark");

    return () => {
      setGlobalSection(0);
      setNavThemeOverride(null); // Clear override when leaving frontpage
    };
  }, [setGlobalSection, setNavThemeOverride]);

  // Ready state after loading
  useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => {
        readyRef.current = true;
      });
    } else {
      readyRef.current = false;
    }
  }, [isLoading]);

  // Simulated Loading Timer
  useEffect(() => {
    // In development, we want instant feedback. In production, we allow the cinematic feel.
    const delay = process.env.NODE_ENV === 'development' ? 100 : 1200;
    const t = setTimeout(() => {
      setIsLoading(false);
      setAppReady(true);
    }, delay);
    return () => clearTimeout(t);
  }, [setAppReady]);

  const getTotalSections = () => 6 + (collections?.length || 0);

  // Cinematic GPU-accelerated section transition
  const animatedScrollToSection = useCallback((index) => {
    if (!readyRef.current) return;

    const total = getTotalSections();
    if (index < 0 || index >= total) return;
    if (index === sectionRef.current && isAnimating.current) return;
    if (!wrapperRef.current) return;

    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    isAnimating.current = true;
    lastScrollTime.current = Date.now();
    sectionRef.current = index;
    setCurrentSection(index);
    setGlobalSection(index);
    setNavThemeOverride(getThemeForSection(index));

    gsap.killTweensOf(wrapperRef.current);

    gsap.to(wrapperRef.current, {
      duration: animationDuration,
      ease: "power2.out",
      y: `${-index * 100}dvh`,
      force3D: true,
      overwrite: "auto",
      onComplete: () => {
        animationTimerRef.current = setTimeout(() => {
          isAnimating.current = false;
        }, 100);
      },
    });

    // Fail-safe: ensure isAnimating is reset even if onComplete doesn't fire
    animationTimerRef.current = setTimeout(() => {
      isAnimating.current = false;
    }, (animationDuration + 0.3) * 1000);
  }, [collections?.length, getThemeForSection, setGlobalSection, setNavThemeOverride]);

  // Scroll & Gesture Handlers
  useEffect(() => {
    if (isLoading || isMenuOpen) return;

    const changeSection = (dir) => {
      const now = Date.now();
      if (isAnimating.current || now - lastScrollTime.current < SCROLL_COOLDOWN) return;
      const next = sectionRef.current + dir;
      const total = getTotalSections();
      if (next >= 0 && next < total) {
        animatedScrollToSection(next);
      }
    };

    const wheelHandler = (e) => {
      if (document.querySelector('.bottom-nav-sheet')) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.cancelable) e.preventDefault();

      const now = Date.now();
      const deltaY = e.deltaY;
      const absDeltaY = Math.abs(deltaY);

      // Track quiet periods between scroll gestures (inertia ends when no wheel event for 150ms)
      clearTimeout(quietTimerRef.current);
      quietTimerRef.current = setTimeout(() => {
        isQuietPeriod.current = true;
        lastWheelDelta.current = 0;
      }, 150);

      // Ignore during animation or within cooldown
      if (isAnimating.current || now - lastScrollTime.current < SCROLL_COOLDOWN) {
        lastWheelDelta.current = absDeltaY;
        isQuietPeriod.current = false;
        return;
      }

      // Wheel must be intentional (threshold >= 25)
      if (absDeltaY < 25) {
        lastWheelDelta.current = absDeltaY;
        return;
      }

      // Check if this is new intent vs lingering inertia:
      // 1. If it was quiet (>150ms since last wheel event), it's a fresh gesture
      // 2. If it's a strong accelerating spike (|delta| > 1.4 * previous delta and > 50), it's a fresh swipe
      const isFreshGesture = isQuietPeriod.current || (absDeltaY > lastWheelDelta.current * 1.4 && absDeltaY > 50);

      if (isFreshGesture) {
        isQuietPeriod.current = false;
        changeSection(deltaY > 0 ? 1 : -1);
      }

      lastWheelDelta.current = absDeltaY;
    };

    const onTouchStart = (e) => {
      if (document.querySelector('.bottom-nav-sheet')) return;
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
      touchSwiped.current = false;
    };

    const onTouchMove = (e) => {
      if (document.querySelector('.bottom-nav-sheet')) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = Math.abs(currentY - touchStartY.current);
      const deltaX = Math.abs(currentX - touchStartX.current);

      if (deltaY > deltaX && e.cancelable) {
        e.preventDefault();
      }

      if (touchSwiped.current || isAnimating.current) return;

      const rawDeltaY = touchStartY.current - currentY;
      const now = Date.now();

      // Trigger swipe if dragged > 45px and not horizontal
      if (Math.abs(rawDeltaY) > 45 && deltaY > deltaX && now - lastScrollTime.current > SCROLL_COOLDOWN) {
        touchSwiped.current = true;
        changeSection(rawDeltaY > 0 ? 1 : -1);
      }
    };

    const onTouchEnd = (e) => {
      if (document.querySelector('.bottom-nav-sheet')) return;
      if (touchSwiped.current || isAnimating.current) return;

      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;

      const endY = e.changedTouches[0]?.clientY || touchStartY.current;
      const endX = e.changedTouches[0]?.clientX || touchStartX.current;
      const rawDeltaY = touchStartY.current - endY;
      const rawDeltaX = touchStartX.current - endX;

      if (Math.abs(rawDeltaY) > 30 && Math.abs(rawDeltaY) > Math.abs(rawDeltaX)) {
        touchSwiped.current = true;
        changeSection(rawDeltaY > 0 ? 1 : -1);
      }
    };

    const keydownHandler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        changeSection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        changeSection(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        animatedScrollToSection(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        animatedScrollToSection(getTotalSections() - 1);
      }
    };

    window.addEventListener("wheel", wheelHandler, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", keydownHandler);

    return () => {
      clearTimeout(quietTimerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      window.removeEventListener("wheel", wheelHandler);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", keydownHandler);
    };
  }, [isLoading, isMenuOpen, animatedScrollToSection]);

  const sectionClass = "h-[100dvh] w-full overflow-hidden bg-transparent lg:pb-0";
  const sectionStyle = { contain: 'layout style paint', isolation: 'isolate' };

  // ---------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------
  return (
    <>
      {/* <LuxuryLoadingOverlay
        isVisible={isLoading}
        direction="up"
        duration={process.env.NODE_ENV === 'development' ? 200 : 3000}
        brandName="AROHA"
        onComplete={() => setIsLoading(false)}
      /> */}
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ height: '100dvh', width: '100vw' }}
      >
        <div
          ref={wrapperRef}
          style={{
            transform: 'translateY(0)',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        >
          {/* 0. Hero */}
          <div className={sectionClass} style={sectionStyle}>
            {(currentSection === 0 || currentSection === 1) && <HeroSection heroData={heroData} />}
          </div>

          {/* 1. Category Section */}
          <div className={sectionClass} style={sectionStyle}>
            {(currentSection >= 0 && currentSection <= 2) && <CategorySection />}
          </div>

          {/* 2. Product Carousel (New/Sale/Best) */}
          <div className={sectionClass} style={sectionStyle}>
            {(currentSection >= 1 && currentSection <= 3) && <ProductCarousel />}
          </div>

          {/* 3, 4, 5... Dynamic Collections (Animated Sections) */}
          {collections.map((collection, index) => {
            const sectionIndex = 3 + index;
            const isNear = Math.abs(currentSection - sectionIndex) <= 1;
            return (
              <div
                key={collection.id}
                className={sectionClass}
                style={sectionStyle}
              >
                {isNear && (
                  <AnimatedSection
                    collectionHandle={collection.handle}
                    defaultBackground={collection.metadata?.image}
                    desktopViewMode={(index + 1) % 2 === 0 ? "invert" : "normal"}
                    title={collection.title}
                    description={collection.metadata?.description}
                  />
                )}
              </div>
            );
          })}

          {/* Static Sections After Collections */}
          {(() => {
            const aboutIndex = 3 + collections.length;
            const engagementIndex = 4 + collections.length;
            const footerIndex = 5 + collections.length;

            return (
              <>
                <div className={sectionClass} style={sectionStyle}>
                  {Math.abs(currentSection - aboutIndex) <= 1 && <AboutSection />}
                </div>
                <div className={sectionClass} style={sectionStyle}>
                  {Math.abs(currentSection - engagementIndex) <= 1 && <EngagementSection />}
                </div>
                <div className={sectionClass} style={sectionStyle}>
                  {Math.abs(currentSection - footerIndex) <= 1 && <Footer />}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
};

export default FrontpageClient;