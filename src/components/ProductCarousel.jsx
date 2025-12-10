// src/components/ProductCarousel.jsx
import React from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useIsMobile } from "../hooks/useIsMobile";
import { useProductCarouselData } from "../hooks/useProductCarouselData";
import { useTabSelection } from "../hooks/useTabSelection";
import { useInitialized } from "../hooks/useInitialized";
import { useCarouselAnimation } from "../hooks/useCarouselAnimation";
import { getResponsiveCarouselConfig } from "../utils/responsiveConfig";

import SectionBackground from "./carousel/SectionBackground";
import SectionHeader from "./carousel/SectionHeader";
import ProductSection from "./carousel/ProductSection";
import TabNavigation from "./carousel/TabNavigation";

const TABS = ["New Designs", "Sale", "Best Sellers"];

export default function ProductCarousel() {
  const viewport = useResponsive();
  const isMobile = useIsMobile();

  // Tab selection with derived link state
  const { selectedTab, handleTabSelect, linkState } = useTabSelection(
    TABS,
    "New Designs"
  );

  // Data fetching
  const { products, loading } = useProductCarouselData(selectedTab);

  // Initialization tracking
  const isInitialized = useInitialized(loading);

  // Animation refs
  const { sectionRef, headerRef, tabsRef, sliderRef, ctaRef } =
    useCarouselAnimation(isInitialized, isMobile);

  // Responsive configuration
  const responsiveValues = getResponsiveCarouselConfig(viewport);

  return (
    <section
      ref={sectionRef}
      className="bg-transparent min-h-screen w-full overflow-hidden flex items-start justify-center md:pt-24 md:mt-2 pt-[1rem]"
    >
      <SectionBackground />

      <div className="flex flex-col w-full max-w-7xl px-4 md:px-6 space-y-6 md:space-y-8">
        {/* Header + Tabs Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader ref={headerRef} />
          <TabNavigation
            ref={tabsRef}
            tabs={TABS}
            selectedTab={selectedTab}
            onTabSelect={handleTabSelect}
          />
        </div>

        {/* Product Section */}
        <ProductSection
          selectedTab={selectedTab}
          products={products}
          loading={loading}
          viewport={viewport}
          responsiveValues={responsiveValues}
          linkState={linkState}
          sliderRef={sliderRef}
          ctaRef={ctaRef}
        />
      </div>
    </section>
  );
}
