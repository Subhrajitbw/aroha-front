import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
  Navigate,
} from "react-router-dom";
import useDevice from "./hooks/useDevice";

// ✅ Pages
import Frontpage from "./pages/Frontpage";
import Rooms from "./pages/Rooms";
import ProductCatelog from "./pages/ProductCatelog";
import ShopSingle from "./pages/ShopSingle";
import ShopSingleDetails from "./pages/ShopSingleDetails";
import Lookbook from "./pages/Lookbook";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Journal from "./pages/Journal";
import ProductPage from "./pages/ProductSingle";
import RoomSingle1 from "./pages/RoomSingle1";
import RoomSingle2 from "./pages/RoomSingle2";
import RoomSingle3 from "./pages/RoomSingle3";
import RoomSingle4 from "./pages/RoomSingle4";
import Account from "./pages/Account";

// ✅ Legal / Policy Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import ReturnRefundPolicy from "./pages/Refund";
import ShippingPolicy from "./pages/Shipping";

// ✅ Components
import NavBar from "./components/NavBar";
import AuthModal from "./components/AuthModal";
import SearchModal from "./components/SearchModal";
import Footer from "./components/Footer";

// ✅ Store
import { useSearchStore } from "./stores/searchStore";
import { useAuthModalStore } from "./stores/useAuthModalStore";
import { useAuthStore } from "./stores/useAuthStore";
import OAuthRelay from "./components/OAuthRelay";
import ProtectedRoute from "./components/protectedroute";
import SimpleWorldlinePayment from "./pages/SImpleWorldLinePayment";
import BlogPost from "./pages/BlogPost";

// ✅ Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
      <p className="text-stone-600 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// Helper function to check if refresh token exists (httpOnly cookie)
const hasRefreshToken = async () => {
  if (typeof document === 'undefined') return false;
  
  try {
    // Try to make a simple request that would use the refresh token
    const response = await fetch('/api/auth/check-refresh', {
      method: 'HEAD', // Use HEAD to avoid response body
      credentials: 'include',
    });
    
    // If we get any response (even 401), it means the server received our cookies
    // We'll let the auth store handle the actual validation
    return response.status !== 404; // 404 would mean no endpoint, so no auth system
  } catch (error) {
    // If there's a network error or the endpoint doesn't exist, check for any auth-related cookies
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => 
      cookie.trim().startsWith('refreshToken=') || 
      cookie.trim().startsWith('refresh_token=') ||
      cookie.trim().startsWith('jwt=')
    );
  }
};

// Alternative: Check for stored access token
const hasStoredToken = () => {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage (development)
  const localStorageToken = localStorage.getItem('accessToken');
  if (localStorageToken) return true;
  
  // Check cookies (production)
  const cookies = document.cookie.split(';');
  const hasAccessToken = cookies.some(cookie => 
    cookie.trim().startsWith('accessToken=')
  );
  
  return hasAccessToken;
};

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  // Device Detection Hook
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isMobileOrTablet, 
    isNotDesktop, 
    isNotMobile, 
    screenWidth, 
    deviceType 
  } = useDevice();

  // Store hooks
  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchStore();
  const { isOpen: isAuthOpen, open: openAuth, close: closeAuth } = useAuthModalStore();
  const { initializeAuth, isInitialized, isLoading: authLoading, setInitialized, getCurrentUser, skipInitialization } = useAuthStore();

  // ✅ Initialize authentication only if tokens exist
 // In App.jsx - FIXED VERSION
useEffect(() => {
  const initAuth = async () => {
    console.log('🔍 Checking for existing authentication...');
    
    // Check for stored access token first (synchronous, fast)
    const hasStored = hasStoredToken();
    console.log('📄 Stored access token:', hasStored ? 'Found' : 'Not found');
    
    if (hasStored) {
      console.log('✅ Stored token found, initializing auth...');
      await initializeAuth();
      return;
    }
    
    // If no stored token, make ONE refresh attempt
    console.log('🔍 No stored token, checking refresh token...');
    const refreshResult = await hasRefreshToken(); // Direct call, not initializeAuth
    
    if (refreshResult.success) {
      console.log('✅ Refresh token worked');
      await getCurrentUser(); // Get user info
      setInitialized(true);
    } else {
      console.log('❌ No valid authentication found');
      skipInitialization();
    }
  };

  initAuth();
}, [initializeAuth, hasRefreshToken, getCurrentUser, skipInitialization, setInitialized]);

  // 🔹 Determine NavBar variant based on route
  const getNavBarVariant = () => {
    const homeRoutes = ["/", "/home"];
    return homeRoutes.includes(pathname) ? "light" : "dark";
  };

  // 🔹 Hide footer on homepage routes
  const shouldShowFooter = !["/", "/home", "/lookbook"].includes(pathname);

  // 🔹 Scroll to top on route change (except POP/back navigation)
  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  // 🔹 Dynamic Page Titles + Meta Description with device awareness
  useEffect(() => {
    let title = "Aroha";
    let metaDescription = "";

    switch (pathname) {
      case "/":
      case "/home":
        title = "Aroha — Home";
        metaDescription = `Discover elegant home decor at Aroha. Optimized for ${deviceType} viewing.`;
        break;
      case "/rooms":
        title = "Rooms | Aroha";
        metaDescription = `Browse our stunning room collections, perfectly displayed on ${deviceType}.`;
        break;
      case "/shop":
        title = "Shop | Aroha";
        metaDescription = `Shop premium home decor items with seamless ${deviceType} experience.`;
        break;
      case "/lookbook":
        title = "Lookbook | Aroha";
        metaDescription = `Explore our curated lookbook collection on ${deviceType}.`;
        break;
      case "/faq":
        title = "FAQ | Aroha";
        metaDescription = `Find answers to frequently asked questions, ${deviceType} optimized.`;
        break;
      case "/contact":
        title = "Contact | Aroha";
        metaDescription = `Get in touch with us through our ${deviceType} friendly contact page.`;
        break;
      case "/journal":
        title = "Journal | Aroha";
        metaDescription = `Read our latest articles and insights, formatted for ${deviceType}.`;
        break;
      case "/account":
        title = "Your Account | Aroha";
        metaDescription = `Manage your account settings and preferences on ${deviceType}.`;
        break;
      default:
        title = "Aroha";
        metaDescription = `Premium home decor and lifestyle products at Aroha, optimized for ${deviceType}.`;
    }

    document.title = title;

    // Update meta description
    let metaTag = document.querySelector('head > meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', metaDescription);

    // Ensure viewport meta tag exists for responsive design
    let viewportTag = document.querySelector('head > meta[name="viewport"]');
    if (!viewportTag) {
      viewportTag = document.createElement('meta');
      viewportTag.setAttribute('name', 'viewport');
      viewportTag.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      document.head.appendChild(viewportTag);
    }
  }, [pathname, deviceType]);

  // 🔹 Add device-specific classes to body for CSS targeting
  useEffect(() => {
    const body = document.body;
    
    // Remove existing device classes
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    
    // Add current device class
    body.classList.add(`device-${deviceType}`);
    
    // Add screen width class for additional targeting
    if (isMobile) {
      body.classList.add('screen-small');
      body.classList.remove('screen-medium', 'screen-large');
    } else if (isTablet) {
      body.classList.add('screen-medium');
      body.classList.remove('screen-small', 'screen-large');
    } else {
      body.classList.add('screen-large');
      body.classList.remove('screen-small', 'screen-medium');
    }

    // Cleanup on unmount
    return () => {
      body.classList.remove(
        'device-mobile', 'device-tablet', 'device-desktop',
        'screen-small', 'screen-medium', 'screen-large'
      );
    };
  }, [deviceType, isMobile, isTablet]);

  // 🔹 Performance optimization: Preload routes based on device type
  useEffect(() => {
    if (isDesktop) {
      // Preload important routes for desktop users (better bandwidth)
      const preloadRoutes = ['/shop', '/rooms', '/lookbook'];
      preloadRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }, [isDesktop]);

  // ✅ Show loading screen while auth initializes
  if (!isInitialized || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`app-container device-${deviceType}`}>
      {/* ---------------- Global NavBar with Device Detection ---------------- */}
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
      
      {/* ---------------- Global Modals with Device Awareness ---------------- */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={closeSearch}
        isMobile={isMobile}
        deviceType={deviceType}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={closeAuth}
        isMobile={isMobile}
        deviceType={deviceType}
      />

      {/* ---------------- Main Content Area ---------------- */}
      <main className="main-content">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Frontpage deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/home" element={<Frontpage deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/rooms" element={<Rooms deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/shop" element={<ProductCatelog deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/shop/category/:categoryId" element={<ProductCatelog />} />
          <Route path="/lookbook" element={<Lookbook deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/faq" element={<FAQ deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/contact" element={<Contact deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/test-pay" element={<SimpleWorldlinePayment />} />
          <Route path="/lookbook" element={<Lookbook/>}/>
          {/* Protected Account Route */}
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account/*" 
            element={
              <ProtectedRoute>
                <Account deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />
              </ProtectedRoute>
            } 
          />

          {/* Product / Shop Pages */}
          <Route path="/product/:slug" element={<ShopSingle deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/product/*" element={<Navigate to="/shop" />} />
          <Route
            path="/shop-single-details/:slug"
            element={<ShopSingleDetails deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />}
          />

          {/* Journal Pages */}
          <Route path="/blogs" element={<Journal deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/blogs/:handle" element={<BlogPost deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />

          {/* Room Pages */}
          <Route path="/products/:handle"  element={<ProductPage deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/room-single1" element={<RoomSingle1 deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/room-single2" element={<RoomSingle2 deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/room-single3" element={<RoomSingle3 deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/room-single4" element={<RoomSingle4 deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />

          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route path="/terms-of-use" element={<TermsOfUse deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          <Route
            path="/return-and-refund-policy"
            element={<ReturnRefundPolicy deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />}
          />
          <Route path="/shipping-policy" element={<ShippingPolicy deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }} />} />
          
          {/* OAuth Callback */}
          <Route path="/oauth/callback" element={<OAuthRelay />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ---------------- Global Footer with Device Awareness ---------------- */}
      {shouldShowFooter && (
        <Footer 
          deviceInfo={{ isMobile, isTablet, isDesktop, deviceType, screenWidth }}
        />
      )}
    </div>
  );
}

export default App;
