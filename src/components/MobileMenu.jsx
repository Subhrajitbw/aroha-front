// src/components/MobileMenu.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  X,
  User,
  LogOut,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Settings,
  Package,
  MapPin,
  CreditCard,
  LifeBuoy,
  Heart,
  Star,
  Zap,
} from "lucide-react";

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
  const [currentView, setCurrentView] = useState("main");
  const [activeCategory, setActiveCategory] = useState(null);

  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const mainContentRef = useRef(null);
  const subContentRef = useRef(null);

  // Quick access links - FIXED: Navigate to /shop with filter state
  const quickLinks = [
    { 
      name: "New Arrivals", 
      href: "/shop", 
      icon: Star,
      gradient: "from-amber-500 to-amber-600",
      filterKey: "newOnly" // Add filter identifier
    },
    { 
      name: "On Sale", 
      href: "/shop", 
      icon: Zap,
      gradient: "from-emerald-500 to-emerald-600",
      filterKey: "discountedOnly" // Add filter identifier
    },
  ];

  // Account links organized like luxury brands
  const accountSections = [
    {
      items: [
        { name: "Profile", href: "/account/profile", icon: User },
        { name: "Orders", href: "/account/orders", icon: Package },
        { name: "Wishlist", href: "/account/wishlist", icon: Heart },
      ],
    },
    {
      items: [
        { name: "Addresses", href: "/account/addresses", icon: MapPin },
        { name: "Payment Methods", href: "/account/payment-methods", icon: CreditCard },
        { name: "Settings", href: "/account/settings", icon: Settings },
      ],
    },
    {
      items: [{ name: "Help & Support", href: "/help", icon: LifeBuoy }],
    },
  ];

  const slideToSubMenu = (category) => {
    const subMenuData = megaMenuContent[category.href];
    if (!subMenuData || !subMenuData.columns?.length) {
      // If no submenu, just navigate
      window.location.href = category.href;
      return;
    }

    setActiveCategory({
      ...category,
      subMenu: subMenuData,
    });

    gsap.to(mainContentRef.current, {
      x: "-100%",
      duration: 0.5,
      ease: "power3.inOut",
    });
    gsap.fromTo(
      subContentRef.current,
      { x: "100%" },
      {
        x: "0%",
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => setCurrentView(category.name),
      }
    );
  };

  const slideBackToMain = () => {
    gsap.to(subContentRef.current, {
      x: "100%",
      duration: 0.5,
      ease: "power3.inOut",
    });
    gsap.fromTo(
      mainContentRef.current,
      { x: "-100%" },
      {
        x: "0%",
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          setCurrentView("main");
          setActiveCategory(null);
        },
      }
    );
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.4 });
      gsap.fromTo(
        menuRef.current,
        { x: "100%" },
        {
          x: "0%",
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3 });
    gsap.to(menuRef.current, {
      x: "100%",
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        document.body.style.overflow = "";
        setCurrentView("main");
        setActiveCategory(null);
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/10 backdrop-blur-md"
        onClick={handleClose}
        style={{ visibility: "hidden", opacity: 0 }}
      />

      {/* Drawer */}
      <div
        ref={menuRef}
        className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-[0_0_60px_rgba(0,0,0,0.15)]"
        style={{ transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          {currentView !== "main" ? (
            <button
              onClick={slideBackToMain}
              className="flex items-center gap-3 -ml-2 p-2 rounded-xl hover:bg-neutral-50 transition-colors group"
            >
              <ArrowLeft size={18} className="text-neutral-600 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-[13px] tracking-wide text-neutral-700">
                {activeCategory?.name}
              </span>
            </button>
          ) : (
            <Link
              to="/"
              onClick={handleClose}
              className="text-xl font-light tracking-[0.3em] text-neutral-900"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              AROHA
            </Link>
          )}
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors group"
          >
            <X
              size={18}
              className="text-neutral-600 group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Content Container */}
        <div className="relative h-[calc(100%-80px)] overflow-hidden">
          {/* Main Menu */}
          <div
            ref={mainContentRef}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-8">
              {/* Quick Access - New Arrivals & On Sale - FIXED */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 px-2">
                  Featured
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      state={{ 
                        applyFilter: link.filterKey // Pass filter to apply
                      }}
                      onClick={handleClose}
                      className="group relative overflow-hidden rounded-2xl bg-neutral-50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-5 space-y-3">
                        <div className={`inline-flex p-3 bg-gradient-to-br ${link.gradient} rounded-xl shadow-md`}>
                          <link.icon size={20} strokeWidth={2} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-[13px] tracking-wide text-neutral-800 leading-tight">
                            {link.name}
                          </h4>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-100/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

              {/* Categories Section */}
              {categories && categories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 px-2">
                    Shop by Category
                  </h3>
                  <nav className="space-y-2">
                    {categories.map((category) => {
                      const hasSubMenu =
                        megaMenuContent[category.href] &&
                        megaMenuContent[category.href].columns?.length > 0;

                      return (
                        <div
                          key={category.id}
                          className="group"
                        >
                          {hasSubMenu ? (
                            <button
                              onClick={() => slideToSubMenu(category)}
                              className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-neutral-50 transition-all duration-300"
                            >
                              <span className="text-[14px] tracking-wide text-neutral-800">
                                {category.name}
                              </span>
                              <ChevronRight
                                size={16}
                                strokeWidth={2}
                                className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-300"
                              />
                            </button>
                          ) : (
                            <Link
                              to={category.href}
                              onClick={handleClose}
                              className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-neutral-50 transition-all duration-300"
                            >
                              <span className="text-[14px] tracking-wide text-neutral-800">
                                {category.name}
                              </span>
                              <ChevronRight
                                size={16}
                                strokeWidth={2}
                                className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-300"
                              />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

              {/* Account Section */}
              <div className="space-y-6">
                {isLoggedIn && user ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white text-[16px] font-light tracking-wide">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-neutral-900 tracking-wide truncate">
                            {user.name || "Valued Customer"}
                          </p>
                          <p className="text-[11px] text-neutral-500 tracking-wide truncate mt-0.5">
                            {user.email || "email@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Links */}
                    {accountSections.map((section, sectionIdx) => (
                      <div key={sectionIdx} className="space-y-2">
                        {section.items.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={handleClose}
                            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-neutral-50 transition-all duration-300"
                          >
                            <item.icon
                              size={16}
                              strokeWidth={2}
                              className="text-neutral-400 group-hover:text-neutral-600 transition-colors"
                            />
                            <span className="text-[13px] tracking-wide text-neutral-700 group-hover:text-neutral-900 transition-colors">
                              {item.name}
                            </span>
                            <ChevronRight
                              size={14}
                              strokeWidth={2}
                              className="ml-auto text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all duration-300"
                            />
                          </Link>
                        ))}
                        {sectionIdx < accountSections.length - 1 && (
                          <div className="h-px bg-neutral-100 my-2" />
                        )}
                      </div>
                    ))}

                    {/* Logout */}
                    <button
                      onClick={() => {
                        onLogout();
                        handleClose();
                      }}
                      className="group w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 transition-all duration-300"
                    >
                      <LogOut
                        size={16}
                        strokeWidth={2}
                        className="text-red-400 group-hover:text-red-600 transition-colors"
                      />
                      <span className="text-[13px] tracking-wide text-red-600 group-hover:text-red-700 transition-colors">
                        Sign Out
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onAuthOpen();
                      handleClose();
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-lg"
                  >
                    <User size={18} strokeWidth={2} />
                    <span className="text-[13px] font-medium tracking-wide">
                      Sign In
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub Menu */}
          <div
            ref={subContentRef}
            className="absolute inset-0 overflow-y-auto bg-white"
            style={{ transform: "translateX(100%)" }}
          >
            {activeCategory && (
              <div className="px-6 py-8 space-y-6">
                {/* Category Header */}
                <div className="text-center py-6">
                  <h2 className="text-[16px] font-medium tracking-wide text-neutral-900">
                    {activeCategory.name}
                  </h2>
                  <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent mt-4" />
                </div>

                {/* Subcategories */}
                {activeCategory.subMenu.columns.map((column, colIdx) => (
                  <div key={colIdx} className="space-y-3">
                    <Link
                      to={column.href}
                      onClick={handleClose}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-neutral-50 transition-all duration-300"
                    >
                      <h3 className="text-[11px] font-medium tracking-[0.12em] uppercase text-neutral-700 group-hover:text-neutral-900 transition-colors">
                        {column.title}
                      </h3>
                      <ChevronRight
                        size={14}
                        strokeWidth={2}
                        className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-300"
                      />
                    </Link>
                    <div className="space-y-1 pl-4">
                      {column.items?.slice(0, 5).map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.href}
                          onClick={handleClose}
                          className="group flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-300"
                        >
                          <span className="mt-1.5 w-[3px] h-[3px] rounded-full bg-neutral-300 group-hover:bg-neutral-700 group-hover:w-[4px] group-hover:h-[4px] transition-all duration-300 flex-shrink-0" />
                          <span className="text-[13px] tracking-wide text-neutral-600 group-hover:text-neutral-900 transition-colors">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                      {column.items?.length > 5 && (
                        <Link
                          to={column.href}
                          onClick={handleClose}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors tracking-wide"
                        >
                          <span>View all</span>
                          <ArrowRight size={11} strokeWidth={2} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {/* View All Button */}
                <Link
                  to={activeCategory.href}
                  onClick={handleClose}
                  className="group flex items-center justify-center gap-3 w-full px-6 py-4 mt-8 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all duration-300 shadow-lg"
                >
                  <span className="text-[13px] font-medium tracking-wide">
                    View All {activeCategory.name}
                  </span>
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
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
