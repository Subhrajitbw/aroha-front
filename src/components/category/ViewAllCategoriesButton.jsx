// src/components/category/ViewAllCategoriesButton.jsx
import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Grid3X3 } from "lucide-react";

const ViewAllCategoriesButton = forwardRef(({ handleViewAllHover }, ref) => {
  return (
    <div ref={ref} className="pt-4">
      <Link
        to="/categories"
        className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl text-gray-800 rounded-full text-sm font-medium tracking-wide border border-white/40 hover:border-white/60 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        onMouseEnter={(e) => handleViewAllHover(e, true)}
        onMouseLeave={(e) => handleViewAllHover(e, false)}
        aria-label="View all categories"
      >
        <Grid3X3
          size={16}
          className="view-all-icon text-gray-600 transition-all duration-200"
          aria-hidden="true"
        />
        <span className="view-all-text transition-transform duration-200">
          View All Categories
        </span>
      </Link>
    </div>
  );
});

ViewAllCategoriesButton.displayName = "ViewAllCategoriesButton";

export default ViewAllCategoriesButton;
