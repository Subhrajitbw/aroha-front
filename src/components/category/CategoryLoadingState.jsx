// components/category/CategoryLoadingState.jsx
import ProductSlider from "../ProductSlider";

export default function CategoryLoadingState({ products }) {
  return (
    <div className="w-full py-8 space-y-8">
      <div className="w-full mx-auto space-y-6">
        <div className="flex gap-3 animate-pulse justify-center px-4 sm:px-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 w-24 h-24 sm:w-32 sm:h-32"
            />
          ))}
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <ProductSlider products={products} loading={true} />
        </div>
      </div>
    </div>
  );
}
