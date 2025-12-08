// components/hero/HeroButtons.jsx
import React, { forwardRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const HeroButtons = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
      style={{ willChange: "transform, opacity" }}
    >
      <a
        href="/collection"
        className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full text-sm sm:text-base font-medium tracking-wide hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl w-full sm:w-auto"
      >
        <span>Shop Now</span>
        <ArrowRight
          size={16}
          className="group-hover:translate-x-2 transition-transform duration-300"
        />
      </a>

      <a
        href="/explore"
        className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/30 text-white rounded-full text-sm sm:text-base font-light tracking-wide hover:bg-white/10 hover:border-white/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
      >
        <span>Explore More</span>
        <ArrowUpRight
          size={16}
          className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
        />
      </a>
    </div>
  );
});

HeroButtons.displayName = "HeroButtons";
export default HeroButtons;
