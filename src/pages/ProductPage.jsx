import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient"; // Import Sanity client
import { PortableText } from '@portabletext/react'; // For rich text
import { ProductInfoCard } from "../components/ProductInfoCard";

const stripHtml = (value = "") =>
  String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const normalizeImages = (product) => {
  const sorted = [...(product?.images || [])].sort(
    (a, b) => (a?.rank ?? Number.MAX_SAFE_INTEGER) - (b?.rank ?? Number.MAX_SAFE_INTEGER)
  );
  const mapped = sorted
    .map((img) => ({ id: img?.id || img?.url, url: img?.url }))
    .filter((img) => img.url);

  if (product?.thumbnail && !mapped.some((img) => img.url === product.thumbnail)) {
    mapped.unshift({
      id: `thumb-${product.id || "product"}`,
      url: product.thumbnail,
    });
  }

  return mapped;
};

const isVariantInStock = (variant) => {
  if (!variant) return false;
  if (variant.manage_inventory === false) return true;
  if (variant.allow_backorder) return true;
  if (typeof variant.inventory_quantity === "number") return variant.inventory_quantity > 0;
  return true;
};

const renderMarkdownLike = (text = "") => {
  const lines = String(text).split("\n");
  const nodes = [];
  let list = [];

  const renderInline = (line = "") => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={`${part}-${idx}`}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${part}-${idx}`}>{part}</span>
      )
    );
  };

  const flushList = (key) => {
    if (!list.length) return;
    nodes.push(
      <ul key={`${key}-ul`} className="list-disc pl-5 space-y-1.5 text-stone-700">
        {list}
      </ul>
    );
    list = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const key = `line-${idx}`;

    if (!trimmed) {
      flushList(key);
      return;
    }

    if (trimmed === "---") {
      flushList(key);
      nodes.push(<hr key={`${key}-hr`} className="border-stone-200 my-2" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList(key);
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

    flushList(key);
    nodes.push(
      <p key={`${key}-p`} className="text-stone-700 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList("end");
  return nodes;
};

const ProductPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const thumbnailRefs = useRef([]);

  // State
  const [product, setProduct] = useState(null);
  const [sanityContent, setSanityContent] = useState(null); // Sanity content
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [optionsState, setOptionsState] = useState({});

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [region, setRegion] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState("details");

  const WHATSAPP_NUMBER = "1234567890";

  const cardWidths = useMemo(() => ({
    xs: 160,
    sm: 192,
    md: 224,
    lg: 256,
    xl: 288,
  }), []);

  const cardSize = "md"; // Define cardSize
  const currentCardWidth = cardWidths[cardSize] || cardWidths.md;

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      try {
        let existingCartId = localStorage.getItem("cart_id");
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
        const { regions } = await sdk.store.region.list();
        if (regions && regions.length > 0) {
          setRegion(regions[0]);
          localStorage.setItem("region_id", regions[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    initialize();
  }, []);

  // Fetch Data from Medusa and Sanity
  useEffect(() => {
    const fetchProduct = async () => {
      if (!region) return;
      setLoading(true);
      try {
        const queryParams = {
          handle,
          fields:
            "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants.id,*variants.title,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*variants.allow_backorder,*variants.options,*variants.calculated_price,*variants.prices,*collection,*tags,*type,material,weight,length,width,height,origin_country,created_at,*metadata",
          ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
        };

        const { products } = await sdk.store.product.list(queryParams);
        const productData = products?.[0];

        if (!productData) {
          navigate("/404");
          return;
        }

        setProduct({
          ...productData,
          subtitle: stripHtml(productData.subtitle || ""),
          description: productData.description || "",
          images: normalizeImages(productData),
        });

        // Initialize Options State
        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          const initialOptions = {};
          firstVariant.options.forEach(opt => {
            initialOptions[opt.option_id] = opt.value;
          });
          setOptionsState(initialOptions);
          setSelectedVariant(firstVariant);
        }

        // Fetch Sanity Content
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
            },
            relatedProducts[]->{
              medusaId,
              title,
              handle,
              thumbnailR2
            },
            upsellProducts[]->{
              medusaId,
              title,
              handle,
              thumbnailR2
            },
            crosssellProducts[]->{
              medusaId,
              title,
              handle,
              thumbnailR2
            }
          }`,
          { handle }
        );

        setSanityContent(sanityData);

        // Fetch related products from Medusa
        if (productData.collection_id) {
          const { products: relatedList } = await sdk.store.product.list({
            collection_id: [productData.collection_id],
            fields: "id,title,subtitle,description,handle,thumbnail,*images,*variants.calculated_price,*variants.prices",
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
            limit: 4,
          });
          setRelatedProducts(
            relatedList
              ?.filter((p) => p.id !== productData.id)
              .slice(0, 3)
              .map((p) => ({ ...p, images: normalizeImages(p), subtitle: stripHtml(p.subtitle || "") })) || []
          );
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

  const getOptionValues = (optionId) => {
    if (!product?.variants) return [];
    const values = new Set();
    product.variants.forEach((variant) => {
      const opt = variant.options.find((o) => o.option_id === optionId);
      if (opt) values.add(opt.value);
    });
    return Array.from(values);
  };

  const handleOptionSelect = (optionId, value) => {
    const newOptions = { ...optionsState, [optionId]: value };
    setOptionsState(newOptions);

    const matchingVariant = product?.variants?.find((variant) => {
      return variant.options.every((opt) => newOptions[opt.option_id] === opt.value);
    });

    setSelectedVariant(matchingVariant || null);
  };

  const formatPrice = (amount, currencyCode) => {
    const code = (currencyCode || region?.currency_code || "usd").toUpperCase();
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getVariantPriceDetails = (variant) => {
    if (!variant) return { price: "—" };
    if (
      variant.calculated_price?.calculated_amount !== undefined &&
      variant.calculated_price?.calculated_amount !== null
    ) {
      const calc = variant.calculated_price;
      return {
        price: formatPrice(calc.calculated_amount, calc.currency_code),
        originalPrice: calc.original_amount > calc.calculated_amount ? formatPrice(calc.original_amount, calc.currency_code) : null,
      };
    }
    const priceInRegion =
      variant.prices?.find((price) => price.currency_code === region?.currency_code) ||
      variant.prices?.[0];
    return { price: formatPrice(priceInRegion?.amount || 0, priceInRegion?.currency_code || region?.currency_code) };
  };

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    if (thumbnailRefs.current[index]) {
      thumbnailRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in ${product?.title}${selectedVariant ? ` (${Object.values(optionsState).join(', ')})` : ''}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const transformProductForCard = (item) => {
    const priceDetails = getVariantPriceDetails(item.variants?.[0]);
    return {
      ...item,
      subtitle: item.subtitle,
      description: stripHtml(item.description || ""),
      price: priceDetails.price,
      originalPrice: priceDetails.originalPrice,
      image: item.thumbnail || item.images?.[0]?.url || item.images?.[0],
    };
  };

  const activeVariant = selectedVariant || product?.variants?.[0];
  const inStock = isVariantInStock(activeVariant);

  const medusaSpecs = useMemo(() => {
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
    if (product.origin_country) rows.push({ label: "Origin", value: String(product.origin_country).toUpperCase() });
    if (product.material) rows.push({ label: "Material", value: product.material });
    if (product.type?.value) rows.push({ label: "Type", value: product.type.value });

    return rows;
  }, [activeVariant, product]);

  // Build accordion sections from Sanity
  const accordionSections = useMemo(() => {
    const sections = [];

    // Product Details (from Medusa + Sanity specs)
    sections.push({
      id: "details",
      label: "Product Details",
      content: (
        <div className="space-y-4">
          {sanityContent?.specifications && sanityContent.specifications.length > 0 && (
            <ul className="space-y-2 text-stone-600 list-disc pl-4">
              {sanityContent.specifications.map((spec, idx) => (
                <li key={idx}><strong>{spec.label}:</strong> {spec.value}</li>
              ))}
            </ul>
          )}
          {activeVariant?.sku && <p className="text-sm text-stone-500">SKU: {activeVariant.sku}</p>}
          {medusaSpecs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-600">
              {medusaSpecs.map((row) => (
                <p key={row.label}>
                  <strong>{row.label}:</strong> {row.value}
                </p>
              ))}
            </div>
          )}
        </div>
      ),
    });

    // Extra sections from Sanity
    if (sanityContent?.extraSections) {
      sanityContent.extraSections.forEach((section) => {
        sections.push({
          id: section.title.toLowerCase().replace(/\s+/g, '-'),
          label: section.title,
          icon: section.icon,
          content: (
            <div className="prose prose-sm max-w-none text-stone-600">
              <PortableText value={section.content} />
            </div>
          ),
        });
      });
    }

    return sections;
  }, [sanityContent, activeVariant, medusaSpecs]);

  if (loading || !region) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const priceDetails = getVariantPriceDetails(activeVariant);
  const images = product.images?.length > 0 ? product.images : [{ url: product.thumbnail }];

  // Use Sanity description if available, fallback to Medusa
  const productDescription = sanityContent?.shortDescription || product.description;

  return (
    <div className="min-h-screen  text-stone-900 font-sans pt-10">
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            {/* Mobile: Vertical Layout */}
            <div className="lg:hidden flex flex-col gap-6">
              <div className="relative w-full group select-none">
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-stone-100/80">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/45 hover:bg-black/60 text-white transition flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/45 hover:bg-black/60 text-white transition flex items-center justify-center"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="relative group">
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide scroll-smooth">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        ref={(el) => (thumbnailRefs.current[idx] = el)}
                        onClick={() => handleImageChange(idx)}
                        className={`
                          flex-shrink-0 relative w-20 h-20 snap-start
                          border transition-all duration-300 ease-out overflow-hidden
                          ${currentImageIndex === idx
                            ? "border-stone-900 opacity-100"
                            : "border-stone-200 opacity-60 hover:opacity-100"}
                        `}
                      >
                        <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Horizontal Layout */}
            <div className="hidden lg:flex gap-4">
              {images.length > 1 && (
                <div className="flex flex-col gap-4 w-24 flex-shrink-0">
                  <div className="flex flex-col gap-4 max-h-[650px] overflow-y-auto scrollbar-hide">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        ref={(el) => (thumbnailRefs.current[idx] = el)}
                        onClick={() => handleImageChange(idx)}
                        className={`
                          relative w-24 h-24 flex-shrink-0
                          border transition-all duration-300 ease-out overflow-hidden
                          ${currentImageIndex === idx
                            ? "border-stone-900 opacity-100"
                            : "border-stone-200 opacity-60 hover:opacity-100"}
                        `}
                      >
                        <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative flex-1 group select-none">
                <div className="aspect-[4/5] max-h-[720px] w-full overflow-hidden relative bg-stone-100/80">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Details */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-8 px-2">

              {/* Header */}
              <div className="space-y-4 border-b border-stone-200 pb-6">
                <div className="flex justify-between items-start">
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-tight">
                    {product.title}
                  </h1>
                  <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <Heart className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                {product.subtitle && (
                  <p className="text-xs md:text-sm uppercase tracking-[0.14em] text-stone-500 leading-relaxed">
                    {product.subtitle}
                  </p>
                )}

                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-light tracking-wide">{priceDetails.price}</span>
                  {priceDetails.originalPrice && (
                    <span className="text-stone-400 line-through font-light">{priceDetails.originalPrice}</span>
                  )}
                  <span
                    className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border ${
                      inStock
                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                        : "text-rose-700 bg-rose-50 border-rose-300"
                    }`}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Description from Sanity */}
              {productDescription && (
                <div className="space-y-2 text-sm md:text-base">
                  {renderMarkdownLike(productDescription)}
                </div>
              )}

              {/* Features from Sanity */}
              {sanityContent?.features && sanityContent.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-stone-900 font-medium">
                    Features
                  </h3>
                  <ul className="space-y-2">
                    {sanityContent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variant Selectors */}
              {product.options?.map((option) => {
                const uniqueValues = getOptionValues(option.id);
                const normalizedTitle = (option.title || "").toLowerCase();
                const onlyDefaultOption =
                  uniqueValues.length === 1 &&
                  (uniqueValues[0] || "").toLowerCase().includes("default option");

                if (normalizedTitle === "default option" || onlyDefaultOption) return null;
                if (uniqueValues.length === 0) return null;

                return (
                  <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-widest text-stone-900 font-medium">
                        {option.title}
                      </label>
                      <span className="text-xs text-stone-500 font-light">
                        {optionsState[option.id]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {uniqueValues.map((value) => {
                        const isSelected = optionsState[option.id] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.id, value)}
                            className={`
                              relative px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium tracking-wider uppercase 
                              transition-all duration-300 ease-out rounded-full border backdrop-blur-sm
                              transform-gpu will-change-transform flex-shrink-0
                              ${isSelected
                                ? "text-white bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
                                : "text-gray-600 bg-white/90 border-gray-200 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/90 hover:scale-105"
                              }
                            `}
                            style={{
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            }}
                          >
                            {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                            <span>{value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div className="pt-4 space-y-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 transition-all uppercase tracking-widest text-xs font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire Now</span>
                  </div>
                </button>
              </div>

              {/* Accordions from Sanity */}
              <div className="border-t border-stone-200 pt-4">
                {accordionSections.map((section) => (
                  <div key={section.id} className="border-b border-stone-100">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)}
                      className="w-full py-5 flex justify-between items-center text-left group"
                    >
                      <span className="text-xs uppercase tracking-widest text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                        {section.label}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${activeAccordion === section.id ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === section.id ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"}`}>
                      <div className="text-sm font-light text-stone-600 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <h2 className="font-serif text-3xl text-stone-900 mb-12">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {relatedProducts.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex-shrink-0"
                  style={{ width: `${currentCardWidth}px` }}
                >
                  <ProductInfoCard
                    product={transformProductForCard(item)}
                    cardSize={cardSize}
                    isFluid={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductPage;
