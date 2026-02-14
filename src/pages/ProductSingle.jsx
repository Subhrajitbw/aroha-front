import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from "@portabletext/react";
import { ProductInfoCard } from "../components/ProductInfoCard";

const PRODUCT_FIELDS =
  "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants.id,*variants.title,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*variants.allow_backorder,*variants.options,*variants.calculated_price,*variants.prices,*collection,*tags,*type,material,weight,length,width,height,origin_country,metadata,created_at";

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

const getVariantPriceDetails = (variant, fallbackCurrencyCode) => {
  if (!variant) {
    return { amount: 0, originalAmount: 0, currencyCode: fallbackCurrencyCode || "USD" };
  }

  if (variant.calculated_price?.calculated_amount !== undefined) {
    const calc = variant.calculated_price;
    return {
      amount: calc.calculated_amount || 0,
      originalAmount: calc.original_amount || calc.calculated_amount || 0,
      currencyCode: calc.currency_code || fallbackCurrencyCode || "USD",
    };
  }

  const fallbackPrice = variant.prices?.[0];
  if (fallbackPrice) {
    return {
      amount: fallbackPrice.amount || 0,
      originalAmount: fallbackPrice.amount || 0,
      currencyCode: fallbackPrice.currency_code || fallbackCurrencyCode || "USD",
    };
  }

  return { amount: 0, originalAmount: 0, currencyCode: fallbackCurrencyCode || "USD" };
};

const variantInStock = (variant) => {
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
    title: raw.title || "",
    subtitle: stripHtml(raw.subtitle || ""),
    description: raw.description || "",
    imagesSorted: images,
  };
};

const inlineFormat = (text = "") => {
  const chunks = String(text).split(/(\*\*[^*]+\*\*)/g);
  return chunks.map((chunk, idx) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={`${idx}-${chunk}`}>{chunk.slice(2, -2)}</strong>
    ) : (
      <span key={`${idx}-${chunk}`}>{chunk}</span>
    )
  );
};

const renderMarkdownLike = (text = "") => {
  const lines = String(text).split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`${key}-ul`} className="list-disc pl-5 space-y-1.5 text-stone-700">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const key = `line-${index}`;

    if (!trimmed) {
      flushList(key);
      return;
    }

    if (trimmed === "---") {
      flushList(key);
      elements.push(<hr key={`${key}-hr`} className="border-stone-200 my-2" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList(key);
      elements.push(
        <h3 key={`${key}-h3`} className="text-base sm:text-lg font-medium text-stone-900">
          {inlineFormat(trimmed.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("* ")) {
      listItems.push(<li key={`${key}-li`}>{inlineFormat(trimmed.replace(/^\*\s+/, ""))}</li>);
      return;
    }

    flushList(key);
    elements.push(
      <p key={`${key}-p`} className="text-stone-700 leading-relaxed">
        {inlineFormat(trimmed)}
      </p>
    );
  });

  flushList("last");
  return elements;
};

export default function ProductPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const thumbnailRefs = useRef([]);

  const [product, setProduct] = useState(null);
  const [sanityContent, setSanityContent] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [optionsState, setOptionsState] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState("details");
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [cartId, setCartId] = useState(null);

  const WHATSAPP_NUMBER = "1234567890";

  useEffect(() => {
    const initialize = async () => {
      try {
        const existingCartId = localStorage.getItem("cart_id");
        if (existingCartId) {
          try {
            const { cart } = await sdk.store.cart.retrieve(existingCartId);
            setCartId(cart.id);
            setRegion(cart.region);
            return;
          } catch {
            localStorage.removeItem("cart_id");
          }
        }

        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.[0]) {
          setRegion(regions[0]);
          localStorage.setItem("region_id", regions[0].id);
        }
      } catch (error) {
        console.error("Failed initializing product page:", error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!region?.id || !handle) return;
      setLoading(true);

      try {
        const queryParams = {
          handle,
          fields: PRODUCT_FIELDS,
          ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
        };

        const { products } = await sdk.store.product.list(queryParams);
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

        const sanityData = await sanityClient.fetch(
          `*[_type == "product" && handle == $handle][0]{
            shortDescription,
            richDescription,
            features,
            specifications,
            extraSections[]{
              title,
              icon,
              content
            }
          }`,
          { handle }
        );
        setSanityContent(sanityData || null);

        if (normalized.collection_id) {
          const { products: related } = await sdk.store.product.list({
            collection_id: [normalized.collection_id],
            fields: RELATED_FIELDS,
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
            limit: 4,
          });

          const mapped = (related || [])
            .filter((item) => item.id !== normalized.id)
            .slice(0, 3)
            .map((item) => normalizeProduct(item));

          setRelatedProducts(mapped);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle, region, cartId, navigate]);

  const optionGroups = useMemo(() => {
    if (!product?.options?.length) return [];

    return product.options
      .map((option) => {
        const values = Array.from(
          new Set(
            (product.variants || [])
              .map(
                (variant) =>
                  variant.options?.find((item) => item.option_id === option.id)?.value
              )
              .filter(Boolean)
          )
        );
        return { ...option, values };
      })
      .filter((group) => {
        const groupTitle = (group.title || "").toLowerCase();
        const hasOnlyDefaultOption =
          group.values.length === 1 &&
          (group.values[0] || "").toLowerCase().includes("default option");
        return groupTitle !== "default option" && !hasOnlyDefaultOption;
      });
  }, [product]);

  const activeVariant = selectedVariant || product?.variants?.[0];
  const price = getVariantPriceDetails(activeVariant, region?.currency_code);
  const isDiscounted = price.originalAmount > price.amount;
  const inStock = variantInStock(activeVariant);
  const images = product?.imagesSorted || [];

  const specRows = useMemo(() => {
    if (!product) return [];

    const rows = [];
    const width = activeVariant?.width ?? product.width;
    const height = activeVariant?.height ?? product.height;
    const depth = activeVariant?.length ?? product.length;
    const weight = activeVariant?.weight ?? product.weight;

    if (width) rows.push({ label: "Width", value: `${width}"` });
    if (height) rows.push({ label: "Height", value: `${height}"` });
    if (depth) rows.push({ label: "Depth", value: `${depth}"` });
    if (weight) rows.push({ label: "Weight", value: `${weight}` });
    if (product.origin_country) {
      rows.push({ label: "Origin", value: String(product.origin_country).toUpperCase() });
    }
    if (product.material) rows.push({ label: "Material", value: product.material });
    if (product.type?.value) rows.push({ label: "Type", value: product.type.value });

    return rows;
  }, [activeVariant, product]);

  const accordionSections = useMemo(() => {
    const sections = [
      {
        id: "details",
        label: "Details",
        content: (
          <div className="space-y-3">
            {specRows.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-600">
                {specRows.map((row) => (
                  <p key={row.label}>
                    {row.label}: {row.value}
                  </p>
                ))}
              </div>
            )}

            {activeVariant?.sku && (
              <p className="text-sm text-stone-500">SKU: {activeVariant.sku}</p>
            )}

            {sanityContent?.specifications?.length > 0 && (
              <ul className="space-y-2 text-stone-600 list-disc pl-4 text-sm">
                {sanityContent.specifications.map((spec, idx) => (
                  <li key={`spec-${idx}`}>
                    <strong>{spec.label}:</strong> {spec.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      },
    ];

    if (sanityContent?.extraSections) {
      sanityContent.extraSections.forEach((section) => {
        if (!section?.title) return;
        sections.push({
          id: section.title.toLowerCase().replace(/\s+/g, "-"),
          label: section.title,
          content: (
            <div className="prose prose-sm max-w-none text-stone-600">
              <PortableText value={section.content} />
            </div>
          ),
        });
      });
    }

    return sections;
  }, [activeVariant, sanityContent, specRows]);

  const handleOptionSelect = (optionId, value) => {
    const next = { ...optionsState, [optionId]: value };
    setOptionsState(next);

    const matchingVariant = (product?.variants || []).find((variant) =>
      variant.options?.every((opt) => next[opt.option_id] === opt.value)
    );
    setSelectedVariant(matchingVariant || null);
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    if (thumbnailRefs.current[index]) {
      thumbnailRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const handleWhatsAppClick = () => {
    const variantInfo = activeVariant?.title ? ` (${activeVariant.title})` : "";
    const message = `Hi, I'm interested in ${product?.title}${variantInfo}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const relatedCardProduct = (item) => {
    const relatedVariantPrice = getVariantPriceDetails(item.variants?.[0], region?.currency_code);
    return {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: stripHtml(item.description || ""),
      handle: item.handle,
      image: item.thumbnail || item.imagesSorted?.[0],
      price: formatPrice(relatedVariantPrice.amount, relatedVariantPrice.currencyCode),
      originalPrice:
        relatedVariantPrice.originalAmount > relatedVariantPrice.amount
          ? formatPrice(relatedVariantPrice.originalAmount, relatedVariantPrice.currencyCode)
          : null,
      discount:
        relatedVariantPrice.originalAmount > relatedVariantPrice.amount
          ? Math.round(
              ((relatedVariantPrice.originalAmount - relatedVariantPrice.amount) /
                relatedVariantPrice.originalAmount) *
                100
            )
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

  const mergedDescription = sanityContent?.shortDescription || product.description;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 pb-16 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_42%),linear-gradient(180deg,rgba(250,250,249,0.96),rgba(245,245,244,0.9))]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 rounded-3xl border border-stone-200/70 bg-white/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-stone-900/5">
          <section className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5]">
              {images[currentImageIndex] ? (
                <img
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
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
                      handleImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-stone-200 flex items-center justify-center"
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
                      thumbnailRefs.current[idx] = el;
                    }}
                    onClick={() => handleImageChange(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border flex-shrink-0 ${
                      idx === currentImageIndex ? "border-stone-900" : "border-stone-200"
                    }`}
                  >
                    <img src={imageUrl} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-6">
            <div className="border-b border-stone-200 pb-5 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-light text-stone-900 leading-tight tracking-tight">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-xs sm:text-sm uppercase tracking-[0.14em] text-stone-500">
                  {product.subtitle}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl text-stone-900 font-light">
                  {formatPrice(price.amount, price.currencyCode)}
                </span>
                {isDiscounted && (
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

            {mergedDescription && (
              <div className="space-y-2 text-sm sm:text-base">{renderMarkdownLike(mergedDescription)}</div>
            )}

            {sanityContent?.richDescription?.length > 0 && (
              <div className="prose prose-sm max-w-none text-stone-600">
                <PortableText value={sanityContent.richDescription} />
              </div>
            )}

            {sanityContent?.features?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.14em] text-stone-900">Features</h3>
                <ul className="space-y-2">
                  {sanityContent.features.map((feature, idx) => (
                    <li key={`feature-${idx}`} className="flex items-start gap-2 text-sm text-stone-600">
                      <Check className="w-4 h-4 mt-0.5 text-stone-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {optionGroups.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs uppercase tracking-[0.14em] text-stone-900">{option.title}</label>
                  <span className="text-xs text-stone-500">{optionsState[option.id]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const selected = optionsState[option.id] === value;
                    return (
                      <button
                        key={`${option.id}-${value}`}
                        onClick={() => handleOptionSelect(option.id, value)}
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

            <button
              onClick={handleWhatsAppClick}
              className="w-full h-12 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition text-xs uppercase tracking-[0.14em] font-medium"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Enquire Now
              </span>
            </button>

            <div className="border-t border-stone-200">
              {accordionSections.map((section) => (
                <div key={section.id} className="border-b border-stone-100">
                  <button
                    onClick={() =>
                      setActiveAccordion(activeAccordion === section.id ? null : section.id)
                    }
                    className="w-full py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-xs uppercase tracking-[0.14em] text-stone-900">
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform ${
                        activeAccordion === section.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      activeAccordion === section.id ? "max-h-96 pb-4" : "max-h-0"
                    }`}
                  >
                    <div className="text-sm text-stone-600">{section.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {relatedProducts.length > 0 && (
        <section className="pt-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-7">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <ProductInfoCard key={item.id} product={relatedCardProduct(item)} isFluid />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
