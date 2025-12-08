// components/category/CategoryCTA.jsx
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CategoryCTA = forwardRef(({ selectedCategory, linkState = {} }, ref) => {
  if (!selectedCategory) return null;

  const categoryName = selectedCategory.name || "Products";
  const categoryId = selectedCategory.id || selectedCategory._id;

  return (
    <div ref={ref} className="text-center">
      <Link
        to={`/shop/category/${categoryId}`}
        state={{ initialCategoryId: categoryId }}
        className="group inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium text-amber-700 bg-white/90 backdrop-blur-sm transition-all duration-300 transform-gpu hover:scale-105"
      >
        <span className="tracking-wide">Explore collection</span>
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
});

CategoryCTA.displayName = "CategoryCTA";
export default CategoryCTA;
