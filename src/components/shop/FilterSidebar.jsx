// components/FilterSidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  ChevronDown,
  Star,
  Sparkles,
  Crown,
  Diamond,
} from "lucide-react";
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
            <span className={`${accent ? "text-stone-600" : "text-stone-400"} transition-all duration-300`}>
              {icon}
            </span>
          )}
          <span className="text-sm uppercase tracking-[0.1em] font-bold text-stone-900 group-hover:text-stone-500 transition-colors duration-300">
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="text-stone-400 group-hover:text-stone-900 transition-colors duration-300 text-lg font-normal leading-none"
        >
          {isOpen ? "−" : "+"}
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
  <label
    htmlFor={id}
    className="flex items-center justify-between group cursor-pointer py-1.5 transition-all duration-300 relative"
  >
    <div className="flex items-center space-x-3">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-3.5 h-3.5 border flex items-center justify-center transition-all duration-300 ${
            checked ? "bg-stone-900 border-stone-900" : "bg-transparent border-stone-300 group-hover:border-stone-500"
          }`}
        >
          {checked && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-normal tracking-wide transition-colors duration-300 ${checked ? "text-stone-900" : "text-stone-700 group-hover:text-stone-900"}`}>
          {label}
        </span>
      </div>
    </div>

    {typeof count === "number" && (
      <span className="text-xs text-stone-500 font-normal tracking-widest">
        ({count})
      </span>
    )}

  </label>
);

// Build tree from parent_category_id, still keyed by id internally
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

// NOTE: CategoryNode now toggles by HANDLE, not ID
const CategoryNode = ({ node, filters, onToggle }) => {
  const handle = node.handle; // Medusa handle
  return (
    <div key={node.id}>
      <LuxuryCheckbox
        id={`cat-${handle}`}
        label={node.name || node.title}
        checked={filters.categories?.includes(handle) || false}
        onChange={() => onToggle(handle)}
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
};

export const FilterSidebar = ({
  filters,
  onFiltersChange,
  collections = [],
  categories = [],
  priceBounds = { min: 0, max: 0 },
  tags = [],
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

  // Toggle categories by HANDLE
  const handleCategoryToggle = (handle) => {
    const current = filters.categories || [];
    const next = current.includes(handle)
      ? current.filter((c) => c !== handle)
      : [...current, handle];
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
      <div className={isMobile ? "" : "sticky top-32"}>
        <div
          className={`relative ${!isMobile ? "border-r border-stone-200/40 pr-6 mr-6" : ""} bg-transparent`}
        >
          {/* Header */}
          {!isMobile && (
            <div className="mb-10 pb-4 border-b border-stone-200/40">
              <h2 className="text-xs uppercase tracking-[0.1em] font-normal text-stone-900">
                Refine Selections
              </h2>
            </div>
          )}

          <div className="space-y-2 relative z-10">
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

            {/* Categories (by handle) */}
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

            {/* Tags / Suitability */}
            {tags && tags.length > 0 && (
              <FilterSection title="Suitability">
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <LuxuryCheckbox
                      key={tag}
                      id={`tag-${tag}`}
                      label={tag.replace(/-/g, " ")}
                      checked={filters.tags?.includes(tag) || false}
                      onChange={() => {
                        const current = filters.tags || [];
                        const next = current.includes(tag)
                          ? current.filter((t) => t !== tag)
                          : [...current, tag];
                        onFiltersChange({ ...filters, tags: next });
                      }}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Price range */}
            <FilterSection
              title="Price"
              defaultOpen
            >
              <div className="space-y-6 pt-2">
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

            {/* Ratings */}
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
        </div>
      </div>
    </motion.aside>
  );
};
