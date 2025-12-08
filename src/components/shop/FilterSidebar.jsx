// components/FilterSidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, Star, Sparkles, Crown, Diamond } from "lucide-react";
import { PriceRangeSlider } from "./PricingRangeSlider";

const FilterSection = ({
  title,
  children,
  defaultOpen = false,
  icon,
  accent = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${
        accent ? "bg-gradient-to-r from-stone-50/50 to-amber-50/30" : ""
      } ${
        accent ? "-mx-4 px-4 py-4 rounded-xl mb-3" : "py-4"
      } first:pt-0 last:pb-0`}
    >
      <motion.button
        whileHover={{ x: 2 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group relative overflow-hidden"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <motion.span
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`${
                accent ? "text-amber-600" : "text-stone-400"
              } group-hover:text-stone-600 transition-all duration-300`}
            >
              {icon}
            </motion.span>
          )}
          <span
            className={`text-sm font-medium ${
              accent ? "text-stone-800" : "text-stone-900"
            } group-hover:text-stone-700 transition-colors duration-300 tracking-wide`}
          >
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <ChevronDown
            className={`w-4 h-4 ${
              accent ? "text-amber-500" : "text-stone-400"
            } group-hover:text-stone-600 transition-colors duration-300`}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{
              duration: 0.5,
              ease: [0.04, 0.62, 0.23, 0.98],
              opacity: { duration: 0.3 },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="pt-4"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LuxuryCheckbox = ({
  id,
  label,
  checked,
  onChange,
  count,
  premium = false,
  featured = false,
}) => (
  <motion.label
    whileHover={{ x: 4, scale: 1.01 }}
    htmlFor={id}
    className="flex items-center justify-between group cursor-pointer py-2.5 -mx-2 px-2 rounded-lg hover:bg-gradient-to-r hover:from-stone-50/60 hover:to-transparent transition-all duration-400 relative overflow-hidden"
  >
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <motion.div
          animate={{
            backgroundColor: checked
              ? premium
                ? "#f59e0b"
                : "#1c1917"
              : "transparent",
            borderColor: checked
              ? premium
                ? "#f59e0b"
                : "#1c1917"
              : "#d6d3d1",
            boxShadow: checked
              ? premium
                ? "0 0 15px rgba(245, 158, 11, 0.3)"
                : "0 1px 4px rgba(28, 25, 23, 0.2)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-4 h-4 border border-stone-300 rounded flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
        >
          {checked && (
            <motion.svg
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </motion.div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-700 group-hover:text-stone-900 transition-colors duration-300 font-medium tracking-wide">
          {label}
        </span>
        {premium && <Crown className="w-3 h-3 text-amber-500" />}
        {featured && <Sparkles className="w-3 h-3 text-rose-400" />}
      </div>
    </div>

    {typeof count === "number" && (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-300 ${
          premium
            ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200/50"
            : checked
            ? "bg-stone-900 text-white"
            : "text-stone-400 bg-stone-100 group-hover:bg-stone-200 group-hover:text-stone-600"
        }`}
      >
        {count}
      </span>
    )}
  </motion.label>
);

// Build tree from parent_category_id
const buildCategoryTree = (categories) => {
  const map = new Map();
  (categories || []).forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  const roots = [];
  map.forEach((cat) => {
    if (cat.parent_category_id && map.has(cat.parent_category_id)) {
      map.get(cat.parent_category_id).children.push(cat);
    } else {
      roots.push(cat);
    }
  });
  return roots;
};

const CategoryNode = ({ node, filters, onToggle }) => (
  <div key={node.id}>
    <LuxuryCheckbox
      id={`cat-${node.id}`}
      label={node.name || node.title}
      checked={filters.categories?.includes(node.id) || false}
      onChange={() => onToggle(node.id)}
    />
    {node.children?.length > 0 && (
      <div className="ml-4 border-l border-stone-200/70 pl-3 mt-1 space-y-1">
        {node.children.map((child) => (
          <CategoryNode
            key={child.id}
            node={child}
            filters={filters}
            onToggle={onToggle}
          />
        ))}
      </div>
    )}
  </div>
);

export const FilterSidebar = ({
  filters,
  onFiltersChange,
  collections = [],
  categories = [],
  priceBounds = { min: 0, max: 0 },
  className = "",
  isMobile = false,
}) => {
  const ratings = [5, 4, 3, 2];
  const categoryTree = buildCategoryTree(categories);

  const handleCollectionToggle = (id) => {
    const current = filters.collections || [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onFiltersChange({ ...filters, collections: next });
  };

  const handleCategoryToggle = (id) => {
    const current = filters.categories || [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onFiltersChange({ ...filters, categories: next });
  };

  const toggleFlag = (key) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`${isMobile ? "w-full" : "w-72"} ${className}`}
    >
      <div className={isMobile ? "" : "sticky top-24"}>
        <motion.div
          className="relative bg-gradient-to-br from-white/95 via-white/90 to-stone-50/80 backdrop-blur-2xl border border-stone-200/60 rounded-2xl p-5 shadow-lg shadow-stone-900/5 overflow-hidden"
          whileHover={{ scale: isMobile ? 1 : 1.005 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6 relative z-10"
          >
            <div className="p-2 bg-gradient-to-br from-stone-900 to-stone-700 rounded-xl shadow-md">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-medium text-stone-900 tracking-wide">
                Filter products
              </h2>
              <p className="text-xs text-stone-500 font-light">
                Narrow down the products you see
              </p>
            </div>
          </motion.div>

          <div className="space-y-1 relative z-10">
            {/* Collections */}
            {collections.length > 0 && (
              <FilterSection
                title="Collections"
                defaultOpen
                accent
                icon={<Diamond className="w-4 h-4" />}
              >
                <div className="space-y-1">
                  {collections.map((col) => (
                    <LuxuryCheckbox
                      key={col.id}
                      id={`col-${col.id}`}
                      label={col.title}
                      checked={filters.collections?.includes(col.id) || false}
                      onChange={() => handleCollectionToggle(col.id)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Categories */}
            <FilterSection
              title="Categories"
              icon={<Diamond className="w-4 h-4" />}
            >
              <div className="space-y-1">
                {categoryTree.map((cat) => (
                  <CategoryNode
                    key={cat.id}
                    node={cat}
                    filters={filters}
                    onToggle={handleCategoryToggle}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Price range */}
            <FilterSection
              title="Price range"
              icon={<Sparkles className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <PriceRangeSlider
                  min={priceBounds.min || 0}
                  max={priceBounds.max || 0}
                  value={
                    filters.priceRange || [priceBounds.min, priceBounds.max]
                  }
                  onChange={(nextRange) =>
                    onFiltersChange({ ...filters, priceRange: nextRange })
                  }
                  step={1000}
                />
                <div className="text-[11px] text-stone-500">
                  Maximum price:{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(priceBounds.max || 0)}
                </div>
              </div>
            </FilterSection>

            {/* Highlights */}
            <FilterSection title="Filters" icon={<Crown className="w-4 h-4" />}>
              <div className="space-y-1">
                <LuxuryCheckbox
                  id="hl-discount"
                  label="On sale only"
                  checked={filters.discountedOnly || false}
                  onChange={() => toggleFlag("discountedOnly")}
                  premium
                />
                <LuxuryCheckbox
                  id="hl-new"
                  label="New arrivals"
                  checked={filters.newOnly || false}
                  onChange={() => toggleFlag("newOnly")}
                  featured
                />
                <LuxuryCheckbox
                  id="hl-stock"
                  label="In stock only"
                  checked={filters.inStockOnly || false}
                  onChange={() => toggleFlag("inStockOnly")}
                />
              </div>
            </FilterSection>

            {/* Ratings (UI only for now) */}
            <FilterSection title="Ratings" icon={<Star className="w-4 h-4" />}>
              <div className="space-y-2">
                {ratings.map((rating) => (
                  <LuxuryCheckbox
                    key={rating}
                    id={`rating-${rating}`}
                    label={
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-stone-200"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-stone-600 font-light">
                          and above
                        </span>
                      </div>
                    }
                    checked={filters.ratings?.includes(rating) || false}
                    onChange={() => {
                      const current = filters.ratings || [];
                      const next = current.includes(rating)
                        ? current.filter((r) => r !== rating)
                        : [...current, rating];
                      onFiltersChange({ ...filters, ratings: next });
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
};
