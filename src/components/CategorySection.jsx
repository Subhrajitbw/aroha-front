// src/components/CategorySection.jsx
import React from "react";
import CategorySlider from "./CategorySlider";
import CategoryBackground from "./category/CategoryBackground";
import CategoryCTAButtons from "./category/CategoryCTAButtons";
import ViewAllCategoriesButton from "./category/ViewAllCategoriesButton";
import { useCategorySectionAnimation } from "../hooks/useCategorySectionAnimation";
import { useCategoryHoverEffects } from "../hooks/useCategoryHoverEffects";
import { responsiveStyles } from "../styles/categorySectionResponsive";

export default function CategorySection() {
  const {
    sectionRef,
    containerRef,
    backgroundRef,
    badgeRef,
    sliderRef,
    ctaRef,
    viewAllRef,
  } = useCategorySectionAnimation();

  const { handleCTAHover, handleViewAllHover } = useCategoryHoverEffects();

  return (
    <section
      ref={sectionRef}
      className="bg-transparent h-screen w-full overflow-hidden flex items-center justify-center pt-48"
      aria-label="Browse categories"
    >
      <CategoryBackground ref={backgroundRef} />

      {/* Content Container */}
      <div
        ref={containerRef}
        className="flex flex-col space-y-12 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-4 md:space-y-4">
          {/* Badge - if you want to keep it */}
          <div
            ref={badgeRef}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-white/60 to-amber-50/40 backdrop-blur-2xl" />
          </div>

          {/* Category Slider */}
          <div ref={sliderRef} className="w-full max-w-full">
            <CategorySlider />
          </div>

          {/* View All Button */}
          <ViewAllCategoriesButton
            ref={viewAllRef}
            handleViewAllHover={handleViewAllHover}
          />

          {/* CTA Buttons */}
          <CategoryCTAButtons ref={ctaRef} handleCTAHover={handleCTAHover} />
        </div>
      </div>

      <style jsx>{responsiveStyles}</style>
    </section>
  );
}
