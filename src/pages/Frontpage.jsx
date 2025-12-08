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
  
  // Store collections here instead of categories
  const [collections, setCollections] = useState([]);
  
  const { isOpen: isMenuOpen } = useMenuStore();

  const sectionRefs = useRef([]);
  const isAnimating = useRef(false);
  const readyRef = useRef(false);
  const lastScrollTime = useRef(0);
  const lastTouchY = useRef(0);
  const scrollDebounceTime = 400;

  // ---------------------------------------------------------
  // 2. DATA FETCHING
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Fetch the first 3 Collections
        const { collections: fetchedCollections } = await sdk.store.collection.list({
          limit: 3,
          fields: "id,title,handle,metadata" // Ensure handle is fetched
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
  // Update this useEffect to clean up on unmount
useEffect(() => {
  if (!isLoading) {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => (readyRef.current = true));
    document.body.style.overflow = "hidden"; // For Frontpage custom scroll
  } else {
    readyRef.current = false;
  }

  // CLEANUP: Reset overflow when leaving this page
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

  const animatedScrollToSection = useCallback((index) => {
    if (!readyRef.current || isAnimating.current) return;
    const toSection = sectionRefs.current[index];
    if (!toSection) return;

    isAnimating.current = true;

    gsap.to(window, {
      duration: 0.8,
      ease: "power2.inOut",
      scrollTo: { y: toSection.offsetTop, autoKill: false },
      onComplete: () => {
        setCurrentSection(index);
        setTimeout(() => (isAnimating.current = false), 100);
      },
    });
  }, []);

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

    const wheelHandler = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < scrollDebounceTime) return;
      if (isAnimating.current) return;
      if (Math.abs(e.deltaY) < 3) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      lastScrollTime.current = now;
      changeSection(dir);
    };

    const onTouchStart = (e) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      if (isAnimating.current) return;
      const deltaY = lastTouchY.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) > 50) {
        changeSection(deltaY > 0 ? 1 : -1);
      }
    };

    const keyHandler = (e) => {
      if (isAnimating.current) return;
      const keyMap = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, Space: 1 };
      if (keyMap[e.key] !== undefined) {
        e.preventDefault();
        changeSection(keyMap[e.key]);
      } else if (e.key === "Home") {
        animatedScrollToSection(0);
      } else if (e.key === "End") {
        animatedScrollToSection(total - 1);
      }
    };

    window.addEventListener("wheel", wheelHandler, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("wheel", wheelHandler);
      window.removeEventListener("touchstart", onTouchStart);
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
              // Pass handle so it fetches its own products
              collectionHandle={collection.handle} 
              // Use metadata image if available, fallback handled inside component
              defaultBackground={collection.metadata?.image}
              // Alternate layout
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
