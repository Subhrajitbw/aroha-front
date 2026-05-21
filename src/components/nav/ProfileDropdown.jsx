import React from "react";
import { User, Package, MapPin, LogOut, ChevronRight, Heart, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * ProfileDropdown — Clean, readable profile hover dropdown
 * Matches the light theme design language.
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
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full pt-3 w-72 z-[60]"
        >
          <div className="bg-white border border-stone-200 rounded-2xl shadow-lg shadow-stone-900/5 overflow-hidden">

            {/* Profile Header */}
            <div className="flex items-center gap-3.5 px-5 py-4 bg-stone-50 border-b border-stone-100">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-stone-900 flex items-center justify-center text-xs font-serif text-white border-2 border-stone-200">
                  {getInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-stone-900 truncate leading-tight">
                  {getUserDisplayName()}
                </span>
                <span className="text-[11px] text-stone-500 truncate mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-2">
              {[
                { label: 'My Account', icon: User, path: '/account' },
                { label: 'Orders', icon: Package, path: '/account?tab=orders' },
                { label: 'Addresses', icon: MapPin, path: '/account?tab=addresses' },
                { label: 'Settings', icon: Settings, path: '/account?tab=settings' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { onClose(); navigate(item.path); }}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} strokeWidth={1.5} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="p-2 pt-0 border-t border-stone-100 mx-2 mt-0">
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all mt-2"
              >
                <LogOut size={16} strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
