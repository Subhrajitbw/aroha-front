// components/carousel/ProductSection.jsx
import ProductSlider from "../ProductSlider";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import CTASection from "./CTASection";

export default function ProductSection({
  selectedTab,
  products,
  loading,
  viewport,
  responsiveValues,
  linkState,
  sliderRef,
  ctaRef
}) {
  return (
    <div className="space-y-2">
      {/* Selected Tab Indicator */}
      <div className="text-center lg:text-left">
        <h2 className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 mb-2">
          {selectedTab}
        </h2>
        <div className="w-8 md:w-12 h-[1px] bg-gradient-to-r from-amber-500 to-transparent mx-auto lg:mx-0" />
      </div>

      {/* Product Slider Section */}
      <div ref={sliderRef} className="relative opacity-1">
        {loading ? (
          <LoadingSkeleton viewport={viewport} />
        ) : products.length > 0 ? (
          <ProductSlider
            products={products}
            loading={false}
            showNavigation={responsiveValues.showNavigation}
            showDots={responsiveValues.showDots}
            gap={responsiveValues.gap}
            slidesToShow={responsiveValues.slidesToShow}
            className="product-carousel-slider"
            key={`${viewport.width}-${selectedTab}`}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* CTA Section */}
      {!loading && products.length > 0 && (
        <CTASection ref={ctaRef} linkState={linkState} />
      )}
    </div>
  );
}
