import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import LoadingOverlay from "../components/LoadingOverlay";

const PRODUCT_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants.calculated_price,*variants.prices,*variants.options,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*collection,*type,*tags,material,weight,origin_country,metadata";

const stripHtml = (value = "") =>
  String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatPrice = (amount, currencyCode = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currencyCode || "USD").toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getVariantPrice = (variant) => {
  if (!variant) return { amount: 0, originalAmount: 0, currencyCode: "USD" };

  if (variant.calculated_price?.calculated_amount !== undefined) {
    return {
      amount: variant.calculated_price.calculated_amount || 0,
      originalAmount:
        variant.calculated_price.original_amount ||
        variant.calculated_price.calculated_amount ||
        0,
      currencyCode: variant.calculated_price.currency_code || "USD",
    };
  }

  const rawPrice = variant.prices?.[0];
  if (rawPrice) {
    return {
      amount: rawPrice.amount || 0,
      originalAmount: rawPrice.amount || 0,
      currencyCode: rawPrice.currency_code || "USD",
    };
  }

  return { amount: 0, originalAmount: 0, currencyCode: "USD" };
};

const isVariantInStock = (variant) => {
  if (!variant) return false;
  if (variant.manage_inventory === false) return true;
  if (typeof variant.inventory_quantity === "number") {
    return variant.inventory_quantity > 0;
  }
  return true;
};

export default function ShopSingle() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regionId, setRegionId] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [optionsState, setOptionsState] = useState({});

  useEffect(() => {
    const loadRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.[0]?.id) {
          setRegionId(regions[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch Medusa region:", err);
      }
    };

    loadRegion();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError("");

      try {
        const baseParams = {
          fields: PRODUCT_FIELDS,
          ...(regionId ? { region_id: regionId } : {}),
        };

        let result = await sdk.store.product.list({
          ...baseParams,
          handle: slug,
          limit: 1,
        });

        let productData = result?.products?.[0];

        if (!productData) {
          result = await sdk.store.product.list({
            ...baseParams,
            id: [slug],
            limit: 1,
          });
          productData = result?.products?.[0];
        }

        if (!productData) {
          setError("Product not found.");
          setProduct(null);
          return;
        }

        setProduct(productData);
        setSelectedImage(0);

        const firstVariant = productData.variants?.[0] || null;
        setSelectedVariant(firstVariant);

        const nextOptions = {};
        firstVariant?.options?.forEach((opt) => {
          nextOptions[opt.option_id] = opt.value;
        });
        setOptionsState(nextOptions);
      } catch (err) {
        console.error("Failed to fetch product from Medusa:", err);
        setError("Unable to load product details right now.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, regionId]);

  const images = useMemo(() => {
    if (!product) return [];
    const media = (product.images || []).map((img) => img?.url).filter(Boolean);
    if (product.thumbnail && !media.includes(product.thumbnail)) {
      media.unshift(product.thumbnail);
    }
    return media;
  }, [product]);

  const currentImage = images[selectedImage] || images[0] || "";

  const optionGroups = useMemo(() => {
    if (!product?.options?.length) return [];

    return product.options.map((option) => {
      const values = Array.from(
        new Set(
          (product.variants || [])
            .map((variant) =>
              variant.options?.find((v) => v.option_id === option.id)?.value
            )
            .filter(Boolean)
        )
      );

      return { ...option, values };
    });
  }, [product]);

  const onOptionSelect = (optionId, value) => {
    const nextOptions = { ...optionsState, [optionId]: value };
    setOptionsState(nextOptions);

    const match = (product?.variants || []).find((variant) =>
      variant.options?.every((opt) => nextOptions[opt.option_id] === opt.value)
    );
    setSelectedVariant(match || null);
  };

  const priceDetails = getVariantPrice(selectedVariant || product?.variants?.[0]);
  const discounted = priceDetails.originalAmount > priceDetails.amount;
  const inStock = isVariantInStock(selectedVariant || product?.variants?.[0]);

  if (loading) return <LoadingOverlay />;

  if (!product) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-700 text-lg">{error || "Product not found."}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 mt-4 text-sm text-stone-600 hover:text-stone-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.14),_transparent_40%),linear-gradient(180deg,rgba(250,250,249,0.95),rgba(244,244,245,0.92))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-stone-900/5">
          <section>
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border ${
                      idx === selectedImage
                        ? "border-stone-900"
                        : "border-stone-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.18em] text-stone-500">
                  {stripHtml(product.subtitle)}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-light text-stone-900">
                  {formatPrice(priceDetails.amount, priceDetails.currencyCode)}
                </span>
                {discounted && (
                  <span className="text-stone-400 line-through">
                    {formatPrice(
                      priceDetails.originalAmount,
                      priceDetails.currencyCode
                    )}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`px-2.5 py-1 rounded-full border ${
                    inStock
                      ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                      : "border-rose-300 text-rose-700 bg-rose-50"
                  }`}
                >
                  {inStock ? "In stock" : "Out of stock"}
                </span>

                {selectedVariant?.sku && (
                  <span className="px-2.5 py-1 rounded-full border border-stone-200 text-stone-600">
                    SKU: {selectedVariant.sku}
                  </span>
                )}

                {product.collection?.title && (
                  <span className="px-2.5 py-1 rounded-full border border-stone-200 text-stone-600">
                    {product.collection.title}
                  </span>
                )}
              </div>
            </div>

            {optionGroups.length > 0 && (
              <div className="mt-6 space-y-4">
                {optionGroups.map((group) => (
                  <div key={group.id}>
                    <p className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">
                      {group.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const selected = optionsState[group.id] === value;
                        return (
                          <button
                            key={`${group.id}-${value}`}
                            type="button"
                            onClick={() => onOptionSelect(group.id, value)}
                            className={`px-3 py-2 rounded-full border text-sm transition ${
                              selected
                                ? "bg-stone-900 border-stone-900 text-white"
                                : "bg-white border-stone-300 text-stone-700 hover:border-stone-500"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-7 border-t border-stone-200 pt-6 space-y-4">
              {product.description && (
                <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                  {stripHtml(product.description)}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-600">
                {product.type?.value && <p>Type: {product.type.value}</p>}
                {product.material && <p>Material: {product.material}</p>}
                {product.origin_country && (
                  <p>Origin: {product.origin_country.toUpperCase()}</p>
                )}
                {product.weight && <p>Weight: {product.weight}</p>}
              </div>

              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag.id || tag.value}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-100 text-stone-700 px-2.5 py-1 text-xs"
                    >
                      <Check className="w-3 h-3" />
                      {tag.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
