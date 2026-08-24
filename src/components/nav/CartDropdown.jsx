import React, { useEffect, useState } from "react";
import { ShoppingBag, X, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { sdk } from  "@/lib/medusaClient";
import { AnimatePresence, motion } from "framer-motion";

/**
 * CartDropdown — Clean mini-cart hover dropdown
 * Instant preview of shopping bag contents on hover.
 */
const CartDropdown = ({ isOpen, onClose, navigate }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);

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

  const updateQuantity = async (itemId, newQty) => {
    if (!cart || updatingItem) return;
    setUpdatingItem(itemId);
    try {
      if (newQty <= 0) {
        await sdk.store.cart.deleteLineItem(cart.id, itemId);
      } else {
        await sdk.store.cart.updateLineItem(cart.id, itemId, { quantity: newQty });
      }
      await fetchCart();
    } catch (err) {
      console.error("Failed to update item:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full pt-3 w-[360px] z-[60]"
        >
          <div className="bg-white border border-stone-200 rounded-2xl shadow-lg shadow-stone-900/5 overflow-hidden flex flex-col max-h-[70vh]">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} strokeWidth={1.5} className="text-stone-900" />
                <span className="text-sm font-semibold text-stone-900">Shopping Bag</span>
              </div>
              {cart?.items?.length > 0 && (
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Loading…</span>
                </div>
              ) : isEmpty ? (
                <div className="py-16 px-8 text-center flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                    <ShoppingBag size={22} className="text-stone-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-stone-900">Your bag is empty</p>
                    <p className="text-[11px] text-stone-500 leading-relaxed">Discover our collections and find something special.</p>
                  </div>
                  <button 
                    onClick={() => { onClose(); navigate('/shop'); }}
                    className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-stone-900 hover:text-stone-600 transition-colors"
                  >
                    Start Shopping <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {cart.items.map((item) => (
                    <div key={item.id} className="px-5 py-4 flex gap-3.5 hover:bg-stone-50/50 transition-colors group">
                      <div className="w-16 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200/50">
                        <img 
                          src={item.thumbnail || item.variant?.product?.thumbnail || "/placeholder.jpg"} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-semibold text-stone-900 truncate pr-1">{item.title}</h4>
                            <button 
                              onClick={() => updateQuantity(item.id, 0)} 
                              disabled={updatingItem === item.id}
                              className="text-stone-300 hover:text-red-500 transition-colors shrink-0 p-0.5 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[10px] text-stone-500 truncate uppercase tracking-wider mt-0.5">
                            {item.variant?.title || 'Default'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-0 bg-stone-100 rounded-lg border border-stone-200/80">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              disabled={updatingItem === item.id}
                              className="text-stone-500 hover:text-stone-900 transition-colors p-1.5 disabled:opacity-40"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-[11px] font-semibold text-stone-900 w-6 text-center">
                              {updatingItem === item.id ? "…" : item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              disabled={updatingItem === item.id}
                              className="text-stone-500 hover:text-stone-900 transition-colors p-1.5 disabled:opacity-40"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-xs font-semibold text-stone-900">
                            {formatPrice(item.unit_price * item.quantity, cart.currency_code)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && cart && (
              <div className="p-5 bg-stone-50 border-t border-stone-100 space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Subtotal</span>
                  <span className="text-lg font-serif text-stone-900">{formatPrice(cart.total, cart.currency_code)}</span>
                </div>
                
                <button 
                  onClick={() => { onClose(); navigate('/cart'); }}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl flex items-center justify-center gap-2.5 hover:bg-stone-800 transition-all active:scale-[0.98] shadow-md group"
                >
                  <span className="text-xs uppercase tracking-widest font-bold">View Cart & Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                
                <p className="text-[10px] text-center text-stone-400">Free delivery on orders above ₹25,000</p>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDropdown;
