// src/components/layout/BottomNavigation.jsx
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Heart, User, ShoppingCart } from "lucide-react";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { sdk } from "@/lib/medusaClient";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { items: wishlistItems, isHydrated: wishlistHydrated } = useWishlistStore();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const currentSection = useMenuStore((state) => state.currentSection);
  const [localScrolled, setLocalScrolled] = useState(false);

  // Synchronized scroll tracking for both standard page scroll and frontpage section transitions
  useEffect(() => {
    const handleScroll = () => {
      setLocalScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isVisible = localScrolled || currentSection > 0;

  // Sync cart item count on mount and route changes
  useEffect(() => {
    initializeAuth();
    const fetchCartStatus = async () => {
      const cartId = localStorage.getItem("cart_id");
      if (cartId) {
        try {
          const { cart } = await sdk.store.cart.retrieve(cartId);
          setCartItemCount(cart.items?.length || 0);
        } catch (e) {
          console.error("BottomNav cart fetch error:", e);
        }
      }
    };
    fetchCartStatus();
  }, [pathname, initializeAuth]);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      path: "/shop",
      isActive: pathname.startsWith("/shop"),
    },
    {
      label: "Wishlist",
      icon: Heart,
      path: "/wishlist",
      isActive: pathname === "/wishlist",
      badge: wishlistHydrated && wishlistItems.length > 0 ? wishlistItems.length : null,
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      path: "/cart",
      isActive: pathname === "/cart",
      badge: cartItemCount > 0 ? cartItemCount : null,
    },
    {
      label: "Account",
      icon: User,
      path: "/account",
      isActive: pathname.startsWith("/account"),
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="
            fixed bottom-0 left-0 right-0 z-50 lg:hidden
            bg-white/95 backdrop-blur-2xl border-t border-black/5
            shadow-[0_-8px_30px_rgba(0,0,0,0.03)]
            pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-3.5 px-6
          "
          style={{ willChange: "transform" }}
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className="relative flex flex-col items-center gap-1 min-w-[50px] py-1 text-center group"
                >
                  <div className="relative">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`
                        transition-colors duration-300 p-1.5 rounded-2xl
                        ${item.isActive 
                          ? "text-neutral-900 bg-neutral-900/5" 
                          : "text-neutral-400 group-hover:text-neutral-600"
                        }
                      `}
                    >
                      <Icon 
                        size={20} 
                        strokeWidth={item.isActive ? 2 : 1.5} 
                        className={`transition-all duration-300 ${item.isActive && item.label === "Wishlist" ? "fill-neutral-900" : ""}`}
                      />
                    </motion.div>

                    {/* dynamic notification badge */}
                    {item.badge !== null && item.badge !== undefined && (
                      <span 
                        className="
                          absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 
                          flex items-center justify-center rounded-full text-[9px] font-bold
                          bg-neutral-900 text-white border border-white shadow-sm
                        "
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* label */}
                  <span 
                    className={`
                      text-[9px] tracking-widest uppercase font-medium transition-colors duration-300
                      ${item.isActive ? "text-neutral-900" : "text-neutral-400"}
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator dot */}
                  {item.isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-neutral-900"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
