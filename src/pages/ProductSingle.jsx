import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from '@portabletext/react';
import { ProductInfoCard } from "../components/ProductInfoCard";

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

const renderInlineMarkdown = (line = "") => {
  const parts = String(line).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${idx}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    )
  );
};

const renderDescription = (text = "") => {
  const lines = String(text).split("\n");
  const nodes = [];
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`${key}-ul`} className="list-disc pl-5 space-y-1.5 text-stone-700">
        {listItems}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const key = `desc-${idx}`;

    if (!line) {
      flushList(key);
      return;
    }

    if (line === "---") {
      flushList(key);
      nodes.push(<hr key={`${key}-hr`} className="border-stone-200 my-2" />);
      return;
    }

    if (line.startsWith("### ")) {
      flushList(key);
      nodes.push(
        <h3 key={`${key}-h3`} className="text-base sm:text-lg font-medium text-stone-900">
          {renderInlineMarkdown(line.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    if (line.startsWith("* ")) {
      listItems.push(<li key={`${key}-li`}>{renderInlineMarkdown(line.replace(/^\*\s+/, ""))}</li>);
      return;
    }

    flushList(key);
    nodes.push(
      <p key={`${key}-p`} className="text-stone-600 font-light leading-relaxed text-sm md:text-base">
        {renderInlineMarkdown(line)}
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
  const [sanityContent, setSanityContent] = useState(null);
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

  const cardSize = "md";
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
  // Fetch Data from Medusa and Sanity
useEffect(() => {
  const fetchProduct = async () => {
    if (!region) return;
    setLoading(true);
    try {
      const queryParams = {
        handle,
        fields:
          "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants.id,*variants.title,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*variants.allow_backorder,*variants.options,*variants.weight,*variants.length,*variants.width,*variants.height,*variants.calculated_price,*variants.prices,*collection,*tags,*type,material,weight,length,width,height,origin_country,*metadata,created_at",
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
        subtitle: String(productData.subtitle || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
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
            thumbnailR2{url}
          },
          upsellProducts[]->{
            medusaId,
            title,
            handle,
            thumbnailR2{url}
          },
          crosssellProducts[]->{
            medusaId,
            title,
            handle,
            thumbnailR2{url}
          }
        }`,
        { handle }
      );

      setSanityContent(sanityData);

      // Fetch related products from Sanity OR Medusa
      if (sanityData?.relatedProducts && sanityData.relatedProducts.length > 0) {
        // Use Sanity curated related products
        const medusaIds = sanityData.relatedProducts
          .map(p => p.medusaId)
          .filter(Boolean);
        
        if (medusaIds.length > 0) {
          const { products: relatedList } = await sdk.store.product.list({
            id: medusaIds,
            fields:
              "id,title,subtitle,description,handle,thumbnail,*images,*variants.calculated_price,*variants.prices",
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
          });
          setRelatedProducts(
            (relatedList || [])
              .filter((item) => item.id !== productData.id)
              .map((item) => ({ ...item, images: normalizeImages(item) }))
          );
        }
      } else if (productData.collection_id) {
        // Fallback to collection-based related products
        const { products: relatedList } = await sdk.store.product.list({
          collection_id: [productData.collection_id],
          fields:
            "id,title,subtitle,description,handle,thumbnail,*images,*variants.calculated_price,*variants.prices",
          ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
          limit: 4,
        });
        setRelatedProducts(
          relatedList
            ?.filter((p) => p.id !== productData.id)
            .slice(0, 3)
            .map((item) => ({ ...item, images: normalizeImages(item) })) || []
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
      const opt = variant.options?.find((o) => o.option_id === optionId);
      if (opt) values.add(opt.value);
    });
    return Array.from(values);
  };

  const handleOptionSelect = (optionId, value) => {
    const newOptions = { ...optionsState, [optionId]: value };
    setOptionsState(newOptions);

    const matchingVariant = product?.variants?.find((variant) => {
      return variant.options?.every((opt) => newOptions[opt.option_id] === opt.value);
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
    return {
      price: formatPrice(
        priceInRegion?.amount || 0,
        priceInRegion?.currency_code || region?.currency_code
      ),
    };
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
    const variantForMessage = selectedVariant || product?.variants?.[0];
    const message = `Hi, I'm interested in ${product?.title}${variantForMessage ? ` (${Object.values(optionsState).join(', ')})` : ''}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const transformProductForCard = (item) => {
    const priceDetails = getVariantPriceDetails(item.variants?.[0]);
    return {
      ...item,
      subtitle: String(item.subtitle || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      description: String(item.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      price: priceDetails.price,
      originalPrice: priceDetails.originalPrice,
      image: item.thumbnail || item.images?.[0]?.url,
    };
  };

  const activeVariant = selectedVariant || product?.variants?.[0];
  const isInStock = activeVariant
    ? activeVariant.manage_inventory === false ||
      activeVariant.allow_backorder ||
      (typeof activeVariant.inventory_quantity === "number"
        ? activeVariant.inventory_quantity > 0
        : true)
    : false;

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
          {medusaSpecs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-600">
              {medusaSpecs.map((row) => (
                <p key={row.label}>
                  <strong>{row.label}:</strong> {row.value}
                </p>
              ))}
            </div>
          )}
          {sanityContent?.specifications && sanityContent.specifications.length > 0 && (
            <ul className="space-y-2 text-stone-600 list-disc pl-4">
              {sanityContent.specifications.map((spec, idx) => (
                <li key={idx}><strong>{spec.label}:</strong> {spec.value}</li>
              ))}
            </ul>
          )}
          {activeVariant?.sku && (
            <p className="text-sm text-stone-500">SKU: {activeVariant.sku}</p>
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
  const productDescription = product.description || sanityContent?.shortDescription || "";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pt-10">
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            {/* Mobile: Vertical Layout */}
            <div className="lg:hidden flex flex-col gap-5">
              <div className="relative w-full group select-none">
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-stone-100 border border-stone-200/70">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />

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
                      <div className="absolute bottom-3 right-3 text-[10px] tracking-[0.2em] uppercase text-white/90 bg-black/45 px-2.5 py-1">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="relative group">
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide scroll-smooth">
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
                            : "border-stone-200 opacity-65 hover:opacity-100"}
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
                <div className="flex flex-col gap-3 w-24 flex-shrink-0">
                  <div className="flex flex-col gap-3 max-h-[760px] overflow-y-auto scrollbar-hide">
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
                            : "border-stone-200 opacity-65 hover:opacity-100"}
                        `}
                      >
                        <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative flex-1 group select-none">
                <div className="aspect-[4/5] max-h-[760px] w-full overflow-hidden relative bg-stone-100 border border-stone-200/70">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.2em] uppercase text-white/90 bg-black/45 px-2.5 py-1">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Details */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-7 px-1">
              {/* Header */}
              <div className="space-y-4 border-b border-stone-200 pb-6">
                <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500">
                  Aroha House Signature
                </p>
                <div className="flex justify-between items-start gap-4">
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-tight">
                    {product.title}
                  </h1>
                  <button className="p-2 hover:bg-stone-100 transition-colors">
                    <Heart className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                {product.subtitle && (
                  <p className="text-xs md:text-sm uppercase tracking-[0.14em] text-stone-500 leading-relaxed">
                    {String(product.subtitle).replace(/<[^>]*>/g, " ")}
                  </p>
                )}

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-light tracking-wide text-stone-900">{priceDetails.price}</span>
                  {priceDetails.originalPrice && (
                    <span className="text-stone-400 line-through font-light">{priceDetails.originalPrice}</span>
                  )}
                  <span
                    className={`text-[10px] md:text-xs px-2.5 py-1 border ${
                      isInStock
                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                        : "text-rose-700 bg-rose-50 border-rose-300"
                    }`}
                  >
                    {isInStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Description from Sanity */}
              {productDescription && (
                <div className="space-y-2 border-l-2 border-amber-300/70 pl-4">
                  {renderDescription(productDescription)}
                </div>
              )}

              {/* Rich Description from Sanity */}
              {sanityContent?.richDescription && sanityContent.richDescription.length > 0 && (
                <div className="prose prose-sm max-w-none text-stone-600 font-light leading-relaxed">
                  <PortableText value={sanityContent.richDescription} />
                </div>
              )}

              {/* Features from Sanity */}
              {sanityContent?.features && sanityContent.features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.18em] text-stone-900 font-medium">
                    Features
                  </h3>
                  <ul className="space-y-2">
                    {sanityContent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                        <Check className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
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
                const isDefaultOnly =
                  uniqueValues.length === 1 &&
                  (uniqueValues[0] || "").toLowerCase().includes("default option");
                if (uniqueValues.length === 0 || normalizedTitle === "default option" || isDefaultOnly) {
                  return null;
                }

                return (
                  <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-[0.18em] text-stone-900 font-medium">
                        {option.title}
                      </label>
                      <span className="text-xs text-stone-500 font-light">
                        {optionsState[option.id]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {uniqueValues.map((value) => {
                        const isSelected = optionsState[option.id] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.id, value)}
                            className={`
                              px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium tracking-[0.08em] uppercase
                              transition-all duration-300 ease-out border
                              ${isSelected
                                ? "text-white bg-gradient-to-r from-stone-900 to-stone-700 border-stone-700"
                                : "text-stone-700 bg-white border-stone-300 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50/70"
                              }
                            `}
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
              <div className="pt-2 space-y-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full h-12 bg-gradient-to-r from-stone-900 to-stone-700 text-white hover:from-stone-800 hover:to-stone-600 transition-all uppercase tracking-[0.18em] text-xs font-medium shadow-lg shadow-stone-900/20"
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
                      <span className="text-xs uppercase tracking-[0.18em] text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
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
        <section className="py-20 border-t border-stone-200 bg-gradient-to-b from-white/80 to-stone-50/60">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="mb-12">
              <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500 mb-3">Curated Pairings</p>
              <h2 className="font-serif text-3xl text-stone-900">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {relatedProducts.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex-shrink-0 w-full"
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
