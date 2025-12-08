// src/components/NavBar.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, X, Search as SearchIcon, BookOpen } from "lucide-react";

// Stores and other components
import { useSearchStore } from "../stores/searchStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { useAuthStore } from "../stores/useAuthStore";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./nav/MegaMenu"; // ✅ Ensure this path is correct

// Hooks and Nav sub-components
import { useNavScroll } from "../hooks/useNavScroll";
import { useNavAnimations } from "../hooks/useNavAnimations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { NavIcon } from "./nav/NavIcon";
import { useMenuStore } from "../stores/useMenuStore";
import { sdk } from "../lib/medusaClient";

// Enhanced background sampler utilities
import { rafThrottle, sampleBackgroundAtPoint, getColorAnalysis } from "../utils/backgroundSampler";

const NavBar = ({
  variant = "light",
  isMobile,
  isTablet,
  isDesktop,
  isMobileOrTablet,
  isNotDesktop,
  isNotMobile,
  screenWidth,
  deviceType
}) => {
  // --- Component State ---
  const [scrolled, setScrolled] = useState(false);
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useMenuStore();

  // --- Navigation Data State ---
  const [navItems, setNavItems] = useState([]);
  const [megaMenuContent, setMegaMenuContent] = useState({});

  // --- Megamenu Interaction State ---
  const [activeMenu, setActiveMenu] = useState(null);
  const [caretPosition, setCaretPosition] = useState(null);

  // --- Enhanced Theme State ---
  const [navTheme, setNavTheme] = useState(variant === "dark" ? "dark" : "light");
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [samplingActive, setSamplingActive] = useState(true);
  const [lastSampleTime, setLastSampleTime] = useState(0);

  // --- Refs ---
  const navRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);

  // --- Hooks ---
  const { open: openSearch } = useSearchStore();
  const { open: openAuth } = useAuthModalStore();
  const { isAuthenticated, user, setAuth, clearAuth, initializeAuth } = useAuthStore();
  const location = useLocation();
  const isDark = variant === "dark";
  
  useNavScroll(navRef, logoRef, scrolled, isDark);
  useNavAnimations(navRef, logoRef, iconsRef);
  useKeyboardShortcuts(openSearch);

  // Initialize authentication
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch nav data from MEDUSA
  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const { product_categories } = await sdk.productCategories.list({
          include_descendants_tree: true,
        });

        // Map top-level items
        const mappedNavItems = (product_categories || []).map((cat) => ({
          name: cat.name,
          href: `/category/${cat.handle}`,
          id: cat.id,
        }));

        // Map Mega Menu Content
        const mappedMegaMenuContent = {};
        (product_categories || []).forEach((cat) => {
            // Only create mega menu if it has children
            if(cat.category_children && cat.category_children.length > 0) {
                mappedMegaMenuContent[`/category/${cat.handle}`] = {
                    columns: (cat.category_children || []).map((child) => ({
                    title: child.name,
                    href: `/category/${child.handle}`,
                    items: (child.category_children || []).map((grandChild) => ({
                        name: grandChild.name,
                        href: `/category/${grandChild.handle}`
                    }))
                    })),
                    featured: [
                    {
                        title: `${cat.name} Collection`,
                        href: `/category/${cat.handle}`,
                        // Use metadata image or a clean placeholder
                        image: cat.metadata?.image || "https://placehold.co/600x400/eee/333?text=Collection"
                    }
                    ]
                };
            }
        });

        setNavItems(mappedNavItems);
        setMegaMenuContent(mappedMegaMenuContent);
      } catch (error) {
        console.error("Failed to fetch Medusa navigation data:", error);
      }
    };
    fetchNavigationData();
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu hover handlers
  const handleMenuEnter = (href, event) => {
    if (megaMenuContent[href] && event.currentTarget && contentWrapperRef.current) {
      const wrapperBounds = contentWrapperRef.current.getBoundingClientRect();
      const linkBounds = event.currentTarget.getBoundingClientRect();
      
      // Calculate center
      const center = linkBounds.left + (linkBounds.width / 2);
      const positionInPx = center - wrapperBounds.left;
      const positionInPercent = (positionInPx / wrapperBounds.width) * 100;
      
      setCaretPosition(positionInPercent);
      setActiveMenu(href);
    } else {
        setActiveMenu(null);
    }
  };

  const handleMenuLeave = () => setActiveMenu(null);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  // Background sampling (Kept exactly as provided)
  const performBackgroundSampling = useCallback(async () => {
    if (!samplingActive || !navRef.current) return;

    const now = Date.now();
    if (now - lastSampleTime < 100) return;
    setLastSampleTime(now);

    try {
      const rect = navRef.current.getBoundingClientRect();
      const y = rect.bottom + 2;
      const x = Math.max(10, Math.min(window.innerWidth - 10, Math.floor(window.innerWidth / 2)));
      
      const samplingOptions = {
        log: false, 
        sampleRadius: isMobile ? 6 : 10, 
        sampleCount: isMobile ? 5 : 9,   
        clusterThreshold: 25
      };

      const result = await sampleBackgroundAtPoint(x, y, samplingOptions);
      if (!result) return;

      const analysis = getColorAnalysis(result);
      if (result.theme !== navTheme) {
        setNavTheme(result.theme);
        setColorAnalysis(analysis);
      }
    } catch (error) {
      if (navTheme !== variant) {
        setNavTheme(variant);
      }
    }
  }, [samplingActive, navRef.current, navTheme, lastSampleTime, isMobile, variant, location.pathname]);

  useEffect(() => {
    let active = true;
    let rafId = null;
    let timeoutId = null;

    const debouncedSample = rafThrottle(async () => {
      if (!active) return;
      await performBackgroundSampling();
    });

    const onScroll = rafThrottle(() => {
      if (!active) return;
      debouncedSample();
    });

    const onResize = rafThrottle(() => {
      if (!active) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(debouncedSample, 150);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    rafId = requestAnimationFrame(() => {
      if (active) {
        setTimeout(debouncedSample, 100);
      }
    });

    return () => {
      active = false;
      setSamplingActive(false);
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [location.pathname, performBackgroundSampling]);

  useEffect(() => {
    setSamplingActive(true);
    const timer = setTimeout(() => {
      performBackgroundSampling();
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname, performBackgroundSampling]);

  const effectiveTheme = useMemo(() => navTheme, [navTheme]);

  // Dynamic Colors logic
  const colors = useMemo(() => {
    const getFloatingColors = () => {
      if (scrolled) {
        if (effectiveTheme === "dark") {
          return {
            navTextColor: "text-neutral-100",
            navHoverColor: "hover:text-neutral-300",
            logoColor: "text-white",
          };
        } else {
          return {
            navTextColor: "text-neutral-900",
            navHoverColor: "hover:text-neutral-700",
            logoColor: "text-neutral-900",
          };
        }
      }
      return {
        navTextColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
        navHoverColor: effectiveTheme === "light" ? "hover:text-neutral-700" : "hover:text-neutral-300",
        logoColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
      };
    };
    return getFloatingColors();
  }, [scrolled, effectiveTheme]);

  const floatingStyles = useMemo(() => {
    const getFloatingStyles = () => {
      if (scrolled) {
        if (effectiveTheme === "dark") {
          return {
            backgroundColor: colorAnalysis?.hasHighContrast ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: colorAnalysis?.hasHighContrast 
              ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 16px rgba(0, 0, 0, 0.15)"
              : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 16px rgba(0, 0, 0, 0.1)",
          };
        } else {
          return {
            backgroundColor: colorAnalysis?.hasHighContrast ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: colorAnalysis?.hasHighContrast 
              ? "0 8px 32px rgba(255, 255, 255, 0.2), 0 2px 16px rgba(255, 255, 255, 0.15)"
              : "0 8px 32px rgba(255, 255, 255, 0.15), 0 2px 16px rgba(255, 255, 255, 0.1)",
          };
        }
      } else {
        return {
          backgroundColor: "transparent",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        };
      }
    };
    return getFloatingStyles();
  }, [scrolled, effectiveTheme, colorAnalysis]);

  const floatingPosition = useMemo(() => {
    if (scrolled) {
      return !isMobile ? "top-1 left-2 right-2" : "bottom-1 left-2 right-2";
    }
    return "top-0 left-0 right-0";
  }, [scrolled, isMobile]);

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    else if (user.firstName) return user.firstName;
    else if (user.username) return user.username;
    return 'User';
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 transition-all duration-400 ${floatingPosition} ${scrolled ? "rounded-lg shadow-md" : ""} px-4 lg:px-2 py-0`}
        style={floatingStyles}
        onMouseLeave={handleMenuLeave}
        data-theme={effectiveTheme}
        data-analysis={colorAnalysis ? JSON.stringify(colorAnalysis) : null}
      >
        <div ref={contentWrapperRef} className="mx-auto flex items-center justify-between relative max-w-7xl">
          
          {/* Left Side */}
          <div className="flex-1 flex justify-start items-center">
            {isMobile ? (
              <NavIcon 
                as={Link}
                to="/lookbook" 
                className={`${colors.navTextColor} ${colors.navHoverColor}`}
                iconRef={(el) => (iconsRef.current[0] = el)}
              >
                <BookOpen size={18} />
              </NavIcon>
            ) : (
              <div className="flex gap-6 lg:gap-8">
                <Link 
                  to="/lookbook" 
                  className={`text-sm uppercase tracking-widest ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  onMouseEnter={() => setActiveMenu(null)} // Close menu when hovering lookbook
                >
                  Lookbook
                </Link>
                
                {/* ✅ DYNAMIC CATEGORIES INJECTED HERE */}
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`text-sm uppercase tracking-widest ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                    onMouseEnter={(e) => handleMenuEnter(item.href, e)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link
              to="/home"
              ref={logoRef}
              className={`text-xl lg:text-2xl font-light tracking-wider ${colors.logoColor} transition-all duration-500 hover:tracking-widest`}
              style={{ fontFamily: "Playfair Display, serif", textDecoration: "none" }}
              onMouseEnter={() => setActiveMenu(null)} // Close menu when hovering logo
            >
              AROHA
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-end items-center gap-3 lg:gap-4">
            {isMobile ? (
              <NavIcon 
                onClick={openSearch} 
                className={`${colors.navTextColor} ${colors.navHoverColor}`} 
                iconRef={(el) => (iconsRef.current[1] = el)}
              >
                <SearchIcon size={18} />
              </NavIcon>
            ) : (
              <>
                <NavIcon 
                  onClick={openSearch} 
                  className={`${colors.navTextColor} ${colors.navHoverColor}`} 
                  iconRef={(el) => (iconsRef.current[1] = el)}
                >
                  <SearchIcon size={18} />
                </NavIcon>
              </>
            )}
          </div>
        </div>

        {/* ✅ MEGA MENU COMPONENT RENDERED HERE */}
        {!isMobile && (
            <MegaMenu 
                isOpen={!!activeMenu}
                content={activeMenu ? megaMenuContent[activeMenu] : null}
                onClose={() => setActiveMenu(null)}
                caretPosition={caretPosition}
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
          user={user ? {
            name: getUserDisplayName(),
            email: user.email,
            username: user.username,
            isEmailVerified: user.isEmailVerified,
            authType: user.authType
          } : null}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default NavBar;