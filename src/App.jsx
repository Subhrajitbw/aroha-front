import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
  Navigate,
} from "react-router-dom";
import useDevice from "./hooks/useDevice";
import { useSite } from "./context/SiteContext";

// ✅ Pages
import Frontpage from "./pages/Frontpage";
import Rooms from "./pages/shop/Rooms";
import ProductCatelog from "./pages/shop/ProductCatelog";
import ShopSingle from "./pages/shop/ShopSingle";
import Lookbook from "./pages/shop/Lookbook";
import Contact from "./pages/Contact";
import Journal from "./pages/Journal";
import ProductPage from "./pages/shop/ProductSingle";
import Account from "./pages/account/Account";

// ✅ Legal Pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfUse from "./pages/legal/TermsOfUse";
import ReturnRefundPolicy from "./pages/legal/Refund";
import ShippingPolicy from "./pages/legal/Shipping";

// ✅ Components
import NavBar from "./components/layout/NavBar";
import AuthModal from "./components/auth/AuthModal";
import SearchModal from "./components/layout/SearchModal";
import Footer from "./components/layout/Footer";
import OAuthRelay from "./components/auth/OAuthRelay";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import FloatingEnquiry from "./components/layout/FloatingEnquiry";
import CustomCursor from "./components/ui/CustomCursor";

// ✅ Store
import { useSearchStore } from "./stores/searchStore";
import { useAuthModalStore } from "./stores/useAuthModalStore";
import { useAuthStore } from "./stores/useAuthStore";

// ✅ Loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
  </div>
);

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  const { siteSettings } = useSite();

  const {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isNotDesktop,
    isNotMobile,
    screenWidth,
    deviceType,
  } = useDevice();

  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } =
    useSearchStore();
  const { isOpen: isAuthOpen, open: openAuth, close: closeAuth } =
    useAuthModalStore();
  const {
    initializeAuth,
    isInitialized,
    isLoading: authLoading,
  } = useAuthStore();

  // ---------------- AUTH INIT ----------------
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // ---------------- SCROLL RESET ----------------
  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  // ---------------- GLOBAL SEO (CMS DRIVEN) ----------------
  useEffect(() => {
    if (!siteSettings) return;

    let pageTitle = siteSettings.defaultTitle || "Aroha";
    let metaDescription =
      siteSettings.defaultDescription || "Premium furniture by Aroha House.";

    switch (pathname) {
      case "/":
      case "/home":
        pageTitle = "Home";
        break;
      case "/rooms":
        pageTitle = "Rooms";
        break;
      case "/shop":
        pageTitle = "Shop";
        break;
      case "/lookbook":
        pageTitle = "Lookbook";
        break;
      case "/faq":
        pageTitle = "FAQ";
        break;
      case "/contact":
        pageTitle = "Contact";
        break;
      case "/journal":
        pageTitle = "Journal";
        break;
      case "/account":
        pageTitle = "Account";
        break;
      default:
        pageTitle = siteSettings.defaultTitle;
    }

    const finalTitle = siteSettings.titleTemplate
      ? siteSettings.titleTemplate.replace("%s", pageTitle)
      : pageTitle;

    document.title = finalTitle;

    // Description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "description");
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute("content", metaDescription);

    // Robots
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.setAttribute("name", "robots");
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute(
      "content",
      siteSettings.enableIndexing ? "index,follow" : "noindex,nofollow"
    );
  }, [pathname, siteSettings]);

  // ---------------- FAVICON ----------------
  useEffect(() => {
    if (!siteSettings?.favicon?.asset?.url) return;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = siteSettings.favicon.asset.url;
  }, [siteSettings]);

  useEffect(() => {
    if (!siteSettings || !siteSettings.brandName) return;

    const existingScript = document.getElementById("organization-jsonld");
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteSettings.brandName,
      url: siteSettings.baseUrl,
      logo: siteSettings.logo?.asset?.url,
      sameAs: Object.values(siteSettings.socialLinks || {}).filter(Boolean),
      contactPoint: siteSettings.contactPhone
        ? [
          {
            "@type": "ContactPoint",
            telephone: siteSettings.contactPhone,
            contactType: "customer support",
            email: siteSettings.contactEmail || undefined,
          },
        ]
        : undefined,
      address: siteSettings.address
        ? {
          "@type": "PostalAddress",
          streetAddress: siteSettings.address,
          addressCountry: "IN",
        }
        : undefined,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "organization-jsonld";
    script.innerHTML = JSON.stringify(structuredData);

    document.head.appendChild(script);

  }, [siteSettings]);

  // ---------------- ROUTE CONFIG ----------------
  const getNavBarVariant = () => {
    if (["/", "/home", "/lookbook"].includes(pathname) || pathname.startsWith("/shop")) {
      return "light";
    }
    return "dark";
  };

  const shouldShowFooter = !["/", "/home", "/lookbook"].includes(pathname);

  if (!isInitialized || authLoading) return <LoadingSpinner />;

  return (
    <div className={`app-container device-${deviceType}`}>
      <CustomCursor />
      <NavBar
        variant={getNavBarVariant()}
        onSearchClick={openSearch}
        onAuthClick={openAuth}
        isMobile={isMobile}
        isTablet={isTablet}
        isDesktop={isDesktop}
        isMobileOrTablet={isMobileOrTablet}
        isNotDesktop={isNotDesktop}
        isNotMobile={isNotMobile}
        screenWidth={screenWidth}
        deviceType={deviceType}
      />

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />

      <main>
        <Routes>
          <Route path="/" element={<Frontpage />} />
          <Route path="/home" element={<Frontpage />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomLabel" element={<Rooms />} />
          <Route path="/shop" element={<ProductCatelog />} />
          <Route path="/shop/category/:categoryHandle" element={<ProductCatelog />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/product/:slug" element={<ShopSingle />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="/blogs/:handle" element={<Journal />} />
          <Route path="/account/*" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/return-and-refund-policy" element={<ReturnRefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/oauth/callback" element={<OAuthRelay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* <FloatingEnquiry /> */}
      </main>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;