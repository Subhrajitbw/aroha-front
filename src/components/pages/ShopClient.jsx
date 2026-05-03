'use client';

import { useEffect, useState, useMemo, useRef } from "react";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { FilterIcon, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { sdk } from  "@/lib/medusaClient";

import { FilterSidebar } from "../shop/FilterSidebar";
import { MobileFilterDrawer } from "../shop/MobileFilterDrawer";
import { ProductInfoCard } from "../shop/ProductInfoCard";
import CategoryTab from "../sections/category/CategoryTab";
import Breadcrumbs from "../ui/Breadcrumbs";

export default function ShopClient({ initialData }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  // State management initialized with server data
  const [products, setProducts] = useState(initialData.products || []);
  const [collections, setCollections] = useState(initialData.collections || []);
  const [categories, setCategories] = useState(initialData.categories || []);
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [regionId, setRegionId] = useState(null);

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

  // Sync category from URL params
  useEffect(() => {
    const handle = params.handle || null;
    setSelectedCategoryHandle(handle);
    setFilters(prev => ({
      ...prev,
      categories: handle ? [handle] : []
    }));
    setPage(1);
    if (x) x.set(0);
  }, [params.handle, x]);

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

  // Fetch products with backend filtering
  useEffect(() => {
    const fetchProducts = async () => {
      if (!regionId) return;
      if (filters.categories?.length > 0 && categories.length === 0) return;

      if (products.length === 0) setLoading(true);
      try {
        let orderParam = sort === "newest" ? "-created_at" : undefined;
        const queryParams = {
          limit: 100,
          fields: "id,title,handle,thumbnail,variants.calculated_price,variants.inventory_quantity,collection.title,created_at",
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

        const { products: productsList } = await sdk.store.product.list(queryParams);

        const mappedProducts = (productsList || []).map((product) => {
          const defaultVariant = product.variants?.[0];
          let amount = defaultVariant?.calculated_price?.calculated_amount || 0;
          let originalAmount = defaultVariant?.calculated_price?.original_amount || amount;
          let currencyCode = (defaultVariant?.calculated_price?.currency_code || "INR").toUpperCase();

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
            tags: product.tags,
            created_at: product.created_at,
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sort, regionId, filters.collections, filters.categories, categories.length]);

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
        path: `/shop/category/${current.handle}`,
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.collections.length > 0 && !filters.collections.includes(product.collection_id)) return false;
      const price = product._rawAmount || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
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

  const currentProducts = filteredProducts.slice(0, page * limit);
  const hasMore = filteredProducts.length > page * limit;

  const goToCategory = (handle) => {
    if (!handle) router.push("/shop");
    else router.push(`/shop/category/${encodeURIComponent(handle)}`);
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
    <div className="min-h-screen pt-2 sm:pt-4 bg-gradient-to-br from-stone-50/30 via-white to-stone-100/30">
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
                  {!selectedCategoryHandle && <CategoryTab category="All Objects" isSelected={!selectedCategoryHandle} onClick={() => goToCategory(null)} />}
                  {!selectedCategoryHandle ? categoryTree.map((cat) => <CategoryTab key={cat.id} category={cat} isSelected={selectedCategoryHandle === cat.handle} onClick={() => goToCategory(cat.handle)} />) : (
                    <>
                      <CategoryTab key={selectedCategoryNode?.id} category={selectedCategoryNode} isSelected={selectedCategoryHandle === selectedCategoryNode?.handle} onClick={() => goToCategory(selectedCategoryNode?.handle)} />
                      {subCategories.map((cat) => <CategoryTab key={cat.id} category={cat} isSelected={selectedCategoryHandle === cat.handle} onClick={() => goToCategory(cat.handle)} />)}
                      <CategoryTab category="Explore All" onClick={() => goToCategory(null)} />
                    </>
                  )}
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
          <FilterSidebar filters={filters} onFiltersChange={(v) => {setFilters(v); setPage(1);}} collections={collections} categories={categories} tags={availableTags} priceBounds={priceBounds} className="sticky top-24" />
        </aside>

        <main className="flex-1 min-w-0">
          <Breadcrumbs className="mb-8" items={categoryBreadcrumbs} />
          <AnimatePresence mode="wait">
            <motion.div key={selectedCategoryHandle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              {currentProducts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <LayoutGrid className="w-10 h-10 text-stone-400 mb-8" />
                  <h3 className="text-2xl font-light">No products found</h3>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12">
                    {loading ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse aspect-[3/4] bg-stone-100 rounded-2xl" />) 
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

      <MobileFilterDrawer isOpen={mobileFilterOpen} onClose={() => setMobileFilterOpen(false)} filters={filters} onFiltersChange={(v) => {setFilters(v); setPage(1);}} collections={collections} categories={categories} tags={availableTags} priceBounds={priceBounds} sort={sort} onSortChange={(v) => {setSort(v); setPage(1);}} />
    </div>
  );
}
