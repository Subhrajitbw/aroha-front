// components/category/CategoryNavigation.jsx
import { forwardRef } from "react";
import CategoryTab from "./CategoryTab";

const CategoryNavigation = forwardRef(({ 
  categories, 
  selectedSlug, 
  onTabClick, 
  arrowConfig, 
  scrollTabs, 
  tabsScrollRef 
}, ref) => {
  return (
    <div ref={ref} className="opacity-1">
      <div className="relative">
        {/* Scroll Arrows */}
        {arrowConfig.showArrows && (
          <>
            <button
              onClick={() => scrollTabs("left")}
              disabled={arrowConfig.atStart}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => scrollTabs("right")}
              disabled={arrowConfig.atEnd}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-50"
            >
              →
            </button>
          </>
        )}
        
        {/* Category Tabs */}
        <div 
          ref={tabsScrollRef}
          className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 md:px-0"
        >
          {categories.map((category) => (
            <CategoryTab
              key={category._id}
              category={category}
              isSelected={selectedSlug === category._id}
              onClick={() => onTabClick(category._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

CategoryNavigation.displayName = "CategoryNavigation";
export default CategoryNavigation;
