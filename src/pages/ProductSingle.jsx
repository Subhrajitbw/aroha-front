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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(201,168,110,0.14),_transparent_45%),linear-gradient(180deg,rgba(250,250,249,0.98),rgba(245,245,244,0.92))] text-stone-900 font-sans pt-8 sm:pt-10">
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            {/* Mobile: Vertical Layout */}
            <div className="lg:hidden space-y-3">
              <div className="relative overflow-hidden rounded-[28px] border border-stone-200/80 bg-stone-100/80 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.55)]">
                <div className="aspect-[4/5]">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.015]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white hover:bg-black/60 transition flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white hover:bg-black/60 transition flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 text-[10px] tracking-[0.2em] uppercase text-white/90 bg-black/45 px-2.5 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      ref={(el) => (thumbnailRefs.current[idx] = el)}
                      onClick={() => handleImageChange(idx)}
                      className={`
                        relative w-[86px] h-[104px] flex-shrink-0 rounded-2xl overflow-hidden border transition-all duration-300
                        ${currentImageIndex === idx
                          ? "border-stone-900 ring-2 ring-stone-900/10 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.75)]"
                          : "border-stone-200/85 opacity-70 hover:opacity-100 hover:-translate-y-0.5"}
                      `}
                    >
                      <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Balanced Layout */}
            <div className="hidden lg:grid lg:grid-cols-[104px_minmax(0,1fr)] gap-5 xl:gap-7">
              {images.length > 1 && (
                <div className="max-h-[760px] overflow-y-auto scrollbar-hide space-y-3 pr-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      ref={(el) => (thumbnailRefs.current[idx] = el)}
                      onClick={() => handleImageChange(idx)}
                      className={`
                        relative w-[96px] h-[118px] rounded-2xl overflow-hidden border transition-all duration-300
                        ${currentImageIndex === idx
                          ? "border-stone-900 ring-2 ring-stone-900/10 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.8)]"
                          : "border-stone-200/85 opacity-65 hover:opacity-100 hover:-translate-y-0.5"}
                      `}
                    >
                      <img src={img.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[34px] border border-stone-200/80 bg-stone-100/80 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.75)]">
                  <div className="aspect-[4/5]">
                    <img
                      src={images[currentImageIndex]?.url}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.012]"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 text-white hover:bg-black/60 transition flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 text-white hover:bg-black/60 transition flex items-center justify-center"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.2em] uppercase text-white/90 bg-black/45 px-2.5 py-1 rounded-full">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {images.length > 3 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.slice(0, 3).map((img, idx) => (
                      <button
                        key={`preview-${img.id || idx}`}
                        onClick={() => handleImageChange(idx)}
                        className="relative overflow-hidden rounded-2xl border border-stone-200/75 bg-stone-100/80 aspect-[4/3]"
                      >
                        <img src={img.url} alt={`${product.title} preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Sticky Details */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-7 lg:space-y-8">
              {/* Header */}
              <div className="space-y-5 pb-7 border-b border-stone-200/80">
                <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500">
                  Aroha House Signature
                </p>

                <div className="flex justify-between items-start gap-4">
                  <h1 className="font-serif text-3xl md:text-4xl xl:text-5xl text-stone-900 leading-[1.06]">
                    {product.title}
                  </h1>
                  <button className="p-2.5 rounded-full border border-stone-200/80 hover:border-stone-300 hover:bg-white/50 transition-colors">
                    <Heart className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                {product.subtitle && (
                  <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.14em] text-stone-500 leading-relaxed">
                    {String(product.subtitle).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                  </p>
                )}

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl xl:text-[2.05rem] font-light tracking-wide text-stone-900">
                    {priceDetails.price}
                  </span>
                  {priceDetails.originalPrice && (
                    <span className="text-stone-400 line-through font-light text-lg">{priceDetails.originalPrice}</span>
                  )}
                  <span
                    className={`text-[10px] md:text-xs px-2.5 py-1 rounded-full border ${
                      isInStock
                        ? "text-emerald-700 bg-emerald-50/70 border-emerald-300"
                        : "text-rose-700 bg-rose-50/70 border-rose-300"
                    }`}
                  >
                    {isInStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                {medusaSpecs.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-0.5">
                    {medusaSpecs.slice(0, 6).map((row) => (
                      <div key={row.label} className="rounded-xl border border-stone-200/70 bg-white/45 px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">{row.label}</p>
                        <p className="text-sm text-stone-800 mt-1">{row.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {productDescription && (
                <section className="space-y-3">
                  <h2 className="text-xs uppercase tracking-[0.2em] text-stone-900 font-medium">Craft & Narrative</h2>
                  <div className="relative">
                    <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-amber-500/40 via-stone-300 to-transparent" />
                    <div className="pl-4 sm:pl-5 pr-1 max-h-[360px] overflow-y-auto scrollbar-hide space-y-2.5">
                      {renderDescription(productDescription)}
                    </div>
                  </div>
                </section>
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
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sanityContent.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 rounded-xl border border-stone-200/60 bg-white/35 px-3 py-2 text-sm text-stone-700">
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
                              px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium tracking-[0.08em] uppercase rounded-full
                              transition-all duration-300 ease-out border
                              ${isSelected
                                ? "text-white bg-gradient-to-r from-stone-900 to-stone-700 border-stone-700 shadow-lg shadow-stone-900/20"
                                : "text-stone-700 bg-white/80 border-stone-300 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50/70"
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
              <div className="pt-1 space-y-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full h-12 rounded-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-700 text-white hover:from-stone-800 hover:to-stone-600 transition-all uppercase tracking-[0.18em] text-xs font-medium shadow-[0_22px_38px_-26px_rgba(15,23,42,0.95)]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire Now</span>
                  </div>
                </button>
              </div>

              {/* Accordions from Sanity */}
              <div className="border-t border-stone-200 pt-3">
                {accordionSections.map((section) => (
                  <div key={section.id} className="border-b border-stone-100">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)}
                      className="w-full py-4 flex justify-between items-center text-left group"
                    >
                      <span className="text-xs uppercase tracking-[0.18em] text-stone-900 font-medium group-hover:text-stone-600 transition-colors">
                        {section.label}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-300 ${activeAccordion === section.id ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeAccordion === section.id ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
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
        <section className="py-16 sm:py-20 border-t border-stone-200 bg-gradient-to-b from-white/80 to-stone-50/60">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
            <div className="mb-10 sm:mb-12">
              <p className="text-[10px] tracking-[0.28em] uppercase text-stone-500 mb-3">Curated Pairings</p>
              <h2 className="font-serif text-3xl text-stone-900">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
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
