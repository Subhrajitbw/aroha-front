// components/productSlider/useSliderTouch.js
import { useState, useCallback, useRef, useEffect } from "react";

export const useSliderTouch = ({
  cardWidth,
  gap,
  itemsPerView,
  handleSlide,
  draggableRef
}) => {
  const [touchStartX, setTouchStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const autoSlideRef = useRef(null);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsDragging(false);
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (touchStartX === null) return;
      const currentX = e.targetTouches[0].clientX;
      const deltaX = Math.abs(touchStartX - currentX);
      if (deltaX > 10) {
        setIsDragging(true);
        e.preventDefault();
      }
    },
    [touchStartX]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX === null || !isDragging) {
        setTouchStartX(null);
        setIsDragging(false);
        return;
      }
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchStartX - touchEndX;
      const threshold = cardWidth * 0.2;
      if (Math.abs(deltaX) > threshold) {
        const direction = deltaX > 0 ? "right" : "left";
        const steps = Math.ceil(Math.abs(deltaX) / (cardWidth + gap));
        handleSlide(direction, Math.min(steps, itemsPerView));
      }
      setTouchStartX(null);
      setIsDragging(false);
    },
    [touchStartX, isDragging, cardWidth, gap, itemsPerView, handleSlide]
  );

  // Manually attach event listeners
  useEffect(() => {
    const element = draggableRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};
