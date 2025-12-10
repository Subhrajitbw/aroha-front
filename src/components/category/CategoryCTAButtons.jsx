// src/components/category/CategoryCTAButtons.jsx
import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { MoveRight, ArrowUpRight } from "lucide-react";

const CategoryCTAButtons = forwardRef(({ handleCTAHover }, ref) => {
  return (
    <div
      ref={ref}
      className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full max-w-md sm:max-w-none px-4 sm:px-0"
    >
      <Link
        to="/featured"
        className="cta-button w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full text-base font-medium tracking-wide shadow-xl shadow-black/8 hover:shadow-2xl hover:shadow-black/15 transition-shadow duration-300"
        onMouseEnter={(e) => handleCTAHover(e, true)}
        onMouseLeave={(e) => handleCTAHover(e, false)}
        aria-label="Featured Collection"
      >
        <span>Featured Collection</span>
        <ArrowUpRight
          size={18}
          className="cta-icon transition-transform duration-200"
          aria-hidden="true"
        />
      </Link>

      <Link
        to="/new-arrivals"
        className="cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/70 backdrop-blur-xl text-gray-800 rounded-full text-base font-light tracking-wide border border-white/50 hover:bg-white/85 transition-all duration-300 shadow-lg shadow-black/5"
        onMouseEnter={(e) => handleCTAHover(e, true)}
        onMouseLeave={(e) => handleCTAHover(e, false)}
        aria-label="New Arrivals"
      >
        <span>New Arrivals</span>
        <MoveRight
          size={18}
          className="cta-icon transition-transform duration-200"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
});

CategoryCTAButtons.displayName = "CategoryCTAButtons";

export default CategoryCTAButtons;
