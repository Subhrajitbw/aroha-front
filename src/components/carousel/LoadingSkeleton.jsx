export default function LoadingSkeleton({ viewport = {} }) {
  const { isMobile = false, isTablet = false } = viewport;
  const getGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getSkeletonCount = () => {
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };

  return (
    <div className={`grid gap-4 md:gap-6 ${getGridCols()}`}>
      {[...Array(getSkeletonCount())].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-3 md:mb-4" />
          <div className="space-y-2">
            <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
