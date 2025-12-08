// components/hero/SlideIndicators.jsx
import React from "react";

const SlideIndicators = ({
  totalSlides,
  activeSlide,
  progress,
  progressBarsRef,
  onGoToSlide
}) => {
  return (
    <div className="flex gap-2 sm:gap-3">
      {Array.from({ length: totalSlides }, (_, idx) => (
        <button
          key={idx}
          onClick={() => onGoToSlide(idx)}
          className="group relative"
          aria-label={`Go to slide ${idx + 1}`}
        >
          <div className="w-8 sm:w-12 h-1 bg-white/20 rounded-full overflow-hidden transition-colors duration-300 hover:bg-white/30 relative">
            <div
              ref={(el) => (progressBarsRef.current[idx] = el)}
              className="absolute inset-0 bg-white rounded-full origin-left"
              style={{
                transform:
                  idx === activeSlide
                    ? `scaleX(${progress / 100})`
                    : idx < activeSlide
                    ? "scaleX(1)"
                    : "scaleX(0)",
                willChange: "transform",
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlideIndicators;
