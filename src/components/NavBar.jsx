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
  User,
  ShoppingBag,
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
  const [roomCategories, setRoomCategories] = useState([]);
  const [megaMenuContent, setMegaMenuContent] = useState({});

  // Mega menus
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'shop', 'rooms', or null

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
  const shouldUseBackgroundSampling =
    variant === "light" || location.pathname.startsWith("/products/");

  useNavScroll(navRef, logoRef, scrolled, isDark);
  useNavAnimations(navRef, logoRef, iconsRef);
  useKeyboardShortcuts(openSearch);

  // Keep navbar theme in sync with route-driven variant.
  useEffect(() => {
    setNavTheme(variant === "dark" ? "dark" : "light");
    setSamplingActive(shouldUseBackgroundSampling);
    if (!shouldUseBackgroundSampling) {
      setColorAnalysis(null);
    }
  }, [variant, location.pathname, shouldUseBackgroundSampling]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // FIX 1: Prevent body scroll when mega menu is open
  useEffect(() => {
    if (activeMegaMenu && !isMobile) {
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
  }, [activeMegaMenu, isMobile]);

  useEffect(() => {
    setThemeFrozen(!!activeMegaMenu);
  }, [activeMegaMenu]);

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

  // Fetch Rooms for Mega Menu
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await sanityClient.fetch(`*[_type == "product" && defined(perfectFor)]{ perfectFor }`);
        const keywords = ["bedroom", "living", "studio", "lounge", "dining", "office", "suite"];
        const found = new Set();
        data.forEach(p => {
          const tags = Array.isArray(p.perfectFor) ? p.perfectFor : [p.perfectFor];
          tags.forEach(tag => {
            const lower = tag.toLowerCase();
            if (keywords.find(kw => lower.includes(kw))) {
              const display = tag.split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
              found.add(display);
            }
          });
        });
        setRoomCategories(Array.from(found).slice(0, 6)); // Limit to 6 for menu
      } catch (err) {
        console.error("Failed to fetch rooms for nav:", err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Build Rooms Mega Content
  const roomsMegaContent = useMemo(() => {
    const categories = roomCategories.length > 0 ? roomCategories : ["Living Room", "Bedroom", "Studio"];
    
    return {
      columns: [
        {
          title: "Virtual Tours",
          href: "/rooms",
          items: categories.map(cat => ({ 
            name: cat.toUpperCase(), 
            href: `/rooms/${cat.toLowerCase().replace(/\s+/g, '-')}` 
          }))
        }
      ],
      featured: [
        {
          title: "The Visionary Estate",
          subtitle: "UHNI homes",
          href: "/rooms",
          image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800"
        },
        {
          title: "Structural Form",
          subtitle: "Architects",
          href: "/rooms",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
        }
      ]
    };
  }, [roomCategories]);

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

  const handleShopHover = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setActiveMegaMenu('shop');
    }
  };

  const handleRoomsHover = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      setActiveMegaMenu('rooms');
    }
  };

  const handleShopClick = (event) => {
    event.preventDefault();
    setActiveMegaMenu(null);
    navigate("/shop");
  };

  const handleRoomsClick = (event) => {
    event.preventDefault();
    setActiveMegaMenu(null);
    navigate("/rooms");
  };



  // FIX 2: Better mouse leave detection
  const handleNavAreaLeave = useCallback((event) => {
    const relatedTarget = event.relatedTarget;

    if (!relatedTarget) {
      setActiveMegaMenu(null);
      return;
    }

    if (megaMenuRef.current?.contains(relatedTarget)) {
      return;
    }

    if (navRef.current?.contains(relatedTarget)) {
      return;
    }

    setActiveMegaMenu(null);
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
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [location.pathname, performBackgroundSampling]);

  useEffect(() => {
    if (!shouldUseBackgroundSampling) return;

    setSamplingActive(true);
    const timer = setTimeout(() => {
      performBackgroundSampling();
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname, performBackgroundSampling, shouldUseBackgroundSampling]);

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
                    type="button"
                    onClick={handleShopClick}
                    onMouseEnter={handleShopHover}
                    className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  >
                    Shop
                  </button>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${colors.navTextColor} ${
                      activeMegaMenu === 'shop' ? "rotate-180" : ""
                    }`}
                  />
                </div>

    <Link
                  to="/lookbook"
                  className={`hidden md:flex text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  onMouseEnter={() => setActiveMegaMenu(null)}
                >
                  Lookbook
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleRoomsClick}
                    onMouseEnter={handleRoomsHover}
                    className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  >
                    Rooms
                  </button>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${colors.navTextColor} ${
                      activeMegaMenu === 'rooms' ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <Link
                  to="/journal"
                  className={`hidden md:flex text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
                  onMouseEnter={() => setActiveMegaMenu(null)}
                >
                  Journal
                </Link>
              </>
            )}

            {isMobile && (
              <>
                {/* Mobile: Menu Icon Only */}
                <NavIcon
                  onClick={toggleMenu}
                  className={`${colors.navTextColor} ${colors.navHoverColor}`}
                  iconRef={(el) => (iconsRef.current[0] = el)}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </NavIcon>
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
              onMouseEnter={() => setActiveMegaMenu(null)}
            >
              AROHA
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-5">
            <NavIcon
              onClick={openSearch}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`
                ${colors.navTextColor} 
                ${colors.navHoverColor}
                transition-all duration-300
              `}
              iconRef={(el) => (iconsRef.current[1] = el)}
            >
              <SearchIcon size={18} strokeWidth={1.5} />
            </NavIcon>

            <NavIcon
              onClick={() => isAuthenticated ? navigate('/account') : openAuth()}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`
                hidden md:flex
                ${colors.navTextColor} 
                ${colors.navHoverColor}
                transition-all duration-300
              `}
              iconRef={(el) => (iconsRef.current[2] = el)}
            >
              <User size={18} strokeWidth={1.5} />
            </NavIcon>

            <NavIcon
              onClick={() => {}}
              onMouseEnter={() => setActiveMegaMenu(null)}
              className={`
                ${colors.navTextColor} 
                ${colors.navHoverColor}
                transition-all duration-300
              `}
              iconRef={(el) => (iconsRef.current[3] = el)}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
            </NavIcon>
          </div>

        </div>

        {/* Dynamic Mega Menu Support */}
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
