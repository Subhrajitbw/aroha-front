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
      <div className="relative z-10 w-full max-w-5xl max-h-[95vh] overflow-auto">
        <div className="relative bg-white rounded-xl shadow-2xl">
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm rounded-full shadow-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
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
