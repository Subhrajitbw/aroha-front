// components/ProductControls.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, Rows3, ArrowUpDown, ChevronDown, SlidersHorizontal, Filter } from "lucide-react";

const LuxuryDropdown = ({ value, onChange, options, label, icon, mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = options.find(opt => opt.value === value);

  return (
    <div className="relative flex-1 sm:flex-none">
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ y: 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-light text-stone-700 hover:bg-white hover:border-stone-300/60 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-400 w-full sm:w-auto ${
          mobile ? 'justify-between' : ''
        }`}
      >
        {icon && <span className="text-stone-500 flex-shrink-0">{icon}</span>}
        <span className={`${mobile ? 'flex-1' : ''} text-left truncate`}>
          {currentOption?.label || label}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-stone-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full mt-2 left-0 right-0 bg-white/95 backdrop-blur-xl border border-stone-200/60 rounded-xl sm:rounded-2xl shadow-xl shadow-stone-900/10 z-50 overflow-hidden min-w-full sm:min-w-[200px]"
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-light transition-all duration-300 ${
                    value === option.value 
                      ? 'bg-stone-100 text-stone-900' 
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate block">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ViewToggle = ({ view, onChange }) => (
  <div className="flex items-center bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-sm">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange("grid")}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
        view === "grid" 
          ? 'bg-stone-900 text-white shadow-lg' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
      }`}
    >
      <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="text-xs sm:text-sm font-light hidden xs:block sm:hidden md:block">Grid</span>
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange("list")}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
        view === "list" 
          ? 'bg-stone-900 text-white shadow-lg' 
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
      }`}
    >
      <Rows3 className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="text-xs sm:text-sm font-light hidden xs:block sm:hidden md:block">List</span>
    </motion.button>
  </div>
);

const ProductCount = ({ productCount }) => (
  <div className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-light text-stone-600 shadow-sm whitespace-nowrap">
    <span className="hidden xs:inline">{productCount} </span>
    <span className="xs:hidden">{productCount}</span>
    <span className="hidden xs:inline ml-1">
      {productCount === 1 ? 'piece' : 'pieces'}
    </span>
  </div>
);

export const ProductControls = ({ 
  view, 
  onViewChange, 
  sort, 
  onSortChange, 
  productCount,
  onMobileFilterOpen,
  className = ""
}) => {
  const sortOptions = [
    { value: "curated", label: "Curated Selection" },
    { value: "price-low", label: "Price: Accessible First" },
    { value: "price-high", label: "Price: Premium First" },
    { value: "newest", label: "Latest Arrivals" },
    { value: "rating", label: "Most Coveted" },
    { value: "popular", label: "Collector's Choice" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`w-full ${className}`}
    >
      {/* Mobile Layout (< lg) */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Filter Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMobileFilterOpen}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-xl sm:rounded-2xl text-stone-600 hover:text-stone-900 hover:bg-white transition-all duration-300 shadow-sm"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-light">Refine & Sort Selection</span>
        </motion.button>
        
        {/* Mobile Controls Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ViewToggle view={view} onChange={onViewChange} />
          <LuxuryDropdown
            value={sort}
            onChange={onSortChange}
            options={sortOptions}
            label="Sort"
            icon={<ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            mobile={true}
          />
          <ProductCount productCount={productCount} />
        </div>
      </div>

      {/* Desktop Layout (>= lg) */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
        {/* Mobile filter button for tablet range */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMobileFilterOpen}
          className="xl:hidden flex items-center justify-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-2xl text-stone-600 hover:text-stone-900 hover:bg-white transition-all duration-300 shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-sm font-light">Filters</span>
        </motion.button>

        {/* Desktop Controls */}
        <div className="flex items-center gap-4 xl:gap-6 ml-auto">
          <ViewToggle view={view} onChange={onViewChange} />
          <LuxuryDropdown
            value={sort}
            onChange={onSortChange}
            options={sortOptions}
            label="Curate by"
            icon={<ArrowUpDown className="w-4 h-4" />}
          />
          <ProductCount productCount={productCount} />
        </div>
      </div>
    </motion.div>
  );
};
