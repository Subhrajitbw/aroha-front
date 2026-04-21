import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";
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
  Map
} from "lucide-react";

/**
 * Luxury Account Profile
 * Premium UI with glassmorphism, refined typography, and smooth micro-interactions.
 */
const Account = () => {
  const { user, logout, updateUser, manageAddress, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerMode, setDrawerMode] = useState(null); 
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "" });
  const [addressForm, setAddressForm] = useState({
    first_name: "", last_name: "", phone: "", address_1: "", address_2: "", city: "", postal_code: "", country_code: "in", province: "", company: "Home"
  });

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        first_name: user.first_name || "", 
        last_name: user.last_name || "", 
        phone: user.phone || "" 
      });
    }
  }, [user]);

  // Lock body scroll when drawer is open
  useLockBodyScroll(!!drawerMode);

  const handleLogout = () => {
    logout();
    navigate("/");
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

  const TABS = [
    { id: "overview", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: Map },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const SettingTile = ({ icon: Icon, title, desc, onClick }) => (
    <button onClick={onClick} className="group relative overflow-hidden bg-white/60 backdrop-blur-xl border border-zinc-200/50 p-8 rounded-3xl flex items-start gap-6 text-left hover:border-zinc-400/50 transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-zinc-900 group-hover:text-amber-50 transition-all duration-500 transform group-hover:-translate-y-1 group-hover:shadow-lg">
         <Icon size={20} className="stroke-[1.5]" />
      </div>
      <div className="relative z-10 flex-1">
         <h4 className="text-lg font-medium text-zinc-900 mb-2 font-serif">{title}</h4>
         <p className="text-sm text-zinc-500 font-light leading-relaxed">{desc}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-24 lg:pt-36 pb-24 px-4 sm:px-8 selection:bg-zinc-900 selection:text-white font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-200/30 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-100/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative z-10">
        
        {/* --- LUXURY SIDEBAR --- */}
        <aside className="lg:w-80 flex flex-col space-y-12 shrink-0">
          <div className="space-y-4 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/5 rounded-full border border-zinc-900/10 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-600">Account</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-zinc-900 tracking-tight">My<br/><span className="text-zinc-400 italic">Profile</span></h1>
          </div>

          <nav className="flex flex-col gap-2">
            {TABS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id 
                    ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 scale-[1.02]" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className="stroke-[1.5]" />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={16} className="text-zinc-400" />}
              </button>
            ))}
          </nav>

          <div className="pt-8 border-t border-zinc-200/60 pl-4">
            <button onClick={handleLogout} className="group flex items-center gap-4 text-sm font-medium text-red-900/60 hover:text-red-700 transition-colors">
              <div className="p-2 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="uppercase tracking-widest text-[11px]">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* --- DYNAMIC MAIN CONTENT --- */}
        <main className="flex-1 w-full min-h-[600px]">
          
          {activeTab === "overview" && (
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 z-10">
              <div className="relative overflow-hidden bg-white/70 backdrop-blur-2xl border border-white p-8 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative z-10">
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-medium">Customer</p>
                    <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 leading-tight">
                      {user?.first_name} {user?.last_name}
                    </h2>
                    <p className="text-zinc-500 font-light flex items-center gap-2">
                       <span>ID:</span> <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">{user?.id?.slice(-8) || '...'}</span>
                    </p>
                  </div>
                  <button onClick={() => setDrawerMode('edit-profile')} className="group flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all hover:shadow-lg hover:-translate-y-1">
                    <span className="text-xs uppercase tracking-widest font-medium">Edit Profile</span>
                    <Edit2 size={14} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-zinc-200/50 relative z-10">
                  <div className="space-y-3 group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-1">
                      <div className="p-1.5 rounded-md bg-zinc-100 group-hover:bg-zinc-200 transition-colors"><ShieldCheck size={14} /></div>
                      <p className="text-xs uppercase tracking-[0.2em] font-medium">Primary Email</p>
                    </div>
                    <p className="text-lg text-zinc-900 font-medium pl-9">{user?.email}</p>
                  </div>
                  <div className="space-y-3 group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-1">
                      <div className="p-1.5 rounded-md bg-zinc-100 group-hover:bg-zinc-200 transition-colors"><Headset size={14} /></div>
                      <p className="text-xs uppercase tracking-[0.2em] font-medium">Contact Number</p>
                    </div>
                    <p className="text-lg text-zinc-900 font-medium pl-9">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2 mb-4">
                  <div>
                    <h2 className="text-3xl font-serif text-zinc-900">Addresses</h2>
                    <p className="text-sm text-zinc-500 mt-2">Manage your delivery destinations.</p>
                  </div>
                  <button onClick={() => setDrawerMode('add-address')} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-xs uppercase tracking-widest hover:bg-zinc-800 hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <Plus size={16} /> Add Location
                  </button>
               </div>

               {(!user?.addresses || user.addresses.length === 0) && (
                 <div className="w-full bg-white/50 border border-dashed border-zinc-300 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
                    <MapPin size={48} className="text-zinc-300 mb-6" strokeWidth={1} />
                    <h3 className="text-xl font-serif text-zinc-700 mb-2">No Addresses Yet</h3>
                    <p className="text-zinc-500 text-sm max-w-sm">Add your home or work address to expedite your future checkout experiences.</p>
                 </div>
               )}

               <div className="grid md:grid-cols-2 gap-6">
                  {user?.addresses?.map(addr => (
                    <div key={addr.id} className="bg-white/70 backdrop-blur-xl border border-zinc-200/60 p-8 rounded-[2rem] group relative hover:border-zinc-400 transition-all duration-500 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)]">
                       <div className="flex justify-between items-start mb-8">
                          <div className="px-4 py-1.5 bg-zinc-100 text-[10px] uppercase tracking-[0.2em] rounded-full text-zinc-600 font-bold flex items-center gap-2 border border-zinc-200">
                            {addr.company?.toLowerCase() === 'work' ? <Briefcase size={10} /> : <Home size={10} />}
                            {addr.company || 'Home'}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <button onClick={() => openEditAddress(addr)} className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-2 rounded-full transition-colors"><Edit2 size={16} /></button>
                             <button onClick={() => onDeleteAddress(addr.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
                          </div>
                       </div>
                       <h3 className="text-xl font-serif text-zinc-900 mb-4">{addr.first_name} {addr.last_name}</h3>
                       <div className="space-y-1.5 text-sm text-zinc-500 font-light leading-relaxed">
                          <p>{addr.address_1}</p>
                          {addr.address_2 && <p>{addr.address_2}</p>}
                          <p>{addr.city}, {addr.province}</p>
                          <p>{addr.country_code?.toUpperCase()} {addr.postal_code}</p>
                          {addr.phone && <p className="pt-4 flex items-center gap-2"><Headset size={14} className="text-zinc-300" /> {addr.phone}</p>}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="px-2 mb-4">
                 <h2 className="text-3xl font-serif text-zinc-900">Settings</h2>
                 <p className="text-sm text-zinc-500 mt-2">Manage your account settings.</p>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  <SettingTile icon={ShieldCheck} title="Login & Security" desc="Manage passwords and 2FA settings for your account." onClick={() => setDrawerMode('edit-profile')} />
                  <SettingTile icon={Bell} title="Notifications" desc="Control newsletter subscriptions and order alerts." onClick={() => {}} />
                  <SettingTile icon={CreditCard} title="Payment Methods" desc="Securely save cards for faster checkout." onClick={() => {}} />
                  <SettingTile icon={Headset} title="Support" desc="Get dedicated support for your account." onClick={() => navigate('/contact')} />
               </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="px-2 mb-8">
                 <h2 className="text-3xl font-serif text-zinc-900">Order History</h2>
               </div>
               <div className="bg-white/50 backdrop-blur-sm border border-zinc-200/50 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[500px] text-zinc-400 space-y-8 p-8">
                  <div className="w-32 h-32 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                    <Package size={48} strokeWidth={1} className="text-zinc-300" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-serif text-zinc-900">No orders yet</h3>
                    <p className="text-sm max-w-xs mx-auto">Your past orders will appear here once you make a purchase.</p>
                  </div>
                  <button onClick={() => navigate('/shop')} className="px-8 py-4 bg-zinc-900 text-white rounded-full text-xs uppercase tracking-[0.2em] font-medium hover:bg-zinc-800 transition-colors shadow-xl shadow-zinc-900/10 hover:-translate-y-0.5">Shop Now</button>
               </div>
            </div>
          )}
        </main>

        {/* --- LUXURIOUS DRAWER OVERLAY --- */}
        {drawerMode && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div onClick={() => setDrawerMode(null)} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-500" />
            
            <div className="relative w-full md:w-[600px] h-full bg-[#fcfbf9] border-l border-zinc-200 shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-500">
               
               {/* Drawer Header */}
               <div className="flex items-center justify-between p-8 md:p-12 border-b border-zinc-200/50 bg-white/50 backdrop-blur-md">
                  <h2 className="text-2xl font-serif text-zinc-900 capitalize tracking-wide">{drawerMode.replace('-', ' ')}</h2>
                  <button onClick={() => setDrawerMode(null)} className="p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors">
                    <X size={20} />
                  </button>
               </div>

               {/* Drawer Content */}
               <div 
                 className="flex-1 overflow-y-auto p-8 md:p-12 mb-8"
                 onWheel={(e) => e.stopPropagation()}
                 onTouchMove={(e) => e.stopPropagation()}
               >
                 <form id="drawer-form" onSubmit={drawerMode === 'edit-profile' ? onSaveProfile : onManageAddress} className="space-y-10">
                    {drawerMode === 'edit-profile' ? (
                      <div className="space-y-8">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">First Name</label>
                            <input value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Last Name</label>
                            <input value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Contact Number</label>
                            <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-4 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-900 transition-all" placeholder="+1..." required />
                          </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <button type="button" onClick={detectLocation} className="w-full py-4 bg-zinc-900/5 hover:bg-zinc-900/10 border border-zinc-900/10 text-zinc-900 text-[10px] uppercase tracking-[0.3em] font-medium flex items-center justify-center gap-3 transition-all rounded-xl mb-6">
                          <Navigation size={14} /> Auto-detect Location
                        </button>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">First Name</label>
                            <input value={addressForm.first_name} onChange={e => setAddressForm({...addressForm, first_name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Last Name</label>
                            <input value={addressForm.last_name} onChange={e => setAddressForm({...addressForm, last_name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Mobile</label>
                          <input value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Street Address</label>
                          <input value={addressForm.address_1} onChange={e => setAddressForm({...addressForm, address_1: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Apartment, Suite, Company (Optional)</label>
                          <input value={addressForm.address_2} onChange={e => setAddressForm({...addressForm, address_2: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">City</label>
                            <input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">State / Province</label>
                            <input value={addressForm.province} onChange={e => setAddressForm({...addressForm, province: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Zip / Postal Code</label>
                            <input value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:border-zinc-900 outline-none transition-colors" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Country</label>
                            <select value={addressForm.country_code} onChange={e => setAddressForm({...addressForm, country_code: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm focus:border-zinc-900 outline-none transition-colors appearance-none" required>
                               <option value="in">India</option>
                               <option value="us">United States</option>
                               <option value="gb">United Kingdom</option>
                               <option value="ca">Canada</option>
                               <option value="au">Australia</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-200/50">
                           <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500">Address Category</label>
                           <div className="flex gap-4">
                              {['Home', 'Work'].map(type => (
                                <button key={type} type="button" onClick={() => setAddressForm({...addressForm, company: type})} className={`flex-1 py-4 border text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${addressForm.company === type ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'}`}>
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
               <div className="p-8 md:p-12 border-t border-zinc-200/50 bg-white">
                 <button type="submit" form="drawer-form" disabled={authLoading} className="w-full py-5 bg-zinc-900 text-white text-[11px] uppercase tracking-[0.3em] font-medium rounded-xl hover:bg-zinc-800 transition-all focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10">
                   {authLoading ? 'Processing...' : 'Save Changes'}
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
