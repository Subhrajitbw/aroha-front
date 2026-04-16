// components/productSlider/SliderNavigation.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SliderNavigation({
  onPrevious,
  onNext,
  showPrevious,
  showNext,
  sliderContent
}) {
  return (
    <div className="flex items-start gap-4">
      <button
        onClick={onPrevious}
        disabled={!showPrevious}
        className="disabled:opacity-25 disabled:cursor-not-allowed pt-24 p-2 rounded-lg  transition-colors duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      {sliderContent}
      <button
        onClick={onNext}
        disabled={!showNext}
        className="disabled:opacity-25 disabled:cursor-not-allowed pt-24 p-2 rounded-lg  transition-colors duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
