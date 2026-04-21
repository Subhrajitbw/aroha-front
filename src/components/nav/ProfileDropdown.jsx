import React from "react";
import { User, Package, MapPin, LogOut, ChevronDown } from "lucide-react";

/**
 * ProfileDropdown - Luxury dropdown for authenticated users
 * Consistent with the Maison / Sanctuary design language.
 */
const ProfileDropdown = ({ 
  user, 
  isOpen, 
  onClose, 
  navigate, 
  onLogout,
  getInitials,
  getUserDisplayName 
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="absolute right-0 top-full pt-4 w-72 transform animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-white/95 backdrop-blur-2xl border border-zinc-200/60 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.1)] overflow-hidden p-3 flex flex-col">

        {/* Profile Header */}
        <div className="flex items-center gap-4 px-4 py-6 border-b border-zinc-100/80 mb-2">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center text-sm font-serif text-white border-[3px] border-zinc-100 shadow-sm">
              {getInitials()}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" title="Active" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-lg font-serif text-zinc-900 truncate font-medium tracking-tight leading-tight">
              {getUserDisplayName()}
            </span>
            <span className="text-[12px] font-sans text-zinc-500 truncate mt-0.5 opacity-70">
              {user.email}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          {[
            { label: 'Account Settings', icon: <User size={16} />, path: '/account' },
            { label: 'Orders', icon: <Package size={16} />, path: '/account?tab=orders' },
            { label: 'Addresses', icon: <MapPin size={16} />, path: '/account?tab=addresses' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { onClose(); navigate(item.path); }}
              className="flex items-center justify-between w-full px-4 py-3.5 text-[10px] uppercase tracking-[0.15em] text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 rounded-[1.5rem] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-5 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <span className="font-semibold">{item.label}</span>
              </div>
              <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover:opacity-40 transition-all translate-x-1 group-hover:translate-x-0" />
            </button>
          ))}
        </div>

        {/* Footer / Logout */}
        <div className="mt-2 pt-2 border-t border-zinc-100">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="flex items-center gap-4 w-full px-4 py-3.5 text-[10px] uppercase tracking-[0.15em] text-red-500 hover:bg-red-50/50 rounded-[1.5rem] transition-all group"
          >
            <div className="w-5 flex justify-center opacity-70">
              <LogOut size={16} />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileDropdown;
