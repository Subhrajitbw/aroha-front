import { useEffect, useCallback } from "react";

export const useHeroGestures = ({ containerRef, nextSlide, prevSlide, isTransitioning }) => {
  // Touch/swipe handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isDragging = false;
    const threshold = 50; // Minimum distance for swipe
    const timeThreshold = 300; // Maximum time for swipe (ms)

    const handleTouchStart = (e) => {
      if (isTransitioning) return;
      
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging || isTransitioning) return;
      
      // Prevent vertical scrolling during horizontal swipe
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);
      
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isDragging || isTransitioning) return;
      
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      isDragging = false;
      
      // Check if it's a valid swipe (horizontal, fast enough, long enough)
      if (
        Math.abs(deltaX) > threshold &&
        Math.abs(deltaX) > Math.abs(deltaY) &&
        deltaTime < timeThreshold
      ) {
        if (deltaX > 0) {
          prevSlide(); // Swipe right = previous slide
        } else {
          nextSlide(); // Swipe left = next slide
        }
      }
    };

    // Mouse drag handling for desktop
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseStartTime = 0;

    const handleMouseDown = (e) => {
      if (isTransitioning) return;
      
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseStartTime = Date.now();
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown || isTransitioning) return;
      
      const deltaX = Math.abs(e.clientX - mouseStartX);
      if (deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleMouseUp = (e) => {
      if (!isMouseDown || isTransitioning) return;
      
      const endX = e.clientX;
      const endTime = Date.now();
      const deltaX = endX - mouseStartX;
      const deltaTime = endTime - mouseStartTime;
      
      isMouseDown = false;
      container.style.cursor = 'grab';
      
      if (
        Math.abs(deltaX) > threshold &&
        deltaTime < timeThreshold
      ) {
        if (deltaX > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
    };

    const handleMouseLeave = () => {
      if (isMouseDown) {
        isMouseDown = false;
        container.style.cursor = 'grab';
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (isTransitioning) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextSlide();
          break;
        case ' ': // Space bar
          e.preventDefault();
          nextSlide();
          break;
      }
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    document.addEventListener('keydown', handleKeyDown);

    // Set initial cursor style
    container.style.cursor = '';

    // Cleanup
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, nextSlide, prevSlide, isTransitioning]);

  // Wheel/scroll handling (optional - for desktop scroll-to-navigate)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout;
    let lastScrollTime = 0;
    const scrollThrottle = 1000; // Prevent rapid scrolling

    const handleWheel = (e) => {
      if (isTransitioning) return;
      
      const now = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const deltaY = e.deltaY;
        
        if (Math.abs(deltaY) > 10) {
          if (deltaY > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          lastScrollTime = Date.now();
        }
      }, 50);
    };

    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [containerRef, nextSlide, prevSlide, isTransitioning]);
};
