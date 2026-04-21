// components/auth/AuthModal.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { useAuthModalStore } from "../../stores/useAuthModalStore";
import { X } from 'lucide-react';
import AuthPage from "../../pages/AuthPage";
import { motion, AnimatePresence } from "framer-motion";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

const AuthModal = () => {
  const { isOpen, close } = useAuthModalStore();
  useLockBodyScroll(isOpen);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(245,245,244,0.92) 0%, rgba(231,229,228,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onClick={close}
          />

          {/* Scroll-isolating layer — this scrolls, body does not */}
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <div className="min-h-full flex items-center justify-center p-4 md:p-8 lg:p-12">

              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-6xl bg-white rounded-2xl shadow-2xl shadow-stone-900/8 border border-stone-200/60 flex flex-col overflow-hidden"
                style={{ maxHeight: '92vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={close}
                  className="absolute top-5 right-5 z-[60] p-2.5 rounded-full bg-stone-100/80 hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-all duration-300 group"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2} />
                </button>

                {/* Scrollable content */}
                <div 
                  className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <AuthPage />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
