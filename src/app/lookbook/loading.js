export default function LookbookLoading() {
  return (
    <div className="min-h-screen bg-black pt-24 overflow-hidden">
      <div className="animate-pulse w-full max-w-[2200px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
          <div className="w-16 h-16 border-t-2 border-white/20 border-r-2 border-r-transparent rounded-full animate-spin"></div>
          <div className="h-4 bg-white/10 rounded w-32 tracking-[0.3em]"></div>
        </div>
      </div>
    </div>
  );
}
