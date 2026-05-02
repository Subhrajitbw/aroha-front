'use client';

import React, { useState, useEffect } from "react";
import { useAuthStore } from  "@/stores/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { sdk } from  "@/lib/medusaClient";
import { User, Package, Map, Settings, LogOut, Edit2, Plus, Trash2, X, ChevronRight, Navigation, Home, Briefcase, CheckCircle2, XCircle, Clock, Truck, ArrowRight, ShieldCheck, Headset, CreditCard, MapPin } from "lucide-react";

const AccountClient = () => {
  const { user, logout, updateUser, manageAddress, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerMode, setDrawerMode] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { orders: fetchedOrders } = await sdk.store.order.list({ limit: 20, fields: "+items,+items.variant,+items.variant.product,+shipping_address" });
      setOrders(fetchedOrders || []);
    } catch (err) { console.warn(err); }
    finally { setOrdersLoading(false); }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    router.push(`/account?tab=${tabId}`);
  };

  if (!user && !authLoading) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-12 pb-24 px-12 font-sans">
      <div className="max-w-6xl mx-auto flex gap-16">
        <aside className="w-72 shrink-0 space-y-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="font-semibold">{user?.first_name} {user?.last_name}</h2>
            <p className="text-xs text-stone-500">{user?.email}</p>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { id: "overview", label: "Profile", icon: User },
              { id: "orders", label: "Orders", icon: Package },
              { id: "addresses", label: "Addresses", icon: Map },
              { id: "settings", label: "Settings", icon: Settings },
            ].map(item => (
              <button key={item.id} onClick={() => switchTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                <item.icon size={16} /> {item.label}
              </button>
            ))}
          </nav>
          <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-stone-500 hover:text-red-600 px-4">
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        <main className="flex-1">
          {activeTab === "overview" && (
            <section className="space-y-6">
              <h1 className="text-3xl font-serif">Profile</h1>
              <div className="bg-white border border-stone-200 rounded-2xl divide-y">
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">Full Name</p>
                  <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                </div>
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">Email Address</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === "orders" && (
            <section className="space-y-6">
              <h1 className="text-3xl font-serif">Order History</h1>
              {ordersLoading ? <div className="animate-pulse h-40 bg-stone-200 rounded-2xl" /> : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-6">
                      <div className="flex justify-between mb-4">
                        <span className="text-xs font-mono">#{order.display_id}</span>
                        <span className="text-xs uppercase tracking-widest">{order.status}</span>
                      </div>
                      <p className="text-sm font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: order.currency_code }).format(order.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountClient;
