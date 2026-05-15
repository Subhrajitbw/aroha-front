// components/FilterSidebar.jsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  ChevronDown,
  Star,
  Sparkles,
  Crown,
  Diamond,
  RotateCcw,
  Plus,
  Minus
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
    <div className={`relative ${accent ? "bg-stone-50/40 rounded-2xl mb-4 px-2" : "mb-2"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-2 text-left group"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className={`transition-transform duration-500 group-hover:scale-110 ${accent ? "text-amber-600" : "text-stone-400"}`}>
              {icon}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-900 group-hover:text-stone-600 transition-colors">
            {title}
          </span>
        </div>
        <div className="text-stone-300 group-hover:text-stone-900 transition-colors">
          {isOpen ? <Minus size={14} strokeWidth={1} /> : <Plus size={14} strokeWidth={1} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 px-2 space-y-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LuxuryCheckbox = ({
  id,
  label,
  checked,
  onChange,
  count,
  isChild = false
}) => (
  <label
    htmlFor={id}
    className={`flex items-center justify-between group cursor-pointer py-2 rounded-lg transition-all duration-300 ${
      checked ? "bg-stone-100/50 px-3 -mx-3" : "hover:bg-stone-50/50 px-3 -mx-3"
    }`}
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
          className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all duration-500 ${
            checked ? "bg-stone-900 border-stone-900 scale-110" : "bg-transparent border-stone-200 group-hover:border-stone-400"
          }`}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          )}
        </div>
      </div>
      <span className={`text-[11px] tracking-wide transition-colors duration-300 ${
        checked ? "text-stone-950 font-bold" : "text-stone-600 group-hover:text-stone-950 font-medium"
      }`}>
        {label}
      </span>
    </div>

    {typeof count === "number" && (
      <span className={`text-[9px] tracking-widest font-bold transition-all duration-500 ${
        checked ? "text-stone-900 scale-110" : "text-stone-300 group-hover:text-stone-400"
      }`}>
        {count.toString().padStart(2, '0')}
      </span>
    )}
  </label>
);

// Build tree from parent_category_id, filtering out categories with no products
const buildCategoryTree = (categories) => {
  const map = new Map();
  
  // First pass: identify active categories
  (categories || []).forEach((c) => {
    // Priority 1: Use pre-calculated hasDirectProducts from custom backend route
    // Priority 2: Use products array length
    // Priority 3: Use product_count
    let finalHasProducts = false;
    
    if (c.hasDirectProducts !== undefined) {
      finalHasProducts = !!c.hasDirectProducts;
    } else if (c.products && Array.isArray(c.products)) {
      finalHasProducts = c.products.length > 0;
    } else if (c.product_count !== undefined) {
      finalHasProducts = c.product_count > 0;
    }

    map.set(c.id, { ...c, children: [], hasDirectProducts: finalHasProducts });
  });

  const roots = [];
  map.forEach((cat) => {
    if (cat.parent_category_id && map.has(cat.parent_category_id)) {
      map.get(cat.parent_category_id).children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  // Prune tree: Keep node only if it has direct products OR its children have products
  const pruneEmptyCategories = (nodes) => {
    const pruned = nodes.filter(node => {
      const activeChildren = pruneEmptyCategories(node.children);
      node.children = activeChildren;
      return node.hasDirectProducts || activeChildren.length > 0;
    });
    
    return pruned;
  };

  return pruneEmptyCategories(roots);
};

const CategoryNode = ({ node, filters, onToggle, level = 0, selectedCategoryHandle }) => {
  const handle = node.handle;
  // Support up to 4 levels of category nesting
  if (level > 3) return null;

  // Recursively determine if any descendant is active
  const checkHasActiveDescendant = (n) => {
    if (!n.children) return false;
    if (n.children.some(c => c.handle === selectedCategoryHandle)) return true;
    return n.children.some(c => checkHasActiveDescendant(c));
  };

  const isActive = selectedCategoryHandle === handle;
  const hasActiveDescendant = checkHasActiveDescendant(node);
  const isExpanded = isActive || hasActiveDescendant;

  return (
    <div key={node.id} className={level === 0 ? "mb-1" : "mt-1"}>
      <LuxuryCheckbox
        id={`cat-${handle}`}
        label={node.name || node.title}
        checked={filters.categories?.includes(handle) || false}
        onChange={() => onToggle(handle)}
        isChild={level > 0}
      />
      
      {/* Subcategories only expand if the parent or a sibling subcategory is active */}
      {node.children?.length > 0 && isExpanded && (
        <AnimatePresence>
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className={`overflow-hidden ${level === 0 ? "ml-4 pl-3 mt-1 border-l border-stone-100" : "ml-4 pl-2 border-l border-stone-100/50"}`}
          >
            {node.children.map((child) => (
              <CategoryNode
                key={child.id}
                node={child}
                filters={filters}
                onToggle={onToggle}
                level={level + 1}
                selectedCategoryHandle={selectedCategoryHandle}
              />
            ))}
          </motion.div>
        </AnimatePresence>
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
  selectedCategoryHandle = null,
  onCategorySelect,
}) => {
  const ratings = [5, 4, 3, 2];
  
  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  const handleCollectionToggle = (id) => {
    const current = filters.collections || [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onFiltersChange({ ...filters, collections: next });
  };

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

  const clearAll = () => {
    onFiltersChange({
      priceRange: [priceBounds.min, priceBounds.max],
      collections: [],
      categories: selectedCategoryHandle ? [selectedCategoryHandle] : [],
      tags: [],
      discountedOnly: false,
      newOnly: false,
      inStockOnly: false,
      ratings: [],
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.collections?.length > 0) count++;
    if (filters.categories?.length > (selectedCategoryHandle ? 1 : 0)) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.discountedOnly) count++;
    if (filters.newOnly) count++;
    if (filters.inStockOnly) count++;
    if (filters.ratings?.length > 0) count++;
    return count;
  }, [filters, selectedCategoryHandle]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: isMobile ? 0 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isMobile ? "w-full" : "w-72"} ${className}`}
    >
      <div className={isMobile ? "" : "sticky top-32"}>
        <div className={`relative ${!isMobile ? "pr-6" : ""} bg-transparent`}>
          {/* Production-Grade Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-900">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[8px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAll}
                className="group flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] text-stone-400 hover:text-stone-950 transition-colors"
              >
                <RotateCcw size={10} className="group-hover:rotate-[-45deg] transition-transform duration-500" />
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1">
            {/* Categories - Intelligent Tree */}
            <FilterSection
              title="Categories"
              defaultOpen
              icon={<Diamond className="w-3.5 h-3.5" />}
            >
              <div className="space-y-0.5">
                {categoryTree.map((cat) => (
                  <CategoryNode
                    key={cat.id}
                    node={cat}
                    filters={filters}
                    onToggle={onCategorySelect || handleCategoryToggle}
                    selectedCategoryHandle={selectedCategoryHandle}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Price Architecture */}
            <FilterSection title="Investment" defaultOpen>
              <div className="pt-2">
                <PriceRangeSlider
                  min={priceBounds.min || 0}
                  max={priceBounds.max || 0}
                  value={filters.priceRange || [priceBounds.min, priceBounds.max]}
                  onChange={(nextRange) => onFiltersChange({ ...filters, priceRange: nextRange })}
                  step={1000}
                />
                <div className="mt-6 flex items-center justify-between text-[10px] tracking-widest text-stone-400 uppercase font-medium">
                  <span>Min</span>
                  <span>Max</span>
                </div>
              </div>
            </FilterSection>

            {/* Curation Filters */}
            <FilterSection title="Curations" icon={<Crown className="w-3.5 h-3.5" />}>
              <div className="space-y-0.5">
                <LuxuryCheckbox
                  id="hl-discount"
                  label="Private Sale"
                  checked={filters.discountedOnly || false}
                  onChange={() => toggleFlag("discountedOnly")}
                />
                <LuxuryCheckbox
                  id="hl-new"
                  label="New Arrivals"
                  checked={filters.newOnly || false}
                  onChange={() => toggleFlag("newOnly")}
                />
                <LuxuryCheckbox
                  id="hl-stock"
                  label="Ready to Ship"
                  checked={filters.inStockOnly || false}
                  onChange={() => toggleFlag("inStockOnly")}
                />
              </div>
            </FilterSection>

            {/* Collections */}
            {collections.length > 0 && (
              <FilterSection title="Collections">
                <div className="space-y-0.5">
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

            {/* Suitability / Tags */}
            {tags && tags.length > 0 && (
              <FilterSection title="Suitability">
                <div className="space-y-0.5">
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

            {/* Ratings - Restored with Luxury Feel */}
            <FilterSection title="Ratings" icon={<Star className="w-3.5 h-3.5" />}>
              <div className="space-y-1">
                {ratings.map((rating) => (
                  <LuxuryCheckbox
                    key={rating}
                    id={`rating-${rating}`}
                    label={
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i < rating ? "fill-stone-900 text-stone-900" : "text-stone-200"}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] uppercase tracking-tighter text-stone-400 font-bold ml-1">
                          & Up
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
