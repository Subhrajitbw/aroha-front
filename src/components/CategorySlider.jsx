import { useEffect, useState, useRef } from "react";
import { sdk } from "../lib/medusaClient"; 
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useResponsive } from "../hooks/useResponsive";

import SectionBackground from "./carousel/SectionBackground";
import CategoryHeader from "./category/CategoryHeader";
import CategoryNavBar from "./CategroyNavBar";
import CategoryProductSection from "./category/CategoryProductSection";

gsap.registerPlugin(ScrollTrigger);

export default function CategorySlider() {
  // ---------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const [regionId, setRegionId] = useState(null); // To help with price calculations
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const viewport = useResponsive();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const sliderRef = useRef(null);
  const ctaRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const animationContext = useRef(null);

  // ---------------------------------------------------------
  // 2. DATA FETCHING
  // ---------------------------------------------------------

  // A. Fetch Region (Optional but recommended for accurate tax/currency)
  useEffect(() => {
    const initRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.length > 0) {
          setRegionId(regions[0].id);
        }
      } catch (e) {
        console.warn("Region fetch failed, falling back to raw prices", e);
      }
    };
    initRegion();
  }, []);

  // B. Fetch Root Categories
  useEffect(() => {
    const fetchRootCategories = async () => {
      setCategoriesLoading(true);
      try {
        const { product_categories } = await sdk.store.category.list({
          parent_category_id: "null", 
          fields: "id,name,handle,description",
          limit: 20
        });
        
        setCategories(product_categories);
        
        if (product_categories.length > 0 && !selectedSlug) {
          setSelectedSlug(product_categories[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchRootCategories();
  }, []);

  // C. Fetch Products with ROBUST Price Mapping
  useEffect(() => {
    if (!selectedSlug) return;

    const fetchCategoryProducts = async () => {
      setProductsLoading(true);
      try {
        const queryParams = {
          category_id: [selectedSlug],
          limit: 10,
          fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*",
        };
        
        // Only pass region_id if we successfully fetched it
        if (regionId) queryParams.region_id = regionId;

        const { products } = await sdk.store.product.list(queryParams);
        
        const mappedProducts = products.map(product => {
          const defaultVariant = product.variants?.[0];
          
          // --- PRICE LOGIC START ---
          // Priority 1: Calculated Price (If Medusa context is working)
          let amount = defaultVariant?.calculated_price?.calculated_amount;
          let originalAmount = defaultVariant?.calculated_price?.original_amount;
          let currencyCode = defaultVariant?.calculated_price?.currency_code;

          // Priority 2: Raw Price Array (Fallback if context/calculation fails)
          if (amount === undefined || amount === null) {
            const prices = defaultVariant?.prices || [];
            
            // Try to find INR specific price
            let priceObj = prices.find(p => p.currency_code?.toLowerCase() === 'inr');
            
            // If no INR, just take the first available one (e.g. USD)
            if (!priceObj) priceObj = prices[0];

            if (priceObj) {
              amount = priceObj.amount;
              originalAmount = priceObj.amount; // Raw prices don't show discounts easily
              currencyCode = priceObj.currency_code;
            }
          }
          // --- PRICE LOGIC END ---

          // Defaults
          amount = amount || 0;
          originalAmount = originalAmount || 0;
          currencyCode = (currencyCode || "INR").toUpperCase();

          // Calculate Discount %
          let discount = 0;
          if (originalAmount > amount) {
            discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
          }

          // Formatter
          const formatPrice = (val) => {
             return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(val);
          };

          const isSale = discount > 0;

          return {
            id: product.id,
            title: product.title,
            handle: product.handle,
            image: product.thumbnail || product.images?.[0]?.url || "https://placehold.co/600x800/f5f5f5/e0e0e0",
            price: formatPrice(amount),
            originalPrice: isSale ? formatPrice(originalAmount) : null,
            discount: discount,
            status: isSale ? "sale" : "new",
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedSlug, regionId]);

  // ---------------------------------------------------------
  // 3. UI LOGIC (Scroll, Resize, Init)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInitialized && !categoriesLoading && categories.length > 0) {
      setIsInitialized(true);
    }
  }, [categoriesLoading, isInitialized, categories.length]);

  useEffect(() => {
    let timeoutId;
    const checkDevice = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

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
    scrollContainer.addEventListener("scroll", updateScrollState, { passive: true });
    const handleResize = () => setTimeout(updateScrollState, 100);
    window.addEventListener("resize", handleResize, { passive: true });
    setTimeout(updateScrollState, 50);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scrollContainer.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories.length, isMobile]);

  useEffect(() => {
    if (!selectedSlug || !tabsRef.current) return;
    const selectedTab = tabsRef.current.querySelector(`[data-slug="${selectedSlug}"]`);
    if (selectedTab?.scrollIntoView) {
      selectedTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedSlug]);

  // ---------------------------------------------------------
  // 4. GSAP ANIMATIONS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!isInitialized) return;
    if (animationContext.current) animationContext.current.revert();

    const ctx = gsap.context(() => {
      gsap.set([headerRef.current, tabsRef.current, sliderRef.current, ctaRef.current], {
        opacity: 0,
        clearProps: "transform"
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse",
        }
      });

      tl.to(headerRef.current, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
        .to(tabsRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5")
        .from(tabsRef.current?.children || [], {
          x: viewport.isMobile ? 20 : 30,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.6")
        .to(sliderRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.4")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");

    }, sectionRef);

    animationContext.current = ctx;
    return () => {
      if (animationContext.current) animationContext.current.revert();
    };
  }, [isInitialized, products, viewport.isMobile]);

  // ---------------------------------------------------------
  // 5. HANDLERS & RENDER
  // ---------------------------------------------------------
  const handleTabClick = (id) => {
    if (id !== selectedSlug) setSelectedSlug(id);
  };

  const scrollTabs = (direction) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.7, 280);
    el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const getResponsiveValues = () => ({
    gap: viewport.isMobile ? 12 : viewport.isTablet ? 16 : 20,
    showNavigation: !viewport.isMobile,
    showDots: viewport.isMobile,
    slidesToShow: viewport.isMobile ? 2 : viewport.isTablet ? 3 : 4,
  });

  // Loading State
  if (categoriesLoading) {
    return (
      <section className="h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Categories...</p>
        </div>
      </section>
    );
  }

  // No Data State
  if (!categoriesLoading && categories.length === 0) {
    return (
      <section className="h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No categories available</p>
        </div>
      </section>
    );
  }

  const selectedCategory = categories.find(cat => cat.id === selectedSlug);
  const responsiveValues = getResponsiveValues();

  return (
    <section
      ref={sectionRef}
      className="bg-transparent h-svh w-full overflow-hidden flex items-start justify-center md:pt-16 pt-[1rem]"
    >
      <SectionBackground />

      <div className="flex flex-col sm:flex-row md:flex-col justify-center md:justify-start w-full max-w-7xl px-4 md:px-6">

        <div className="grid md:grid-cols-2 grid-cols-1 lg:flex-row lg:items-center lg:justify-between md:mb-10 lg:mb-12 md:gap-4">
          <CategoryHeader ref={headerRef} />
          <CategoryNavBar
            ref={tabsRef}
            categories={categories}
            selectedSlug={selectedSlug}
            onTabClick={handleTabClick}
            arrowConfig={{ showArrows, atStart, atEnd }}
            scrollTabs={scrollTabs}
            tabsScrollRef={tabsScrollRef}
          />
        </div>

        <CategoryProductSection
          selectedCategory={selectedCategory}
          products={products}
          loading={productsLoading}
          viewport={viewport}
          responsiveValues={responsiveValues}
          sliderRef={sliderRef}
          ctaRef={ctaRef}
        />
      </div>
    </section>
  );
}
