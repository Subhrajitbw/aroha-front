// src/components/MobileMenu.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  X,
  User,
  LogOut,
  ArrowRight,
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

  // Quick access links
  const quickLinks = [
    { 
      name: "New Arrivals", 
      href: "/shop", 
      icon: Star,
      filterKey: "newOnly" 
    },
    { 
      name: "On Sale", 
      href: "/shop", 
      icon: Zap,
      filterKey: "discountedOnly" 
    },
  ];

  // Account links
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
        { name: "Payment", href: "/account/payment-methods", icon: CreditCard },
        { name: "Settings", href: "/account/settings", icon: Settings },
      ],
    },
    {
      items: [{ name: "Support", href: "/help", icon: LifeBuoy }],
    },
  ];

  const slideToSubMenu = (category) => {
    const subMenuData = megaMenuContent[category.href];
    if (!subMenuData || !subMenuData.columns?.length) {
      window.location.href = category.href;
      return;
    }

    setActiveCategory({
      ...category,
      subMenu: subMenuData,
    });

    gsap.to(mainContentRef.current, {
      x: "-20%",
      opacity: 0,
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
    
    gsap.to(mainContentRef.current, {
      x: "0%",
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        setCurrentView("main");
        setActiveCategory(null);
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(
        menuRef.current,
        { x: "-100%" }, // Slide from left for a luxury feel
        {
          x: "0%",
          duration: 0.7,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.4 });
    gsap.to(menuRef.current, {
      x: "-100%",
      duration: 0.6,
      ease: "power3.inOut",
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
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Heavy Blur Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={handleClose}
        style={{ visibility: "hidden", opacity: 0 }}
      />

      {/* Luxury Drawer (Sliding from Left) */}
      <div
        ref={menuRef}
        className="absolute top-0 left-0 h-full w-[90%] max-w-[400px] bg-[#fafafa] flex flex-col"
        style={{ transform: "translateX(-100%)" }}
      >
        {/* Minimalist Header */}
        <div className="flex items-center justify-between px-6 py-8 border-b border-stone-200">
          {currentView !== "main" ? (
            <button
              onClick={slideBackToMain}
              className="group flex items-center gap-4 hover:opacity-70 transition-opacity"
            >
              <ArrowRight size={16} strokeWidth={1} className="text-stone-900 rotate-180" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-900 font-medium">
                Back
              </span>
            </button>
          ) : (
            <Link
              to="/"
              onClick={handleClose}
              className="text-2xl tracking-[0.3em] uppercase text-stone-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Aroha
            </Link>
          )}
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-stone-900 hover:rotate-90 transition-transform duration-500"
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Content Container */}
        <div className="relative flex-1 overflow-hidden">
          
          {/* Main Menu Context */}
          <div
            ref={mainContentRef}
            className="absolute inset-0 overflow-y-auto hide-scrollbar"
          >
            <div className="px-6 py-10 space-y-12">
              
              {/* Grand Categories */}
              {categories && categories.length > 0 && (
                <div className="space-y-6 lg:space-y-8">
                  <h3 className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-medium border-b border-stone-200 pb-4">
                    The Collection
                  </h3>
                  <nav className="space-y-4">
                    {categories.map((category) => {
                      const hasSubMenu = megaMenuContent[category.href] && megaMenuContent[category.href].columns?.length > 0;
                      return (
                        <div key={category.id} className="group">
                          {hasSubMenu ? (
                            <button
                              onClick={() => slideToSubMenu(category)}
                              className="w-full flex items-center justify-between py-2 group/btn"
                            >
                              <span className="font-serif text-3xl text-stone-900 tracking-wide font-light transition-transform duration-500 origin-left group-hover/btn:scale-[1.05]">
                                {category.name}
                              </span>
                              <ArrowRight
                                size={18}
                                strokeWidth={1}
                                className="text-stone-400 group-hover/btn:text-stone-900 group-hover/btn:translate-x-2 transition-all duration-500"
                              />
                            </button>
                          ) : (
                            <Link
                              to={category.href}
                              onClick={handleClose}
                              className="w-full flex items-center justify-between py-2 group/btn"
                            >
                              <span className="font-serif text-3xl text-stone-900 tracking-wide font-light transition-transform duration-500 origin-left group-hover/btn:scale-[1.05]">
                                {category.name}
                              </span>
                              <ArrowRight
                                size={18}
                                strokeWidth={1}
                                className="text-stone-400 group-hover/btn:text-stone-900 group-hover/btn:translate-x-2 transition-all duration-500"
                              />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Minimal Featured Links */}
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    state={{ applyFilter: link.filterKey }}
                    onClick={handleClose}
                    className="flex flex-col items-center justify-center py-8 border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-colors duration-500 group/box"
                  >
                    <link.icon size={18} strokeWidth={1} className="mb-4 text-stone-900 group-hover/box:text-white transition-colors duration-500" />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-medium">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Editorials Section */}
              <div className="space-y-6 pt-6 border-t border-stone-200">
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-medium pb-2">
                  Editorials
                </h3>
                <div className="grid grid-cols-1 gap-y-4">
                  {[
                    { name: "Rooms", href: "/rooms" },
                    { name: "Journal", href: "/journal" },
                    { name: "Lookbook", href: "/lookbook" }
                  ].map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleClose}
                      className="flex items-center justify-between group/link"
                    >
                      <span className="text-xl font-serif text-stone-900 tracking-wide font-normal transition-transform duration-500 origin-left group-hover/link:scale-[1.05]">
                        {item.name}
                      </span>
                      <ArrowRight
                        size={16}
                        strokeWidth={1}
                        className="text-stone-400 group-hover/link:text-stone-900 group-hover/link:translate-x-2 transition-all duration-500"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-6 pt-6 border-t border-stone-200">
                {isLoggedIn && user ? (
                  <>
                    <h3 className="text-xs tracking-[0.3em] uppercase text-stone-400 font-medium pb-2">
                      Identity
                    </h3>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-lg font-serif text-stone-900">
                        {user.name || "Client"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {accountSections.flatMap(s => s.items).map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={handleClose}
                          className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <item.icon size={14} strokeWidth={1.5} />
                          <span className="text-sm uppercase tracking-[0.1em] font-medium">{item.name}</span>
                        </Link>
                      ))}
                    </div>

                    <button
                      onClick={() => { onLogout(); handleClose(); }}
                      className="w-full flex items-center justify-between pt-8 mt-8 border-t border-stone-200 text-stone-900 group/out"
                    >
                      <span className="text-sm uppercase tracking-[0.2em] font-medium">Sign Out</span>
                      <LogOut size={16} strokeWidth={1} className="group-hover/out:translate-x-1 transition-transform" />
                    </button>
                  </>
                ) : (
                  <div className="pb-8">
                    <button
                      onClick={() => { onAuthOpen(); handleClose(); }}
                      className="w-full py-5 bg-stone-900 text-white flex justify-center items-center hover:bg-stone-800 transition-colors"
                    >
                      <span className="text-sm uppercase tracking-[0.3em] font-medium">
                        Authenticate
                      </span>
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-4 tracking-widest uppercase">
                      Access exclusive collections
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Menu Overlay */}
          <div
            ref={subContentRef}
            className="absolute inset-0 overflow-y-auto bg-[#fafafa] hide-scrollbar"
            style={{ transform: "translateX(100%)" }}
          >
            {activeCategory && (
              <div className="px-6 py-10 space-y-10">
                <h2 className="font-serif text-4xl text-stone-900 tracking-wide font-light border-b border-stone-200 pb-8">
                  {activeCategory.name}
                </h2>

                <div className="space-y-10">
                  {activeCategory.subMenu.columns.map((column, colIdx) => (
                    <div key={colIdx} className="space-y-4">
                      <h3 className="text-xs tracking-[0.2em] uppercase text-stone-500 font-bold">
                        {column.title}
                      </h3>
                      <div className="space-y-3">
                        {column.items?.map((item, itemIdx) => (
                          <Link
                            key={itemIdx}
                            to={item.href}
                            onClick={handleClose}
                            className="block text-base text-stone-900 hover:text-stone-600 tracking-wide font-normal transition-colors py-1"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={activeCategory.href}
                  onClick={handleClose}
                  className="group flex items-center justify-between w-full py-5 border-t border-stone-200 mt-12"
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-stone-900 font-medium">
                    Explore Directory
                  </span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1}
                    className="group-hover:translate-x-2 transition-transform duration-500 text-stone-900"
                  />
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `
      }} />
    </div>
  );
};

export default MobileMenu;
