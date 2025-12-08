import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  X,
  Sofa,
  Sparkles,
  Lightbulb,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  ArrowRight,
  Star,
  Zap,
  ChevronRight,
  ArrowLeft,
  Settings,
  Package,        // Icon for Orders (matching ProfileDropdown)
  MapPin,         // Icon for Addresses
  CreditCard,     // Icon for Payment Methods
  LifeBuoy        // Icon for Help/Support
} from "lucide-react";

// Helper to provide the visual data (icons, colors, descriptions) for categories
const getCategoryVisuals = (categoryName) => {
  const visuals = {
    "Furniture": { icon: Sofa, description: "Sofas, tables, & more", color: "from-slate-500 to-slate-600" },
    "Décor": { icon: Sparkles, description: "Art, vases, & accessories", color: "from-stone-500 to-stone-600" },
    "Lighting": { icon: Lightbulb, description: "Lamps & smart lights", color: "from-amber-500 to-amber-600" },
    "Kitchenware": { icon: Star, description: "Kitchen essentials & more", color: "from-emerald-500 to-emerald-600" },
    "Textiles": { icon: Heart, description: "Rugs, curtains, & fabrics", color: "from-rose-500 to-rose-600" },
    "Storage": { icon: Package, description: "Organizers & containers", color: "from-blue-500 to-blue-600" },
    "Bathroom": { icon: Sparkles, description: "Bath accessories & more", color: "from-cyan-500 to-cyan-600" },
    "Outdoor": { icon: Star, description: "Garden & patio items", color: "from-green-500 to-green-600" }
  };
  
  // Return specific visual data or fallback with generic styling
  return visuals[categoryName] || { 
    icon: Star, 
    description: `Explore ${categoryName.toLowerCase()}`, 
    color: "from-gray-500 to-gray-600" 
  };
};

const MobileMenu = ({
  isOpen,
  onClose,
  onAuthOpen,
  categories = [],
  megaMenuContent = {},
  isLoggedIn,
  user
}) => {
  const [currentView, setCurrentView] = useState('main');
  const [activeCategory, setActiveCategory] = useState(null);

  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const mainContentRef = useRef(null);
  const subContentRef = useRef(null);

  // --- Link Data (matching exactly with ProfileDropdown) ---
  const quickLinks = [
    { name: "New Arrivals", href: "/new", icon: Star },
    { name: "On Sale", href: "/sale", icon: Zap },
  ];
  
  // Main account links - exactly matching ProfileDropdown
  const mainAccountLinks = [
    { name: "Profile", href: "/account/profile", icon: User },
    { name: "Orders", href: "/account/orders", icon: Package },      // Using Package icon like ProfileDropdown
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  ];

  // Settings and Support links - exactly matching ProfileDropdown
  const settingsLinks = [
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
    { name: "Payment Methods", href: "/account/payment-methods", icon: CreditCard },
    { name: "Account Settings", href: "/account/settings", icon: Settings },
  ];
  
  const supportLinks = [
    { name: "Help/Support", href: "/help", icon: LifeBuoy }
  ];

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

  const slideToSubMenu = (category) => {
    const subMenuData = megaMenuContent[category.href];
    if (!subMenuData || !subMenuData.columns?.length) return;

    setActiveCategory({
      ...category,
      ...getCategoryVisuals(category.name),
      subMenu: subMenuData,
    });
    
    gsap.to(mainContentRef.current, { x: "-100%", duration: 0.4, ease: "power3.inOut" });
    gsap.fromTo(subContentRef.current, { x: "100%" }, { x: "0%", duration: 0.4, ease: "power3.out", onComplete: () => setCurrentView(category.name) });
  };

  const slideBackToMain = () => {
    gsap.to(subContentRef.current, { x: "100%", duration: 0.4, ease: "power3.inOut" });
    gsap.fromTo(mainContentRef.current, { x: "-100%" }, { x: "0%", duration: 0.4, ease: "power3.out", onComplete: () => setCurrentView('main') });
  };
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.4 });
      gsap.fromTo(menuRef.current, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.6, ease: "power3.out" });
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.3 });
    gsap.to(menuRef.current, {
      clipPath: "circle(0% at 100% 0%)",
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        document.body.style.overflow = 'auto';
        setCurrentView('main');
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div ref={overlayRef} className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={handleClose} style={{ visibility: 'hidden', opacity: 0 }} />
      <div ref={menuRef} className="absolute top-0 right-0 h-full w-full max-w-md bg-gray-100 shadow-2xl" style={{ clipPath: "circle(0% at 100% 0%)" }}>

        <div className="relative flex items-center justify-between p-4 border-b border-neutral-200/80 bg-white/80 backdrop-blur-sm">
          {currentView !== 'main' ? (
            <button onClick={slideBackToMain} className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors group">
              <ArrowLeft size={20} className="text-neutral-600" />
              <span className=" text-neutral-800">{activeCategory?.name}</span>
            </button>
          ) : (
            <Link to="/" onClick={handleClose} className="text-xl font-serif tracking-wider text-neutral-800">AROHA</Link>
          )}
          <button onClick={handleClose} className="p-3 rounded-full hover:bg-neutral-200/60 transition-colors group">
            <X size={18} className="text-neutral-600 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="relative h-[calc(100%-100px)] overflow-hidden z-99">
          {/* --- Main Menu View --- */}
          <div ref={mainContentRef} className="absolute inset-0 overflow-y-auto p-4 space-y-6">
            {/* Only show Collections section if categories exist */}
            {categories && categories.length > 0 && (
              <>
                <h3 className="px-2 text-sm text-neutral-600 uppercase tracking-wider">Collections</h3>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const visuals = getCategoryVisuals(category.name);
                    const hasSubMenu = megaMenuContent[category.href] && megaMenuContent[category.href].columns?.length > 0;

                    return (
                      <div key={category.name} className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center p-4">
                          <div className={`p-3 bg-gradient-to-br ${visuals.color} rounded-lg shadow-md mr-4`}>
                            <visuals.icon size={22} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-neutral-800 font-medium">{category.name}</h4>
                            <p className="text-xs text-neutral-500 mt-1">{visuals.description}</p>
                          </div>
                          {hasSubMenu ? (
                            <button 
                              onClick={() => slideToSubMenu(category)}
                              className="ml-3 p-2 rounded-full hover:bg-neutral-100 transition-colors group"
                            >
                              <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all duration-200" />
                            </button>
                          ) : (
                            <Link 
                              to={category.href} 
                              onClick={handleClose}
                              className="ml-3 p-2 rounded-full hover:bg-neutral-100 transition-colors group"
                            >
                              <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all duration-200" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <h3 className="px-2 text-sm text-neutral-600 uppercase tracking-wider pt-4">Quick Access</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.name} to={link.href} onClick={handleClose} className="group text-left p-4 bg-white rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="p-3 inline-block bg-neutral-100 rounded-lg mb-3"><link.icon size={22} className="text-neutral-600" /></div>
                  <h4 className=" text-neutral-800">{link.name}</h4>
                </Link>
              ))}
            </div>

            <div className="border-t border-neutral-200/80 pt-6">
              {isLoggedIn && user ? (
                <div className="space-y-4">
                  {/* Header section - exactly matching ProfileDropdown */}
                  <div className="p-3 bg-white rounded-xl border border-neutral-200/60 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className=" text-neutral-800 text-sm leading-tight">{user.name || "Valued Customer"}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email || "email@example.com"}</p>
                    </div>
                  </div>
                  
                  {/* Main account links - exactly matching ProfileDropdown */}
                  <div className="bg-white rounded-xl border border-neutral-200/60 p-1 space-y-1">
                    {mainAccountLinks.map((action) => (
                      <Link key={action.name} to={action.href} onClick={handleClose} className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
                        <action.icon size={16} />
                        <span>{action.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Settings and Support - exactly matching ProfileDropdown */}
                  <div className="bg-white rounded-xl border border-neutral-200/60 p-1 space-y-1">
                    {settingsLinks.map((action) => (
                      <Link key={action.name} to={action.href} onClick={handleClose} className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
                        <action.icon size={16} />
                        <span>{action.name}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Help and Logout - exactly matching ProfileDropdown */}
                  <div className="bg-white rounded-xl border border-neutral-200/60 p-1 space-y-1">
                    {supportLinks.map((action) => (
                      <Link key={action.name} to={action.href} onClick={handleClose} className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
                        <action.icon size={16} />
                        <span>{action.name}</span>
                      </Link>
                    ))}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { onAuthOpen(); handleClose(); }} className="w-full flex items-center justify-center gap-3 p-4 bg-neutral-800 text-white  rounded-xl hover:bg-neutral-700 transition-colors">
                  <User size={20} />
                  <span>Sign In or Create Account</span>
                </button>
              )}
            </div>
          </div>

          {/* --- Sub Menu View --- */}
          <div ref={subContentRef} className="absolute inset-0 overflow-y-auto" style={{ transform: 'translateX(100%)' }}>
            {activeCategory && (
                <div className="p-4 space-y-4 bg-gray-100 h-full">
                  <div className="text-center p-6 bg-white rounded-2xl">
                    <div className={`inline-flex p-5 bg-gradient-to-br ${activeCategory.color} rounded-2xl shadow-lg mb-4`}>
                      <activeCategory.icon size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl  text-neutral-800">{activeCategory.name}</h2>
                  </div>
                  
                  {activeCategory.subMenu.columns.map(column => (
                    <div key={column.title}>
                      <h3 className="px-4 pt-4 pb-2 text-sm  text-neutral-500 uppercase tracking-wider">{column.title}</h3>
                      <div className="space-y-1 bg-white rounded-xl border border-neutral-200/60">
                        {column.links.map((link, index) => (
                          <Link key={link.name} to={link.href} onClick={handleClose} className={`group flex items-center justify-between p-4 transition-all ${index < column.links.length - 1 ? 'border-b border-neutral-200/60' : ''}`}>
                            <span className=" text-neutral-700">{link.name}</span>
                            <ChevronRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  {activeCategory.subMenu.featured && (
                      <Link to={activeCategory.subMenu.featured.href} onClick={handleClose} className="block mt-4 p-4 rounded-lg bg-white shadow-lg border">
                          <img src={activeCategory.subMenu.featured.imageUrl} alt={activeCategory.subMenu.featured.title} className="w-full h-32 object-cover rounded-md mb-3" />
                          <h4 className=" text-neutral-800">{activeCategory.subMenu.featured.title}</h4>
                          <p className="text-sm text-neutral-600">{activeCategory.subMenu.featured.description}</p>
                      </Link>
                  )}
                  
                  <Link to={activeCategory.href} onClick={handleClose} className="flex items-center justify-center gap-2 w-full p-4 mt-4 bg-neutral-800 text-white  rounded-xl">
                      View All {activeCategory.name}
                      <ArrowRight size={18} />
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
