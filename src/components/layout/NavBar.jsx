// src/components/layout/NavBar.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search as SearchIcon, ChevronDown, User, ShoppingBag, Heart } from "lucide-react";

import { useSearchStore } from "@/stores/searchStore";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { useWishlistStore } from "@/stores/useWishlistStore";

import MobileMenu from "./MobileMenu";
import MegaMenu from "../nav/MegaMenu";
import { NavIcon } from "../nav/NavIcon";
import Logo from "../nav/Logo";
import ProfileDropdown from "../nav/ProfileDropdown";

// import { useNavAnimations } from "@/hooks/useNavAnimations";
import { useKeyboardShortcuts } from  "@/hooks/useKeyboardShortcuts";
import { useNavData } from  "@/hooks/useNavData";
import { useNavTheming } from  "@/hooks/useNavTheming";
import { motion, AnimatePresence } from "framer-motion";
import CartDropdown from "../nav/CartDropdown";
import { sdk } from  "@/lib/medusaClient";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

const NavBar = ({ variant = "light" }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);
  const megaMenuRef = useRef(null);

  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Pure client-side device detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isNotDesktopDevice, setIsNotDesktopDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobileDevice(width < 1024);
      setIsNotDesktopDevice(width < 1024);
    };
    handleResize(); // Initial client check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Expose --nav-height CSS variable so pages can offset content below the navbar
  const lastNavHeight = useRef(0);
  useEffect(() => {
    if (!navRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = Math.ceil(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height);
      // Only update if change is significant (> 1px) to prevent layout thrashing
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

  // useNavAnimations(navRef, logoRef, iconsRef);
  useKeyboardShortcuts(openSearch);

  useEffect(() => {
    initializeAuth();

    // Initial cart count fetch
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

  const [caretPosition, setCaretPosition] = useState(null);
  const shopButtonRef = useRef(null);
  const contentWrapperRef = useRef(null);

  const calculateCaretPosition = useCallback(() => {
    if (!contentWrapperRef.current || !shopButtonRef.current) return;
    const wrapperBounds = contentWrapperRef.current.getBoundingClientRect();
    const btnBounds = shopButtonRef.current.getBoundingClientRect();
    const btnCenter = btnBounds.left + btnBounds.width / 2;
    setCaretPosition(btnCenter); // store viewport-relative px
  }, []);

  const handleChevronHover = (event) => {
    setActiveMegaMenu('shop');
    calculateCaretPosition();
  };

  const handleShopClick = () => {
    setActiveMegaMenu(null);
    router.push('/shop');
  };

  useEffect(() => {
    setThemeFrozen(!!activeMegaMenu);
  }, [activeMegaMenu, setThemeFrozen]);

  // Handle body scroll locking when mega menu is open
  useLockBodyScroll(!!activeMegaMenu && !isMobileDevice);

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

  // Close all menus on route change
  useEffect(() => {
    setActiveMegaMenu(null);
    closeMenu(); // Correct method from useMenuStore
    setCartDropdownOpen(false);
  }, [pathname, closeMenu]);

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

  const { items: wishlistItems, isHydrated: wishlistHydrated } = useWishlistStore();

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 transition-all duration-300 ease-out ${floatingPosition} ${scrolled ? "rounded-full shadow-xl" : ""
          } px-6 lg:px-12 py-4 lg:py-2 pt-[calc(1rem+env(safe-area-inset-top,0px))] lg:pt-2`}
        style={floatingStyles}
        onMouseLeave={handleNavAreaLeave}
        data-theme={effectiveTheme}
      >
        <div ref={contentWrapperRef} className="mx-auto flex items-center justify-between relative max-w-7xl">
          {/* Left: Desktop Nav or Mobile Hamburger */}
          <div className="flex-1 flex items-center gap-4 lg:gap-12">
            {!isMobileDevice ? (
              <>
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
                      className={`
                        flex items-center gap-1.5 text-xs tracking-[0.24em] uppercase transition-colors font-medium
                        ${colors.navTextColor} ${colors.navHoverColor}
                      `}
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
            ) : (
              <NavIcon onClick={toggleMenu} className={colors.navTextColor} iconRef={(el) => (iconsRef.current[0] = el)}>
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </NavIcon>
            )}
          </div>

          <Logo logoRef={logoRef} color={colors.logoColor} onMouseEnter={() => setActiveMegaMenu(null)} />

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-5">
            <NavIcon onClick={openSearch} onMouseEnter={() => setActiveMegaMenu(null)} className={`${colors.navTextColor} ${colors.navHoverColor}`} iconRef={(el) => (iconsRef.current[1] = el)}>
              <SearchIcon size={18} strokeWidth={1.5} />
            </NavIcon>

            <NavIcon 
              onClick={() => router.push('/wishlist')} 
              className={`
                ${colors.navTextColor} ${colors.navHoverColor} relative transition-all duration-300
                ${pathname === '/wishlist' ? 'scale-110' : ''}
              `}
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

            {/* Profile Dropdown Logic */}
            <div className="relative hidden md:flex items-center" onMouseEnter={() => { setActiveMegaMenu(null); if (isAuthenticated) setProfileDropdownOpen(true); }} onMouseLeave={() => setProfileDropdownOpen(false)}>
              <button onClick={() => !isAuthenticated ? openAuth() : router.push('/account')} className={`flex items-center gap-2 group p-1 rounded-full transition-all duration-300 ${isAuthenticated ? 'hover:bg-zinc-100/50' : colors.navHoverColor}`}>
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

      {isNotDesktopDevice && (
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
