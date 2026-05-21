export default function JournalLoading() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 bg-stone-50/50">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-12 md:h-16 bg-stone-200/60 rounded-lg w-64 mx-auto mb-16"></div>
        <div className="space-y-16 md:space-y-24">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 aspect-[4/3] bg-stone-200/60 rounded-2xl"></div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="h-4 bg-stone-200/60 rounded w-24"></div>
                <div className="h-8 bg-stone-200/60 rounded w-3/4"></div>
                <div className="h-4 bg-stone-200/60 rounded w-full"></div>
                <div className="h-4 bg-stone-200/60 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
