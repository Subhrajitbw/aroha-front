import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

function applyLockStyles() {
  savedScrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  document.body.style.height = '100dvh';
  document.documentElement.style.overflow = 'hidden';
  document.body.classList.add('scroll-locked');
  document.documentElement.classList.add('scroll-locked');
  // iOS Safari can defer applying a `position: fixed` layout change to the
  // next paint instead of synchronously; forcing a reflow here is what
  // makes the later cleanup's layout change (and scroll restore) reliably
  // "stick" instead of leaving the page visually stuck once unlocked.
  void document.body.offsetHeight;
}

function clearLockStyles() {
  const restoreY = savedScrollY;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.documentElement.style.overflow = '';
  document.body.classList.remove('scroll-locked');
  document.documentElement.classList.remove('scroll-locked');
  void document.body.offsetHeight;
  // Defer the scroll restore a frame — on iOS Safari, calling scrollTo()
  // immediately after removing `position: fixed` can run before WebKit
  // has re-engaged touch scrolling, leaving the page frozen even though
  // the CSS is already correct.
  requestAnimationFrame(() => {
    window.scrollTo(0, restoreY);
  });
}

function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    lockCount++;
    if (lockCount === 1) applyLockStyles();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) clearLockStyles();
    };
  }, [isLocked]);
}

// Safety net for route changes: nothing in this app is meant to land on a
// new page already scroll-locked. Checks the actual DOM state (not just
// the counter) so it's a no-op on an already-clean page — it only clears
// and restores scroll when something was genuinely left locked, so it
// never forces an unwanted scroll position on a normal navigation.
export function forceResetBodyScrollLock() {
  const wasLocked =
    document.body.style.position === 'fixed' ||
    document.documentElement.classList.contains('scroll-locked');
  lockCount = 0;
  if (!wasLocked) return;
  clearLockStyles();
}

export default useLockBodyScroll;
