// components/category/CategoryHeader.jsx
import { forwardRef } from "react";

const CategoryHeader = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="mb-2 lg:mb-0">
      <div className="flex items-center gap-3 md:gap-4 mb-2">
        <div className="w-6 md:w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-500" />
        <span className="text-xs md:text-sm font-medium text-amber-600 tracking-[0.15em] md:tracking-[0.2em] uppercase">
          Curated Collections
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 tracking-wide">
        Discover <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">Excellence</span>
      </h1>
      <p className="text-gray-600 mt-2 md:mt-3 text-sm md:text-base max-w-md">
        Handpicked furniture collections crafted for discerning taste
      </p>
    </div>
  );
});

CategoryHeader.displayName = "CategoryHeader";
export default CategoryHeader;
