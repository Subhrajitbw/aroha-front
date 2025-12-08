// components/carousel/EmptyState.jsx
export default function EmptyState({ 
  icon = null, 
  title = "No products found", 
  description = "Check back soon for new arrivals" 
}) {
  const defaultIcon = (
    <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-10 0H4" />
    </svg>
  );

  return (
    <div className="text-center py-12 md:py-16">
      <div className="text-gray-400 mb-4">
        {icon || defaultIcon}
      </div>
      <p className="text-gray-500 text-base md:text-lg">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
  );
}
