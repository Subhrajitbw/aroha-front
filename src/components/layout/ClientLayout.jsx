'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NavBar from '../layout/NavBar';
import Footer from '../layout/Footer';
import SearchModal from '../layout/SearchModal';
import AuthModal from '../auth/AuthModal';
import BottomNavigation from '../layout/BottomNavigation';
import CustomCursor from '../ui/CustomCursor';
import { useSearchStore } from  '@/stores/searchStore';
import { useAuthModalStore } from  '@/stores/useAuthModalStore';
import { forceResetBodyScrollLock } from '@/hooks/useLockBodyScroll';
import { useNavStore } from '@/stores/useNavStore';
import { useWishlistStore } from '@/stores/useWishlistStore';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const { isOpen: isSearchOpen, close: closeSearch } = useSearchStore();
  const { isOpen: isAuthOpen, close: closeAuth } = useAuthModalStore();

  // Rehydrate Zustand persisted stores after mount to avoid SSR/client HTML mismatch (#418).
  // Both stores use skipHydration:true so the server and first client render both see the
  // initial empty state; localStorage data loads here, after hydration completes.
  useEffect(() => {
    useNavStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  // Safety net: nothing in this app is meant to land on a new page already
  // scroll-locked. If any modal/drawer's own cleanup ever missed releasing
  // the lock during a client-side navigation, this guarantees it can't
  // carry over to the next page — closing the gap where only a full
  // reload used to fix a stuck page.
  useEffect(() => {
    forceResetBodyScrollLock();
  }, [pathname]);

  const getNavBarVariant = () => {
    // Only Frontpage & lookbook have dark hero backgrounds — start with white text
    if (["/", "/home", "/lookbook"].includes(pathname)) {
      return "dark";
    }
    // All other pages (product, categories, shop, rooms, journal, account, wishlist, etc.) have light backgrounds
    return "light";
  };

  const shouldShowFooter = !["/", "/home", "/lookbook", "/categories"].includes(pathname);
  // Frontpage uses full-screen fixed sections; it handles its own layout.
  // All other pages need a spacer so content doesn't hide under the fixed navbar.
  // Shop page, category pages, and product pages bypass this spacer to work like the frontpage.
  const needsNavSpacer =
    !["/", "/home", "/lookbook", "/shop", "/categories"].includes(pathname) &&
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
