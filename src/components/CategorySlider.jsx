// src/components/CategorySlider.jsx
import React from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useCategoryData } from "../hooks/useCategoryData";
import { useRegion } from "../hooks/useRegion";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import { useCategorySelection } from "../hooks/useCategorySelection";
import { useIsMobile } from "../hooks/useIsMobile";
import { useTabScroll } from "../hooks/useTabScroll";
import { useSelectedTabScroll } from "../hooks/useSelectedTabScroll";
import { useCategorySliderAnimation } from "../hooks/useCategorySliderAnimation";
import { getResponsiveSliderConfig } from "../utils/responsiveConfig";
import { useCarouselAnimation } from "../hooks/useCarouselAnimation";
import { useInitialized } from "../hooks/useInitialized";

import SectionBackground from "./carousel/SectionBackground";
import CategoryHeader from "./category/CategoryHeader";
import CategoryNavBar from "./CategroyNavBar";
import CategoryProductSection from "./category/CategoryProductSection";
import {
  CategoryLoadingState,
  CategoryEmptyState,
} from "./category/CategoryLoadingStates";

export default function CategorySlider() {
  // Data fetching
  const { categories, loading: categoriesLoading } = useCategoryData();
  const { regionId } = useRegion();

  // UI state
  const viewport = useResponsive();
  const isMobile = useIsMobile();
  const { selectedSlug, selectedCategory, handleTabClick } =
    useCategorySelection(categories);

  // Products
  const { products, loading: productsLoading } = useCategoryProducts(
    selectedSlug,
    regionId
  );

  const isInitialized = useInitialized(categoriesLoading);

  // Tab scroll management
  const { tabsScrollRef, showArrows, atStart, atEnd, scrollTabs } =
    useTabScroll(categories, isMobile);

  // Animation refs
  const { sectionRef, headerRef, tabsRef, sliderRef, ctaRef } =
    useCarouselAnimation(isInitialized && categories.length > 0, isMobile);

  // Auto-scroll to selected tab
  useSelectedTabScroll(selectedSlug, tabsRef);

  // Responsive configuration
  const responsiveValues = getResponsiveSliderConfig(viewport);

  // Loading state
  if (categoriesLoading) {
    return <CategoryLoadingState />;
  }

  // Empty state
  if (categories.length === 0) {
    return <CategoryEmptyState />;
  }

  return (
    <section
      ref={sectionRef}
      className="bg-transparent h-svh w-full overflow-hidden flex items-start justify-center md:pt-16 pt-[1rem]"
    >
      <SectionBackground />

      <div className="flex flex-col sm:flex-row md:flex-col justify-center md:justify-start w-full max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 grid-cols-1 lg:flex-row lg:items-center lg:justify-between md:mb-10 lg:mb-12 md:gap-4">
          <CategoryHeader ref={headerRef} />
          <CategoryNavBar
            ref={tabsRef}
            categories={categories}
            selectedSlug={selectedSlug}
            onTabClick={handleTabClick}
            arrowConfig={{ showArrows, atStart, atEnd }}
            scrollTabs={scrollTabs}
            tabsScrollRef={tabsScrollRef}
          />
        </div>

        <CategoryProductSection
          selectedCategory={selectedCategory}
          products={products}
          loading={productsLoading}
          viewport={viewport}
          responsiveValues={responsiveValues}
          sliderRef={sliderRef}
          ctaRef={ctaRef}
        />
      </div>
    </section>
  );
}
