'use client';

import { usePathname } from 'next/navigation';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import SearchModal from '../layout/SearchModal';
import AuthModal from '../auth/AuthModal';
import CustomCursor from '../ui/CustomCursor';
import { useSearchStore } from  '@/stores/searchStore';
import { useAuthModalStore } from  '@/stores/useAuthModalStore';

export default function ClientLayout({ children, isMobile, isNotDesktop }) {
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
      pathname.startsWith("/account")
    ) {
      return "light";
    }
    return "dark";
  };

  const shouldShowFooter = !["/", "/home", "/lookbook"].includes(pathname);
  // Frontpage uses full-screen fixed sections; it handles its own layout.
  // All other pages need a spacer so content doesn't hide under the fixed navbar.
  const needsNavSpacer = !["/", "/home", "/lookbook"].includes(pathname);

  return (
    <div className="app-container min-h-[100dvh] flex flex-col">
      <CustomCursor />
      <NavBar 
        variant={getNavBarVariant()} 
        isMobile={isMobile} 
        isNotDesktop={isNotDesktop} 
      />
      
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
      
      {/* Top Spacer: only for top-fixed nav on desktop/non-floating states */}
      {needsNavSpacer && !isNotDesktop && (
        <div 
          aria-hidden="true"
          style={{ height: 'var(--nav-height, 64px)' }} 
        />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {shouldShowFooter && <Footer />}
    </div>
  );
}
