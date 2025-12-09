import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Search, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchStore } from "../stores/searchStore";
import { searchClient, PRODUCTS_INDEX } from "../lib/meilisearch";
import gsap from "gsap";


const SearchModal = () => {
  const modalRef = useRef();
  const backdropRef = useRef();
  const inputRef = useRef();
  const resultsRef = useRef();


  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);


  const { isOpen, close } = useSearchStore();
  const navigate = useNavigate();


  // Entrance Animation
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      // Backdrop fade in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );


      // Modal scale and fade in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out", delay: 0.1 }
      );


      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 200);
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);


  // Results animation
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      const items = resultsRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05,
          ease: "power2.out" 
        }
      );
    }
  }, [results]);


  // Elegant close with animation
  const handleClose = useCallback(() => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -20,
        duration: 0.25,
        ease: "power2.in"
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          close();
          setQuery("");
          setResults([]);
        }
      });
    }
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
          limit: 8,
          attributesToRetrieve: [
            'id',
            'title',
            'handle',
            'thumbnail',
            'description',
            'variants',
            'collection'
          ],
          attributesToHighlight: ['title', 'description'],
        });


      const mappedProducts = searchResponse.hits.map(hit => ({
        id: hit.id,
        title: hit.title,
        handle: hit.handle,
        thumbnail: hit.thumbnail,
        description: hit.description,
        collection: hit.collection?.title,
        _highlightedTitle: hit._formatted?.title || hit.title,
        price: hit.variants?.[0]?.prices?.[0]?.amount 
          ? `$${(hit.variants[0].prices[0].amount / 100).toFixed(2)}`
          : null
      }));


      setResults(mappedProducts);
    } catch (err) {
      setError("Unable to search. Please try again.");
      console.error('MeiliSearch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  // Debounced search
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, fetchResults]);


  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigate(`/products/${results[selectedIndex].handle}`);
        handleClose();
      } else if (query.trim()) {
        navigate(`/search?query=${encodeURIComponent(query)}`);
        handleClose();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    }
  }, [selectedIndex, results, query, navigate, handleClose]);


  const handleProductClick = useCallback((product) => {
    navigate(`/products/${product.handle}`);
    handleClose();
  }, [navigate, handleClose]);


  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);


  if (!isOpen) return null;


  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-2xl flex items-start justify-center p-4 pt-[12vh]"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative z-[70] w-full max-w-3xl bg-white/5 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 255, 255, 0.03)'
        }}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center gap-4 px-8 py-6 border-b border-white/5">
          <div className="relative">
            <Search className="w-6 h-6 text-white/50" />
            <Sparkles className="w-3 h-3 text-amber-400/60 absolute -top-1 -right-1 animate-pulse" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Discover your next treasure..."
            className="flex-1 bg-transparent text-lg md:text-xl text-white placeholder-white/30 border-none outline-none focus:ring-0 font-light tracking-wide"
            aria-label="Search products"
          />
          
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-white/40 hover:text-white/70 transition-all duration-300 hover:rotate-90"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-all duration-300 rounded-full p-2.5 hover:bg-white/10 hover:rotate-90"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* Results - FIXED */}
        <div 
          className="px-8 py-6 overflow-y-auto max-h-[520px] custom-scrollbar"
          role="listbox"
        >
          {!query.trim() && (
            <div className="text-center py-16 space-y-4">
              <div className="relative inline-block">
                <Search className="w-16 h-16 text-white/20 mx-auto" />
                <div className="absolute inset-0 blur-xl bg-white/10 rounded-full" />
              </div>
              <div className="space-y-2">
                <p className="text-white/60 text-base font-light tracking-wide">
                  Begin your search
                </p>
                <p className="text-white/30 text-sm">
                  Type to explore our curated collection
                </p>
              </div>
            </div>
          )}


          {loading && (
            <div className="text-center py-16 space-y-4">
              <div className="relative inline-block">
                <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mx-auto" />
                <div className="absolute inset-0 blur-xl bg-white/10 rounded-full" />
              </div>
              <p className="text-white/50 text-sm font-light">Searching our collection...</p>
            </div>
          )}


          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <p className="text-red-300/90 text-sm font-light">{error}</p>
              </div>
            </div>
          )}


          {!loading && !error && query.trim() && results.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="text-6xl opacity-20">🔍</div>
              <div className="space-y-2">
                <p className="text-white/60 text-base">No treasures found</p>
                <p className="text-white/30 text-sm">
                  Try a different search term for "{query}"
                </p>
              </div>
            </div>
          )}


          {!loading && !error && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30 uppercase tracking-[0.15em] font-medium">
                  {results.length} {results.length === 1 ? 'Result' : 'Results'}
                </p>
                <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              
              <ul ref={resultsRef} className="space-y-3">
                {results.map((product, index) => (
                  <li
                    key={product.id}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => handleProductClick(product)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      group relative text-white rounded-2xl p-4 transition-all duration-300 cursor-pointer 
                      flex gap-4 items-center overflow-hidden
                      ${selectedIndex === index 
                        ? 'bg-white/15 scale-[1.02] shadow-lg shadow-white/5' 
                        : 'bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    {/* Hover gradient effect */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    `} />
                    
                    {product.thumbnail && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-20 h-20 object-cover rounded-xl bg-white/5 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p 
                          className="font-medium text-base tracking-wide line-clamp-1"
                          dangerouslySetInnerHTML={{ 
                            __html: product._highlightedTitle 
                          }}
                        />
                        <ArrowRight className={`
                          w-5 h-5 text-white/40 flex-shrink-0 transition-all duration-300
                          ${selectedIndex === index ? 'translate-x-1 text-white/70' : ''}
                        `} />
                      </div>
                      
                      {product.collection && (
                        <p className="text-xs text-white/40 uppercase tracking-wider font-light">
                          {product.collection}
                        </p>
                      )}
                      
                      {product.description && (
                        <p className="text-white/50 text-sm line-clamp-1 font-light">
                          {product.description}
                        </p>
                      )}
                    </div>
                    
                    {product.price && (
                      <span className="text-white/80 text-base font-light tracking-wide flex-shrink-0 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                        {product.price}
                      </span>
                    )}
                  </li>
                ))}
              </ul>


              {/* View all results link */}
              {results.length >= 8 && (
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      navigate(`/search?query=${encodeURIComponent(query)}`);
                      handleClose();
                    }}
                    className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white text-sm font-light tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span>View all results</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Keyboard hints */}
        <div className="relative px-8 py-4 border-t border-white/5 bg-white/2">
          <div className="flex items-center justify-center gap-6 text-xs text-white/20 font-light">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↑</kbd>
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/5 rounded border border-white/10">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`
        /* Custom scrollbar that preserves scroll functionality */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};


export default SearchModal;
