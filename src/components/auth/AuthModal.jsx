// components/auth/AuthModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthModalStore } from "../../stores/useAuthModalStore";
import { X } from 'lucide-react';
import AuthPage from "../../pages/AuthPage";
import { motion, AnimatePresence } from "framer-motion";

const AuthModal = () => {
  const { isOpen, close } = useAuthModalStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Cinematic Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="absolute inset-0 bg-stone-100/40 backdrop-blur-3xl"
          onClick={close}
        />
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1], // Custom cinematic easing
            opacity: { duration: 0.8 }
          }}
          className="relative z-10 w-full max-w-7xl h-full md:h-[90vh] lg:h-[85vh] overflow-hidden bg-white/95 border border-stone-200 shadow-[0_40px_100px_rgba(0,0,0,0.05)] flex flex-col m-4 md:m-0"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-[1px] bg-gradient-to-r from-stone-300 to-transparent" />
          <div className="absolute top-0 left-0 w-[1px] h-32 bg-gradient-to-b from-stone-300 to-transparent" />

          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-6 right-6 z-[60] p-4 text-stone-400 hover:text-stone-900 transition-all duration-500 group"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 stroke-[1] transition-transform duration-500 group-hover:rotate-90" />
          </button>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar relative">
             {/* Large Editorial Headline (Hidden on small) */}
             <div className="absolute top-12 left-12 pointer-events-none opacity-[0.03] select-none hidden lg:block">
                <h2 className="text-[12rem] font-serif italic text-stone-900 tracking-tighter leading-none">Aroha</h2>
             </div>

            {/* Auth Page Component */}
            <div className="relative z-10">
              <AuthPage />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
