import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Search, ArrowRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchStore } from  "@/stores/searchStore";
import { searchClient, PRODUCTS_INDEX } from  "@/lib/meilisearch";
import { medusaApi } from  "@/lib/react-query";
import { motion, AnimatePresence } from "framer-motion";
import useLockBodyScroll from  "@/hooks/useLockBodyScroll";

const SearchModal = () => {
  const inputRef = useRef();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  const { isOpen, close } = useSearchStore();
  const router = useRouter();

  useLockBodyScroll(isOpen);

  // Fetch featured categories
  useEffect(() => {
    if (isOpen) {
      const fetchInitial = async () => {
        try {
          const data = await medusaApi.getCuratedCategories();
          const list = Array.isArray(data) ? data : (data?.curated_categories || []);
          setFeaturedCategories(list.slice(0, 4));
        } catch (e) {
          console.warn("Featured categories fetch failed", e);
        }
      };
      fetchInitial();
    }
  }, [isOpen]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close handler
  const handleClose = useCallback(() => {
    close();
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  }, [close]);

  // Search logic
  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const searchResponse = await searchClient
        .index(PRODUCTS_INDEX)
        .search(searchTerm, {
          limit: 12,
          attributesToRetrieve: ["id", "title", "handle", "thumbnail", "description", "variants", "collection"],
          attributesToHighlight: ["title"],
        });

      const mappedProducts = searchResponse.hits.map((hit) => {
        const defaultVariant = hit.variants?.[0];
        let price = defaultVariant?.prices?.[0]?.amount;
        return {
          id: hit.id,
          title: hit.title,
          handle: hit.handle,
          thumbnail: hit.thumbnail,
          description: hit.description,
          collection: hit.collection?.title,
          _highlightedTitle: hit._formatted?.title || hit.title,
          price: price
            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
            : null,
        };
      });
      setResults(mappedProducts);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) fetchResults(query);
      else setResults([]);
    }, 280);
    return () => clearTimeout(debounce);
  }, [query, fetchResults]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/product/${results[selectedIndex].handle}`);
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    },
    [selectedIndex, results, handleClose, router]
  );

  if (!isOpen) return null;

  const trendingTags = ["Tables", "Seating", "Lighting", "Linen", "Ceramics", "Decor"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[120] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop / Background */}
        <div 
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 40%, #e7e5e4 100%)" }}
        />
        
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-10 md:py-16 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-px bg-stone-300" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-stone-400 font-medium">Search</span>
          </div>
          <button
            onClick={handleClose}
            className="group flex items-center gap-3 px-4 py-2 rounded-full border border-stone-200/60 hover:border-stone-400 hover:bg-white/60 transition-all duration-500"
          >
            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500 font-medium hidden sm:inline">Close</span>
            <X size={16} strokeWidth={1.5} className="text-stone-500 group-hover:text-stone-900 transition-colors group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {/* Scrollable container */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="max-w-5xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 pb-32">
            
            {/* Search input container */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="w-full mb-16 md:mb-24"
            >
              <div className="relative">
                <div className="flex items-center gap-5 md:gap-8">
                  <Search className="w-6 h-6 md:w-7 md:h-7 text-stone-300 shrink-0" strokeWidth={1.5} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-3xl md:text-5xl lg:text-6xl font-light text-stone-900 placeholder-stone-300 outline-none tracking-tight leading-tight"
                    style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                  />
                  {query && (
                    <button
                      onClick={() => { setQuery(""); setResults([]); }}
                      className="shrink-0 text-xs uppercase tracking-[0.15em] text-stone-400 hover:text-stone-700 border-b border-transparent hover:border-stone-400 pb-px transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="mt-5 h-px w-full bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200" />
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-3 mt-5">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Searching...</span>
                  </div>
                ) : query ? (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                    {results.length} {results.length === 1 ? "result" : "results"} found
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-300">
                    Type to begin searching
                  </span>
                )}
              </div>
            </motion.div>

            {/* Content area */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                {!query.trim() ? (
                  /* ---- Empty state: Discovery view ---- */
                  <motion.div
                    key="discovery"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-20"
                  >
                    {/* Trending tags */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <TrendingUp size={14} strokeWidth={1.5} className="text-stone-400" />
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-semibold">Trending Searches</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {trendingTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="px-5 py-2.5 rounded-full border border-stone-200 text-sm text-stone-600 hover:text-stone-900 hover:border-stone-400 hover:bg-white/70 hover:shadow-sm transition-all duration-400"
                            style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Featured categories */}
                    {featuredCategories.length > 0 && (
                      <div className="space-y-8">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-semibold">Explore Collections</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                          {featuredCategories.map((cat, i) => (
                            <button
                              key={cat.id || i}
                              onClick={() => {
                                router.push(`/product-categories/${cat.handle}`);
                                handleClose();
                              }}
                              className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-stone-100"
                            >
                              <img
                                src={cat.image || "https://placehold.co/600x800/f5f5f4/a8a29e?text="}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
                              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                                <h4
                                  className="text-white text-lg md:text-xl font-medium leading-snug mb-1"
                                  style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                                >
                                  {cat.name}
                                </h4>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">Explore</span>
                                  <ArrowRight size={10} className="text-white/70" strokeWidth={1.5} />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* ---- Results view ---- */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {results.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
                        {results.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.5 }}
                            onClick={() => {
                              router.push(`/product/${product.handle}`);
                              handleClose();
                            }}
                            className={`group cursor-pointer ${selectedIndex === index ? "ring-2 ring-stone-300 rounded-2xl" : ""}`}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 mb-4">
                              <img
                                src={product.thumbnail || null}
                                alt={product.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Quick view hint */}
                              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-[0.15em] text-stone-700 font-medium shadow-sm">
                                  View Product
                                </span>
                              </div>
                            </div>

                            <div className="px-1 space-y-1.5">
                              <h4
                                className="text-base md:text-lg text-stone-900 leading-snug line-clamp-2"
                                style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                                dangerouslySetInnerHTML={{ __html: product._highlightedTitle }}
                              />
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-medium truncate">
                                  {product.collection || "Aroha"}
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-semibold shrink-0">Enquire</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      !loading && (
                        <div className="flex flex-col items-center justify-center py-32 space-y-8">
                          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                            <Search size={24} className="text-stone-300" strokeWidth={1.5} />
                          </div>
                          <div className="text-center space-y-3">
                            <p
                              className="text-2xl md:text-3xl text-stone-300 font-light"
                              style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                            >
                              No results for "{query}"
                            </p>
                            <p className="text-sm text-stone-400">Try a different search term or browse our collections</p>
                          </div>
                          <button
                            onClick={() => setQuery("")}
                            className="px-6 py-2.5 rounded-full border border-stone-200 text-xs uppercase tracking-[0.15em] text-stone-600 hover:border-stone-400 hover:bg-white/60 transition-all duration-400"
                          >
                            Clear Search
                          </button>
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
