import React, { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NavigationButton = memo(({ direction, onClick, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center rounded-full transition-all duration-200 border backdrop-blur-sm z-20 touch-manipulation flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 border-gray-200/70
               ${disabled
                 ? "text-gray-300 cursor-not-allowed bg-gray-50/70 border-gray-100"
                 : "text-gray-700"
               } ${className}`}
    aria-label={`Scroll ${direction}`}
  >
    {direction === "left" ? 
      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : 
      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  </button>
));

export default NavigationButton;
