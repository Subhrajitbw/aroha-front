// src/components/layout/NavBar.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search as SearchIcon, ChevronDown, User, ShoppingBag } from "lucide-react";

import { useSearchStore } from "../../stores/searchStore";
import { useAuthModalStore } from "../../stores/useAuthModalStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { useMenuStore } from "../../stores/useMenuStore";

import MobileMenu from "./MobileMenu";
import MegaMenu from "../nav/MegaMenu";
import { NavIcon } from "../nav/NavIcon";
import Logo from "../nav/Logo";
import ProfileDropdown from "../nav/ProfileDropdown";

import { useNavAnimations } from "../../hooks/useNavAnimations";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useNavData } from "../../hooks/useNavData";
import { useNavTheming } from "../../hooks/useNavTheming";
import { motion, AnimatePresence } from "framer-motion";
import CartDropdown from "../nav/CartDropdown";
import { sdk } from "../../lib/medusaClient";

const NavBar = ({ variant = "light", isMobile, isNotDesktop }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);
  const megaMenuRef = useRef(null);

  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

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
  } = useNavTheming(navRef, variant, location, isMobile);

  const {
    navItems,
    roomsMegaContent,
    aggregatedMegaContent,
    megaMenuContent
  } = useNavData();

  useNavAnimations(navRef, logoRef, iconsRef);
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

  useEffect(() => {
    setThemeFrozen(!!activeMegaMenu);
  }, [activeMegaMenu, setThemeFrozen]);

  // Handle body scroll locking when mega menu is open
  useEffect(() => {
    if (activeMegaMenu && !isMobile) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalStyle; };
    }
  }, [activeMegaMenu, isMobile]);

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
    navigate("/");
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
        className={`fixed z-50 transition-all duration-500 ease-out ${floatingPosition} ${scrolled ? "rounded-[2rem] shadow-xl" : ""
          } px-6 lg:px-12 py-5`}
        style={floatingStyles}
        onMouseLeave={handleNavAreaLeave}
        data-theme={effectiveTheme}
      >
        <div className="mx-auto flex items-center justify-between relative max-w-7xl">
          {/* Left: Desktop Nav */}
          <div className="flex-1 flex items-center gap-4 lg:gap-12">
            {!isMobile ? (
              <>
                {[
                  { label: 'Shop', path: '/shop', hasMega: true, megaKey: 'shop' },
                  { label: 'Lookbook', path: '/lookbook' },
                  { label: 'Rooms', path: '/rooms', hasMega: true, megaKey: 'rooms' },
                  { label: 'Journal', path: '/journal' }
                ].map((item) => (
                  <div key={item.label} className="relative py-4 group">
                    <button
                      onClick={() => { setActiveMegaMenu(null); navigate(item.path); }}
                      onMouseEnter={() => item.hasMega ? setActiveMegaMenu(item.megaKey) : setActiveMegaMenu(null)}
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
                    {location.pathname === item.path && (
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

            {/* Profile Dropdown Logic */}
            <div className="relative hidden md:flex items-center" onMouseEnter={() => { setActiveMegaMenu(null); if (isAuthenticated) setProfileDropdownOpen(true); }} onMouseLeave={() => setProfileDropdownOpen(false)}>
              <button onClick={() => !isAuthenticated ? openAuth() : navigate('/account')} className={`flex items-center gap-2 group p-1 rounded-full transition-all duration-300 ${isAuthenticated ? 'hover:bg-zinc-100/50' : colors.navHoverColor}`}>
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
                navigate={navigate} 
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
                onClick={() => navigate('/cart')} 
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
                navigate={navigate} 
              />
            </div>
          </div>
        </div>

        {!isMobile && (
          <MegaMenu
            ref={megaMenuRef}
            isOpen={!!activeMegaMenu}
            content={activeMegaMenu === 'rooms' ? roomsMegaContent : aggregatedMegaContent}
            onClose={() => setActiveMegaMenu(null)}
            onMouseLeave={handleNavAreaLeave}
          />
        )}
      </nav>

      {isNotDesktop && (
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
