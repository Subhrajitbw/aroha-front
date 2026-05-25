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
      document.body.style.width = '100%';
      document.body.style.height = '100dvh';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add("scroll-locked");
      document.documentElement.classList.add("scroll-locked");
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.body.classList.remove("scroll-locked");
        document.documentElement.classList.remove("scroll-locked");
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [isLocked]);
}

export default useLockBodyScroll;
