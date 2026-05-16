import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;

    if (lockCount === 1) {
      savedScrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [isLocked]);
}

export default useLockBodyScroll;
