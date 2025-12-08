// components/nav/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Package,        // Icon for Orders
  Heart,          // Icon for Wishlist
  MapPin,         // Icon for Addresses
  CreditCard,     // Icon for Payment Methods
  LifeBuoy,       // Icon for Help/Support
  ChevronDown 
} from 'lucide-react';
import { AnimatePresence, motion } from "framer-motion";

export const ProfileDropDown = ({ user, onLogout, scrolled, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : <User size={18} />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1.5 rounded-full ${scrolled ? 'bg-neutral-100/10' : isDark ? "bg-neutral-400/60" : ""} hover:bg-neutral-100/20 transition-colors duration-300`}
      >
        <div className="w-8 h-8 rounded-full bg-neutral-700 text-white flex items-center justify-center text-sm font-semibold border-2 border-neutral-600">
          {userInitial}
        </div>
        <span className={`${scrolled ||isDark ? 'text-neutral-800' : 'text-white'} font-medium text-sm hidden md:block`}>{user?.name || "My Account"}</span>
        <ChevronDown size={16} className={`${scrolled ||isDark ? 'text-neutral-800' : 'text-white'} transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl shadow-black/20 border border-neutral-200/50 p-2 z-50"
          >
            {/* Header section */}
            <div className="p-2 border-b border-neutral-200/60 mb-2">
              <p className="font-semibold text-neutral-800 text-sm">{user?.name || "Valued Customer"}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email || "email@example.com"}</p>
            </div>
            
            {/* Main account links */}
            <ul className="space-y-1">
              <li><Link to="/account/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><User size={16} /> Profile</Link></li>
              <li><Link to="/account/orders" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><Package size={16} /> Orders</Link></li>
              <li><Link to="/account/wishlist" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><Heart size={16} /> Wishlist</Link></li>
            </ul>

            {/* Divider */}
            <div className="h-px bg-neutral-200/60 my-2"></div>

            {/* Settings and Support */}
            <ul className="space-y-1">
                <li><Link to="/account/addresses" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><MapPin size={16} /> Addresses</Link></li>
                <li><Link to="/account/payment-methods" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><CreditCard size={16} /> Payment Methods</Link></li>
                <li><Link to="/account/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><Settings size={16} /> Account Settings</Link></li>
            </ul>

            {/* Divider */}
            <div className="h-px bg-neutral-200/60 my-2"></div>

            {/* Help and Logout */}
            <ul className="space-y-1">
                <li><Link to="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"><LifeBuoy size={16} /> Help/Support</Link></li>
                <li><button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"><LogOut size={16} /> Logout</button></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
