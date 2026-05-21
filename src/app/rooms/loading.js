export default function RoomsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">
      <div className="max-w-[2200px] mx-auto px-4 md:px-8 xl:px-16 animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-16 md:mb-24 space-y-6">
          <div className="h-12 md:h-16 bg-stone-200/60 rounded-lg w-64"></div>
          <div className="h-4 md:h-6 bg-stone-200/60 rounded w-full max-w-2xl"></div>
        </div>

        {/* Room Section Skeleton */}
        <div className="space-y-24 md:space-y-40">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-12">
              <div className="flex items-end justify-between">
                <div className="h-10 bg-stone-200/60 rounded-lg w-48"></div>
                <div className="h-4 bg-stone-200/60 rounded-full w-24"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="aspect-[16/10] md:aspect-[4/3] bg-stone-200/60 rounded-2xl w-full"></div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex flex-col gap-3">
                      <div className="aspect-[3/4] bg-stone-200/60 rounded-xl w-full"></div>
                      <div className="h-3 bg-stone-200/60 rounded w-2/3"></div>
                      <div className="h-3 bg-stone-200/60 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
