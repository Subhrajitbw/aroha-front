// components/hero/NavigationControls.jsx
import React, { forwardRef } from "react";
import { Play, Pause } from "lucide-react";
import SlideIndicators from "./SlideIndecators";

const NavigationControls = forwardRef(({
  activeSlide,
  totalSlides,
  isPlaying,
  progress,
  progressBarsRef,
  onTogglePlay,
  onGoToSlide
}, ref) => {
  return (
    <div
      ref={ref}
      className="w-full sm:w-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mb-3 sm:mb-4">
        <button
          onClick={onTogglePlay}
          className="p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 group"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause
              className="group-hover:scale-110 transition-transform duration-200 text-white"
              size={16}
            />
          ) : (
            <Play
              className="group-hover:scale-110 transition-transform duration-200 text-white ml-0.5"
              size={16}
            />
          )}
        </button>

        <div className="text-right">
          <div className="text-base sm:text-lg font-light text-white tracking-wide">
            <span>{String(activeSlide + 1).padStart(2, "0")}</span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-white/60">
              {String(totalSlides).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-white/50 font-light tracking-wider uppercase">
            Collection
          </div>
        </div>
      </div>

      <SlideIndicators
        totalSlides={totalSlides}
        activeSlide={activeSlide}
        progress={progress}
        progressBarsRef={progressBarsRef}
        onGoToSlide={onGoToSlide}
      />
    </div>
  );
});

NavigationControls.displayName = "NavigationControls";
export default NavigationControls;
