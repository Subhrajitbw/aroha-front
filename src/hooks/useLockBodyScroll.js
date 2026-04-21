import { useLayoutEffect } from 'react';

// Global state for nested lock management
let lockCount = 0;
let scrollY = 0;

/**
 * Super-robust scroll lock hook.
 * Uses position:fixed for visual locking and event-listeners for momentum blocking.
 *
 * @param {boolean} isLocked Whether scrolling should be locked.
 */
function useLockBodyScroll(isLocked) {
  useLayoutEffect(() => {
    if (!isLocked) return;

    lockCount++;

    const preventDefault = (e) => {
      // Only prevent if the event is not reaching us from a scrollable child that stopped propagation
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    // Block all scroll-triggering events at the window level
    // Modals MUST call e.stopPropagation() on their scrollable areas to work
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });

    if (lockCount === 1) {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;

      const originalStyles = {
        body: {
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left,
          right: document.body.style.right,
          width: document.body.style.width,
          overflow: document.body.style.overflow,
        },
        html: {
          overflow: document.documentElement.style.overflow,
          height: document.documentElement.style.height,
          scrollBehavior: document.documentElement.style.scrollBehavior,
        }
      };

      document.body.dataset.lockBodyScrollOriginalStyles = JSON.stringify(originalStyles);

      Object.assign(document.body.style, {
        position: 'fixed',
        top: `-${scrollY}px`,
        left: '0',
        right: '0',
        width: '100%',
        overflow: 'hidden',
      });

      Object.assign(document.documentElement.style, {
        overflow: 'hidden',
        height: '100%',
        scrollBehavior: 'auto',
      });
    }

    return () => {
      lockCount--;

      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);

      if (lockCount === 0) {
        const storedStyles = document.body.dataset.lockBodyScrollOriginalStyles;
        if (storedStyles) {
          const originalStyles = JSON.parse(storedStyles);
          
          Object.assign(document.body.style, {
            position: originalStyles.body.position,
            top: originalStyles.body.top,
            left: originalStyles.body.left,
            right: originalStyles.body.right,
            width: originalStyles.body.width,
            overflow: originalStyles.body.overflow,
          });

          Object.assign(document.documentElement.style, {
            overflow: originalStyles.html.overflow,
            height: originalStyles.html.height,
            scrollBehavior: 'auto',
          });

          window.scrollTo(0, scrollY);
          document.documentElement.style.scrollBehavior = originalStyles.html.scrollBehavior;
          
          delete document.body.dataset.lockBodyScrollOriginalStyles;
        }
      }
    };
  }, [isLocked]);
}

export default useLockBodyScroll;
