// components/productSlider/useSliderLogic.js
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSpring } from "@react-spring/web";

export const useSliderLogic = ({
  products,
  cardWidth,
  gap,
  containerRef,
  onSlideChange,
  autoSlide,
  autoSlideInterval
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const autoSlideRef = useRef(null);

  // Spring animation
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: { tension: 180, friction: 30 },
  }));

  // Calculate how many items can fit in the container
  const calculateItemsPerView = useCallback(() => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.offsetWidth;
    const itemsCount = Math.floor((containerW + gap) / (cardWidth + gap));
    setItemsPerView(Math.max(1, itemsCount));
  }, [cardWidth, gap]);

  // Calculate max index based on items per view
  const maxIndex = useMemo(
    () => Math.max(0, products.length - itemsPerView),
    [products.length, itemsPerView]
  );

  // Reset on products change
  useEffect(() => {
    setCurrentIndex(0);
    api.start({ x: 0, immediate: true });
  }, [products, api]);

  // Slide handler with bounds checking
  const handleSlide = useCallback(
    (direction, steps = 1) => {
      let newIndex = currentIndex;
      if (direction === "left") {
        newIndex = Math.max(currentIndex - steps, 0);
      } else if (direction === "right") {
        newIndex = Math.min(currentIndex + steps, maxIndex);
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        const translateX = -newIndex * (cardWidth + gap);
        api.start({ x: translateX });
        onSlideChange?.(newIndex, direction);
      }
    },
    [currentIndex, maxIndex, cardWidth, gap, api, onSlideChange]
  );

  // Auto slide functionality
  useEffect(() => {
    if (autoSlide && products.length > itemsPerView) {
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
          const translateX = -nextIndex * (cardWidth + gap);
          api.start({ x: translateX });
          onSlideChange?.(nextIndex, "auto");
          return nextIndex;
        });
      }, autoSlideInterval);
      return () => clearInterval(autoSlideRef.current);
    }
  }, [autoSlide, autoSlideInterval, products.length, itemsPerView, maxIndex, cardWidth, gap, api, onSlideChange]);

  return {
    currentIndex,
    itemsPerView,
    maxIndex,
    handleSlide,
    calculateItemsPerView,
    api,
    x
  };
};
