import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";
import { sdk } from "../../lib/medusaClient";
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  X,
  ChevronRight,
  Edit2,
  ShieldCheck,
  Bell,
  CreditCard,
  Navigation,
  Briefcase,
  Home,
  Headset,
  Map,
  Eye,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";

/**
 * Account Page — Premium E-commerce Account Dashboard
 * Features: Profile, Order History (live from Medusa), Addresses, Settings
 */
const Account = () => {
  const { user, logout, updateUser, manageAddress, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerMode, setDrawerMode] = useState(null); 
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [addressForm, setAddressForm] = useState({
    first_name: "", last_name: "", phone: "", address_1: "", address_2: "", city: "", postal_code: "", country_code: "in", province: "", company: "Home"
  });

  // Sync tab from URL params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "orders", "addresses", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        first_name: user.first_name || "", 
        last_name: user.last_name || "", 
        phone: user.phone || "" 
      });
    }
  }, [user]);

  // Fetch orders when orders tab is activated
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { orders: fetchedOrders } = await sdk.store.order.list({
        limit: 20,
        offset: 0,
        fields: "+items,+items.variant,+items.variant.product,+shipping_address",
      });
      setOrders(fetchedOrders || []);
    } catch (err) {
      console.warn("Could not fetch orders:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useLockBodyScroll(!!drawerMode);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
        const data = await res.json();
        const addr = data.address;
        setAddressForm(prev => ({
          ...prev,
          city: addr.city || addr.town || addr.village || "",
          province: addr.state || "",
          postal_code: addr.postcode || "",
          address_2: addr.suburb || addr.neighbourhood || ""
        }));
      } catch (err) { console.error("Location failed", err); }
    });
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    const res = await updateUser(profileForm);
    if (res.success) setDrawerMode(null);
  };

  const onManageAddress = async (e) => {
    e.preventDefault();
    const action = drawerMode === 'add-address' ? 'add' : 'update';
    const res = await manageAddress(action, selectedAddress?.id, addressForm);
    if (res.success) { setDrawerMode(null); setSelectedAddress(null); }
  };

  const onDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you wish to permanently remove this address?")) {
      await manageAddress('delete', id);
    }
  };

  const openEditAddress = (addr) => {
    setSelectedAddress(addr);
    setAddressForm({
      first_name: addr.first_name, last_name: addr.last_name, phone: addr.phone || "",
      address_1: addr.address_1, address_2: addr.address_2 || "", city: addr.city,
      postal_code: addr.postal_code, country_code: addr.country_code, province: addr.province || "", company: addr.company || "Home"
    });
    setDrawerMode('edit-address');
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: currency?.toUpperCase() || 'INR', minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const map = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      archived: "bg-stone-100 text-stone-600 border-stone-200",
      canceled: "bg-red-50 text-red-600 border-red-200",
      requires_action: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return map[status] || "bg-stone-100 text-stone-600 border-stone-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={12} />;
      case 'canceled': return <XCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      default: return <Truck size={12} />;
    }
  };

  const TABS = [
    { id: "overview", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: Map },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const SettingTile = ({ icon: Icon, title, desc, onClick }) => (
    <button onClick={onClick} className="group relative overflow-hidden bg-white border border-stone-200 p-6 sm:p-8 rounded-2xl flex items-start gap-5 text-left hover:border-stone-300 transition-all duration-300 hover:shadow-md">
      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300 shrink-0">
         <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
         <h4 className="text-sm font-semibold text-stone-900 mb-1">{title}</h4>
         <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0 mt-1" />
    </button>
  );

  const InputField = ({ label, value, onChange, type = "text", required = false, placeholder = "" }) => (
    <div className="space-y-1.5">
      <label className="block text-[11px] text-stone-600 font-semibold uppercase tracking-[0.1em]">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-400 transition-all placeholder-stone-400 shadow-sm" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pt-24 lg:pt-36 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-stone-200 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* ─── SIDEBAR ─── */}
        <aside className="lg:w-72 shrink-0 space-y-8">
          {/* User info card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-sm font-serif text-white border-2 border-stone-200">
                  {(user?.first_name?.[0] || "")}{(user?.last_name?.[0] || "")}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-stone-900 truncate">{user?.first_name} {user?.last_name}</h2>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map(item => (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                  activeTab === item.id 
                    ? "bg-stone-900 text-white shadow-md" 
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <item.icon size={16} strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:block pt-6 border-t border-stone-200">
            <button onClick={handleLogout} className="group flex items-center gap-3 text-sm font-medium text-stone-500 hover:text-red-600 transition-colors px-4">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 min-w-0">
          
          {/* PROFILE TAB */}
          {activeTab === "overview" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Profile</h1>
                  <p className="text-sm text-stone-500 mt-1">Manage your personal information.</p>
                </div>
                <button onClick={() => setDrawerMode('edit-profile')} className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-sm">
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
                {[
                  { label: "Full Name", value: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "—", icon: User },
                  { label: "Email Address", value: user?.email || "—", icon: ShieldCheck },
                  { label: "Phone Number", value: user?.phone || "Not provided", icon: Headset },
                  { label: "Account ID", value: user?.id?.slice(-12) || "—", icon: CreditCard, mono: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-5">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                      <item.icon size={16} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-stone-500 font-medium uppercase tracking-wider">{item.label}</p>
                      <p className={`text-sm text-stone-900 font-medium mt-0.5 truncate ${item.mono ? "font-mono text-xs" : ""}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Orders", icon: Package, tab: "orders" },
                  { label: "Addresses", icon: MapPin, tab: "addresses" },
                  { label: "Settings", icon: Settings, tab: "settings" },
                ].map((item) => (
                  <button key={item.tab} onClick={() => switchTab(item.tab)} className="bg-white border border-stone-200 rounded-xl px-4 py-4 flex items-center gap-3 text-sm font-medium text-stone-700 hover:border-stone-300 hover:shadow-sm transition-all">
                    <item.icon size={16} strokeWidth={1.5} className="text-stone-400" />
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Order History</h1>
                <p className="text-sm text-stone-500 mt-1">Track and manage your recent purchases.</p>
              </div>

              {ordersLoading ? (
                <div className="bg-white border border-stone-200 rounded-2xl flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                    <span className="text-xs text-stone-500 font-medium uppercase tracking-wider">Loading orders…</span>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
                    <Package size={32} strokeWidth={1} className="text-stone-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">No orders yet</h3>
                  <p className="text-sm text-stone-500 max-w-xs mb-6">Your order history will appear here once you make your first purchase.</p>
                  <button onClick={() => navigate('/shop')} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-sm">
                    Browse Collection <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-all">
                      {/* Order header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-stone-50/50 border-b border-stone-100">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-stone-500">#{order.display_id || order.id?.slice(-8)}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(order.created_at)}</span>
                          <span className="font-semibold text-stone-900">{formatPrice(order.total, order.currency_code)}</span>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="px-6 py-4 space-y-3">
                        {order.items?.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200/50">
                              <img src={item.thumbnail || item.variant?.product?.thumbnail || "https://placehold.co/60x60/f5f5f4/a8a29e?text=•"} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">{item.title}</p>
                              <p className="text-[11px] text-stone-500">Qty: {item.quantity} · {formatPrice(item.unit_price, order.currency_code)}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-stone-400 font-medium">+ {order.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Addresses</h1>
                  <p className="text-sm text-stone-500 mt-1">Manage your delivery locations.</p>
                </div>
                <button onClick={() => { setAddressForm({ first_name: user?.first_name || "", last_name: user?.last_name || "", phone: user?.phone || "", address_1: "", address_2: "", city: "", postal_code: "", country_code: "in", province: "", company: "Home" }); setDrawerMode('add-address'); }} className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-sm">
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {(!user?.addresses || user.addresses.length === 0) ? (
                <div className="bg-white border border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
                  <MapPin size={32} className="text-stone-300 mb-4" strokeWidth={1} />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">No Addresses Yet</h3>
                  <p className="text-sm text-stone-500 max-w-xs">Add your shipping address for faster checkout.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {user.addresses.map(addr => (
                    <div key={addr.id} className="bg-white border border-stone-200 p-6 rounded-2xl group hover:border-stone-300 hover:shadow-sm transition-all relative">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-[10px] uppercase tracking-wider rounded-full text-stone-600 font-semibold border border-stone-200">
                          {addr.company?.toLowerCase() === 'work' ? <Briefcase size={10} /> : <Home size={10} />}
                          {addr.company || 'Home'}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditAddress(addr)} className="text-stone-400 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => onDeleteAddress(addr.id)} className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-stone-900 mb-2">{addr.first_name} {addr.last_name}</h3>
                      <div className="space-y-1 text-xs text-stone-500 leading-relaxed">
                        <p>{addr.address_1}</p>
                        {addr.address_2 && <p>{addr.address_2}</p>}
                        <p>{addr.city}, {addr.province} {addr.postal_code}</p>
                        <p>{addr.country_code?.toUpperCase()}</p>
                        {addr.phone && <p className="pt-2 flex items-center gap-1.5 text-stone-600 font-medium"><Headset size={12} /> {addr.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Settings</h1>
                <p className="text-sm text-stone-500 mt-1">Manage your account preferences.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <SettingTile icon={ShieldCheck} title="Login & Security" desc="Manage passwords and two-factor authentication." onClick={() => setDrawerMode('edit-profile')} />
                <SettingTile icon={Bell} title="Notifications" desc="Control alerts for orders and promotions." onClick={() => {}} />
                <SettingTile icon={CreditCard} title="Payment Methods" desc="Save cards for faster checkout." onClick={() => {}} />
                <SettingTile icon={Headset} title="Support" desc="Reach our dedicated support team." onClick={() => navigate('/contact')} />
              </div>

              {/* Mobile sign out */}
              <div className="lg:hidden pt-6 border-t border-stone-200">
                <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </section>
          )}
        </main>

        {/* ─── DRAWER OVERLAY ─── */}
        {drawerMode && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div onClick={() => setDrawerMode(null)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            
            <div className="relative w-full sm:w-[500px] h-full bg-white border-l border-stone-200 shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
               
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50 shrink-0">
                <h2 className="text-lg font-semibold text-stone-900 capitalize">{drawerMode.replace(/-/g, ' ')}</h2>
                <button onClick={() => setDrawerMode(null)} className="p-2 hover:bg-stone-200 text-stone-500 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div 
                className="flex-1 overflow-y-auto px-6 py-6"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <form id="drawer-form" onSubmit={drawerMode === 'edit-profile' ? onSaveProfile : onManageAddress} className="space-y-5">
                  {drawerMode === 'edit-profile' ? (
                    <div className="space-y-5">
                      <InputField label="First Name" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} required />
                      <InputField label="Last Name" value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} required />
                      <InputField label="Phone Number" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+91..." required />
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <button type="button" onClick={detectLocation} className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2.5 transition-all rounded-xl">
                        <Navigation size={14} /> Auto-detect Location
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="First Name" value={addressForm.first_name} onChange={e => setAddressForm({...addressForm, first_name: e.target.value})} required />
                        <InputField label="Last Name" value={addressForm.last_name} onChange={e => setAddressForm({...addressForm, last_name: e.target.value})} required />
                      </div>

                      <InputField label="Phone" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} required />
                      <InputField label="Street Address" value={addressForm.address_1} onChange={e => setAddressForm({...addressForm, address_1: e.target.value})} required />
                      <InputField label="Apt, Suite, Company (Optional)" value={addressForm.address_2} onChange={e => setAddressForm({...addressForm, address_2: e.target.value})} />

                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                        <InputField label="State / Province" value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Postal Code" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} required />
                        <div className="space-y-1.5">
                          <label className="block text-[11px] text-stone-600 font-semibold uppercase tracking-[0.1em]">Country</label>
                          <select value={addressForm.country_code} onChange={e => setAddressForm({...addressForm, country_code: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-stone-400 outline-none transition-colors shadow-sm" required>
                            <option value="in">India</option>
                            <option value="us">United States</option>
                            <option value="gb">United Kingdom</option>
                            <option value="ca">Canada</option>
                            <option value="au">Australia</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="block text-[11px] text-stone-600 font-semibold uppercase tracking-[0.1em]">Address Type</label>
                        <div className="flex gap-3">
                          {['Home', 'Work'].map(type => (
                            <button key={type} type="button" onClick={() => setAddressForm({...addressForm, company: type})} className={`flex-1 py-3 border text-xs uppercase tracking-widest font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${addressForm.company === type ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'}`}>
                              {type === 'Home' ? <Home size={14} /> : <Briefcase size={14} />} {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 shrink-0">
                <button type="submit" form="drawer-form" disabled={authLoading} className="w-full py-3.5 bg-stone-900 text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  {authLoading ? 'Processing…' : 'Save Changes'}
                </button>
              </div>
               
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Account;
