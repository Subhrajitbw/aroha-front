import { useEffect } from 'react';

// Global state for nested lock management
let lockCount = 0;

/**
 * Super-robust scroll lock hook.
 */
function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;

    if (lockCount === 1) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
        document.documentElement.style.overflow = originalHtmlStyle === 'hidden' ? '' : originalHtmlStyle;
      }
    };
  }, [isLocked]);
}

export default useLockBodyScroll;
