import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Search, ArrowRight, Sparkles, TrendingUp, History, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../../stores/searchStore";
import { searchClient, PRODUCTS_INDEX } from "../../lib/meilisearch";
import { medusaApi } from "../../lib/react-query";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";

const SearchModal = () => {
  const modalRef = useRef();
  const inputRef = useRef();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  const { isOpen, close } = useSearchStore();
  const navigate = useNavigate();

  // Fetch featured categories for empty state
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

  // Entrance & Exit Animations
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 1,
        backdropFilter: "blur(50px)",
        duration: 1,
        ease: "power4.out"
      });
      
      gsap.fromTo(".search-content", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.1, ease: "power4.out" }
      );

      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 500);
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    gsap.to(modalRef.current, {
      opacity: 0,
      backdropFilter: "blur(0px)",
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        close();
        setQuery("");
        setResults([]);
      }
    });
  }, [close]);

  // MeiliSearch Integration
  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const searchResponse = await searchClient
        .index(PRODUCTS_INDEX)
        .search(searchTerm, {
          limit: 12,
          attributesToRetrieve: ['id', 'title', 'handle', 'thumbnail', 'description', 'variants', 'collection'],
          attributesToHighlight: ['title'],
        });

      const mappedProducts = searchResponse.hits.map(hit => {
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
            ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)
            : null
        };
      });

      setResults(mappedProducts);
    } catch (err) {
      setError("Unable to complete search request.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, fetchResults]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") handleClose();
    else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigate(`/product/${results[selectedIndex].handle}`);
        handleClose();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    }
  }, [selectedIndex, results, handleClose, navigate]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[120] bg-stone-50/95 dark:bg-stone-900/95 opacity-0 flex flex-col pt-[12vh] px-6 md:px-12 lg:px-24 xl:px-32"
      onKeyDown={handleKeyDown}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[5%] -left-[5%] w-[45%] h-[45%] bg-stone-200/40 dark:bg-amber-100/5 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] -right-[5%] w-[35%] h-[40%] bg-stone-100/40 dark:bg-stone-800/20 blur-[120px] rounded-full" 
        />
      </div>

      {/* Close Action */}
      <button
        onClick={handleClose}
        className="absolute top-10 right-10 md:top-14 md:right-14 p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all duration-500 group z-[130]"
      >
        <span className="sr-only">Close Search</span>
        <X size={32} strokeWidth={1} className="transition-transform duration-500 group-hover:rotate-90" />
      </button>

      <div className="search-content w-full max-w-7xl mx-auto flex flex-col h-full">
        {/* Editorial Search Bar */}
        <div className="relative mb-20">
          <div className="flex items-center gap-8 border-b border-stone-200 dark:border-white/10 pb-8 group">
            <Search className="w-8 h-8 md:w-10 md:h-10 text-stone-400 group-focus-within:text-stone-900 transition-colors duration-500" strokeWidth={1} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our atelier..."
              className="w-full bg-transparent text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-stone-900 dark:text-white placeholder-stone-300 dark:placeholder-white/10 outline-none font-serif italic tracking-tight"
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500 font-semibold">
              {loading ? "Scanning all archival indices..." : "Explore Objects across our curated collections"}
            </p>
            {query && (
               <button 
                 onClick={() => setQuery("")}
                 className="text-xs uppercase tracking-[0.1em] text-stone-600 hover:text-stone-900 border-b border-stone-200 hover:border-stone-900 transition-all font-medium"
               >
                 Clear Inquiry
               </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          <AnimatePresence mode="wait">
            {!query.trim() ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-20"
              >
                {/* Visual Navigation */}
                <div className="lg:col-span-8 space-y-16">
                  <div className="space-y-8">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-white flex items-center gap-4">
                      <Compass size={16} strokeWidth={1.5} /> Primary Collections
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {featuredCategories.map((cat, i) => (
                        <button
                          key={cat.id || i}
                          onClick={() => {
                            navigate(`/shop/category/${cat.handle}`);
                            handleClose();
                          }}
                          className="group relative h-64 overflow-hidden rounded-none bg-stone-100 dark:bg-stone-800 flex flex-col justify-end p-8 text-left border border-stone-200/50 hover:border-stone-900 transition-all duration-700"
                        >
                          <img 
                            src={cat.image || "https://placehold.co/800x600/f5f5f7/999"} 
                            alt={cat.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/10 to-transparent opacity-60" />
                          <h4 className="relative z-10 text-white text-3xl font-serif italic tracking-wide leading-tight">{cat.name}</h4>
                          <span className="relative z-10 text-xs uppercase tracking-[0.3em] text-white/70 mt-3 font-medium">Explore Archive</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions & Trends */}
                <div className="lg:col-span-4 space-y-16">
                  <div className="space-y-8">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-900 dark:text-white flex items-center gap-4">
                      <TrendingUp size={16} strokeWidth={1.5} /> Trending Now
                    </h3>
                    <div className="flex flex-col gap-5">
                      {['Monolith Tables', 'Hand-Knotted Rugs', 'Sculptural Lighting', 'Raw Linen'].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setQuery(tag)}
                          className="w-fit text-xl font-serif italic text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-4 group"
                        >
                          <span className="w-5 h-[1px] bg-stone-300 group-hover:w-10 group-hover:bg-stone-900 transition-all duration-500" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 dark:text-stone-600 flex items-center gap-4">
                      <History size={16} strokeWidth={1.5} /> Inquiry History
                    </h3>
                    <p className="text-stone-500 italic text-base font-serif font-light leading-relaxed">Your collection inquiry history is currently private and secure.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-16"
              >
                {results.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-14">
                    {results.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => {
                          navigate(`/product/${product.handle}`);
                          handleClose();
                        }}
                        className={`group cursor-pointer space-y-5 ${selectedIndex === index ? "scale-105" : "hover:scale-[1.02]"} transition-transform duration-500`}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-stone-100 dark:bg-stone-800 border border-stone-200/40 dark:border-white/5">
                          <img 
                            src={product.thumbnail} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-700" />
                          
                          {selectedIndex === index && (
                             <div className="absolute inset-0 border-2 border-stone-900/20 pointer-events-none" />
                          )}
                        </div>
                        <div className="space-y-3">
                          <h4 
                            className="text-xl font-serif italic text-stone-900 dark:text-white leading-tight underline-offset-4 decoration-stone-200" 
                            dangerouslySetInnerHTML={{ __html: product._highlightedTitle }} 
                          />
                          <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-100 dark:border-white/5">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 font-bold truncate">{product.collection || "Atelier Object"}</span>
                            <span className="text-sm font-medium text-stone-900 dark:text-white/80 shrink-0">{product.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : !loading && (
                  <div className="py-32 text-center space-y-8 flex flex-col items-center">
                    <div className="w-20 h-px bg-stone-200" />
                    <p className="text-4xl md:text-5xl font-serif italic text-stone-300 dark:text-stone-700 font-light max-w-2xl mx-auto">
                      No archival objects found matching your inquiry.
                    </p>
                    <button 
                      onClick={() => setQuery("")} 
                      className="text-[10px] uppercase tracking-[0.4em] text-stone-900 dark:text-white border-b border-stone-900 dark:border-white pb-2 hover:opacity-60 transition-opacity font-bold"
                    >
                      Reset Discovery
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default SearchModal;
