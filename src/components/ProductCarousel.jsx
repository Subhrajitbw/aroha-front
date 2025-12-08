import { useEffect, useState, useRef } from "react";
import { sdk } from "../lib/medusaClient"; 
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useResponsive } from "../hooks/useResponsive";

// Import your sub-components
import SectionBackground from "./carousel/SectionBackground";
import SectionHeader from "./carousel/SectionHeader";
import ProductSection from "./carousel/ProductSection";
import TabNavigation from "./carousel/TabNavigation";

gsap.registerPlugin(ScrollTrigger);

export default function ProductCarousel() {
  const [selectedTab, setSelectedTab] = useState("New Designs");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const viewport = useResponsive();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const sliderRef = useRef(null);
  const ctaRef = useRef(null);
  const animationContext = useRef(null);

  // Map Products
  const mapProducts = (rawProducts) => {
    if (!Array.isArray(rawProducts)) return [];

    return rawProducts.map((product) => {
      let amount = 0;
      let originalAmount = 0;
      let discount = 0;
      let currencyCode = "INR";

      if (product.sale_price !== undefined || product.discount_percentage !== undefined) {
        amount = product.sale_price || 0;
        originalAmount = product.original_price || 0;
        discount = product.discount_percentage || 
                   (originalAmount > 0 ? Math.round(((originalAmount - amount) / originalAmount) * 100) : 0);
        if (product.currency_code) currencyCode = product.currency_code.toUpperCase();
      } else {
        const defaultVariant = product.variants?.[0];
        const priceData = defaultVariant?.calculated_price;
        amount = priceData?.calculated_amount || 0;
        originalAmount = priceData?.original_amount || 0; 
        if (priceData?.currency_code) currencyCode = priceData.currency_code.toUpperCase();
        if (originalAmount > amount) {
          discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
        }
      }

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
        image: product.thumbnail || product.images?.[0]?.url || "https://placehold.co/400", 
        price: formatPrice(amount),
        originalPrice: isSale ? formatPrice(originalAmount) : null,
        discount: discount,
        collection: product.collection?.title || (isSale ? "Sale" : "New Arrival"),
        status: isSale ? "sale" : "new",
      };
    });
  };

  // Fetch Logic
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let rawData = [];
      
      if (selectedTab === "New Designs") {
        const result = await sdk.client.fetch("/store/custom/new");
        rawData = result.products || result.data || result; 
      } else if (selectedTab === "Sale") {
        const result = await sdk.client.fetch("/store/custom/discounted");
        rawData = result.products || result.data || result;
      } else if (selectedTab === "Best Sellers") {
        const { products } = await sdk.store.product.list({ 
          limit: 10,
          fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*", 
        });
        rawData = products;
      }

      setProducts(mapProducts(rawData));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedTab]);

  useEffect(() => {
    if (!isInitialized && !loading) {
      setIsInitialized(true);
    }
  }, [loading, isInitialized]);

  // GSAP Animations
  useEffect(() => {
    if (!isInitialized) return;

    if (animationContext.current) {
      animationContext.current.revert();
    }

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

      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      })
        .to(tabsRef.current, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        }, "-=0.5")
        .from(tabsRef.current?.children || [], {
          x: viewport.isMobile ? 20 : 30,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.6")
        .to(sliderRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        }, "-=0.4")
        .to(ctaRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.3");

    }, sectionRef);

    animationContext.current = ctx;

    return () => {
      if (animationContext.current) {
        animationContext.current.revert();
      }
    };
  }, [isInitialized, products, viewport.isMobile]);

  // Layout Helpers
  const linkState = (() => {
    if (selectedTab === "New Designs") {
      return { new: true, title: "New Designs" };
    }
    if (selectedTab === "Best Sellers") {
      return { bestselling: true, title: "Best Sellers" };
    }
    if (selectedTab === "Sale") {
      return { onsale: true, title: "Sale" };
    }
    return { title: "Shop All" };
  })();

  const getResponsiveValues = () => ({
    gap: viewport.isMobile ? 12 : viewport.isTablet ? 16 : 20,
    showNavigation: !viewport.isMobile,
    showDots: viewport.isMobile,
    slidesToShow: viewport.isMobile ? 2 : viewport.isTablet ? 3 : 4,
  });

  const tabs = ["New Designs", "Sale"];

  // ✅ RENDER WITH PROPER ALIGNMENT
  return (
    <section
      ref={sectionRef}
      className="bg-transparent min-h-screen w-full overflow-hidden flex items-start justify-center md:pt-24 md:mt-2 pt-[1rem]"
    >
      <SectionBackground />

      <div className="flex flex-col w-full max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        
        {/* Header + Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader ref={headerRef} />
          <TabNavigation
            ref={tabsRef}
            tabs={tabs}
            selectedTab={selectedTab}
            onTabSelect={setSelectedTab}
          />
        </div>

        {/* Product Section - Navigation will be centered with cards */}
        <ProductSection
          selectedTab={selectedTab}
          products={products}
          loading={loading}
          viewport={viewport}
          responsiveValues={getResponsiveValues()}
          linkState={linkState}
          sliderRef={sliderRef}
          ctaRef={ctaRef}
        />
      </div>
    </section>
  );
}
