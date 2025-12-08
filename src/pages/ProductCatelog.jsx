// pages/ProductCatalog.jsx
import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FilterIcon, LayoutGrid } from "lucide-react";
import { sdk } from "../lib/medusaClient";

import { FilterSidebar } from "../components/shop/FilterSidebar";
import { MobileFilterDrawer } from "../components/shop/MobileFilterDrawer";
import { ProductInfoCard } from "../components/ProductInfoCard";
import CategoryTab from "../components/category/CategoryTab";

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
  const { categoryId: categoryIdParam } = useParams();

  // Initial category from URL or navigation state
  const initialCategoryIdFromState =
    categoryIdParam || location.state?.initialCategoryId || null;

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategoryIdFromState
  );

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Sort
  const [sort, setSort] = useState("relevance");

  // Dynamic price bounds
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 50000000 });

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 50000000],
    collections: [],
    categories: initialCategoryIdFromState ? [initialCategoryIdFromState] : [],
    discountedOnly: false,
    newOnly: false,
    inStockOnly: false,
    ratings: [],
  });

  // Keep selectedCategoryId and filters.categories in sync with URL changes
  useEffect(() => {
    const next =
      categoryIdParam || location.state?.initialCategoryId || null;
    setSelectedCategoryId(next || null);
    setFilters((prev) => ({
      ...prev,
      categories: next ? [next] : [],
    }));
    setPage(1);
  }, [categoryIdParam, location.state?.initialCategoryId]);

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

  // Fetch products with price mapping + pagination + sort + category filter
  useEffect(() => {
    const fetchProducts = async () => {
      if (!regionId) return;

      setLoading(true);
      try {
        const offset = (page - 1) * limit;

        let orderParam;
        if (sort === "newest") {
          orderParam = "-created_at";
        }

        const queryParams = {
          limit,
          offset,
          fields:
            "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*,images,created_at,collection_id,tags",
          region_id: regionId,
        };

        if (orderParam) {
          queryParams.order = orderParam;
        }

        // Filter by category on the backend when selected
        if (selectedCategoryId) {
          queryParams["category_id[]"] = [selectedCategoryId];
        }

        const { products: productsList, count } =
          await sdk.store.product.list(queryParams);

        setTotalCount(count || 0);

        const mappedProducts = productsList.map((product) => {
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
            collection_id: product.collection_id,
            tags: product.tags,
            created_at: product.created_at,
          };
        });

        // Price bounds
        const prices = mappedProducts
          .map((p) => p._rawAmount || 0)
          .filter((v) => v > 0);

        if (prices.length) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceBounds({ min, max });

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
        } else {
          sortedProducts = mappedProducts;
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
  }, [sort, regionId, page, selectedCategoryId]);

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

  // Build category tree and helpers
  const buildCategoryTree = (categoriesArray) => {
    const map = new Map();
    (categoriesArray || []).forEach((c) => {
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
    return { roots, byId: map };
  };

  const { roots: categoryTree, byId: categoryById } =
    buildCategoryTree(categories);

  const selectedCategoryNode = selectedCategoryId
    ? categoryById.get(selectedCategoryId)
    : null;

  const subCategories =
    selectedCategoryNode?.children && selectedCategoryNode.children.length > 0
      ? selectedCategoryNode.children
      : [];

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

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Helpers to navigate to category shop page
  const goToCategory = (id) => {
    if (!id) {
      navigate("/shop");
      setSelectedCategoryId(null);
      setFilters((prev) => ({ ...prev, categories: [] }));
      setPage(1);
      return;
    }

    navigate(`/shop/category/${id}`, {
      state: { initialCategoryId: id },
    });
    setSelectedCategoryId(id);
    setFilters((prev) => ({ ...prev, categories: [id] }));
    setPage(1);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight text-stone-900 tracking-wide leading-tight px-2">
              Curated Atelier
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-stone-600 font-light max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              A curated collection of furniture pieces for your home.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Top bar */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-3 sm:pb-4 lg:pb-6">
        <div className="max-w-[2200px] mx-auto flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-stone-500">
            Showing {filteredProducts.length} of {totalCount} products
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

      {/* Subcategory tabs row (selected node + its children) */}
      {selectedCategoryNode && (
        <div className="max-w-[2200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pb-4">
          <div className="flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            <CategoryTab
              key={selectedCategoryNode.id}
              category={selectedCategoryNode}
              isSelected={selectedCategoryId === selectedCategoryNode.id}
              onClick={() => goToCategory(selectedCategoryNode.id)}
            />
            {subCategories.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onClick={() => goToCategory(category.id)}
              />
            ))}
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
              if (val.categories?.length) {
                goToCategory(val.categories[0]);
              } else {
                goToCategory(null);
              }
            }}
            collections={collections}
            categories={categories}
            priceBounds={priceBounds}
            className="hidden lg:block lg:w-72 xl:w-80 2xl:w-96 shrink-0"
          />

          {/* Products */}
          <main className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`products-${dimensions.width}-page-${page}-sort-${sort}-cat-${selectedCategoryId}`}
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
                        gap-x-4 sm:gap-x-6 lg:gap-x-8
                        gap-y-6 sm:gap-y-8 lg:gap-y-10
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
                        filteredProducts.map((product) => (
                          <ProductInfoCard
                            key={product.id}
                            product={product}
                            isFluid={true}
                            cardSize="default"
                          />
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
                        <button
                          onClick={() => hasPrev && setPage((p) => p - 1)}
                          disabled={!hasPrev}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm border transition
                            ${
                              hasPrev
                                ? "border-stone-400 text-stone-800 hover:bg-stone-100"
                                : "border-stone-200 text-stone-300 cursor-not-allowed"
                            }`}
                        >
                          Previous
                        </button>

                        <span className="text-xs sm:text-sm text-stone-600">
                          Page {page} of {totalPages}
                        </span>

                        <button
                          onClick={() => hasNext && setPage((p) => p + 1)}
                          disabled={!hasNext}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm border transition
                            ${
                              hasNext
                                ? "border-stone-400 text-stone-800 hover:bg-stone-100"
                                : "border-stone-200 text-stone-300 cursor-not-allowed"
                            }`}
                        >
                          Next
                        </button>
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
          if (val.categories?.length) {
            goToCategory(val.categories[0]);
          } else {
            goToCategory(null);
          }
        }}
        collections={collections}
        categories={categories}
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
