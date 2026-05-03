// src/components/layout/PwaPrompt.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Smartphone, Download } from 'lucide-react';

export default function PwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptType, setPromptType] = useState(null); // 'ios' or 'android'
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) return;

    // 2. Handle Android/Chrome "beforeinstallprompt"
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPromptType('android');
      
      // Show prompt after a delay or based on some engagement
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Handle iOS Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isStandalone) {
      setPromptType('ios');
      const timer = setTimeout(() => setShowPrompt(true), 8000); // Wait longer for iOS
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[200] md:left-auto md:right-8 md:w-96"
      >
        <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6">
          {/* Close button */}
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={16} className="text-stone-400" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-stone-900 flex items-center justify-center shadow-lg">
              <Smartphone className="text-white" size={24} />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="text-lg font-serif text-stone-900 leading-tight mb-1">
                Install Aroha House
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Add to your home screen for a seamless boutique experience and faster access.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100">
            {promptType === 'android' ? (
              <button
                onClick={handleAndroidInstall}
                className="w-full py-3.5 bg-stone-900 text-white rounded-2xl text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all active:scale-95"
              >
                <Download size={14} />
                Install Now
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                    <Share size={14} />
                  </div>
                  <span>Tap the <strong>Share</strong> button in Safari</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                    <PlusSquare size={14} />
                  </div>
                  <span>Select <strong>"Add to Home Screen"</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
