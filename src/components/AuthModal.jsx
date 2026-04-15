// components/AuthModal.js
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthModalStore } from '../stores/useAuthModalStore';
import { X } from 'lucide-react';
import AuthPage from '../pages/AuthPage';

const AuthModal = () => {
  const { isOpen, close } = useAuthModalStore();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={close}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-none">
        <div className="relative bg-[#fafafa] rounded-none shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[95vh] hide-scrollbar border border-stone-200">
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-[50] p-2 md:p-3 text-stone-400 hover:text-stone-900 bg-white/50 hover:bg-white backdrop-blur-md transition-all duration-300 border border-transparent hover:border-stone-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 stroke-[1.5]" />
          </button>
          
          {/* Auth Page Component */}
          <AuthPage />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
