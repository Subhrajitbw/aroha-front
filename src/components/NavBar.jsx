// src/components/NavBar.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search as SearchIcon,
  ChevronDown,
  BookOpen,
} from "lucide-react";

import { useSearchStore } from "../stores/searchStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useMenuStore } from "../stores/useMenuStore";

import MobileMenu from "./MobileMenu";
import MegaMenu from "./nav/MegaMenu";
import { NavIcon } from "./nav/NavIcon";

import { useNavScroll } from "../hooks/useNavScroll";
import { useNavAnimations } from "../hooks/useNavAnimations";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";

import {
  rafThrottle,
  sampleBackgroundAtPoint,
  getColorAnalysis,
} from "../utils/backgroundSampler";

const NavBar = ({
  variant = "light",
  isMobile,
  isNotDesktop,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const contentWrapperRef = useRef(null);
  const logoRef = useRef(null);
  const iconsRef = useRef([]);
  const shopButtonRef = useRef(null);
  const megaMenuRef = useRef(null);
  const chevronRef = useRef(null);

  // Data
  const [navItems, setNavItems] = useState([]);
  const [megaMenuContent, setMegaMenuContent] = useState({});

  // Mega menu
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [caretPosition, setCaretPosition] = useState(null);

  // Theming
  const [navTheme, setNavTheme] = useState(
    variant === "dark" ? "dark" : "light"
  );
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [samplingActive, setSamplingActive] = useState(true);
  const [lastSampleTime, setLastSampleTime] = useState(0);
  const [themeFrozen, setThemeFrozen] = useState(false);

  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } =
    useMenuStore();
  const { open: openSearch } = useSearchStore();
  const { open: openAuth } = useAuthModalStore();
  const { isAuthenticated, user, clearAuth, initializeAuth } =
    useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();
  const isDark = variant === "dark";

  useNavScroll(navRef, logoRef, scrolled, isDark);
  useNavAnimations(navRef, logoRef, iconsRef);
  useKeyboardShortcuts(openSearch);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // FIX 1: Prevent body scroll when mega menu is open
  useEffect(() => {
    if (megaMenuOpen && !isMobile) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [megaMenuOpen, isMobile]);

  // FIX 3: Freeze theme when mega menu is open
  useEffect(() => {
    setThemeFrozen(megaMenuOpen);
  }, [megaMenuOpen]);

  // Fetch Medusa + Sanity nav data
  useEffect(() => {
    const fetchNavigationData = async () => {
      try {
        const { product_categories } = await sdk.store.category.list({
          limit: 1000,
        });

        const categoriesByHandle = new Map(
          (product_categories || []).map((cat) => [cat.handle, cat])
        );

        let navConfig = null;
        try {
          navConfig = await sanityClient.fetch(`
            *[_type == "navigation"][0]{
              items[]{
                label,
                categoryHandle,
                priority,
                featured{
                  title,
                  subtitle,
                  "imageUrl": image.asset->url,
                  href
                }
              }
            }
          `);
          console.log("Sanity navConfig:", navConfig);
        } catch (err) {
          console.error("Sanity fetch failed:", err);
        }

        const items = navConfig?.items || [];

        // Fallback if Sanity empty
        if (!items.length) {
          const topLevel = (product_categories || []).filter(
            (cat) => !cat.parent_category_id
          );

          const fallbackNavItems = topLevel.map((cat, idx) => ({
            id: cat.id,
            name: cat.name,
            href: `/shop/category/${cat.handle}`,
            handle: cat.handle,
            priority: idx,
            hasMega: (cat.category_children || []).length > 0,
          }));

          const fallbackMega = {};
          topLevel.forEach((cat) => {
            const href = `/shop/category/${cat.handle}`;
            const children = cat.category_children || [];
            if (!children.length) return;

            const columns = children.map((child) => ({
              title: child.name,
              href: `/shop/category/${child.handle}`,
              items: (child.category_children || []).map((grandChild) => ({
                name: grandChild.name,
                href: `/shop/category/${grandChild.handle}`,
              })),
            }));

            fallbackMega[href] = {
              columns,
              featured: [
                {
                  title: `${cat.name} Collection`,
                  subtitle: "",
                  href,
                  image:
                    cat.metadata?.image ||
                    "https://placehold.co/800x600/f5f5f5/111?text=Collection",
                },
              ],
            };
          });

          setNavItems(fallbackNavItems);
          setMegaMenuContent(fallbackMega);
          return;
        }

        // Build navItems from Sanity
        const mappedNavItems = items
          .map((item) => {
            const cat = categoriesByHandle.get(item.categoryHandle);
            if (!cat) return null;

            const href = `/shop/category/${cat.handle}`;

            return {
              id: cat.id,
              name: item.label || cat.name,
              href,
              handle: cat.handle,
              priority: item.priority ?? 0,
              hasMega: (cat.category_children || []).length > 0,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.priority - b.priority);

        // Build megaMenuContent per category
        const mappedMegaMenuContent = {};

        items.forEach((item) => {
          const cat = categoriesByHandle.get(item.categoryHandle);
          if (!cat) return;

          const href = `/shop/category/${cat.handle}`;
          const children = cat.category_children || [];
          if (!children.length) return;

          // Build columns from children
          const columns = children.map((child) => ({
            title: child.name,
            href: `/shop/category/${child.handle}`,
            items: (child.category_children || []).map((grandChild) => ({
              name: grandChild.name,
              href: `/shop/category/${grandChild.handle}`,
            })),
          }));

          mappedMegaMenuContent[href] = {
            columns,
            featured: [
              {
                title:
                  item.featured?.title || `${cat.name} Collection`,
                subtitle: item.featured?.subtitle || "",
                href: item.featured?.href || href,
                image:
                  cat.metadata?.image ||
                  item.featured?.imageUrl ||
                  "https://placehold.co/800x600/f5f5f5/111?text=Collection",
              },
            ],
          };
        });

        setNavItems(mappedNavItems);
        setMegaMenuContent(mappedMegaMenuContent);
      } catch (err) {
        console.error("Failed to fetch navigation data:", err);
      }
    };

    fetchNavigationData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Build proper parent-child structure for mega menu
  const aggregatedMegaContent = useMemo(() => {
    const columns = [];
    const allFeatured = [];

    navItems.forEach((parentItem) => {
      const parentContent = megaMenuContent[parentItem.href];
      if (!parentContent) return;

      const subcategories = [];

      if (parentContent.columns) {
        parentContent.columns.forEach((childColumn) => {
          subcategories.push({
            name: childColumn.title,
            href: childColumn.href,
          });

          if (childColumn.items && subcategories.length < 5) {
            const remaining = 5 - subcategories.length;
            subcategories.push(...childColumn.items.slice(0, remaining));
          }
        });
      }

      columns.push({
        title: parentItem.name,
        href: parentItem.href,
        items: subcategories.slice(0, 5),
      });

      if (parentContent.featured) {
        allFeatured.push(...parentContent.featured);
      }
    });

    return {
      columns,
      featured: allFeatured.slice(0, 3),
    };
  }, [navItems, megaMenuContent]);

  // FIX 4: Only hovering chevron opens mega menu
  const handleChevronHover = (event) => {
    if (window.matchMedia("(hover: hover)").matches) {
      setMegaMenuOpen(true);
      calculateCaretPosition(event);
    }
  };

  // FIX 4: Click on "Shop" button navigates to /shop
  const handleShopClick = (event) => {
    event.preventDefault();
    setMegaMenuOpen(false);
    navigate("/shop");
  };

  const calculateCaretPosition = (event) => {
    if (!contentWrapperRef.current || !shopButtonRef.current) return;

    const wrapperBounds = contentWrapperRef.current.getBoundingClientRect();
    const btnBounds = shopButtonRef.current.getBoundingClientRect();

    const btnCenter = btnBounds.left + btnBounds.width / 2;
    const positionInPx = btnCenter - wrapperBounds.left;

    const positionInPercent = Math.max(5, Math.min(95, (positionInPx / wrapperBounds.width) * 100));

    setCaretPosition(positionInPercent);
  };

  // FIX 2: Better mouse leave detection
  const handleNavAreaLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;

    if (!relatedTarget) {
      setMegaMenuOpen(false);
      return;
    }

    if (megaMenuRef.current?.contains(relatedTarget)) {
      return;
    }

    if (navRef.current?.contains(relatedTarget)) {
      return;
    }

    setMegaMenuOpen(false);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  // FIX 3: Disable background sampling when theme is frozen
  const performBackgroundSampling = useCallback(
    async () => {
      if (!samplingActive || !navRef.current || themeFrozen) return;

      const now = Date.now();
      if (now - lastSampleTime < 100) return;
      setLastSampleTime(now);

      try {
        const rect = navRef.current.getBoundingClientRect();
        const y = rect.bottom + 2;
        const x = Math.max(
          10,
          Math.min(
            window.innerWidth - 10,
            Math.floor(window.innerWidth / 2)
          )
        );

        const samplingOptions = {
          log: false,
          sampleRadius: isMobile ? 6 : 10,
          sampleCount: isMobile ? 5 : 9,
          clusterThreshold: 25,
        };

        const result = await sampleBackgroundAtPoint(
          x,
          y,
          samplingOptions
        );
        if (!result) return;

        const analysis = getColorAnalysis(result);
        if (result.theme !== navTheme) {
          setNavTheme(result.theme);
          setColorAnalysis(analysis);
        }
      } catch {
        if (navTheme !== variant) {
          setNavTheme(variant);
        }
      }
    },
    [
      samplingActive,
      navRef.current,
      navTheme,
      lastSampleTime,
      isMobile,
      variant,
      location.pathname,
      themeFrozen,
    ]
  );

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

  const colors = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          navTextColor: "text-neutral-100",
          navHoverColor: "hover:text-neutral-300",
          logoColor: "text-white",
        };
      }
      return {
        navTextColor: "text-neutral-900",
        navHoverColor: "hover:text-neutral-700",
        logoColor: "text-neutral-900",
      };
    }
    return {
      navTextColor:
        effectiveTheme === "light"
          ? "text-neutral-900"
          : "text-white",
      navHoverColor:
        effectiveTheme === "light"
          ? "hover:text-neutral-700"
          : "hover:text-neutral-300",
      logoColor:
        effectiveTheme === "light"
          ? "text-neutral-900"
          : "text-white",
    };
  }, [scrolled, effectiveTheme]);

  const floatingStyles = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          backgroundColor: colorAnalysis?.hasHighContrast
            ? "rgba(0, 0, 0, 0.15)"
            : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: colorAnalysis?.hasHighContrast
            ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 16px rgba(0, 0, 0, 0.15)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 16px rgba(0, 0, 0, 0.1)",
        };
      }
      return {
        backgroundColor: colorAnalysis?.hasHighContrast
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: colorAnalysis?.hasHighContrast
          ? "0 8px 32px rgba(255, 255, 255, 0.2), 0 2px 16px rgba(255, 255, 255, 0.15)"
          : "0 8px 32px rgba(255, 255, 255, 0.15), 0 2px 16px rgba(255, 255, 255, 0.1)",
      };
    }
    return {
      backgroundColor: "transparent",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  }, [scrolled, effectiveTheme, colorAnalysis]);

  const floatingPosition = useMemo(() => {
    if (scrolled) {
      return !isMobile ? "top-1 left-2 right-2" : "bottom-1 left-2 right-2";
    }
    return "top-0 left-0 right-0";
  }, [scrolled, isMobile]);

  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    return "User";
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 transition-all duration-400 ${floatingPosition} ${
          scrolled ? "rounded-2xl shadow-md" : ""
        } px-3 lg:px-4 py-1`}
        style={floatingStyles}
        onMouseLeave={handleNavAreaLeave}
        data-theme={effectiveTheme}
        data-analysis={colorAnalysis ? JSON.stringify(colorAnalysis) : null}
      >
        <div
          ref={contentWrapperRef}
          className="mx-auto flex items-center justify-between relative max-w-7xl"
        >
          {/* Left: Shop + Lookbook OR Mobile Menu + Lookbook */}
          <div className="flex-1 flex items-center gap-4 lg:gap-8">
            {!isMobile && (
              <>
                {/* Desktop: Shop with Chevron + Lookbook */}
                <div className="flex items-center gap-1">
                  <button
                    ref={shopButtonRef}
                    type="button"
                    onClick={handleShopClick}
                    className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  >
                    Shop
                  </button>
                  <button
                    ref={chevronRef}
                    type="button"
                    onMouseEnter={handleChevronHover}
                    className={`${colors.navTextColor} ${colors.navHoverColor} transition-all`}
                    aria-label="Open shop menu"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${
                        megaMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <Link
                  to="/lookbook"
                  className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  onMouseEnter={() => setMegaMenuOpen(false)}
                >
                  Lookbook
                </Link>
              </>
            )}

            {isMobile && (
              <>
                {/* Mobile: Menu Icon + Lookbook Icon - FIXED SPACING */}
                <NavIcon
                  onClick={toggleMenu}
                  className={`${colors.navTextColor} ${colors.navHoverColor}`}
                  iconRef={(el) => (iconsRef.current[0] = el)}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </NavIcon>
                
                <Link
                  to="/lookbook"
                  className={`${colors.navTextColor} ${colors.navHoverColor} transition-colors flex items-center justify-center`}
                  aria-label="View Lookbook"
                >
                  <BookOpen size={18} strokeWidth={2} />
                </Link>
              </>
            )}
          </div>

          {/* Center logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link
              to="/home"
              ref={logoRef}
              className={`text-xl lg:text-2xl font-light tracking-[0.3em] ${colors.logoColor} transition-all duration-500 hover:tracking-[0.5em]`}
              style={{
                fontFamily: "Playfair Display, serif",
                textDecoration: "none",
              }}
              onMouseEnter={() => setMegaMenuOpen(false)}
            >
              AROHA
            </Link>
          </div>

          {/* Right: Search */}
          <div className="flex-1 flex justify-end items-center">
            <NavIcon
              onClick={openSearch}
              className={`${colors.navTextColor} ${colors.navHoverColor}`}
              iconRef={(el) => (iconsRef.current[1] = el)}
            >
              <SearchIcon size={18} />
            </NavIcon>
          </div>
        </div>

        {/* Single aggregated mega menu with parent-child structure */}
        {!isMobile && (
          <MegaMenu
            ref={megaMenuRef}
            isOpen={megaMenuOpen}
            content={aggregatedMegaContent}
            caretPosition={caretPosition}
            onClose={() => setMegaMenuOpen(false)}
            onMouseLeave={handleNavAreaLeave}
          />
        )}
      </nav>

      {/* Mobile drawer */}
      {isNotDesktop && (
        <MobileMenu
          isOpen={menuOpen}
          onClose={closeMenu}
          onAuthOpen={openAuth}
          categories={navItems}
          megaMenuContent={megaMenuContent}
          isLoggedIn={isAuthenticated}
          user={
            user
              ? {
                  name: getUserDisplayName(),
                  email: user.email,
                  username: user.username,
                  isEmailVerified: user.isEmailVerified,
                  authType: user.authType,
                }
              : null
          }
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default NavBar;
