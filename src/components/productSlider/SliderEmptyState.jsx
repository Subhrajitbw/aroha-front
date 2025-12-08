// components/productSlider/SliderEmptyState.jsx
export default function SliderEmptyState({ 
  title = "No products available",
  description = "Check back soon for new items"
}) {
  return (
    <div className="text-center py-16">
      <div className="mb-4">
        <svg 
          className="w-12 h-12 mx-auto text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-10 0H4" 
          />
        </svg>
      </div>
      <p className="text-gray-500 text-base mb-1">{title}</p>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
