// components/category/CategoryProductSection.jsx (Updated)
import LoadingSkeleton from "../carousel/LoadingSkeleton";
import EmptyState from "../carousel/EmptyState";
import CategoryCTA from "./CategoryCTA";
import ProductSlider from "../ProductSlider";

export default function CategoryProductSection({
  selectedCategory,
  products,
  loading,
  viewport,
  responsiveValues,
  sliderRef,
  ctaRef
}) {
  const linkState = {
    categoryName: selectedCategory?.name,
    categoryId: selectedCategory?._id,
    fromCategorySlider: true
  };

  return (
    <div className="space-y-2">
      {/* Selected Category Indicator */}
      <div className="text-center lg:text-left">
        <h2 className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 mb-2">
          {selectedCategory?.name || "Products"}
        </h2>
        <div className="w-8 md:w-12 h-[1px] bg-gradient-to-r from-amber-500 to-transparent mx-auto lg:mx-0" />
        
        {/* Category description
        {selectedCategory?.description && (
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto lg:mx-0">
            {selectedCategory.description}
          </p>
        )} */}
      </div>

      {/* Product Slider Section */}
      <div ref={sliderRef} className="relative opacity-1">
        {loading ? (
          <LoadingSkeleton viewport={viewport} />
        ) : products.length > 0 ? (
          <ProductSlider
            key={`category-slider-${selectedCategory?._id || 'default'}-${viewport.width}`}
            products={products}
            showNavigation={responsiveValues.showNavigation}
            showDots={responsiveValues.showDots}
            gap={responsiveValues.gap}
            cardSize="md"
            className="category-product-slider"
          />
        ) : (
          <EmptyState 
            title={`No ${selectedCategory?.name || 'products'} available`}
            description="Check back soon for new arrivals in this category"
          />
        )}
      </div>

      {/* CTA Section */}
      {!loading && products.length > 0 && (
        <CategoryCTA
          ref={ctaRef}
          selectedCategory={selectedCategory}
          productCount={products.length}
          linkState={linkState}
          className="opacity-0"
        />
      )}
    </div>
  );
}
