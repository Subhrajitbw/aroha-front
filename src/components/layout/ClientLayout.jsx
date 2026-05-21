'use client';

import { usePathname } from 'next/navigation';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import SearchModal from '../layout/SearchModal';
import AuthModal from '../auth/AuthModal';
import BottomNavigation from '../layout/BottomNavigation';
import CustomCursor from '../ui/CustomCursor';
import { useSearchStore } from  '@/stores/searchStore';
import { useAuthModalStore } from  '@/stores/useAuthModalStore';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const { isOpen: isSearchOpen, close: closeSearch } = useSearchStore();
  const { isOpen: isAuthOpen, close: closeAuth } = useAuthModalStore();

  const getNavBarVariant = () => {
    // Frontpage & lookbook have dark hero backgrounds — start with white text
    if (["/", "/home", "/lookbook"].includes(pathname)) {
      return "dark";
    }
    // Shop & account have light backgrounds — start with dark text
    if (
      pathname.startsWith("/shop") ||
      pathname.startsWith("/account") ||
      pathname === "/wishlist"
    ) {
      return "light";
    }
    return "dark";
  };

  const shouldShowFooter = !["/", "/home", "/lookbook"].includes(pathname);
  // Frontpage uses full-screen fixed sections; it handles its own layout.
  // All other pages need a spacer so content doesn't hide under the fixed navbar.
  // Shop page, category pages, and product pages bypass this spacer to work like the frontpage.
  const needsNavSpacer = 
    !["/", "/home", "/lookbook", "/shop"].includes(pathname) && 
    !pathname.startsWith("/product/") &&
    !pathname.startsWith("/product-categories/");

  return (
    <div className="app-container min-h-[100dvh] flex flex-col">
      <CustomCursor />
      <NavBar 
        variant={getNavBarVariant()} 
      />
      <BottomNavigation />
      
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
      
      {/* Top Spacer: pushes content below fixed nav (desktop only) */}
      {needsNavSpacer && (
        <div
          className="hidden lg:block"
          aria-hidden="true"
          style={{ height: 'var(--nav-height, 48px)' }}
        />
      )}
      
      <main className="flex-1 pb-[calc(72px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </main>
      
      {shouldShowFooter && <Footer />}
    </div>
  );
}
