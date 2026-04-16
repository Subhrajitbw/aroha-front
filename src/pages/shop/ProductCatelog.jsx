// pages/ProductCatalog.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { FilterIcon, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { sdk } from "../../lib/medusaClient";

import { FilterSidebar } from "../../components/shop/FilterSidebar";
import { MobileFilterDrawer } from "../../components/shop/MobileFilterDrawer";
import { ProductInfoCard } from "../../components/shop/ProductInfoCard";
import CategoryTab from "../../components/sections/category/CategoryTab";

export default function ProductCatalog() {
  // State management
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [regionId, setRegionId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { categoryHandle: categoryHandleParam } = useParams();

  // Initial category handle from URL or navigation state
  const initialCategoryHandleFromState =
    categoryHandleParam || location.state?.initialCategoryHandle || null;

  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState(
    initialCategoryHandleFromState
  );

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 12; // Adjusted to perfectly divide into 2, 3, or 4 columns
  const [totalCount, setTotalCount] = useState(0);

  // Sort
  const [sort, setSort] = useState("relevance");

  // Dynamic price bounds
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 50000000 });

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    collections: [],
    // we’ll keep categories in filters as handles now
    categories: initialCategoryHandleFromState
      ? [initialCategoryHandleFromState]
      : [],
    discountedOnly: false,
    newOnly: false,
    inStockOnly: false,
    ratings: [],
    tags: [],
  });

  // Category slider interaction state
  const sliderContainerRef = useRef(null);
  const sliderContentRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const x = useMotionValue(0);

  // Keep selectedCategoryHandle and filters.categories in sync with URL changes
  useEffect(() => {
    const next =
      categoryHandleParam || location.state?.initialCategoryHandle || null;
    setSelectedCategoryHandle(next || null);
    setFilters((prev) => ({
      ...prev,
      categories: next ? [next] : [],
    }));
    setPage(1);
    
    // Reset category slider position
    if (x) x.set(0);

    // Explicit scroll restoration to prevent bottom-stuck views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryHandleParam, location.state?.initialCategoryHandle, x]);

  // Fetch region
  useEffect(() => {
    const initRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.length > 0) {
          setRegionId(regions[0].id);
        }
      } catch (e) {
        console.warn("Region fetch failed, falling back to raw prices", e);
      }
    };
    initRegion();
  }, []);

  // Track viewport
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // We use stringified dependencies to avoid infinite loops from object references
  const backendCollections = filters.collections?.join(",") || "";
  const backendCategories = filters.categories?.join(",") || "";

  // Fetch products with backend filtering for categories/collections
  useEffect(() => {
    const fetchProducts = async () => {
      if (!regionId) return;

      // We must wait for categories to load if we need to map handles -> IDs
      if (filters.categories?.length > 0 && categories.length === 0) {
        return;
      }

      setLoading(true);
      try {
        let orderParam;
        if (sort === "newest") {
          orderParam = "-created_at";
        }

        const queryParams = {
          limit: 100, // Fetch more for proper client-side filtering of price/sale
          fields:
            "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*,images,created_at,collection_id,tags",
          region_id: regionId,
        };

        if (orderParam) {
          queryParams.order = orderParam;
        }

        // Backend filtering for collections
        if (filters.collections?.length > 0) {
          queryParams["collection_id[]"] = filters.collections;
        }

        // Backend filtering for categories (requires mapping from handle -> ID)
        if (filters.categories?.length > 0) {
          const categoryIds = filters.categories
            .map((handle) => categories.find((c) => c.handle === handle)?.id)
            .filter(Boolean);

          if (categoryIds.length > 0) {
            queryParams["category_id[]"] = categoryIds;
          }
        }

        const { products: productsList, count } =
          await sdk.store.product.list(queryParams);

        const mappedProducts = (productsList || []).map((product) => {
          const defaultVariant = product.variants?.[0];

          let amount = defaultVariant?.calculated_price?.calculated_amount;
          let originalAmount =
            defaultVariant?.calculated_price?.original_amount;
          let currencyCode = defaultVariant?.calculated_price?.currency_code;

          if (amount === undefined || amount === null) {
            const prices = defaultVariant?.prices || [];
            let priceObj = prices.find(
              (p) => p.currency_code?.toLowerCase() === "inr"
            );
            if (!priceObj) priceObj = prices[0];

            if (priceObj) {
              amount = priceObj.amount;
              originalAmount = priceObj.amount;
              currencyCode = priceObj.currency_code;
            }
          }

          amount = amount || 0;
          originalAmount = originalAmount || 0;
          currencyCode = (currencyCode || "INR").toUpperCase();

          let discount = 0;
          if (originalAmount > amount) {
            discount = Math.round(
              ((originalAmount - amount) / originalAmount) * 100
            );
          }

          const formatPrice = (val) =>
            new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: currencyCode,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(val);

          const isSale = discount > 0;

          return {
            id: product.id,
            title: product.title,
            handle: product.handle,
            image:
              product.thumbnail ||
              product.images?.[0]?.url ||
              "https://placehold.co/600x800/f5f5f5/e0e0e0",
            price: formatPrice(amount),
            originalPrice: isSale ? formatPrice(originalAmount) : null,
            discount,
            status: isSale ? "sale" : "new",
            _rawAmount: amount,
            _rawOriginalAmount: originalAmount,
            _currencyCode: currencyCode,
            collection_id: product.collection_id || product.collection?.id,
            tags: product.tags,
            created_at: product.created_at,
          };
        });

        // Price bounds calculation based on REAL catalog bounds, not just this batch
        const prices = mappedProducts
          .map((p) => p._rawAmount || 0)
          .filter((v) => v > 0);

        if (prices.length) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceBounds((prev) => ({
            min: prev.min === 0 ? min : Math.min(prev.min, min),
            max: prev.max === 50000000 ? max : Math.max(prev.max, max)
          }));

          setFilters((prev) => {
            const isDefault =
              prev.priceRange[0] === 0 && prev.priceRange[1] === 50000000;
            return isDefault ? { ...prev, priceRange: [min, max] } : prev;
          });
        }

        // Local sort for price
        let sortedProducts = [...mappedProducts];

        if (sort === "price-low") {
          sortedProducts.sort(
            (a, b) => (a._rawAmount || 0) - (b._rawAmount || 0)
          );
        } else if (sort === "price-high") {
          sortedProducts.sort(
            (a, b) => (b._rawAmount || 0) - (a._rawAmount || 0)
          );
        }

        setProducts(sortedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sort, regionId, backendCollections, backendCategories, categories.length]);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { collections: collectionsList } =
          await sdk.store.collection.list({
            fields: "id,title,handle",
          });
        setCollections(collectionsList || []);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    };
    fetchCollections();
  }, []);

  // Fetch categories (flat list)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { product_categories } = await sdk.store.category.list({
          limit: 1000,
          offset: 0,
          fields: "id,name,handle,description,parent_category_id",
        });
        setCategories(product_categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (location.state?.applyFilter) {
      const filterKey = location.state.applyFilter;

      setFilters((prev) => ({
        ...prev,
        [filterKey]: true,
        // Reset other quick filters
        newOnly: filterKey === 'newOnly',
        discountedOnly: filterKey === 'discountedOnly',
      }));

      setPage(1);

      // Explicit scroll restoration
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear the state so it doesn't reapply on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Build category tree and helpers (by id, but we also need lookups by handle)
  const buildCategoryTree = (categoriesArray) => {
    const mapById = new Map();
    const mapByHandle = new Map();

    (categoriesArray || []).forEach((c) => {
      const node = { ...c, children: [] };
      mapById.set(c.id, node);
      if (c.handle) {
        mapByHandle.set(c.handle, node);
      }
    });

    const roots = [];
    mapById.forEach((cat) => {
      if (cat.parent_category_id && mapById.has(cat.parent_category_id)) {
        mapById.get(cat.parent_category_id).children.push(cat);
      } else {
        roots.push(cat);
      }
    });

    return { roots, byId: mapById, byHandle: mapByHandle };
  };

  const {
    roots: categoryTree,
    byId: categoryById,
    byHandle: categoryByHandle,
  } = buildCategoryTree(categories);

  // Selected node by handle
  const selectedCategoryNode = selectedCategoryHandle
    ? categoryByHandle.get(selectedCategoryHandle)
    : null;

  const subCategories =
    selectedCategoryNode?.children && selectedCategoryNode.children.length > 0
      ? selectedCategoryNode.children
      : [];

  // Extract unique suitability tags from fetched products
  const availableTags = useMemo(() => {
    const uniqueTags = new Set();
    products.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          const val = t.value || t;
          if (val) uniqueTags.add(val.toLowerCase());
        });
      }
    });
    return Array.from(uniqueTags).sort();
  }, [products]);

  // Filter products (client-side filters)
  const filteredProducts = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : [];

    return productsArray.filter((product) => {
      // Collections
      if (
        filters.collections.length > 0 &&
        (!product.collection_id ||
          !filters.collections.includes(product.collection_id))
      ) {
        return false;
      }

      // Price
      const price = product._rawAmount || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Suitability Tags
      if (filters.tags && filters.tags.length > 0) {
        if (!product.tags || product.tags.length === 0) return false;

        const productTagValues = product.tags.map(t => (t.value || t).toLowerCase());
        const matchesATag = filters.tags.some(t => productTagValues.includes(t.toLowerCase()));
        if (!matchesATag) return false;
      }

      // Discounted only
      if (filters.discountedOnly && !(product.discount > 0)) {
        return false;
      }

      // New arrivals (last 30 days)
      if (filters.newOnly) {
        const createdAt = new Date(product.created_at);
        const daysDiff =
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 30) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Luxury 'Discover More' flow
  const totalFilteredCount = filteredProducts.length;
  const hasMore = totalFilteredCount > page * limit;
  const currentProducts = filteredProducts.slice(0, page * limit);

  // Helpers to navigate to category shop page (by handle)
  const goToCategory = (handle) => {
    if (!handle) {
      navigate("/shop");
      setSelectedCategoryHandle(null);
      setFilters((prev) => ({ ...prev, categories: [] }));
      setPage(1);
      return;
    }

    navigate(`/shop/category/${handle}`, {
      state: { initialCategoryHandle: handle },
    });
    setSelectedCategoryHandle(handle);
    setFilters((prev) => ({ ...prev, categories: [handle] }));
    setPage(1);
  };

  const updateScrollState = () => {
    if (!sliderContainerRef.current || !sliderContentRef.current) return;
    const containerWidth = sliderContainerRef.current.offsetWidth;
    const contentWidth = sliderContentRef.current.scrollWidth;
    const currentX = x.get();
    
    setCanScrollLeft(currentX < -5);
    setCanScrollRight(currentX > containerWidth - contentWidth + 5);
  };

  useEffect(() => {
    if (sliderContainerRef.current && sliderContentRef.current) {
      const containerWidth = sliderContainerRef.current.offsetWidth;
      const contentWidth = sliderContentRef.current.scrollWidth;
      setDragConstraints({
        left: contentWidth > containerWidth ? -(contentWidth - containerWidth + 32) : 0,
        right: 0
      });
      updateScrollState();
    }
  }, [categories, subCategories, selectedCategoryHandle]);

  useEffect(() => {
    const unsub = x.onChange(() => updateScrollState());
    return () => unsub();
  }, [x, dragConstraints]);

  const slide = (direction) => {
    if (!sliderContainerRef.current) return;
    const containerWidth = sliderContainerRef.current.offsetWidth;
    const scrollAmount = containerWidth * 0.6;
    const targetX = direction === 'left' ? x.get() + scrollAmount : x.get() - scrollAmount;
    
    // Clamp targetX within constraints
    const clampedX = Math.min(0, Math.max(dragConstraints.left, targetX));
    
    animate(x, clampedX, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 lg:pt-24 bg-gradient-to-br from-stone-50/30 via-white to-stone-100/30">
      {/* Header */}
      <div className="pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
        <div className="max-w-[2200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-4 sm:space-y-6"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-stone-900 tracking-[0.05em] leading-tight px-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Curated Atelier
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-stone-500 font-light max-w-xs sm:max-w-md md:max-w-xl mx-auto leading-relaxed px-4 tracking-[0.2em] uppercase">
              Archival Objects for the Modern Space
            </p>
          </motion.div>
        </div>
      </div>

      {/* Top bar */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-3 sm:pb-4 lg:pb-6">
        <div className="max-w-[2200px] mx-auto flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-stone-500">
            Showing {currentProducts.length} of {totalFilteredCount} products
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden text-xs sm:text-sm px-3 py-1.5 rounded-full border border-stone-300 text-stone-700 flex items-center justify-center"
            >
              <FilterIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Category Navigation Slider */}
      {(categoryTree.length > 0 || subCategories.length > 0) && (
        <div className="max-w-[2200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 mb-8 sm:mb-12 border-y border-stone-200/60 py-2 sm:py-3 group/nav">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Proper Navigation Arrows - On the same line as categories */}
            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center">
              <AnimatePresence>
                {canScrollLeft && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => slide('left')}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div
              ref={sliderContainerRef}
              className="flex-1 overflow-hidden relative"
            >
              <motion.div
                ref={sliderContentRef}
                className="flex items-center gap-4 sm:gap-8 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                style={{ x }}
                onDrag={() => updateScrollState()}
              >
                <div className="flex items-center gap-4 sm:gap-8 w-max px-2">
                  {!selectedCategoryHandle && (
                    <CategoryTab
                      key="all-root"
                      category="All Objects"
                      isSelected={!selectedCategoryHandle}
                      onClick={() => goToCategory(null)}
                    />
                  )}

                  {!selectedCategoryHandle ? (
                    categoryTree.map((category) => (
                      <CategoryTab
                        key={category.id}
                        category={category}
                        isSelected={selectedCategoryHandle === category.handle}
                        onClick={() => goToCategory(category.handle)}
                      />
                    ))
                  ) : (
                    <>
                      <CategoryTab
                        key={selectedCategoryNode?.id}
                        category={selectedCategoryNode}
                        isSelected={selectedCategoryHandle === selectedCategoryNode?.handle}
                        onClick={() => goToCategory(selectedCategoryNode?.handle)}
                      />
                      {subCategories.map((category) => (
                        <CategoryTab
                          key={category.id}
                          category={category}
                          isSelected={selectedCategoryHandle === category.handle}
                          onClick={() => goToCategory(category.handle)}
                        />
                      ))}
                      <CategoryTab
                        key="back-to-all"
                        category="Explore All"
                        isSelected={false}
                        onClick={() => goToCategory(null)}
                      />
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center">
              <AnimatePresence>
                {canScrollRight && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => slide('right')}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                  >
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[2200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-10 sm:pb-14 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 2xl:gap-16">
          {/* Desktop filters */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={(val) => {
              setFilters(val);
              setPage(1); // Reset page on filter change
            }}
            collections={collections}
            categories={categories}
            tags={availableTags}
            priceBounds={priceBounds}
            className="hidden lg:block lg:w-72 xl:w-80 2xl:w-96 shrink-0"
          />

          {/* Products */}
          <main className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`products-${dimensions.width}-page-${page}-sort-${sort}-cat-${selectedCategoryHandle}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {filteredProducts.length === 0 && !loading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 xl:py-32 px-4"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-stone-100 rounded-full flex items-center justify-center mb-6 sm:mb-8">
                      <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-stone-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-stone-900 mb-3 sm:mb-4 text-center">
                      No products found
                    </h3>
                    <p className="text-stone-500 text-center max-w-sm sm:max-w-md lg:max-w-lg font-light leading-relaxed text-sm sm:text-base">
                      Try changing or clearing some filters to see more products.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div
                      className="
                        grid 
                        grid-cols-2 
                        md:grid-cols-3 
                        lg:grid-cols-3 
                        xl:grid-cols-4 
                        gap-x-4 sm:gap-x-8 lg:gap-x-12
                        gap-y-10 sm:gap-y-12 lg:gap-y-16
                      "
                    >
                      {loading ? (
                        Array.from({ length: limit }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] bg-stone-200 rounded-full mb-3 sm:mb-4"></div>
                            <div className="h-4 bg-stone-200 rounded mb-2 w-3/4 mx-auto"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/2 mx-auto"></div>
                          </div>
                        ))
                      ) : (
                        currentProducts.map((product) => (
                          <ProductInfoCard
                            key={product.id}
                            product={product}
                            isFluid={true}
                            cardSize="default"
                          />
                        ))
                      )}
                    </div>

                    {/* Pagination - Luxury Discover More */}
                    {!loading && hasMore && (
                      <div className="mt-16 sm:mt-24 mb-8 flex flex-col items-center justify-center">
                        <div className="text-xs text-stone-400 font-light tracking-wider mb-6">
                          Showing {currentProducts.length} of {totalFilteredCount}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPage((p) => p + 1)}
                          className="group relative px-8 py-3 bg-transparent overflow-hidden"
                        >
                          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-stone-300 group-hover:bg-stone-900 transition-colors duration-500"></div>
                          <span className="relative z-10 text-xs sm:text-sm tracking-[0.2em] uppercase text-stone-600 group-hover:text-stone-900 transition-colors duration-500">
                            Discover More
                          </span>
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile filters */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={(val) => {
          setFilters(val);
          setPage(1); // Reset page on filter change
        }}
        collections={collections}
        categories={categories}
        tags={availableTags}
        priceBounds={priceBounds}
        sort={sort}
        onSortChange={(val) => {
          setSort(val);
          setPage(1);
        }}
      />
    </div>
  );
}
