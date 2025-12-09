import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { sdk } from "../lib/medusaClient"; 
import { useMenuStore } from "../stores/useMenuStore";

// Component Imports
import HeroSection from "../components/HeroSection";
import ProductCarousel from "../components/ProductCarousel";
import AboutSection from "../components/AboutSection";
import EngagementSection from "../components/EngagementSection";
import CategorySection from "../components/CategorySection";
import AnimatedSection from "../components/AnimatedSection";
import LuxuryLoadingOverlay from "../components/LoadingOverlay";
import Footer from "../components/Footer";

gsap.registerPlugin(ScrollToPlugin);

const Frontpage = () => {
  // ---------------------------------------------------------
  // 1. STATE
  // ---------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [collections, setCollections] = useState([]);
  
  const { isOpen: isMenuOpen } = useMenuStore();

  const sectionRefs = useRef([]);
  const isAnimating = useRef(false);
  const readyRef = useRef(false);
  const lastScrollTime = useRef(0);
  const lastTouchY = useRef(0);
  const touchStartTime = useRef(0);
  const scrollAccumulator = useRef(0);
  const scrollThreshold = 30; // Lower threshold for better responsiveness
  const animationDuration = 0.5;
  const cooldownTime = 50; // Minimal cooldown between scrolls

  // ---------------------------------------------------------
  // 2. DATA FETCHING
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { collections: fetchedCollections } = await sdk.store.collection.list({
          limit: 3,
          fields: "id,title,handle,metadata"
        });
        
        setCollections(fetchedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setCollections([]);
      }
    };

    fetchCollections();
  }, []);

  // ---------------------------------------------------------
  // 3. SCROLL & LAYOUT LOGIC
  // ---------------------------------------------------------
  
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

  // Reset scroll on load
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Lock body during load
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
  }, []);

  // Unlock when loading finished
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        readyRef.current = true;
      });
      document.body.style.overflow = "hidden";
    } else {
      readyRef.current = false;
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  // Simulated Loading Timer
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2500); 
    return () => clearTimeout(t);
  }, []);

  const getTotalSections = () => 6 + collections.length;

  // Ultra-fast scroll animation
  const animatedScrollToSection = useCallback((index) => {
    if (!readyRef.current || isAnimating.current) return;
    
    const total = getTotalSections();
    if (index < 0 || index >= total) return;
    
    const toSection = sectionRefs.current[index];
    if (!toSection) return;

    isAnimating.current = true;
    setCurrentSection(index);

    // Kill any existing scroll animations immediately
    gsap.killTweensOf(window);

    gsap.to(window, {
      duration: animationDuration,
      ease: "power4.out",
      scrollTo: { 
        y: toSection.offsetTop, 
        autoKill: false 
      },
      onComplete: () => {
        isAnimating.current = false;
        scrollAccumulator.current = 0;
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

    // Fixed wheel handler
    const wheelHandler = (e) => {
      e.preventDefault();
      
      if (isAnimating.current) return;

      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      // Only check cooldown when actually scrolling
      if (timeSinceLastScroll < cooldownTime) return;

      // Reset accumulator if paused
      if (timeSinceLastScroll > 300) {
        scrollAccumulator.current = 0;
      }

      // Accumulate scroll - use raw deltaY for better sensitivity
      scrollAccumulator.current += e.deltaY;

      // Check if we've reached threshold
      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        const dir = scrollAccumulator.current > 0 ? 1 : -1;
        lastScrollTime.current = now;
        scrollAccumulator.current = 0;
        changeSection(dir);
      }
    };

    // Touch handlers
    const onTouchStart = (e) => {
      lastTouchY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const onTouchMove = (e) => {
      if (Math.abs(e.touches[0].clientY - lastTouchY.current) > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e) => {
      if (isAnimating.current) return;
      
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime.current;
      const deltaY = lastTouchY.current - e.changedTouches[0].clientY;
      const velocity = Math.abs(deltaY) / touchDuration;

      const threshold = velocity > 0.5 ? 20 : 40;

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

  const sectionClass = "h-[calc(var(--vh)*100)] w-full overflow-hidden bg-transparent";

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
      <main className="main-wrapper overflow-hidden">
        {/* 0. Hero */}
        <div ref={(el) => (sectionRefs.current[0] = el)} className={sectionClass}>
          <HeroSection />
        </div>

        {/* 1. Category Section */}
        <div ref={(el) => (sectionRefs.current[1] = el)} className={sectionClass}>
          <CategorySection />
        </div>

        {/* 2. Product Carousel (New/Sale/Best) */}
        <div ref={(el) => (sectionRefs.current[2] = el)} className={sectionClass}>
          <ProductCarousel />
        </div>

        {/* 3, 4, 5... Dynamic Collections (Animated Sections) */}
        {collections.map((collection, index) => (
          <div
            key={collection.id} 
            ref={(el) => (sectionRefs.current[index + 3] = el)}
            className={sectionClass}
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
        <div ref={(el) => (sectionRefs.current[3 + collections.length] = el)} className={sectionClass}>
          <AboutSection />
        </div>
        <div ref={(el) => (sectionRefs.current[4 + collections.length] = el)} className={sectionClass}>
          <EngagementSection />
        </div>
        <div ref={(el) => (sectionRefs.current[5 + collections.length] = el)} className={sectionClass}>
          <Footer />
        </div>
      </main>
    </>
  );
};

export default Frontpage;
