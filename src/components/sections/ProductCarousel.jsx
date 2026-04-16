import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MoveRight, ArrowUpRight, ChevronUp, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { medusaApi, prefetchImage } from "../../lib/react-query";
import { sdk } from "../../lib/medusaClient";
import { useResponsive } from "../../hooks/useResponsive";

gsap.registerPlugin(ScrollTrigger);

export default function ProductCarousel() {
  const [selectedTab, setSelectedTab] = useState("New Designs");
  const [activeProductId, setActiveProductId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Track guided interaction state

  const { isDesktop } = useResponsive();
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const showcaseRef = useRef(null);
  const scrollRef = useRef(null);

  const tabs = ["New Designs", "Sale"];

  // Map Products (Pricing logic preserved)
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
        image: product.thumbnail || product.images?.[0]?.url || "https://placehold.co/800x1200",
        price: formatPrice(amount),
        originalPrice: isSale ? formatPrice(originalAmount) : null,
        discount: discount,
        collection: product.collection?.title || (isSale ? "Sale" : "New Arrival"),
        status: isSale ? "sale" : "new",
      };
    });
  };

  // --- TANSTACK QUERY INTEGRATION ---
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-carousel', selectedTab],
    queryFn: async () => {
      let rawData = [];
      try {
        if (selectedTab === "New Designs") {
          const response = await sdk.client.fetch("/store/custom/new", { method: "GET" });
          rawData = response.products || response.data || response;
        } else if (selectedTab === "Sale") {
          const response = await sdk.client.fetch("/store/custom/discounted", { method: "GET" });
          rawData = response.products || response.data || response;
        } else if (selectedTab === "Best Sellers") {
          const response = await sdk.store.product.list({
            limit: 10,
            fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*"
          });
          rawData = response.products;
        }
      } catch (e) {
        console.error("Error fetching carousel products:", e);
      }

      const mapped = mapProducts(rawData);
      mapped.forEach(p => prefetchImage(p.image));
      return mapped;
    },
  });


  // Cap at 10 items
  const displayProducts = useMemo(() => products.slice(0, 10), [products]);

  // Reset on tab change
  useEffect(() => {
    if (displayProducts.length > 0) {
      setCurrentIndex(0);
      setActiveProductId(displayProducts[0].id);
    }
  }, [displayProducts]);

  // Dead-simple navigation — no useCallback, no refs, no guards
  function goToIndex(idx) {
    const max = displayProducts.length - 1;
    if (max < 0) return;
    const next = Math.max(0, Math.min(idx, max));
    setCurrentIndex(next);
    setActiveProductId(displayProducts[next].id);

    // Immediately scroll the track
    const track = scrollRef.current;
    if (track) {
      const child = track.children[next];
      if (child) {
        if (window.innerWidth >= 1024) {
          track.scrollTo({ top: child.offsetTop, behavior: 'smooth' });
        } else {
          const scrollLeft = child.offsetLeft - (track.offsetWidth / 2) + (child.offsetWidth / 2);
          track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
      }
    }
  }

  // Block wheel and touch on the track (desktop only) — runs once
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const block = (e) => { if (window.innerWidth >= 1024) e.preventDefault(); };
    el.addEventListener("wheel", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("wheel", block);
      el.removeEventListener("touchmove", block);
    };
  }, []);

  // Entrance animations removed
  useEffect(() => {
    // Animations are gone
  }, []);

  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#fdfbf9] py-10 md:py-16 lg:py-24 selection:bg-stone-200 flex flex-col justify-start min-h-screen lg:min-h-0"
    >
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12 flex flex-col gap-8 lg:gap-10 h-full min-h-0">

        {/* HEADER */}
        <div
          ref={headlineRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-4"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-stone-400">
                Curated Collections
              </span>
              <div className="h-px w-6 bg-stone-300 hidden md:block" />

            </div>

            <div className="flex items-center gap-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tight text-stone-900">
                The Showcase
              </h2>
              <Link
                to="/store"
                className="group hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-medium text-stone-400 hover:text-stone-900 transition-colors duration-300 mt-2"
              >
                Shop All
                <MoveRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-2 md:mt-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 pb-2 border-b-2
              ${selectedTab === tab
                    ? "text-stone-900 border-stone-900"
                    : "text-stone-400 border-transparent hover:text-stone-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-4">
            <div className="w-6 h-6 border-t border-stone-800 rounded-full animate-spin"></div>
            <p className="text-stone-400 font-serif italic tracking-wide">
              Curating pieces...
            </p>
          </div>
        )}

        {/* MAIN LAYOUT */}
        {!isLoading && displayProducts.length > 0 && activeProduct && (
          <div
            ref={showcaseRef}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full lg:h-[70vh]"
          >
            {/* LEFT HERO */}
            <div className="flex col-span-1 lg:col-span-8 relative rounded-2xl lg:rounded-[2rem] overflow-hidden bg-stone-100 group h-[50vh] lg:h-full shadow-sm">
              <img
                key={activeProduct.id}
                src={activeProduct.image}
                alt={activeProduct.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              <div className="absolute inset-0 p-5 lg:p-8 flex flex-col justify-between pointer-events-none">
                <div className="self-end px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] uppercase tracking-widest font-medium">
                  {activeProduct.status === "new" ? "Latest Arrival" : "On Sale"}
                </div>

                <div className="w-full text-white/95 flex flex-col md:flex-row justify-between md:items-end gap-4 md:gap-8" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                  <div className="flex flex-col max-w-xl">
                    <h3 className="text-2xl sm:text-3xl lg:text-5xl font-serif italic font-light leading-snug line-clamp-2">
                      {activeProduct.title}
                    </h3>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:pb-1 md:shrink-0 w-full md:w-auto mt-auto">
                    <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-white/70 font-medium hidden md:block mb-1.5">
                      {activeProduct.collection || "Collection"}
                    </span>
                    <div className="flex items-center gap-3 md:gap-2">
                      {activeProduct.originalPrice && (
                        <span className="text-white/50 line-through text-xs lg:text-sm font-light tracking-wider">
                          {activeProduct.originalPrice}
                        </span>
                      )}
                      <span className="text-lg lg:text-2xl font-light tracking-wide whitespace-nowrap">
                        {activeProduct.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/product/${activeProduct.handle}`}
                className="absolute inset-0 z-10"
              />
            </div>

            {/* RIGHT SCROLL TRACK WRAPPER */}
            <div className="col-span-1 lg:col-span-4 relative h-auto lg:h-full flex flex-col min-h-0 group">

              {/* Progress Track */}
              <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-center z-30 gap-0 w-10">

                {/* Arrow Up */}
                <button
                  disabled={currentIndex === 0}
                  onClick={() => goToIndex(currentIndex - 1)}
                  className="w-7 h-7 shrink-0 rounded-full bg-white/95 backdrop-blur shadow-sm border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 hover:scale-110 transition-all duration-300 mb-3 outline-none"
                  aria-label="Previous product"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                {/* Dot indicators — simple fixed list */}
                <div className="flex flex-col items-center gap-3 relative">
                  {/* Track line */}
                  <div className="absolute top-0 bottom-0 w-px bg-stone-200 pointer-events-none" />

                  {displayProducts.map((product, i) => {
                    const isActive = i === currentIndex;
                    const itemNumber = (i + 1).toString().padStart(2, '0');

                    return (
                      <div key={'ind-' + product.id} className="relative group/dot">
                        <button
                          onClick={() => goToIndex(i)}
                          className="relative z-10 w-8 h-8 flex items-center justify-center outline-none cursor-pointer"
                          aria-label={`Go to product ${i + 1}: ${product.title}`}
                        >
                          <div
                            className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                              ? 'w-6 h-8 rounded-sm ring-1 ring-stone-800 shadow-md overflow-hidden'
                              : 'w-2 h-2 rounded-full bg-stone-300 hover:bg-stone-500 hover:scale-150'
                              }`}
                          >
                            {isActive && (
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        </button>

                        {/* Hover tooltip */}
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 pointer-events-none group-hover/dot:opacity-100 group-hover/dot:translate-x-0 transition-all duration-200 ease-out flex items-center z-50">
                          <div className="whitespace-nowrap px-3 py-1.5 bg-white shadow-lg rounded-lg border border-stone-100 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-400">{itemNumber}</span>
                            <span className="text-xs font-medium text-stone-800 max-w-[120px] truncate">{product.title}</span>
                          </div>
                          <div className="w-2 h-px bg-stone-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Arrow Down */}
                <button
                  disabled={currentIndex >= displayProducts.length - 1}
                  onClick={() => goToIndex(currentIndex + 1)}
                  className="w-7 h-7 shrink-0 rounded-full bg-white/95 backdrop-blur shadow-sm border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 disabled:opacity-30 hover:scale-110 transition-all duration-300 mt-3 outline-none"
                  aria-label="Next product"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* RIGHT SCROLL TRACK */}
              <div
                ref={scrollRef}
                className="
                  flex overflow-x-auto items-center
                  lg:flex-col lg:flex-1 lg:items-stretch
                  lg:overflow-y-auto lg:overflow-x-hidden
                  snap-x snap-mandatory lg:snap-none
                  scrollbar-hide
                  gap-2.5 lg:gap-3 py-2 lg:py-0 lg:pr-16 lg:mr-4
                  h-auto lg:h-full lg:min-h-0 min-w-0
                  relative
                "
              >
                {displayProducts.map((product, i) => {
                  const isActive = product.id === activeProductId;

                  return (
                    <div
                      key={product.id}
                      onClick={() => goToIndex(i)}
                      onMouseEnter={() =>
                        window.innerWidth >= 1024 &&
                        setActiveProductId(product.id)
                      }
                      className={`
                  relative flex-none cursor-pointer
                  transition-all duration-500 ease-out overflow-hidden snap-center

                  w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-xl
                  lg:w-full lg:h-auto lg:min-h-[120px] lg:flex lg:flex-row lg:rounded-2xl

                  border bg-white
                  ${isActive
                          ? "ring-2 ring-stone-800 border-stone-800 lg:ring-0 lg:border-stone-900 shadow-md scale-110 lg:scale-100"
                          : "border-stone-200 hover:border-stone-400 opacity-75 lg:opacity-90 hover:opacity-100"
                        }
                `}
                    >
                      <div className="absolute inset-0 lg:relative lg:w-[120px] lg:h-full lg:shrink-0 bg-stone-100">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="hidden lg:flex relative p-5 flex-col justify-center pointer-events-none flex-1">
                        <h4
                          className={`font-serif text-lg leading-snug mb-1 line-clamp-2 ${isActive
                            ? "text-stone-900"
                            : "text-stone-700"
                            }`}
                        >
                          {product.title}
                        </h4>

                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`text-sm ${isActive
                              ? "text-stone-900"
                              : "text-stone-500"
                              }`}
                          >
                            {product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Artificial Spacer to allow trailing items to scroll perfectly to the top offset */}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    /* Elegant Desktop Scrollbar Indicator */
    @media (min-width: 1024px) {
      .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
        display: block;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.03); 
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.15); 
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(0,0,0,0.3); 
      }
    }
  `}</style>
    </section>
  );
}
