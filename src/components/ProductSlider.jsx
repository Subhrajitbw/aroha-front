// components/ProductSlider.jsx
import { useEffect, useRef, useMemo } from "react";

import SliderContent from "./productSlider/SliderContent";
import { useSliderLogic } from "./productSlider/useSliderLogic";
import SliderNavigation from "./productSlider/SliderNavigations";
import { useSliderTouch } from "./productSlider/useSliderTouch";

export default function ProductSlider({
  products = [],
  className = "",
  showNavigation = true,
  cardSize = "md",
  gap = 16,
  onSlideChange = null,
  autoSlide = false,
  autoSlideInterval = 5000,
  direction = "horizontal",
  bg = "normal",
}) {
  const containerRef = useRef(null);
  const draggableRef = useRef(null);

  // Fixed card widths (px)
  const cardWidths = useMemo(
    () => ({
      xs: 160,
      sm: 192,
      md: 224,
      lg: 256,
      xl: 288,
    }),
    []
  );
  const cardWidth = cardWidths[cardSize] || cardWidths.md;

  // Clamp gap so it's never too small or too huge
  const effectiveGap = Math.max(8, Math.min(gap, 32));

  // Custom slider logic
  const {
    currentIndex,
    itemsPerView,
    maxIndex,
    handleSlide,
    calculateItemsPerView,
    api,
    x,
  } = useSliderLogic({
    products,
    cardWidth,
    gap: effectiveGap,
    containerRef,
    onSlideChange,
    autoSlide,
    autoSlideInterval,
  });

  const { isDragging } = useSliderTouch({
    cardWidth,
    gap: effectiveGap,
    itemsPerView,
    handleSlide,
    draggableRef,
  });

  // Recalculate items per view on resize
  useEffect(() => {
    calculateItemsPerView();
    const resizeObserver = new ResizeObserver(calculateItemsPerView);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [calculateItemsPerView]);

  const showPrevious = currentIndex > 0;
  const showNext = currentIndex < maxIndex;
  const hasMultipleSlides = products.length > itemsPerView;

  const sliderContent = (
    <SliderContent
      products={products}
      cardWidth={cardWidth}
      gap={effectiveGap}
      isDragging={isDragging}
      x={x}
      draggableRef={draggableRef}
      cardSize={cardSize}
      containerRef={containerRef}
      direction={direction}
      bg={bg}
    />
  );

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {direction !== "vertical" && showNavigation && hasMultipleSlides ? (
        <SliderNavigation
          onPrevious={() => handleSlide("left", itemsPerView)}
          onNext={() => handleSlide("right", itemsPerView)}
          showPrevious={showPrevious}
          showNext={showNext}
          sliderContent={sliderContent}
        />
      ) : (
        sliderContent
      )}
    </div>
  );
}
