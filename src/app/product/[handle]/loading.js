export default function ProductLoading() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 lg:px-16 max-w-[2200px] mx-auto bg-[#fafafa]">
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col md:flex-row-reverse gap-4">
          <div className="flex-1 aspect-[4/5] bg-stone-200/60 rounded-2xl"></div>
          <div className="flex md:flex-col gap-4 w-full md:w-24 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 md:w-24 aspect-[3/4] bg-stone-200/60 rounded-xl flex-shrink-0"></div>
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="space-y-8 pt-8 lg:pt-12">
          <div className="space-y-4">
            <div className="h-10 md:h-12 bg-stone-200/60 rounded-lg w-3/4"></div>
            <div className="h-6 bg-stone-200/60 rounded-lg w-1/4"></div>
          </div>
          <div className="h-20 bg-stone-200/60 rounded-lg w-full"></div>
          
          <div className="space-y-4 pt-6">
            <div className="h-12 bg-stone-200/60 rounded-xl w-full"></div>
            <div className="h-12 bg-stone-200/60 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
