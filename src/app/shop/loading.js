export default function ShopLoading() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center bg-gradient-to-br from-stone-50/30 via-white to-stone-100/30">
      <div className="animate-pulse space-y-6 text-center max-w-[2200px] w-full px-4 md:px-8 xl:px-16">
        <div className="h-10 md:h-14 bg-stone-200/60 rounded-lg w-64 mx-auto mb-2"></div>
        <div className="h-4 bg-stone-200/60 rounded w-48 mx-auto mb-12"></div>
        
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12 w-full mt-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] bg-stone-200/60 rounded-2xl w-full"></div>
              <div className="h-4 bg-stone-200/60 rounded w-3/4"></div>
              <div className="h-4 bg-stone-200/60 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
