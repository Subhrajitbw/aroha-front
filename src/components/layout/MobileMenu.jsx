'use client';
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  X,
  User,
  LogOut,
  ArrowRight,
  ChevronRight,
  Heart,
  Package,
  ShoppingBag,
  Search,
  Home,
  BookOpen,
  Camera,
  Mail,
} from "lucide-react";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useSearchStore } from "@/stores/searchStore";

const MobileMenu = ({
  isOpen,
  onClose,
  onAuthOpen,
  categories = [],
  megaMenuContent = {},
  isLoggedIn,
  user,
  onLogout,
}) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const router = useRouter();
  const { items: wishlistItems, isHydrated: wishlistHydrated } = useWishlistStore();
  const { open: openSearch } = useSearchStore();

  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const mainRef = useRef(null);
  const subRef = useRef(null);

  // Swipe-to-close gesture tracking (isolated from vertical scrolling)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchCurrentX = useRef(0);
  const touchCurrentY = useRef(0);
  const isDragging = useRef(false);
  const isSwipeGesture = useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;
    isDragging.current = true;
    isSwipeGesture.current = false;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !drawerRef.current) return;
    touchCurrentX.current = e.touches[0].clientX;
    touchCurrentY.current = e.touches[0].clientY;

    const deltaX = touchCurrentX.current - touchStartX.current;
    const deltaY = touchCurrentY.current - touchStartY.current;

    // Isolate vertical scroll from horizontal swiping
    if (!isSwipeGesture.current) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > 8 || absY > 8) {
        if (absX > absY) {
          isSwipeGesture.current = true; // Confirmed horizontal swipe close gesture
        } else {
          isDragging.current = false; // Vertical scrolling list, skip swipe tracking
          return;
        }
      } else {
        return; // Movement below threshold
      }
    }

    if (deltaX < 0) {
      const pct = (deltaX / drawerRef.current.offsetWidth) * 100;
      gsap.set(drawerRef.current, { x: `${Math.max(pct, -100)}%`, force3D: true });
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { opacity: Math.max(0, 1 + deltaX / drawerRef.current.offsetWidth) });
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !drawerRef.current) return;
    isDragging.current = false;
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (deltaX < -(drawerRef.current.offsetWidth * 0.3)) {
      handleClose();
    } else {
      gsap.to(drawerRef.current, { x: "0%", duration: 0.2, ease: "power2.out", force3D: true });
      if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 1, duration: 0.2 });
    }
  };

  useLockBodyScroll(isOpen);

  // ── Animation: open / close ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    // reset sub-panel
    if (subRef.current) gsap.set(subRef.current, { x: "100%", force3D: true });
    if (mainRef.current) gsap.set(mainRef.current, { x: "0%", opacity: 1, force3D: true });

    gsap.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(drawerRef.current, { x: "-100%" }, { x: "0%", duration: 0.4, ease: "power3.out", force3D: true });
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.2 });
    gsap.to(drawerRef.current, {
      x: "-100%",
      duration: 0.35,
      ease: "power3.inOut",
      force3D: true,
      onComplete: () => {
        setActiveCategory(null);
        onClose();
      },
    });
  };

  const openSub = (cat) => {
    const subMenuData = megaMenuContent[cat.href];
    if (!subMenuData?.columns?.length) {
      handleClose();
      router.push(cat.href);
      return;
    }
    setActiveCategory({ ...cat, subMenu: subMenuData });
    gsap.to(mainRef.current, { x: "-20%", opacity: 0, duration: 0.3, ease: "power3.inOut", force3D: true });
    gsap.fromTo(subRef.current, { x: "100%" }, { x: "0%", duration: 0.35, ease: "power3.out", force3D: true });
  };

  const closeSub = () => {
    gsap.to(subRef.current, { x: "100%", duration: 0.3, ease: "power3.inOut", force3D: true });
    gsap.to(mainRef.current, {
      x: "0%", opacity: 1, duration: 0.35, ease: "power3.out", force3D: true,
      onComplete: () => setActiveCategory(null),
    });
  };

  const go = (path) => { handleClose(); router.push(path); };

  if (!isOpen) return null;

  // ── Nav items ──────────────────────────────────────────────────────────────
  const editorials = [
    { label: "Rooms", href: "/rooms", icon: Home },
    { label: "Journal", href: "/journal", icon: BookOpen },
    { label: "Lookbook", href: "/lookbook", icon: Camera },
    { label: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        style={{ visibility: "hidden", opacity: 0, willChange: "opacity, visibility" }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute top-0 left-0 h-full w-[88%] max-w-[380px] md:max-w-[440px] bg-[#FAFAF8] flex flex-col"
        style={{ 
          transform: "translateX(-100%)", 
          paddingTop: "env(safe-area-inset-top, 0px)", 
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          willChange: "transform" 
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          {activeCategory ? (
            <button
              onClick={closeSub}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ChevronRight size={16} className="rotate-180" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Back</span>
            </button>
          ) : (
            <Link href="/" onClick={handleClose}>
              <span
                className="text-xl tracking-[0.35em] uppercase text-stone-900 font-light"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Aroha
              </span>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {!activeCategory && (
              <button
                onClick={() => { handleClose(); openSearch(); }}
                className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-stone-500 hover:text-stone-900 transition-colors hover:rotate-90 duration-300"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="relative flex-1 overflow-hidden">

          {/* MAIN PANEL */}
          <div
            ref={mainRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="px-6 py-6 space-y-8">

              {/* Collections (from Medusa/Sanity) */}
              {categories?.length > 0 && (
                <section>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold mb-4">
                    Collections
                  </p>
                  <nav className="space-y-1">
                    {categories.map((cat) => {
                      const hasSub = megaMenuContent[cat.href]?.columns?.length > 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => hasSub ? openSub(cat) : go(cat.href)}
                          className="w-full flex items-center justify-between py-3 group"
                        >
                          <span className="text-2xl font-serif text-stone-900 tracking-wide font-light group-hover:translate-x-1 transition-transform duration-300">
                            {cat.name}
                          </span>
                          <ChevronRight
                            size={16}
                            strokeWidth={1}
                            className="text-stone-300 group-hover:text-stone-700 group-hover:translate-x-1 transition-all duration-300"
                          />
                        </button>
                      );
                    })}
                    {/* All Shop shortcut */}
                    <button
                      onClick={() => go("/shop")}
                      className="w-full flex items-center justify-between py-3 group"
                    >
                      <span className="text-2xl font-serif text-stone-900 tracking-wide font-light group-hover:translate-x-1 transition-transform duration-300">
                        All Products
                      </span>
                      <ChevronRight size={16} strokeWidth={1} className="text-stone-300 group-hover:text-stone-700 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </nav>
                </section>
              )}

              {/* Quick actions */}
              <section className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => go("/wishlist")}
                  className="relative flex flex-col items-center justify-center gap-2 py-6 border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white group transition-all duration-300"
                >
                  <Heart size={18} strokeWidth={1.5} className="text-stone-600 group-hover:text-white transition-colors" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-700 group-hover:text-white transition-colors">Wishlist</span>
                  {wishlistHydrated && wishlistItems.length > 0 && (
                    <span className="absolute top-3 right-3 w-4 h-4 bg-stone-900 group-hover:bg-white text-white group-hover:text-stone-900 text-[9px] rounded-full flex items-center justify-center font-bold transition-colors">
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => go("/shop?filter=newOnly")}
                  className="flex flex-col items-center justify-center gap-2 py-6 border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white group transition-all duration-300"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} className="text-stone-600 group-hover:text-white transition-colors" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-stone-700 group-hover:text-white transition-colors">New In</span>
                </button>
              </section>

              {/* Editorials */}
              <section>
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold mb-4">
                  Discover
                </p>
                <div className="space-y-1">
                  {editorials.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClose}
                      className="flex items-center justify-between py-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                        <span className="text-base text-stone-700 font-light tracking-wide group-hover:text-stone-900 transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight size={14} strokeWidth={1} className="text-stone-300 group-hover:text-stone-700 group-hover:translate-x-1 transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Account */}
              <section className="border-t border-stone-100 pt-6">
                {isLoggedIn && user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white text-sm font-light shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm text-stone-900 font-medium leading-tight">{user.name}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "My Account", href: "/account", icon: User },
                        { label: "Orders", href: "/account", icon: Package },
                        { label: "Wishlist", href: "/wishlist", icon: Heart },
                        { label: "Contact", href: "/contact", icon: Mail },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={handleClose}
                          className="flex items-center gap-2 p-3 border border-stone-100 hover:border-stone-300 transition-colors group"
                        >
                          <item.icon size={14} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                          <span className="text-[11px] uppercase tracking-[0.15em] text-stone-700 group-hover:text-stone-900 font-medium transition-colors">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <button
                      onClick={() => { onLogout(); handleClose(); }}
                      className="w-full flex items-center justify-between py-3 text-stone-400 hover:text-red-500 transition-colors group"
                    >
                      <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Sign Out</span>
                      <LogOut size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => { onAuthOpen(); handleClose(); }}
                      className="w-full py-4 bg-stone-900 text-white text-[12px] uppercase tracking-[0.3em] font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <User size={14} strokeWidth={1.5} />
                      Sign In / Register
                    </button>
                    <p className="text-center text-[10px] text-stone-400 tracking-wider uppercase">
                      Access your orders & wishlist
                    </p>
                  </div>
                )}
              </section>

              {/* Legal footer */}
              <section className="border-t border-stone-100 pt-4 pb-8">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { label: "Privacy", href: "/privacy-policy" },
                    { label: "Terms", href: "/terms-of-use" },
                    { label: "Shipping", href: "/shipping-policy" },
                    { label: "Refunds", href: "/refund-policy" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleClose}
                      className="text-[10px] text-stone-400 hover:text-stone-700 uppercase tracking-widest transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* SUB PANEL (category drill-down) */}
          <div
            ref={subRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain bg-[#FAFAF8]"
            style={{ transform: "translateX(100%)", WebkitOverflowScrolling: "touch" }}
          >
            {activeCategory && (
              <div className="px-6 py-6 space-y-8">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-semibold mb-2">
                    Collection
                  </p>
                  <h2 className="text-3xl font-serif text-stone-900 font-light">
                    {activeCategory.name}
                  </h2>
                </div>

                <div className="space-y-8">
                  {activeCategory.subMenu.columns.map((col, i) => (
                    <div key={i}>
                      <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 font-semibold mb-3 border-b border-stone-100 pb-2">
                        {col.title}
                      </p>
                      <div className="space-y-1">
                        {col.items?.map((item, j) => (
                          <Link
                            key={j}
                            href={item.href}
                            onClick={handleClose}
                            className="flex items-center justify-between py-2.5 group"
                          >
                            <span className="text-base text-stone-700 font-light tracking-wide group-hover:text-stone-900 transition-colors group-hover:translate-x-1 transform duration-200">
                              {item.name}
                            </span>
                            <ArrowRight size={13} strokeWidth={1} className="text-stone-300 group-hover:text-stone-700 group-hover:translate-x-1 transition-all duration-300" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href={activeCategory.href}
                  onClick={handleClose}
                  className="flex items-center justify-between py-4 border-t border-stone-200 group"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-stone-900 font-semibold">
                    View All {activeCategory.name}
                  </span>
                  <ArrowRight size={15} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform text-stone-900" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
