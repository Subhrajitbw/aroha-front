'use client';

import { useEffect, useState, useMemo, useRef } from "react";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Filter, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { sdk } from "@/lib/medusaClient";

import { FilterSidebar } from "../shop/FilterSidebar";
import { MobileFilterDrawer } from "../shop/MobileFilterDrawer";
import { ProductInfoCard, ProductSkeleton } from "../shop/ProductInfoCard";
import CategoryTab from "../sections/category/CategoryTab";
import Breadcrumbs from "../ui/Breadcrumbs";

export default function ShopClient({ initialData }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const mapProduct = (product) => {
    const defaultVariant = product.variants?.[0];
    const calc = defaultVariant?.calculated_price;
    let amount = calc?.calculated_amount || 0;
    let originalAmount = calc?.original_amount || amount;
    let currencyCode = (calc?.currency_code || "INR").toUpperCase();

    let discount = 0;
    if (originalAmount > amount) {
      discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
    }

    const formatPrice = (val) => new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      image: product.thumbnail || "https://placehold.co/600x800/f5f5f5/e0e0e0",
      price: formatPrice(amount),
      originalPrice: discount > 0 ? formatPrice(originalAmount) : null,
      discount,
      status: discount > 0 ? "sale" : "new",
      _rawAmount: amount,
      _rawOriginalAmount: originalAmount,
      tags: product.tags || [],
      created_at: product.created_at,
      collection_id: product.collection_id
    };
  };

  // State management initialized with mapped server data
  const [products, setProducts] = useState(() => (initialData.products || []).map(mapProduct));
  const [collections, setCollections] = useState(initialData.collections || []);
  const [categories, setCategories] = useState(initialData.categories || []);
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [regionId, setRegionId] = useState(initialData.regionId || null);

  const [selectedCategoryHandle, setSelectedCategoryHandle] = useState(initialData.selectedCategoryHandle || null);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [totalCount, setTotalCount] = useState(initialData.totalCount || 0);


  const [sort, setSort] = useState("relevance");
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 50000000 });

  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    collections: [],
    categories: initialData.selectedCategoryHandle ? [initialData.selectedCategoryHandle] : [],
    discountedOnly: searchParams.get('filter') === 'discountedOnly',
    newOnly: searchParams.get('filter') === 'newOnly',
    inStockOnly: false,
    ratings: [],
    tags: [],
  });

  const sliderContainerRef = useRef(null);
  const sliderContentRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const x = useMotionValue(0);

  const isInitialMount = useRef(true);

  // Sync state with incoming server data when Next.js soft-navigates (e.g. category changes)
  useEffect(() => {
    if (!isInitialMount.current) {
      setProducts((initialData.products || []).map(mapProduct));
      setTotalCount(initialData.totalCount || 0);
      setCategories(initialData.categories || []);
      setCollections(initialData.collections || []);
      setSelectedCategoryHandle(initialData.selectedCategoryHandle || null);
      if (initialData.regionId) setRegionId(initialData.regionId);
      
      // Update filters to match the new category route
      setFilters(prev => ({
        ...prev,
        categories: initialData.selectedCategoryHandle ? [initialData.selectedCategoryHandle] : []
      }));
      setPage(1);
      
      // Data arrived, turn off the loading skeleton
      setLoading(false);
      
      // Reset horizontal scroll slider position
      if (x) x.set(0);
    }
  }, [initialData, x]);

  // Fetch region
  useEffect(() => {
    const initRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.length > 0) setRegionId(regions[0].id);
      } catch (e) {
        console.warn("Region fetch failed", e);
      }
    };
    initRegion();
  }, []);

  const isRestored = useRef(false);

  // Restore state on mount (Client-side only to avoid hydration mismatch)
  useEffect(() => {
    const savedProducts = sessionStorage.getItem('shop_persisted_products');
    const savedPage = sessionStorage.getItem('shop_persisted_page');
    const savedScrollPos = sessionStorage.getItem('shop_scroll_pos');

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          if (savedPage) setPage(parseInt(savedPage, 10));
          isRestored.current = true;

          if (savedScrollPos) {
            setTimeout(() => {
              window.scrollTo({ top: parseInt(savedScrollPos, 10), behavior: 'instant' });
            }, 100);
          }
        }
      } catch (e) {
        console.error("Failed to restore shop state:", e);
      }
    }
  }, []);

  const handleProductClick = (handle) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shop_scroll_pos', window.scrollY.toString());
      sessionStorage.setItem('shop_persisted_products', JSON.stringify(products));
      sessionStorage.setItem('shop_persisted_page', page.toString());
    }
    router.push(`/product/${handle}`);
  };

  const hasMore = useMemo(() => {
    if (totalCount === 0 && products.length > 0) return false;
    return products.length < totalCount;
  }, [products.length, totalCount]);

  // Fetch products with backend filtering
  useEffect(() => {
    const fetchProducts = async () => {
      if (!regionId) return;

      // Skip fetch on mount if we just restored from cache or if we are using the server-rendered initialData
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (isRestored.current) {
          // Clear these once used so a fresh visit doesn't restore old state
          sessionStorage.removeItem('shop_persisted_products');
          sessionStorage.removeItem('shop_persisted_page');
          sessionStorage.removeItem('shop_scroll_pos');
          return;
        }
        // Since we are not restoring from cache, we already have initialData from server SSR.
        // We can safely skip this redundant first client-side fetch!
        return;
      }

      // Do NOT client-side fetch if we just received new server data for a category change,
      // as the server already filtered it. We only client-side fetch for pagination, 
      // price/tag filters, or sorting.
      if (page === 1 && sort === "relevance" && filters.collections.length === 0 && filters.priceRange[0] === 0 && filters.priceRange[1] === 50000000 && filters.tags.length === 0 && !filters.discountedOnly && !filters.newOnly) {
        return; 
      }

      if (filters.categories?.length > 0 && categories.length === 0) return;

      setLoading(true);
      try {
        let orderParam = sort === "newest" ? "-created_at" : undefined;
        const queryParams = {
          limit: 100,
          fields: "id,title,handle,thumbnail,variants.calculated_price,variants.inventory_quantity,collection.title,created_at,*tags",
          region_id: regionId,
          ...(orderParam && { order: orderParam }),
          ...(filters.collections?.length > 0 && { "collection_id[]": filters.collections }),
        };

        if (filters.categories?.length > 0) {
          const categoryIds = filters.categories
            .map((handle) => categories.find((c) => c.handle === handle)?.id)
            .filter(Boolean);
          if (categoryIds.length > 0) queryParams["category_id[]"] = categoryIds;
        }

        // Add pagination offsets
        if (page > 1) {
          queryParams.offset = (page - 1) * limit;
        }

        const { products: productsList, count } = await sdk.store.product.list(queryParams);
        const mappedProducts = (productsList || []).map(mapProduct);

        if (page === 1) {
          setProducts(mappedProducts);
        } else {
          setProducts(prev => [...prev, ...mappedProducts]);
        }

        if (typeof count !== 'undefined') {
          setTotalCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sort, regionId, filters.collections, filters.categories, page]);

  // Build category tree helpers
  const buildCategoryTree = (categoriesArray) => {
    const mapById = new Map();
    const mapByHandle = new Map();
    (categoriesArray || []).forEach((c) => {
      const node = { ...c, children: [] };
      mapById.set(c.id, node);
      if (c.handle) mapByHandle.set(c.handle, node);
    });
    const roots = [];
    mapById.forEach((cat) => {
      if (cat.parent_category_id && mapById.has(cat.parent_category_id)) {
        mapById.get(cat.parent_category_id).children.push(cat);
      } else roots.push(cat);
    });
    return { roots, byId: mapById, byHandle: mapByHandle };
  };

  const { roots: categoryTree, byId: categoryById, byHandle: categoryByHandle } = useMemo(() => buildCategoryTree(categories), [categories]);

  const selectedCategoryNode = selectedCategoryHandle ? categoryByHandle.get(selectedCategoryHandle) : null;

  const categoryBreadcrumbs = useMemo(() => {
    if (!selectedCategoryNode) return [{ label: "Shop", path: "/shop", isLast: true }];
    const hierarchy = [];
    let current = selectedCategoryNode;
    while (current) {
      hierarchy.unshift({
        label: current.name,
        path: `/product-categories/${current.handle}`,
        isLast: current === selectedCategoryNode
      });
      current = current.parent_category_id ? categoryById.get(current.parent_category_id) : null;
    }
    return [{ label: "Shop", path: "/shop" }, ...hierarchy];
  }, [selectedCategoryNode, categoryById]);

  const subCategories = selectedCategoryNode?.children || [];

  const availableTags = useMemo(() => {
    const uniqueTags = new Set();
    products.forEach((p) => p.tags?.forEach((t) => uniqueTags.add((t.value || t).toLowerCase())));
    return Array.from(uniqueTags).sort();
  }, [products]);

  const dynamicCollections = useMemo(() => {
    if (!products.length) return [];
    const validCollectionIds = new Set(products.map(p => p.collection_id).filter(Boolean));
    return collections.filter(c => validCollectionIds.has(c.id));
  }, [products, collections]);

  const dynamicPriceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 50000000 };
    const prices = products.map(p => p._rawAmount || 0);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Make category filtering super practical and accurate by tying it to navigation
  const handleCategoryNavigation = (handle) => {
    // Show skeletons instantly for immediate user feedback
    setLoading(true);
    
    // If clicking the already selected category, clear it (go back to all shop)
    if (selectedCategoryHandle === handle) {
      router.push("/shop");
    } else {
      router.push(`/product-categories/${handle}`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.collections.length > 0 && !filters.collections.includes(product.collection_id)) return false;
      const price = product._rawAmount || 0;
      // Use dynamic bounds or selected range
      const minPrice = filters.priceRange[0] || 0;
      const maxPrice = filters.priceRange[1] || 50000000;
      if (price < minPrice || price > maxPrice) return false;
      if (filters.tags.length > 0) {
        const productTagValues = product.tags?.map(t => (t.value || t).toLowerCase()) || [];
        if (!filters.tags.some(t => productTagValues.includes(t.toLowerCase()))) return false;
      }
      if (filters.discountedOnly && !(product.discount > 0)) return false;
      if (filters.newOnly) {
        const daysDiff = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 30) return false;
      }
      return true;
    });
  }, [products, filters]);

  const currentProducts = filteredProducts;

  const goToCategory = (handle) => {
    setLoading(true);
    if (!handle) router.push("/shop");
    else router.push(`/product-categories/${handle}`);
  };

  // Slider animation logic
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
      const newLeft = contentWidth > containerWidth ? -(contentWidth - containerWidth + 32) : 0;
      setDragConstraints(prev => (prev.left === newLeft && prev.right === 0) ? prev : { left: newLeft, right: 0 });
      updateScrollState();
    }
  }, [categories, subCategories.length, selectedCategoryHandle]);

  useEffect(() => {
    const unsub = x.on("change", () => updateScrollState());
    return () => unsub();
  }, [x, dragConstraints]);

  const slide = (direction) => {
    if (!sliderContainerRef.current) return;
    const containerWidth = sliderContainerRef.current.offsetWidth;
    const targetX = direction === 'left' ? x.get() + containerWidth * 0.6 : x.get() - containerWidth * 0.6;
    const clampedX = Math.min(0, Math.max(dragConstraints.left, targetX));
    animate(x, clampedX, { type: "spring", stiffness: 300, damping: 30 });
  };

  return (
    <div className="min-h-screen pt-2 lg:pt-[var(--nav-height,80px)] bg-gradient-to-br from-stone-50/30 via-white to-stone-100/30">
      <div className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
        <div className="max-w-[2200px] mx-auto text-center space-y-4 sm:space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-stone-900 tracking-[0.05em]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Curated Atelier
          </motion.h1>
          <p className="text-xs sm:text-sm md:text-base text-stone-500 font-light tracking-[0.2em] uppercase">
            Archival Objects for the Modern Space
          </p>
        </div>
      </div>

      {(categoryTree.length > 0 || subCategories.length > 0) && (
        <div className="max-w-[2200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 mb-8 sm:mb-12 border-y border-stone-200/60 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 sm:w-10 flex items-center justify-center">
              <AnimatePresence>{canScrollLeft && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => slide('left')} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
                  <ChevronLeft size={16} />
                </motion.button>
              )}</AnimatePresence>
            </div>
            <div ref={sliderContainerRef} className="flex-1 overflow-hidden">
              <motion.div ref={sliderContentRef} className="flex items-center gap-4 sm:gap-8 cursor-grab active:cursor-grabbing" drag="x" dragConstraints={dragConstraints} style={{ x }}>
                <div className="flex items-center gap-4 sm:gap-8 w-max px-2">
                  {(() => {
                    // Determine which categories to show in the ribbon
                    let visibleCategories = [];
                    if (!selectedCategoryHandle) {
                      // On root shop page, show all root categories that have products
                      visibleCategories = categoryTree;
                    } else {
                      // On a category page, show only its immediate sub-categories that have products
                      visibleCategories = selectedCategoryNode?.children || [];
                    }

                    // Strict filter: only show categories that actually contain products
                    const categoriesWithProducts = visibleCategories.filter(cat =>
                      (cat.products?.length > 0) ||
                      (cat.product_count > 0) ||
                      (cat.hasDirectProducts) ||
                      (cat.children?.some(child => child.products?.length > 0 || child.product_count > 0))
                    );

                    return (
                      <>
                        {!selectedCategoryHandle && (
                          <CategoryTab
                            category="All Objects"
                            isSelected={true}
                            onClick={() => goToCategory(null)}
                          />
                        )}
                        {selectedCategoryHandle && (
                          <CategoryTab
                            category="Explore All"
                            isSelected={false}
                            onClick={() => goToCategory(null)}
                          />
                        )}
                        {categoriesWithProducts.map((cat) => (
                          <CategoryTab
                            key={cat.id}
                            category={cat}
                            isSelected={selectedCategoryHandle === cat.handle}
                            onClick={() => goToCategory(cat.handle)}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
            <div className="w-8 sm:w-10 flex items-center justify-center">
              <AnimatePresence>{canScrollRight && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => slide('right')} className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
                  <ChevronRight size={16} />
                </motion.button>
              )}</AnimatePresence>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[2200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-10 flex flex-col lg:flex-row gap-6 lg:gap-12">
        <aside className="hidden lg:block lg:w-72 xl:w-80 2xl:w-96 shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={(v) => { setFilters(v); setPage(1); }}
            collections={dynamicCollections}
            categories={categories}
            tags={availableTags}
            priceBounds={dynamicPriceBounds}
            selectedCategoryHandle={selectedCategoryHandle}
            onCategorySelect={handleCategoryNavigation}
            className="sticky top-24"
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-8">
            <Breadcrumbs items={categoryBreadcrumbs} className="flex-1 min-w-0" />

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center justify-center p-3 sm:px-6 sm:py-3 bg-white border border-stone-200 rounded-full text-stone-900 hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
              >
                <Filter size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline-block ml-3 text-[10px] uppercase tracking-[0.2em] font-bold">
                  Refine
                </span>
              </button>

              {/* Desktop Sort Dropdown */}
              <div className="hidden lg:flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium whitespace-nowrap">Sort By:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-[10px] uppercase tracking-[0.15em] font-bold text-stone-900 focus:outline-none cursor-pointer hover:text-stone-600 transition-colors border-b border-transparent hover:border-stone-900 pb-0.5"
                >
                  <option value="relevance">Featured</option>
                  <option value="price-low">Price: Low-High</option>
                  <option value="price-high">Price: High-Low</option>
                  <option value="newest">Newest</option>
                  <option value="best-selling">Best Selling</option>
                </select>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedCategoryHandle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {currentProducts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
                  <LayoutGrid className="w-10 h-10 text-stone-400 mb-8" />
                  <h3 className="text-2xl font-light">No products found</h3>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12 min-h-[60vh]">
                    {loading ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                      : currentProducts.map((p) => <ProductInfoCard key={p.id} product={p} isFluid={true} />)}
                  </div>
                  {!loading && hasMore && (
                    <div className="mt-20 flex justify-center">
                      <button onClick={() => setPage(p => p + 1)} className="px-12 py-4 bg-stone-900 text-white rounded-full uppercase tracking-widest text-xs font-bold hover:bg-stone-800 transition-colors">
                        Discover More
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileFilterDrawer isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} filters={filters} onFiltersChange={(v) => { setFilters(v); setPage(1); }} collections={dynamicCollections} categories={categories} tags={availableTags} priceBounds={dynamicPriceBounds} sort={sort} onSortChange={(v) => { setSort(v); setPage(1); }} selectedCategoryHandle={selectedCategoryHandle} onCategorySelect={handleCategoryNavigation} />
    </div>
  );
}
