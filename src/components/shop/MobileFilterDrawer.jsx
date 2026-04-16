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
  tags,
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
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white/95 backdrop-blur-3xl z-50 overflow-hidden flex flex-col border-r border-stone-200/40"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200/40">
              <h2 className="text-sm uppercase tracking-[0.1em] font-bold text-stone-900">
                Refine Selections
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:text-stone-400 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5 text-stone-900" strokeWidth={1} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-20">
              <div className="p-4 space-y-6">
                {/* Sort section */}
                <div className="space-y-4 pt-2">
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-stone-900">
                    Sort by
                  </p>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => onSortChange(e.target.value)}
                      className="w-full border-b border-stone-200 bg-transparent text-sm px-0 py-3 text-stone-800 focus:outline-none focus:border-stone-900 appearance-none rounded-none font-light tracking-wide transition-colors"
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
                  tags={tags}
                  priceBounds={priceBounds}
                  className="w-full"
                  isMobile
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-stone-200/40 bg-white/95 px-6 py-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full text-xs tracking-[0.2em] uppercase px-4 py-4 bg-stone-900 text-white hover:bg-stone-800 transition-colors"
              >
                Show Results
              </button>
              <button
                type="button"
                onClick={() =>
                  onFiltersChange({
                    priceRange: [priceBounds.min, priceBounds.max],
                    collections: [],
                    categories: [],
                    tags: [],
                    discountedOnly: false,
                    newOnly: false,
                    inStockOnly: false,
                    ratings: [],
                  })
                }
                className="w-full text-xs tracking-[0.15em] uppercase px-4 py-3 text-stone-500 hover:text-stone-900 transition-colors"
              >
                Clear Selections
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
