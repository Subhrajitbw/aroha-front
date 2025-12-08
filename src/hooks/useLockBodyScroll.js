import { useLayoutEffect } from 'react';

function useLockBodyScroll(isLocked) {
  useLayoutEffect(() => {
    // Get original body overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent scrolling on mount if isLocked is true
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    }

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]); // Only re-run if isLocked changes
}

export default useLockBodyScroll;
