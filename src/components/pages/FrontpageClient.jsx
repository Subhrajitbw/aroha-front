'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { sdk } from "@/lib/medusaClient";
import { useQuery } from "@tanstack/react-query";
import { useMenuStore } from "@/stores/useMenuStore";

// Component Imports
import HeroSection from "../sections/HeroSection";
import ProductCarousel from "../sections/ProductCarousel";
import AboutSection from "../sections/AboutSection";
import EngagementSection from "../sections/EngagementSection";
import CategorySection from "../sections/CategorySection";
import AnimatedSection from "../sections/AnimatedSection";
import LuxuryLoadingOverlay from "../ui/LoadingOverlay";
import Footer from "../layout/Footer";

const FrontpageClient = ({ initialCollections = [] }) => {
  // ---------------------------------------------------------
  // 1. STATE
  // ---------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  const { isOpen: isMenuOpen, setCurrentSection: setGlobalSection, setAppReady, setNavThemeOverride } = useMenuStore();

  const wrapperRef = useRef(null);
  const isAnimating = useRef(false);
  const readyRef = useRef(false);
  const lastTouchY = useRef(0);
  const lastTouchX = useRef(0);
  const touchStartTime = useRef(0);
  const animationDuration = 1.5; // Extended for butter-smooth feel

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
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    // Set initial theme for hero
    setNavThemeOverride("dark");

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      setGlobalSection(0);
      setNavThemeOverride(null); // Clear override when leaving frontpage
    };
  }, []);

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
    const t = setTimeout(() => {
      setIsLoading(false);
      setAppReady(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [setAppReady]);

  const getTotalSections = () => 6 + collections.length;

  // Cinematic GPU-accelerated section transition
  const animatedScrollToSection = useCallback((index) => {
    if (!readyRef.current || isAnimating.current) return;

    const total = getTotalSections();
    if (index < 0 || index >= total) return;
    if (!wrapperRef.current) return;

    isAnimating.current = true;
    setCurrentSection(index);
    setGlobalSection(index);
    // Instant theme switch — no async delay
    setNavThemeOverride(getThemeForSection(index));

    // Kill any existing animations on the wrapper
    gsap.killTweensOf(wrapperRef.current);

    gsap.to(wrapperRef.current, {
      duration: animationDuration,
      ease: "power2.inOut", // Gentlest S-curve — no harsh acceleration
      y: `${-index * 100}vh`,
      force3D: true,
      rotationZ: 0.01, // Force GPU sub-pixel antialiasing
      onComplete: () => {
        // isAnimating is the ONLY gate — no cooldown timers
        isAnimating.current = false;
      },
    });
  }, [collections.length]);

  // Scroll Handlers
  useEffect(() => {
    if (isLoading || isMenuOpen) return;

    const total = getTotalSections();

    const changeSection = (dir) => {
      if (isAnimating.current) return;

      const next = currentSection + dir;
      if (next >= 0 && next < total) {
        animatedScrollToSection(next);
      }
    };

    // Wheel handler — isAnimating is the sole gate, no cooldown timers
    const wheelHandler = (e) => {
      // Ignore primarily horizontal scrolls (e.g. for carousels)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();

      // isAnimating is the only guard — responsive the instant animation settles
      if (isAnimating.current) return;

      // Trigger on any clear intentional movement
      if (Math.abs(e.deltaY) > 5) {
        const dir = e.deltaY > 0 ? 1 : -1;
        changeSection(dir);
      }
    };

    // Touch handlers — iOS-like momentum
    const onTouchStart = (e) => {
      lastTouchY.current = e.touches[0].clientY;
      // Also track X to differentiate vertical vs horizontal swipes
      lastTouchX.current = e.touches[0].clientX;
      touchStartTime.current = Date.now();
    };

    const onTouchMove = (e) => {
      // Prevent vertical swipes immediately to stop Safari from triggering pull-to-refresh.
      // Safari triggers pull-to-refresh on the first few pixels, which pauses JS.
      // By immediately preventing vertical touchmoves, we avoid the pause.
      const deltaY = Math.abs(e.touches[0].clientY - lastTouchY.current);
      const deltaX = Math.abs(e.touches[0].clientX - lastTouchX.current);
      
      // If movement is primarily vertical, prevent default
      if (deltaY > deltaX && e.cancelable) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (isAnimating.current) return;

      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime.current;
      const deltaY = lastTouchY.current - e.changedTouches[0].clientY;
      const velocity = Math.abs(deltaY) / (touchDuration || 1);

      // Light flick (high velocity) = low threshold for native iOS feel
      // Slow drag = higher threshold to prevent accidental changes
      const threshold = velocity > 0.3 ? 15 : 50;

      if (Math.abs(deltaY) > threshold) {
        changeSection(deltaY > 0 ? 1 : -1);
      }
    };

    const keyHandler = (e) => {
      if (isAnimating.current) return;

      const keyMap = {
        ArrowDown: 1,
        PageDown: 1,
        ArrowUp: -1,
        PageUp: -1,
        Space: 1
      };

      if (keyMap[e.key] !== undefined) {
        e.preventDefault();
        changeSection(keyMap[e.key]);
      } else if (e.key === "Home") {
        e.preventDefault();
        animatedScrollToSection(0);
      } else if (e.key === "End") {
        e.preventDefault();
        animatedScrollToSection(total - 1);
      }
    };

    // Add event listeners
    window.addEventListener("wheel", wheelHandler, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("wheel", wheelHandler);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [currentSection, isLoading, collections.length, animatedScrollToSection, isMenuOpen]);

  const sectionClass = "h-[100vh] w-full overflow-hidden bg-transparent";
  const sectionStyle = { contain: 'layout style paint', isolation: 'isolate' };

  // ---------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------
  return (
    <>
      <LuxuryLoadingOverlay
        isVisible={isLoading}
        direction="up"
        duration={3000}
        brandName="AROHA"
        onComplete={() => setIsLoading(false)}
      />
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ height: '100vh', width: '100vw' }}
      >
        <div
          ref={wrapperRef}
          style={{
            transform: 'translateY(0)',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            willChange: 'transform',
          }}
        >
          {/* 0. Hero */}
          <div className={sectionClass} style={sectionStyle}>
            <HeroSection />
          </div>

          {/* 1. Category Section */}
          <div className={sectionClass} style={sectionStyle}>
            <CategorySection />
          </div>

          {/* 2. Product Carousel (New/Sale/Best) */}
          <div className={sectionClass} style={sectionStyle}>
            <ProductCarousel />
          </div>

          {/* 3, 4, 5... Dynamic Collections (Animated Sections) */}
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={sectionClass}
              style={sectionStyle}
            >
              <AnimatedSection
                collectionHandle={collection.handle}
                defaultBackground={collection.metadata?.image}
                desktopViewMode={(index + 1) % 2 === 0 ? "invert" : "normal"}
                title={collection.title}
                description={collection.metadata?.description}
              />
            </div>
          ))}

          {/* Static Sections After Collections */}
          <div className={sectionClass} style={sectionStyle}>
            <AboutSection />
          </div>
          <div className={sectionClass} style={sectionStyle}>
            <EngagementSection />
          </div>
          <div className={sectionClass} style={sectionStyle}>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default FrontpageClient;