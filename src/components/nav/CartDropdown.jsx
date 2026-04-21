import React, { useEffect, useState } from "react";
import { ShoppingBag, X, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { sdk } from "../../lib/medusaClient";

/**
 * CartDropdown - Luxury mini-cart preview
 * Provides instant feedback on shopping bag contents.
 */
const CartDropdown = ({ isOpen, onClose, navigate }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      setLoading(false);
      return;
    }
    try {
      const { cart: retrievedCart } = await sdk.store.cart.retrieve(cartId, {
        fields: "+items,+items.variant,+items.variant.product"
      });
      setCart(retrievedCart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="absolute right-0 top-full pt-4 w-96 transform animate-in fade-in slide-in-from-top-2 duration-300 z-[60]">
      <div className="bg-white/95 backdrop-blur-2xl border border-zinc-200/60 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[70vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-zinc-900" />
            <span className="text-sm font-serif font-medium text-zinc-900">Shopping Bag</span>
          </div>
          {cart?.items?.length > 0 && (
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
              {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Updating Bag...</span>
            </div>
          ) : isEmpty ? (
            <div className="py-20 px-10 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center">
                <ShoppingBag size={24} className="text-zinc-200" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-serif text-zinc-900">Your bag is empty</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">Discover our artisanal collections and find something exceptional.</p>
              </div>
              <button 
                onClick={() => { onClose(); navigate('/shop'); }}
                className="mt-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-900 border-b border-zinc-900 pb-1 hover:opacity-60 transition-opacity"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {cart.items.map((item) => (
                <div key={item.id} className="p-6 flex gap-4 hover:bg-zinc-50/50 transition-colors group">
                  <div className="w-20 h-24 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 border border-zinc-200/50">
                    <img 
                      src={item.thumbnail || item.variant?.product?.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-serif text-zinc-900 truncate pr-2">{item.title}</h4>
                        <span className="text-xs font-medium text-zinc-900 shrink-0">
                          {formatPrice(item.unit_price, cart.currency_code)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate uppercase tracking-wider">
                        {item.variant?.title || 'Default Variant'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 px-2 py-1 bg-zinc-100 rounded-full">
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Minus size={12} /></button>
                        <span className="text-[11px] font-medium text-zinc-900 w-4 text-center">{item.quantity}</span>
                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Plus size={12} /></button>
                      </div>
                      <button className="text-zinc-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && cart && (
          <div className="p-8 bg-zinc-50/80 border-t border-zinc-100 space-y-6">
            <div className="flex items-center justify-between text-zinc-900">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">Total</span>
              <span className="text-xl font-serif">{formatPrice(cart.total, cart.currency_code)}</span>
            </div>
            
            <button 
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="w-full bg-zinc-950 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl group"
            >
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Secure Checkout</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-[10px] text-center text-zinc-400">Complimentary delivery on orders above ₹25,000</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDropdown;
