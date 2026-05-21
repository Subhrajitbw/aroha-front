// src/app/categories/page.jsx
'use client';

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNavData } from "@/hooks/useNavData";
import { ChevronRight, Search as SearchIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import NavBar from "@/components/layout/NavBar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { motion, AnimatePresence } from "framer-motion";

// Luxury Lifestyle Fallback Images for Catalog Departments and Categories
const CATEGORY_IMAGES = {
  "living-room": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
  "bedroom": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800",
  "dining-room": "https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=800",
  "lighting": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
  "decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
  "rugs": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800",
  "kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
  
  // Generic keywords
  "sofa": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
  "chair": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=400",
  "table": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=400",
  "bed": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=400",
  "lamp": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=400",
  "vase": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=400",
  "cushion": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=400",
  "default": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400"
};

const getCategoryImage = (name, handle) => {
  const normName = (name || "").toLowerCase();
  const normHandle = (handle || "").toLowerCase();
  
  if (CATEGORY_IMAGES[normHandle]) return CATEGORY_IMAGES[normHandle];
  
  for (const key of Object.keys(CATEGORY_IMAGES)) {
    if (normName.includes(key) || normHandle.includes(key)) {
      return CATEGORY_IMAGES[key];
    }
  }
  
  return CATEGORY_IMAGES.default;
};

export default function CategoriesPage() {
  const router = useRouter();
  const { navItems, megaMenuContent } = useNavData();
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-select first department when data loads
  useEffect(() => {
    if (navItems?.length > 0 && !activeCategoryId) {
      setActiveCategoryId(navItems[0].id);
    }
  }, [navItems, activeCategoryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeCategory = navItems?.find(item => item.id === activeCategoryId);
  const activeMenuContent = activeCategory ? megaMenuContent[`/product-categories/${activeCategory.handle}`] : null;

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-stone-900 flex flex-col selection:bg-stone-200">
      
      {/* Dynamic desktop standard navbar - hidden on mobile */}
      <NavBar />

      {/* MOBILE COMPACT HEADER */}
      <header className="sticky top-0 z-40 bg-[#fdfbf9]/95 backdrop-blur-xl border-b border-stone-200/60 px-4 py-3 lg:hidden pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-stone-600 p-1 hover:bg-stone-100 rounded-full transition-colors">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <h1 className="text-lg font-serif font-semibold tracking-wide text-stone-900">
              Browse Departments
            </h1>
          </div>

          {/* Amazon-like top search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search Aroha House..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-100/80 border border-stone-200 rounded-full pl-10 pr-4 py-2 text-xs tracking-wider font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-stone-400 transition-all duration-300"
            />
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" strokeWidth={1.5} />
          </form>

        </div>
      </header>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:pb-0 h-[calc(100vh-100px)] min-h-0">
        
        {/* LEFT SIDEBAR PANEL */}
        <div className="w-[100px] sm:w-[130px] flex-none bg-stone-50/80 border-r border-stone-200/60 overflow-y-auto h-full scrollbar-none">
          <div className="flex flex-col">
            {navItems?.map((dept) => {
              const isActive = dept.id === activeCategoryId;
              return (
                <button
                  key={dept.id}
                  onClick={() => setActiveCategoryId(dept.id)}
                  className={`relative py-4 px-2.5 text-center flex flex-col items-center justify-center gap-2 border-b border-stone-200/40 transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? "bg-white text-stone-900 font-semibold" 
                      : "text-stone-500 hover:text-stone-800 font-normal"
                    }
                  `}
                >
                  {/* Left edge indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="activeLeftIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-stone-900"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Circular visual icon-like thumbnail for the department */}
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border transition-all duration-300 shadow-sm
                    ${isActive 
                      ? "border-stone-900 scale-105" 
                      : "border-stone-200 grayscale opacity-80"
                    }
                  `}>
                    <img 
                      src={getCategoryImage(dept.name, dept.handle)} 
                      alt={dept.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <span className="text-[9px] sm:text-[10px] tracking-wider uppercase leading-tight select-none">
                    {dept.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT VISUAL DETAILS PANEL */}
        <div className="flex-1 bg-white overflow-y-auto h-full p-4 md:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            {activeCategory && (
              <motion.div
                key={activeCategoryId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6 max-w-4xl"
              >
                {/* Visual Department Hero Banner */}
                <div className="relative rounded-2xl overflow-hidden aspect-[21/9] w-full shadow-sm bg-stone-100">
                  <img 
                    src={getCategoryImage(activeCategory.name, activeCategory.handle)} 
                    alt={activeCategory.name}
                    className="w-full h-full object-cover scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 bg-white/80 backdrop-blur-md rounded-xl p-3 border border-white/20">
                    <p className="text-[9px] uppercase tracking-[0.25em] font-medium text-stone-500">Department</p>
                    <h2 className="text-sm font-serif font-semibold text-stone-900 mt-0.5">{activeCategory.name}</h2>
                  </div>
                </div>

                {/* Subcategories Grid Section */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-stone-400 border-b border-stone-100 pb-2">
                    Shop Categories
                  </h3>

                  {activeMenuContent && activeMenuContent.columns?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {activeMenuContent.columns.map((col, idx) => (
                        <Link
                          key={idx}
                          href={col.href}
                          className="flex flex-col items-center gap-3 p-3 rounded-xl border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all duration-300 group cursor-pointer text-center"
                        >
                          {/* Circular Subcategory Photo */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-stone-200 group-hover:scale-105 transition-transform duration-300 shadow-sm relative">
                            <img 
                              src={getCategoryImage(col.title, col.href.split('/').pop())} 
                              alt={col.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] sm:text-xs font-semibold text-stone-800 group-hover:text-stone-900 transition-colors uppercase tracking-wider">
                              {col.title}
                            </span>
                            <span className="text-[8px] tracking-widest text-stone-400 uppercase font-medium flex items-center gap-0.5">
                              Explore <ChevronRight size={8} />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-stone-400 font-serif italic text-sm">
                      Curating subcategories...
                    </div>
                  )}
                </div>

                {/* Footer Explorer CTA */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex justify-center">
                  <Link
                    href={`/product-categories/${activeCategory.handle}`}
                    className="w-full text-center py-3 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-stone-800 transition-all duration-300 shadow-md"
                  >
                    View All {activeCategory.name}
                  </Link>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Floating Classy Curved Bottom Navigation */}
      <BottomNavigation />

    </div>
  );
}
