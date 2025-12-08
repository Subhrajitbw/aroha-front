// components/MobileFilterDrawer.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";

export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  collections,
  categories,
  priceBounds,
  sort,
  onSortChange,
}) => {
  const sortOptions = [
    { value: "relevance", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "best-selling", label: "Best Selling" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-full max-w-full bg-white/95 backdrop-blur-xl z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-medium tracking-wide text-stone-900">
                  Filters & Sort
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4 text-stone-700" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-20">
              <div className="p-4 space-y-6">
                {/* Sort section */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
                    Sort by
                  </p>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => onSortChange(e.target.value)}
                      className="w-full border border-stone-200 bg-white text-sm px-3 py-2 rounded-full text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filters */}
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  collections={collections}
                  categories={categories}
                  priceBounds={priceBounds}
                  className="w-full"
                  isMobile
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-stone-200/60 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    priceRange: [priceBounds.min, priceBounds.max],
                    collections: [],
                    categories: [],
                    discountedOnly: false,
                    newOnly: false,
                    inStockOnly: false,
                    ratings: [],
                  })
                }
                className="text-xs sm:text-sm px-3 py-2 rounded-full border border-stone-300 text-stone-700"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-xs sm:text-sm px-4 py-2 rounded-full bg-stone-900 text-white font-medium tracking-wide hover:bg-stone-800 transition-colors"
              >
                Show results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
