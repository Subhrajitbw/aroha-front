import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { sdk } from "../lib/medusaClient";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight, ChevronLeft, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import { useQuery } from '@tanstack/react-query';
import { medusaApi, prefetchImage } from '../lib/react-query';

const CategorySection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const sliderRef = useRef(null);

  // --- TANSTACK QUERY INTEGRATION ---
  // getCuratedCategories() already returns the array directly
  const { data: curatedData = [], isLoading: loading } = useQuery({
    queryKey: ['curated-categories'],
    queryFn: async () => {
      const categories = await medusaApi.getCuratedCategories();
      // Normalize: getCuratedCategories returns the array on success,
      // or { curated_categories: [] } on error
      const list = Array.isArray(categories) ? categories : (categories?.curated_categories ?? []);
      // Prefetch ALL images for the first category chunk immediately
      const firstChunk = list.slice(0, 4);
      firstChunk.forEach(cat => {
        prefetchImage(cat.image);
        cat.featuredProducts?.forEach(p => prefetchImage(p.thumbnail));
      });
      return list;
    },
  });

  // Chunk layout data into grid modules of 4
  const categoryChunks = [];
  if (curatedData.length) {
    for (let i = 0; i < curatedData.length; i += 4) {
      categoryChunks.push(curatedData.slice(i, i + 4));
    }
  }

  // Smart image prefetching for next slide
  useEffect(() => {
    if (categoryChunks[activeSlide + 1]) {
      const nextSlideData = categoryChunks[activeSlide + 1];
      nextSlideData.forEach(cat => {
        prefetchImage(cat.image);
        cat.featuredProducts?.forEach(p => prefetchImage(p.thumbnail));
      });
    }
  }, [activeSlide, categoryChunks]);

  useEffect(() => {
    if (loading || categoryChunks.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }
      });

      gsap.from(sliderRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        clearProps: "all"
      });
    }, sectionRef);

    const handleScroll = () => {
      if (!sliderRef.current) return;
      const scrollPosition = sliderRef.current.scrollLeft;
      const slideWidth = sliderRef.current.clientWidth;
      const newActiveSlide = Math.round(scrollPosition / slideWidth);
      if (newActiveSlide !== activeSlide) {
        setActiveSlide(newActiveSlide);
      }
    };

    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      ctx.revert();
      if (sliderElement) {
        sliderElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, categoryChunks, activeSlide]);

  const scrollToSlide = (index) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollTo({ left: sliderRef.current.clientWidth * index, behavior: "smooth" });
  };

  const scrollLeft = () => scrollToSlide(Math.max(0, activeSlide - 1));
  const scrollRight = () => scrollToSlide(Math.min(categoryChunks.length - 1, activeSlide + 1));

  if (loading) return (
    <section className="h-full w-full flex items-center justify-center bg-[#fdfbf9]">
      <div className="w-6 h-6 border-t border-stone-800 rounded-full animate-spin" />
    </section>
  );
  console.log(categoryChunks)

  if (categoryChunks.length === 0) {
    return (
      <section className="h-full w-full flex items-center justify-center bg-[#fdfbf9]">
        <p className="text-stone-400 font-serif italic tracking-wide">Curating collections...</p>
      </section>
    );
  }

  const getMasonryClass = (index, chunkLength, chunkIdx) => {
    if (chunkLength === 4) {
      const variant = chunkIdx % 3;

      switch (variant) {
        case 0:
          if (index === 0) return "md:col-span-2 md:row-span-2 col-span-2 row-span-1";
          if (index === 1) return "md:col-span-2 md:row-span-1 col-span-2 row-span-1";
          if (index === 2) return "md:col-span-1 md:row-span-1 col-span-1 row-span-1";
          if (index === 3) return "md:col-span-1 md:row-span-1 col-span-1 row-span-1";
          break;
        case 1:
          if (index === 0) return "md:col-span-2 md:row-span-1 col-span-2 row-span-1";
          if (index === 1) return "md:col-span-1 md:row-span-1 col-span-1 row-span-1";
          if (index === 2) return "md:col-span-1 md:row-span-1 col-span-1 row-span-1";
          if (index === 3) return "md:col-span-2 md:row-span-2 col-span-2 row-span-1";
          break;
        case 2:
          if (index === 0) return "md:col-span-1 md:row-span-2 col-span-1 row-span-2";
          if (index === 1) return "md:col-span-2 md:row-span-1 col-span-2 row-span-1";
          if (index === 2) return "md:col-span-1 md:row-span-2 col-span-1 row-span-2";
          if (index === 3) return "md:col-span-2 md:row-span-1 col-span-2 row-span-1";
          break;
      }
    } else if (chunkLength === 3) {
      if (index === 0) return "md:col-span-2 md:row-span-2 col-span-2 row-span-1";
      if (index === 1) return "md:col-span-1 md:row-span-2 col-span-1 row-span-1";
      if (index === 2) return "md:col-span-1 md:row-span-2 col-span-1 row-span-1";
    } else if (chunkLength === 2) {
      return "md:col-span-2 md:row-span-2 col-span-1 row-span-2";
    }
    return "col-span-4 row-span-2";
  };

  const desktopGridCols = "md:grid-cols-4 md:grid-rows-2";
  const mobileGridCols = "grid-cols-2 grid-rows-3";

  return (
    <section
      ref={sectionRef}
      // RESPONSIVE PADDING ADJUSTMENTS
      className="relative h-full w-full flex flex-col pt-6 pb-6 md:pt-16 md:pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-[#fdfbf9] text-stone-900 justify-start md:justify-center group/section"
    >
      <div className="flex flex-col gap-4 md:gap-6 w-full h-[85vh] min-h-0 max-h-[850px] max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 relative">

        {/* HEADER AREA */}
        <div ref={headerRef} className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-medium text-stone-400">
              The Curated Edit
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tight text-stone-800">
              Shop the Sanctuary
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-8">
            <Link
              to="/categories"
              className="group flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium text-stone-600 hover:text-stone-900 transition-colors duration-300 pb-1"
            >
              All Collections
              <MoveRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Slider Arrows relocated elegantly to the header alongside Links */}
            {categoryChunks.length > 1 && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  disabled={activeSlide === 0}
                  className={`w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 transition-all duration-300 ease-out shadow-sm
                    ${activeSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 hover:bg-stone-900 hover:border-stone-900 hover:text-white hover:shadow-md'}`}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={scrollRight}
                  disabled={activeSlide === categoryChunks.length - 1}
                  className={`w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 transition-all duration-300 ease-out shadow-sm
                    ${activeSlide === categoryChunks.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 hover:bg-stone-900 hover:border-stone-900 hover:text-white hover:shadow-md'}`}
                  aria-label="Next Slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CAROUSEL WRAPPER */}
        <div
          ref={sliderRef}
          className="flex-1 min-h-0 w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide hide-scrollbar pb-2 pt-2 scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryChunks.map((chunk, chunkIdx) => (
            <div
              key={`chunk-${chunkIdx}`}
              className="w-full h-full min-h-0 shrink-0 snap-center px-1"
            >
              <div className={`w-full h-full grid ${mobileGridCols} ${desktopGridCols} grid-flow-dense gap-4 md:gap-6`}>
                {chunk.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`${getMasonryClass(idx, chunk.length, chunkIdx)} min-h-0 h-full w-full`}
                  >
                    <CategoryCard
                      category={cat}
                      isLarge={getMasonryClass(idx, chunk.length, chunkIdx).includes('row-span-2') && getMasonryClass(idx, chunk.length, chunkIdx).includes('col-span-2')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- UX DOT INDICATORS --- */}
        {categoryChunks.length > 1 && (
          <div className="flex-none flex items-center justify-center gap-2 pt-2 pb-1">
            {categoryChunks.map((_, dotIdx) => (
              <button
                key={`dot-${dotIdx}`}
                onClick={() => scrollToSlide(dotIdx)}
                className={`transition-all duration-500 ease-out rounded-full 
                  ${activeSlide === dotIdx
                    ? "w-8 h-1.5 bg-stone-800"
                    : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400"
                  }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

/* LUXURY CARD COMPONENT */
const CategoryCard = ({ category, isLarge = false }) => {
  return (
    <div
      className="group relative w-full h-full min-h-0 flex overflow-hidden rounded-[1.25rem] md:rounded-[2rem] bg-stone-200 shadow-sm isolation-auto cursor-pointer border border-stone-200"
    >
      <Link
        to={`/category/${category.handle}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${category.name} category`}
      />

      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out will-change-transform md:group-hover:scale-105"
        loading="lazy"
      />

      {/* Persistent gradient — matches ProductCarousel hero for consistent readability */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

      {/* Foreground Container: Mobile relies entirely on a minimalist approach (No product cards inside) */}
      <div className="relative w-full h-full flex flex-col justify-end p-5 md:p-6 z-10 pointer-events-none overflow-hidden">

        {/* Title Container - Centered and static on mobile. Translates dynamically on Desktop. */}
        <div className="transform transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform 
          translate-y-0 md:translate-y-0 md:group-hover:-translate-y-24 lg:group-hover:-translate-y-28
          flex flex-col items-start md:block">
          <h3 className={`text-white/95 font-serif italic font-light ${isLarge ? "text-2xl md:text-4xl lg:text-5xl" : "text-xl md:text-2xl"}`} style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {category.name}
          </h3>
          <div className="h-[2px] bg-white/60 mt-3 transition-all duration-700 w-12 md:w-0 md:group-hover:w-16 shadow-sm" />

          {/* Mobile only explore pill since we lack mini-products */}
          <div className="mt-4 md:hidden inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] uppercase font-medium tracking-[0.2em] text-white/90">
            Explore <MoveRight size={12} />
          </div>
        </div>

        {/* Hover Products Container - HIDDEN ON MOBILE completely to declutter to pure editorial view */}
        <div className="hidden md:flex absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 pointer-events-auto h-[65px] md:h-[80px] lg:h-[90px] overflow-visible items-end">

          <div className="flex items-center gap-2 md:gap-3 w-full 
            opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">

            {category.featuredProducts && category.featuredProducts.length > 0 && (
              category.featuredProducts.map((prod, i) => (
                <Link
                  key={prod.id}
                  to={`/product/${prod.handle}`}
                  className="group/mini relative h-[65px] md:h-[80px] lg:h-[90px] aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden bg-stone-200 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/30 will-change-transform"
                  style={{ transitionDelay: `${i * 30}ms` }}
                  title={prod.title}
                >
                  <img src={prod.thumbnail || `https://placehold.co/150x200/e7e5e4/a8a29e?text=Image`} alt={prod.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover/mini:bg-black/20 transition-colors" />
                </Link>
              ))
            )}

            <Link
              to={`/category/${category.handle}`}
              className="group/mini ml-auto md:m-0 relative flex items-center justify-center h-[65px] md:h-[80px] lg:h-[90px] aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden bg-white/10 backdrop-blur-md shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border border-white/30 text-white hover:bg-white hover:text-stone-900 will-change-transform"
              style={{ transitionDelay: `${category.featuredProducts?.length * 30}ms` }}
              aria-label={`View all ${category.name}`}
            >
              <MoveRight size={20} className="transform -rotate-45" />
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CategorySection;
