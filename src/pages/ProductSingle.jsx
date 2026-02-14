import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MessageCircle } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { ProductInfoCard } from "../components/ProductInfoCard";

const PRODUCT_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants.id,*variants.title,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*variants.allow_backorder,*variants.options,*variants.calculated_price,*variants.prices,*collection,*tags,*type,material,weight,length,width,height,origin_country,created_at,metadata";

const RELATED_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,*images,*variants.calculated_price,*variants.prices";

const stripHtml = (value = "") =>
  String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatPrice = (amount, currencyCode = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: (currencyCode || "USD").toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getVariantPrice = (variant, fallbackCurrencyCode) => {
  if (!variant) {
    return { amount: 0, originalAmount: 0, currencyCode: fallbackCurrencyCode || "USD" };
  }

  if (variant.calculated_price?.calculated_amount !== undefined) {
    return {
      amount: variant.calculated_price.calculated_amount || 0,
      originalAmount:
        variant.calculated_price.original_amount ||
        variant.calculated_price.calculated_amount ||
        0,
      currencyCode: variant.calculated_price.currency_code || fallbackCurrencyCode || "USD",
    };
  }

  const fallback = variant.prices?.[0];
  if (fallback) {
    return {
      amount: fallback.amount || 0,
      originalAmount: fallback.amount || 0,
      currencyCode: fallback.currency_code || fallbackCurrencyCode || "USD",
    };
  }

  return { amount: 0, originalAmount: 0, currencyCode: fallbackCurrencyCode || "USD" };
};

const isInStock = (variant) => {
  if (!variant) return false;
  if (variant.manage_inventory === false) return true;
  if (variant.allow_backorder) return true;
  if (typeof variant.inventory_quantity === "number") return variant.inventory_quantity > 0;
  return true;
};

const normalizeProduct = (raw) => {
  if (!raw) return null;
  const images = [...(raw.images || [])]
    .sort((a, b) => (a?.rank ?? Number.MAX_SAFE_INTEGER) - (b?.rank ?? Number.MAX_SAFE_INTEGER))
    .map((img) => img?.url)
    .filter(Boolean);

  if (raw.thumbnail && !images.includes(raw.thumbnail)) {
    images.unshift(raw.thumbnail);
  }

  return {
    ...raw,
    subtitle: stripHtml(raw.subtitle || ""),
    description: raw.description || "",
    media: images,
  };
};

const renderMarkdownLike = (text = "") => {
  const lines = String(text).split("\n");
  const nodes = [];
  let list = [];

  const flush = (key) => {
    if (!list.length) return;
    nodes.push(
      <ul key={`${key}-list`} className="list-disc pl-5 space-y-1.5 text-stone-700">
        {list}
      </ul>
    );
    list = [];
  };

  const renderInline = (value = "") => {
    const parts = value.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${part}-${idx}`}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${part}-${idx}`}>{part}</span>
      )
    );
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const key = `md-${idx}`;

    if (!trimmed) {
      flush(key);
      return;
    }

    if (trimmed === "---") {
      flush(key);
      nodes.push(<hr key={`${key}-hr`} className="border-stone-200 my-2" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flush(key);
      nodes.push(
        <h3 key={`${key}-h3`} className="text-base sm:text-lg font-medium text-stone-900">
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("* ")) {
      list.push(<li key={`${key}-li`}>{renderInline(trimmed.replace(/^\*\s+/, ""))}</li>);
      return;
    }

    flush(key);
    nodes.push(
      <p key={`${key}-p`} className="text-stone-700 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  flush("end");
  return nodes;
};

export default function ProductSingle() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const thumbRefs = useRef([]);

  const [region, setRegion] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [optionsState, setOptionsState] = useState({});

  const WHATSAPP_NUMBER = "1234567890";

  useEffect(() => {
    const init = async () => {
      try {
        const storedCart = localStorage.getItem("cart_id");
        if (storedCart) {
          try {
            const { cart } = await sdk.store.cart.retrieve(storedCart);
            setCartId(cart.id);
            setRegion(cart.region);
            return;
          } catch {
            localStorage.removeItem("cart_id");
          }
        }

        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.[0]) setRegion(regions[0]);
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!region?.id || !handle) return;
      setLoading(true);
      try {
        const { products } = await sdk.store.product.list({
          handle,
          fields: PRODUCT_FIELDS,
          ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
        });

        const normalized = normalizeProduct(products?.[0]);
        if (!normalized) {
          navigate("/404");
          return;
        }

        setProduct(normalized);
        setCurrentImageIndex(0);
        const firstVariant = normalized.variants?.[0] || null;
        setSelectedVariant(firstVariant);

        const initialOptions = {};
        firstVariant?.options?.forEach((opt) => {
          initialOptions[opt.option_id] = opt.value;
        });
        setOptionsState(initialOptions);

        if (normalized.collection_id) {
          const { products: relatedProducts } = await sdk.store.product.list({
            collection_id: [normalized.collection_id],
            fields: RELATED_FIELDS,
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
            limit: 4,
          });

          setRelated(
            (relatedProducts || [])
              .filter((item) => item.id !== normalized.id)
              .slice(0, 3)
              .map((item) => normalizeProduct(item))
          );
        } else {
          setRelated([]);
        }
      } catch (error) {
        console.error("Failed loading product:", error);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, region, cartId, navigate]);

  const optionGroups = useMemo(() => {
    if (!product?.options?.length) return [];

    return product.options
      .map((option) => {
        const values = Array.from(
          new Set(
            (product.variants || [])
              .map((variant) => variant.options?.find((v) => v.option_id === option.id)?.value)
              .filter(Boolean)
          )
        );
        return { ...option, values };
      })
      .filter((group) => {
        const title = (group.title || "").toLowerCase();
        const singleDefault =
          group.values.length === 1 &&
          (group.values[0] || "").toLowerCase().includes("default option");
        return title !== "default option" && !singleDefault;
      });
  }, [product]);

  const activeVariant = selectedVariant || product?.variants?.[0];
  const price = getVariantPrice(activeVariant, region?.currency_code);
  const discounted = price.originalAmount > price.amount;
  const inStock = isInStock(activeVariant);
  const images = product?.media || [];

  const specs = useMemo(() => {
    if (!product) return [];
    const width = activeVariant?.width ?? product.width;
    const height = activeVariant?.height ?? product.height;
    const depth = activeVariant?.length ?? product.length;
    const weight = activeVariant?.weight ?? product.weight;
    const rows = [];
    if (width) rows.push({ label: "Width", value: `${width}"` });
    if (height) rows.push({ label: "Height", value: `${height}"` });
    if (depth) rows.push({ label: "Depth", value: `${depth}"` });
    if (weight) rows.push({ label: "Weight", value: `${weight}` });
    if (product.origin_country) rows.push({ label: "Origin", value: product.origin_country.toUpperCase() });
    if (product.material) rows.push({ label: "Material", value: product.material });
    if (product.type?.value) rows.push({ label: "Type", value: product.type.value });
    return rows;
  }, [activeVariant, product]);

  const onOptionSelect = (optionId, value) => {
    const next = { ...optionsState, [optionId]: value };
    setOptionsState(next);
    const match = (product?.variants || []).find((variant) =>
      variant.options?.every((opt) => next[opt.option_id] === opt.value)
    );
    setSelectedVariant(match || null);
  };

  const onImageChange = (index) => {
    setCurrentImageIndex(index);
    if (thumbRefs.current[index]) {
      thumbRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const onWhatsApp = () => {
    const variantText = activeVariant?.title ? ` (${activeVariant.title})` : "";
    const text = `Hi, I'm interested in ${product?.title}${variantText}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const mapRelated = (item) => {
    const p = getVariantPrice(item.variants?.[0], region?.currency_code);
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: stripHtml(item.description || ""),
      handle: item.handle,
      image: item.thumbnail || item.media?.[0],
      price: formatPrice(p.amount, p.currencyCode),
      originalPrice: p.originalAmount > p.amount ? formatPrice(p.originalAmount, p.currencyCode) : null,
      discount:
        p.originalAmount > p.amount
          ? Math.round(((p.originalAmount - p.amount) / p.originalAmount) * 100)
          : 0,
    };
  };

  if (loading || !region) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-stone-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-16 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.10),_transparent_45%),linear-gradient(180deg,rgba(250,250,249,0.96),rgba(245,245,244,0.9))]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          <section className="lg:col-span-7">
            <div className="relative overflow-hidden bg-stone-100/70 aspect-[4/5]">
              {images[currentImageIndex] ? (
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  No image available
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      onImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/45 hover:bg-black/60 text-white transition flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      onImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/45 hover:bg-black/60 text-white transition flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((imageUrl, idx) => (
                  <button
                    key={`${imageUrl}-${idx}`}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    onClick={() => onImageChange(idx)}
                    className={`w-20 h-20 overflow-hidden border flex-shrink-0 transition ${
                      idx === currentImageIndex
                        ? "border-stone-900 opacity-100"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imageUrl} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6 lg:pl-2">
            <div className="border-b border-stone-200/80 pb-5 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-light text-stone-900 leading-tight tracking-tight">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-xs sm:text-sm uppercase tracking-[0.14em] text-stone-500">
                  {product.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl sm:text-3xl text-stone-900 font-light">
                  {formatPrice(price.amount, price.currencyCode)}
                </span>
                {discounted && (
                  <span className="text-stone-400 line-through">
                    {formatPrice(price.originalAmount, price.currencyCode)}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    inStock
                      ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                      : "text-rose-700 bg-rose-50 border-rose-300"
                  }`}
                >
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {product.description && (
              <div className="space-y-2 text-sm sm:text-base">{renderMarkdownLike(product.description)}</div>
            )}

            {optionGroups.length > 0 && (
              <div className="space-y-4">
                {optionGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-[0.14em] text-stone-900">
                        {group.title}
                      </label>
                      <span className="text-xs text-stone-500">{optionsState[group.id]}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const selected = optionsState[group.id] === value;
                        return (
                          <button
                            key={`${group.id}-${value}`}
                            onClick={() => onOptionSelect(group.id, value)}
                            className={`px-3 py-2 rounded-full border text-xs sm:text-sm transition ${
                              selected
                                ? "bg-stone-900 border-stone-900 text-white"
                                : "bg-white border-stone-300 text-stone-700 hover:border-stone-500"
                            }`}
                          >
                            {selected && <Check className="w-3 h-3 inline mr-1" />}
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(activeVariant?.sku || specs.length > 0 || product.tags?.length > 0) && (
              <div className="border-t border-stone-200/80 pt-5 space-y-3">
                {activeVariant?.sku && <p className="text-sm text-stone-500">SKU: {activeVariant.sku}</p>}
                {specs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-600">
                    {specs.map((row) => (
                      <p key={row.label}>
                        {row.label}: {row.value}
                      </p>
                    ))}
                  </div>
                )}
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
            )}

            <button
              onClick={onWhatsApp}
              className="w-full h-12 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition text-xs uppercase tracking-[0.14em] font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Enquire Now
              </span>
            </button>
          </section>
        </div>
      </main>

      {related.length > 0 && (
        <section className="pt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-7">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <ProductInfoCard key={item.id} product={mapRelated(item)} isFluid />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
