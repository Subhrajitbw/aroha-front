// src/components/layout/BottomNavigation.jsx
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  User, 
  ShoppingCart, 
  X, 
  FileText, 
  Compass, 
  BookOpen, 
  Camera, 
  PhoneCall, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useNavData } from "@/hooks/useNavData";
import { sdk } from "@/lib/medusaClient";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { items: wishlistItems, isHydrated: wishlistHydrated } = useWishlistStore();
  const { isAuthenticated, initializeAuth, logout, user } = useAuthStore();
  const openAuth = useAuthModalStore((state) => state.open);
  const { navItems: categoriesList, megaMenuContent, categoryThumbnails } = useNavData();
  
  const [cartItemCount, setCartItemCount] = useState(0);
  const [activeConsoleTab, setActiveConsoleTab] = useState(null); // 'categories' | 'you' | null
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const isVisible = true;

  // Sync cart item count on mount and route changes
  useEffect(() => {
    initializeAuth();
    const fetchCartStatus = async () => {
      const cartId = localStorage.getItem("cart_id");
      if (cartId) {
        try {
          const { cart } = await sdk.store.cart.retrieve(cartId);
          setCartItemCount(cart.items?.length || 0);
        } catch (e) {
          console.error("BottomNav cart fetch error:", e);
        }
      }
    };
    fetchCartStatus();
  }, [pathname, initializeAuth]);

  // Set initial category tab selections
  useEffect(() => {
    if (categoriesList?.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categoriesList[0].id);
    }
  }, [categoriesList, activeCategoryId]);

  // Close the popup sheet when path changes
  useEffect(() => {
    setActiveConsoleTab(null);
  }, [pathname]);

  // ── Scroll Lock System ─────────────────────────────────────────────────────
  // Uses the position:fixed trick so iOS Safari (which ignores overflow:hidden
  // on body) also gets a fully frozen background when the console panel is open.
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    if (activeConsoleTab !== null) {
      // Capture current scroll position before locking
      const scrollY = window.scrollY;
      body.style.top = `-${scrollY}px`;
      body.classList.add("scroll-locked");
      // Also lock <html> — Next.js scrolls on the html element, not just body
      html.classList.add("scroll-locked");
    } else {
      // Read the saved scroll position back from inline style
      const savedTop = body.style.top;
      body.classList.remove("scroll-locked");
      html.classList.remove("scroll-locked");
      body.style.top = "";
      // Restore scroll position without animation
      if (savedTop) {
        window.scrollTo({ top: parseInt(savedTop || "0", 10) * -1, behavior: "instant" });
      }
    }

    return () => {
      // Cleanup on unmount: always restore body/html to normal
      const savedTop = body.style.top;
      body.classList.remove("scroll-locked");
      html.classList.remove("scroll-locked");
      body.style.top = "";
      if (savedTop) {
        window.scrollTo({ top: parseInt(savedTop || "0", 10) * -1, behavior: "instant" });
      }
    };
  }, [activeConsoleTab]);

  // Gold Standard 4-Tab Layout: Home, Categories (opens Drawer), Shop (direct list), You (opens Profile Console)
  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
      isActive: pathname === "/" && activeConsoleTab === null,
    },
    {
      label: "Categories",
      icon: LayoutGrid,
      path: "#categories",
      isActive: activeConsoleTab === "categories",
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      path: "/shop",
      isActive: pathname.startsWith("/shop") && activeConsoleTab === null,
    },
    {
      label: "You",
      icon: User,
      path: "#you",
      isActive: activeConsoleTab === "you",
    },
  ];

  const handleTabClick = (e, item) => {
    if (item.label === "Categories") {
      e.preventDefault();
      if (activeConsoleTab === "categories") {
        setActiveConsoleTab(null);
      } else {
        setActiveConsoleTab("categories");
      }
    } else if (item.label === "You") {
      e.preventDefault();
      if (activeConsoleTab === "you") {
        setActiveConsoleTab(null);
      } else {
        setActiveConsoleTab("you");
      }
    } else {
      setActiveConsoleTab(null);
    }
  };

  // Helper to dynamically resolve Category image from medusa first product thumbnail, curated image, or fallback
  const getCategoryImage = (item) => {
    if (!item) return DEFAULT_FALLBACK_IMAGE;
    
    // 1. Try medusa product thumbnail first
    if (item.id && categoryThumbnails && categoryThumbnails[item.id]) {
      return categoryThumbnails[item.id];
    }
    
    // 2. Try curated image from sanity
    if (item.curatedImage) {
      return item.curatedImage;
    }
    
    return DEFAULT_FALLBACK_IMAGE;
  };

  const selectedCategory = categoriesList?.find(item => item.id === activeCategoryId);
  const activeMenuContent = selectedCategory ? megaMenuContent[`/product-categories/${selectedCategory.handle}`] : null;
  const isDark = true;

  return (
    <AnimatePresence>
      {/* ── 1. THE POPUP SHEET (FACEBOOK DUAL CONSOLE) ────────────────────── */}
      {activeConsoleTab !== null && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            key="console-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveConsoleTab(null)}
            className="fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-md lg:hidden"
          />

          {/* Sliding Bottom Sheet Console */}
          <motion.div
            key="console-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`
              fixed inset-x-0 bottom-0 z-[101] rounded-t-[2rem] border-t h-[75vh] max-h-[75vh] overflow-hidden lg:hidden flex flex-col pb-[calc(80px+env(safe-area-inset-bottom,0px))]
              ${isDark 
                ? "bg-[#1c1917] border-white/10 text-white shadow-[0_-20px_50px_rgba(0,0,0,0.6)] outline outline-1 outline-[#1c1917]" 
                : "bg-[#fdfbf9] border-stone-200 text-stone-900 shadow-[0_-20px_50px_rgba(0,0,0,0.12)] outline outline-1 outline-[#fdfbf9]"
              }
            `}
          >
            {/* Console Drag & Close Header */}
            <div className="flex-none py-3.5 flex items-center justify-between px-6 border-b border-white/5 bg-[#141210]/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveConsoleTab("categories")}
                  className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-200 cursor-pointer
                    ${activeConsoleTab === "categories" ? "text-stone-100 font-bold" : "text-stone-400 hover:text-white"}
                  `}
                >
                  Categories
                </button>
                <span className="text-stone-700">|</span>
                <button
                  onClick={() => setActiveConsoleTab("you")}
                  className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-200 cursor-pointer
                    ${activeConsoleTab === "you" ? "text-stone-100 font-bold" : "text-stone-400 hover:text-white"}
                  `}
                >
                  You
                </button>
              </div>
              <button 
                onClick={() => setActiveConsoleTab(null)}
                className={`p-1.5 rounded-full border transition-all ${isDark ? "bg-white/5 border-white/10 text-stone-300 hover:text-white" : "bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900"}`}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* BOUNDED CONTENT BODY */}
            <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#141210]">
              
              {/* ── MODE A: CATEGORIES EXPLORER (DESKTOP MEGA MENU LOOK) ────── */}
              {activeConsoleTab === "categories" && (
                <div className="flex w-full min-h-0 flex-1 pointer-events-auto">
                  
                  {/* Left Sidebar (Fully Scrollable, overscroll isolated) */}
                  <div 
                    className="w-[90px] flex-none bg-stone-950/15 border-r border-white/5 overflow-y-scroll overscroll-y-contain scrollbar-none h-full pb-16 touch-pan-y"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="flex flex-col">
                      {categoriesList?.map((dept) => {
                        const isActive = dept.id === activeCategoryId;
                        return (
                          <button
                            key={dept.id}
                            onClick={() => setActiveCategoryId(dept.id)}
                            className={`relative py-4 px-1.5 text-center flex flex-col items-center justify-center gap-1.5 border-b border-white/5 transition-all duration-200 cursor-pointer
                              ${isActive ? "bg-white/[0.03] text-white font-semibold" : "text-stone-400 hover:text-stone-200"}
                            `}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="consoleActiveIndicator"
                                className="absolute left-0 top-0 bottom-0 w-[3px] bg-stone-300"
                              />
                            )}
                            <div className={`w-9 h-9 rounded-full overflow-hidden border transition-all duration-300 relative
                              ${isActive ? "border-stone-300 scale-105" : "border-stone-800/80"}
                            `}>
                              <img 
                                src={getCategoryImage(dept)} 
                                alt={dept.name}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="text-[7.5px] tracking-widest uppercase font-semibold leading-normal break-words max-w-[80px]">
                              {dept.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Content Panel (Fully Scrollable, overscroll isolated) */}
                  <div 
                    className="flex-1 overflow-y-scroll overscroll-y-contain p-4 h-full scrollbar-none bg-[#171513]/10 pb-16 touch-pan-y"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <AnimatePresence mode="wait">
                      {selectedCategory && (
                        <motion.div
                          key={activeCategoryId}
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-col gap-4"
                        >
                          {/* Mini Category Header */}
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-300">
                              {selectedCategory.name}
                            </span>
                            <Link 
                              href={`/product-categories/${selectedCategory.handle}`}
                              onClick={() => setActiveConsoleTab(null)}
                              className="text-[8px] uppercase tracking-widest font-semibold text-stone-300 hover:text-white transition-colors"
                            >
                              Explore All
                            </Link>
                          </div>

                          {/* Subcategories Circular Grid */}
                          {activeMenuContent && activeMenuContent.columns?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 pb-8">
                              {activeMenuContent.columns.map((col, idx) => (
                                <Link
                                  key={idx}
                                  href={col.href}
                                  onClick={() => setActiveConsoleTab(null)}
                                  className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-center group cursor-pointer"
                                >
                                  <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-850 group-hover:scale-103 transition-transform shadow-md relative">
                                    <img 
                                      src={getCategoryImage(col)} 
                                      alt={col.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-[9px] font-semibold text-stone-300 uppercase tracking-wider leading-snug">
                                    {col.title}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="py-16 text-center text-stone-500 font-serif italic text-xs">
                              Curating pieces...
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              )}

              {/* ── MODE B: YOU EXPLORER (MINIMAL CONSOLE SYSTEM) ──────────────── */}
              {activeConsoleTab === "you" && (
                <div className="flex flex-col w-full flex-1 min-h-0 pointer-events-auto">
                  
                  {/* FIXED HEADER: Premium Profile card */}
                  <div className="p-5 flex-none border-b flex flex-col gap-4 relative shadow-sm bg-stone-950 border-white/5">
                    {isAuthenticated && user ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-200 flex items-center justify-center font-serif font-bold text-lg border border-white/10 uppercase shadow-inner">
                            {user.first_name ? user.first_name[0] : user.email[0]}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-200">
                              {user.first_name ? `${user.first_name} ${user.last_name || ""}` : "Aroha House Member"}
                            </h4>
                            <p className="text-[9px] text-stone-500 tracking-wider mt-0.5">{user.email}</p>
                            <Link 
                              href="/account" 
                              onClick={() => setActiveConsoleTab(null)}
                              className="text-[8px] uppercase tracking-widest font-semibold text-stone-400 mt-2 hover:text-stone-200 transition-colors flex items-center gap-0.5"
                            >
                              Manage Account <ChevronRight size={10} />
                            </Link>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            logout();
                            setActiveConsoleTab(null);
                          }}
                          className="p-3 rounded-full bg-red-500/[0.02] border border-red-500/10 text-red-400 hover:bg-red-500/[0.05] hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <LogOut size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-300">Welcome to Aroha</h4>
                          <p className="text-[9px] text-stone-500 leading-relaxed tracking-wider uppercase font-medium">
                            Join us for seamless order tracking, design consultations, & saved collections.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full mt-1">
                          <button
                            onClick={() => {
                              setActiveConsoleTab(null);
                              openAuth('login');
                            }}
                            className="w-full text-center py-2.5 bg-white text-stone-950 text-[9px] uppercase tracking-[0.2em] font-bold rounded hover:bg-stone-100 transition-all duration-300 shadow-sm border border-stone-200 cursor-pointer"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => {
                              setActiveConsoleTab(null);
                              openAuth('register');
                            }}
                            className="w-full text-center py-2.5 bg-transparent text-stone-300 text-[9px] uppercase tracking-[0.2em] font-bold rounded border border-stone-700 hover:bg-white/5 hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SCROLLABLE BODY */}
                  <div 
                    className="flex-1 overflow-y-scroll overscroll-y-contain p-6 pb-16 flex flex-col gap-6 scrollbar-none touch-pan-y"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >

                    {/* FACEBOOK-LIKE GRID SHORTCUTS (Refined low-profile, clean minimal outlines, no flashy colors) */}
                    <div className="flex flex-col gap-3">
                    <h5 className="text-[8px] uppercase tracking-[0.3em] font-semibold text-stone-500">
                      Bespoke Suite
                    </h5>
                    <div className="grid grid-cols-2 gap-3.5">
                      
                      {/* Shopping Bag Card */}
                      <Link 
                        href="/cart"
                        onClick={() => setActiveConsoleTab(null)}
                        className="p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative shadow-sm bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group"
                      >
                        <ShoppingCart size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-white transition-colors">Shopping Bag</span>
                        {cartItemCount > 0 && (
                          <span className="absolute top-4 right-4 bg-stone-800 text-stone-300 font-bold text-[8.5px] px-2 py-0.5 rounded border border-white/10 tracking-widest uppercase">
                            {cartItemCount} Items
                          </span>
                        )}
                      </Link>

                      {/* Wishlist Card */}
                      <Link 
                        href="/wishlist"
                        onClick={() => setActiveConsoleTab(null)}
                        className="p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative shadow-sm bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group"
                      >
                        <Heart size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-white transition-colors">My Wishlist</span>
                        {wishlistHydrated && wishlistItems.length > 0 && (
                          <span className="absolute top-4 right-4 bg-stone-800 text-stone-300 font-bold text-[8.5px] px-2 py-0.5 rounded border border-white/10 tracking-widest uppercase">
                            {wishlistItems.length} Saved
                          </span>
                        )}
                      </Link>

                      {/* Journal Card */}
                      <Link 
                        href="/journal"
                        onClick={() => setActiveConsoleTab(null)}
                        className="p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group"
                      >
                        <BookOpen size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-white transition-colors">The Journal</span>
                      </Link>

                      {/* Lookbooks Card */}
                      <Link 
                        href="/lookbook"
                        onClick={() => setActiveConsoleTab(null)}
                        className="p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group"
                      >
                        <Camera size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-white transition-colors">Lookbooks</span>
                      </Link>

                      {/* Contact Support Card */}
                      <Link 
                        href="/contact"
                        onClick={() => setActiveConsoleTab(null)}
                        className="p-4 rounded-2xl border flex flex-col items-start gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group"
                      >
                        <PhoneCall size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-white transition-colors">Support</span>
                      </Link>
                    </div>
                  </div>

                  {/* LIST ITEMS (SETTINGS & ACTIONS) */}
                  <div className="flex flex-col gap-2 pb-12">
                    <h5 className="text-[8px] uppercase tracking-[0.3em] font-semibold text-stone-500 mb-1">
                      Options & Settings
                    </h5>
                    
                    {/* Orders History Link */}
                    <Link 
                      href="/account"
                      onClick={() => setActiveConsoleTab(null)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 hover:pl-5 bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={15} strokeWidth={1.5} className="text-stone-450" />
                        <span className="text-[10px] uppercase font-medium tracking-[0.15em] text-stone-300">My Orders & Returns</span>
                      </div>
                      <ChevronRight size={12} className="text-stone-600" />
                    </Link>

                    {/* Policies Link */}
                    <Link 
                      href="/shipping-policy"
                      onClick={() => setActiveConsoleTab(null)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 hover:pl-5 bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle size={15} strokeWidth={1.5} className="text-stone-450" />
                        <span className="text-[10px] uppercase font-medium tracking-[0.15em] text-stone-300">Shipping & Delivery Info</span>
                      </div>
                      <ChevronRight size={12} className="text-stone-600" />
                    </Link>
                  </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        </>
      )}

      {/* ── 2. THE PERSISTENT FLOATING CURVED BAR ───────────────────────── */}
      {isVisible && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 lg:hidden w-[92%] max-w-[420px] pointer-events-none flex justify-center">
          <motion.div
            key="persistent-nav-bar"
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`pointer-events-auto w-full
              transition-all duration-500 rounded-[2rem]
              ${isDark 
                ? "bg-[#1c1917]/85 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]" 
                : "bg-[#fdfbf9]/85 backdrop-blur-2xl border border-stone-200/50 shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
              }
              pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] px-3
            `}
            style={{ willChange: "transform" }}
          >
          <div className="flex items-center justify-around relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleTabClick(e, item)}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-[1.5rem] min-w-[64px] text-center group cursor-pointer"
                >
                  {/* Sliding Curved Active highlight behind tab */}
                  {item.isActive && (
                    <motion.div
                      layoutId="activeFloatingTabPill"
                      className={`absolute inset-0 rounded-[1.5rem] -z-10
                        ${isDark 
                          ? "bg-white/10 border border-white/5" 
                          : "bg-stone-900/5 border border-stone-900/5"
                        }
                      `}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    />
                  )}

                  <div className="relative flex items-center justify-center">
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={`
                        transition-all duration-300 p-1
                        ${item.isActive 
                          ? (isDark ? "text-white" : "text-stone-900") 
                          : "text-stone-400 group-hover:text-stone-600"
                        }
                      `}
                    >
                      <Icon 
                        size={19} 
                        strokeWidth={item.isActive ? 2 : 1.5} 
                      />
                    </motion.div>
                  </div>

                  {/* Label with dynamic color */}
                  <span 
                    className={`
                      text-[8px] tracking-[0.18em] uppercase font-semibold transition-colors duration-300 scale-90
                      ${item.isActive 
                        ? (isDark ? "text-white" : "text-stone-900") 
                        : "text-stone-400/80"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
