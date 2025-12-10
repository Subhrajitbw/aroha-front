// src/components/category/CategoryLoadingStates.jsx
import React from "react";

export const CategoryLoadingState = () => (
  <section className="h-screen w-full overflow-hidden flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Loading Categories...</p>
    </div>
  </section>
);

export const CategoryEmptyState = () => (
  <section className="h-screen w-full overflow-hidden flex items-center justify-center">
    <div className="text-center">
      <p className="text-gray-500 text-lg">No categories available</p>
    </div>
  </section>
);
