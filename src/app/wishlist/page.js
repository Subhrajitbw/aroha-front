'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Heart, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { items, isHydrated } = useWishlistStore();
  const [dimensions, setDimensions] = useState({ width: 1200 });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-stone-900 pb-32">
      {/* Cinematic Header */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1c1917 0%, transparent 70%)' }} />
        </div>
        
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="flex items-center gap-3 text-stone-400 uppercase tracking-[0.4em] text-[10px] font-bold">
              <Sparkles size={12} />
              <span>Curated Collection</span>
              <Sparkles size={12} />
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl xl:text-8xl tracking-tight text-stone-950 italic font-light">
              Your Sanctuary
            </h1>
            
            <p className="text-stone-500 font-light tracking-[0.1em] text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              A private archive of pieces that resonate with your space and spirit. Save your favorites for a future of refined living.
            </p>

            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-stone-100/50 border border-stone-200/50 backdrop-blur-sm text-stone-600 text-xs font-medium tracking-widest uppercase">
                {items.length} {items.length === 1 ? 'Piece' : 'Pieces'} Selected
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key="wishlist-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductGrid 
                products={items} 
                loading={false} 
                dimensions={dimensions} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="empty-wishlist"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center py-24 px-6 space-y-12 bg-white rounded-[2rem] border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] max-w-4xl mx-auto"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-stone-900/5 rounded-full blur-3xl animate-pulse" />
                <div className="relative p-10 rounded-full bg-stone-50 text-stone-200 border border-stone-100">
                  <Heart size={64} strokeWidth={0.5} className="text-stone-300" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-serif text-stone-900 italic">An Empty Canvas</h2>
                <p className="text-stone-500 max-w-sm mx-auto font-light leading-relaxed">
                  Your archive is currently empty. Explore our collections to find the objects that speak to your aesthetic.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Link 
                  href="/shop"
                  className="group flex items-center gap-3 px-10 py-5 bg-stone-950 text-white rounded-full text-xs uppercase tracking-[0.25em] font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95"
                >
                  Explore Atelier
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/shop?filter=newOnly"
                  className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-[0.25em] font-bold transition-colors py-2 px-4"
                >
                  New Arrivals
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
