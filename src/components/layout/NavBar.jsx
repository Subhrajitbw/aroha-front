// src/components/layout/NavBar.jsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search as SearchIcon, ChevronDown, User, ShoppingBag, Heart, BookOpen } from "lucide-react";

import { useSearchStore } from "@/stores/searchStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { useWishlistStore } from "@/stores/useWishlistStore";

import MobileMenu from "./MobileMenu";
import MegaMenu from "../nav/MegaMenu";
import { NavIcon } from "../nav/NavIcon";
import ProfileDropdown from "../nav/ProfileDropdown";
import CartDropdown from "../nav/CartDropdown";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNavData } from "@/hooks/useNavData";
import { useNavTheming } from "@/hooks/useNavTheming";
import { motion } from "framer-motion";
import { sdk } from "@/lib/medusaClient";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

const NavBar = ({ variant = "light" }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);
  const megaMenuRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const shopButtonRef = useRef(null);

  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [caretPosition, setCaretPosition] = useState(null);

  // Client-side device detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Expose --nav-height CSS variable
  const lastNavHeight = useRef(0);
  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height);
      if (Math.abs(h - lastNavHeight.current) > 1) {
        document.documentElement.style.setProperty('--nav-height', `${h}px`);
        lastNavHeight.current = h;
      }
    });
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  const pathname = usePathname();
  const router = useRouter();

  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useMenuStore();
  const { open: openSearch } = useSearchStore();
  const { open: openAuth } = useAuthModalStore();
  const { isAuthenticated, user, logout, initializeAuth } = useAuthStore();
  const { items: wishlistItems, isHydrated: wishlistHydrated } = useWishlistStore();

  const {
    scrolled,
    colors,
    floatingStyles,
    floatingPosition,
    setThemeFrozen,
    effectiveTheme
  } = useNavTheming(navRef, variant, pathname, isMobileDevice);

  const {
    navItems,
    roomsMegaContent,
    shopMegaContent,
    megaMenuContent
  } = useNavData();

  useKeyboardShortcuts(openSearch);

  useEffect(() => {
    initializeAuth();
    const fetchCartStatus = async () => {
      const cartId = localStorage.getItem("cart_id");
      if (cartId) {
        try {
          const { cart } = await sdk.store.cart.retrieve(cartId);
          setCartItemCount(cart.items?.length || 0);
        } catch (e) { console.error("Cart fetch error:", e); }
      }
    };
    fetchCartStatus();
  }, [initializeAuth]);

  // Freeze theme when mega menu open
  useEffect(() => {
    setThemeFrozen(!!activeMegaMenu);
  }, [activeMegaMenu, setThemeFrozen]);

  // Lock body scroll when mega menu open (desktop only)
  useLockBodyScroll(!!activeMegaMenu && !isMobileDevice);

  // Close all menus on route change
  useEffect(() => {
    setActiveMegaMenu(null);
    closeMenu();
    setCartDropdownOpen(false);
  }, [pathname, closeMenu]);

  const calculateCaretPosition = useCallback(() => {
    if (!navRef.current || !shopButtonRef.current) return;
    const navBounds = navRef.current.getBoundingClientRect();
    const btnBounds = shopButtonRef.current.getBoundingClientRect();
    const btnCenter = btnBounds.left + btnBounds.width / 2 - navBounds.left;
    setCaretPosition(btnCenter);
  }, []);

  const handleChevronHover = () => {
    setActiveMegaMenu('shop');
    calculateCaretPosition();
  };

  const handleShopClick = () => {
    setActiveMegaMenu(null);
    router.push('/shop');
  };

  const handleNavAreaLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget) { setActiveMegaMenu(null); return; }
    if (relatedTarget instanceof Node && (megaMenuRef.current?.contains(relatedTarget) || navRef.current?.contains(relatedTarget))) {
      return;
    }
    setActiveMegaMenu(null);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    const f = user.firstName || user.first_name || "";
    const l = user.lastName || user.last_name || "";
    if (f && l) return `${f} ${l}`;
    if (f) return f;
    return user.email?.split('@')[0] || "Account";
  };

  const getInitials = () => {
    if (!user) return "";
    const f = user.firstName || user.first_name || "";
    const l = user.lastName || user.last_name || "";
    if (f && l) return (f[0] + l[0]).toUpperCase();
    if (f) return f[0].toUpperCase();
    return "U";
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 transition-all duration-500 ${floatingPosition} ${
          scrolled ? "rounded-[2rem] shadow-lg" : ""
        } px-4 lg:px-6 py-2`}
        style={floatingStyles}
        onMouseLeave={handleNavAreaLeave}
        data-theme={effectiveTheme}
      >
        <div
          ref={contentWrapperRef}
          className="mx-auto flex items-center justify-between relative max-w-7xl"
        >
          {/* Left: Desktop nav links OR Mobile hamburger */}
          <div className="flex-1 flex items-center gap-4 lg:gap-8">
            {!isMobileDevice && (
              <>
                {/* Desktop: Shop + Chevron */}
                <div className="flex items-center gap-1 group relative py-4">
                  <button
                    ref={shopButtonRef}
                    onClick={handleShopClick}
                    className={`text-xs tracking-[0.24em] uppercase transition-colors font-medium ${colors.navTextColor} ${colors.navHoverColor}`}
                  >
                    Shop
                  </button>
                  <button
                    onMouseEnter={handleChevronHover}
                    className={`${colors.navTextColor} ${colors.navHoverColor} transition-all p-1 -m-1`}
                    aria-label="Open shop menu"
                  >
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'shop' ? "rotate-180" : ""}`} />
                  </button>
                  {pathname === '/shop' && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-3 left-0 right-4 h-[1.5px] bg-current opacity-40"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>

                {/* Desktop: Other nav items */}
                {[
                  { label: 'Lookbook', path: '/lookbook' },
                  { label: 'Rooms', path: '/rooms', hasMega: true, megaKey: 'rooms' },
                  { label: 'Journal', path: '/journal' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="relative py-4 group"
                    onMouseEnter={() => item.hasMega ? setActiveMegaMenu(item.megaKey) : setActiveMegaMenu(null)}
                  >
                    <button
                      onClick={() => { setActiveMegaMenu(null); router.push(item.path); }}
                      className={`flex items-center gap-1.5 text-xs tracking-[0.24em] uppercase transition-colors font-medium ${colors.navTextColor} ${colors.navHoverColor}`}
                    >
                      {item.label}
                      {item.hasMega && (
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === item.megaKey ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    {pathname === item.path && (
                      <motion.div
                        layoutId="navUnderline"
                        className="absolute bottom-3 left-0 right-0 h-[1.5px] bg-current opacity-40"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {isMobileDevice && (
              <>
                {/* Mobile: Hamburger + Lookbook icon */}
                <NavIcon
                  onClick={toggleMenu}
                  aria-label="Open menu"
                  className={colors.navTextColor}
                  iconRef={(el) => (iconsRef.current[0] = el)}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </NavIcon>

                <Link
                  href="/lookbook"
                  className={`${colors.navTextColor} ${colors.navHoverColor} transition-colors flex items-center justify-center`}
                  aria-label="View Lookbook"
                >
                  <BookOpen size={18} strokeWidth={1.5} />
                </Link>
              </>
            )}
          </div>

          {/* Center: Logo (absolute positioned) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              href="/home"
              ref={logoRef}
              className={`text-xl lg:text-2xl font-light tracking-[0.3em] ${colors.logoColor} transition-all duration-500 hover:tracking-[0.5em] shrink-0`}
              style={{ fontFamily: "Playfair Display, serif", textDecoration: "none" }}
              onMouseEnter={() => setActiveMegaMenu(null)}
            >
              AROHA
            </Link>
          </div>

          {/* Right: Action icons */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-4">
            <NavIcon
              onClick={openSearch}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`${colors.navTextColor} ${colors.navHoverColor}`}
              iconRef={(el) => (iconsRef.current[1] = el)}
            >
              <SearchIcon size={18} strokeWidth={1.5} />
            </NavIcon>

            <NavIcon
              onClick={() => router.push('/wishlist')}
              className={`${colors.navTextColor} ${colors.navHoverColor} relative transition-all duration-300 ${pathname === '/wishlist' ? 'scale-110' : ''}`}
              iconRef={(el) => (iconsRef.current[2] = el)}
            >
              <Heart
                size={18}
                strokeWidth={1.5}
                className={`transition-colors duration-300 ${pathname === '/wishlist' ? 'fill-current' : ''}`}
              />
              {wishlistHydrated && wishlistItems.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold border ${
                  effectiveTheme === 'dark' ? 'bg-white text-black border-black/10' : 'bg-black text-white border-white/10'
                } text-[8px]`}>
                  {wishlistItems.length}
                </span>
              )}
            </NavIcon>

            {/* Profile (desktop only) */}
            {!isMobileDevice && (
              <div
                className="relative flex items-center"
                onMouseEnter={() => { setActiveMegaMenu(null); if (isAuthenticated) setProfileDropdownOpen(true); }}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  onClick={() => !isAuthenticated ? openAuth() : router.push('/account')}
                  className={`flex items-center gap-2 group p-1 rounded-full transition-all duration-300 ${isAuthenticated ? 'hover:bg-zinc-100/50' : colors.navHoverColor}`}
                >
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-serif text-white shadow-lg border border-white/20 group-hover:scale-105 transition-transform">
                        {getInitials()}
                      </div>
                      <ChevronDown size={12} className={`transition-transform duration-500 opacity-50 ${profileDropdownOpen ? 'rotate-180' : ''} ${colors.navTextColor}`} />
                    </div>
                  ) : (
                    <div className={colors.navTextColor}><User size={18} strokeWidth={1.5} /></div>
                  )}
                </button>

                <ProfileDropdown
                  user={user}
                  isOpen={profileDropdownOpen}
                  onClose={() => setProfileDropdownOpen(false)}
                  router={router}
                  onLogout={handleLogout}
                  getInitials={getInitials}
                  getUserDisplayName={getUserDisplayName}
                />
              </div>
            )}

            {/* Cart */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => { setActiveMegaMenu(null); setCartDropdownOpen(true); }}
              onMouseLeave={() => setCartDropdownOpen(false)}
            >
              <NavIcon
                onClick={() => router.push('/cart')}
                className={`${colors.navTextColor} ${colors.navHoverColor} relative`}
                iconRef={(el) => (iconsRef.current[3] = el)}
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zinc-900 text-white text-[8px] flex items-center justify-center rounded-full font-bold border border-white">
                    {cartItemCount}
                  </span>
                )}
              </NavIcon>

              <CartDropdown
                isOpen={cartDropdownOpen}
                onClose={() => setCartDropdownOpen(false)}
                router={router}
              />
            </div>
          </div>
        </div>

        {/* Mega menu (desktop only) */}
        {!isMobileDevice && (
          <MegaMenu
            ref={megaMenuRef}
            isOpen={!!activeMegaMenu}
            content={activeMegaMenu === 'rooms' ? roomsMegaContent : (activeMegaMenu === 'shop' ? shopMegaContent : megaMenuContent[`/product-categories/${activeMegaMenu}`] || megaMenuContent[activeMegaMenu])}
            caretPosition={caretPosition}
            onClose={() => setActiveMegaMenu(null)}
            onMouseLeave={handleNavAreaLeave}
          />
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobileDevice && (
        <MobileMenu
          isOpen={menuOpen}
          onClose={closeMenu}
          onAuthOpen={openAuth}
          categories={navItems}
          megaMenuContent={megaMenuContent}
          isLoggedIn={isAuthenticated}
          user={user ? { name: getUserDisplayName(), email: user.email } : null}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default NavBar;
