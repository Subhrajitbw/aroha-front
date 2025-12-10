import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from '@portabletext/react';
import { ProductInfoCard } from "../components/ProductInfoCard";

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

  const WHATSAPP_NUMBER = "+919830483628";

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
        fields: "*variants.calculated_price,*variants.prices,*images,*options,*collection,*tags,*type,*material,*weight,*origin_country,*metadata",
        ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
      };

      const { products } = await sdk.store.product.list(queryParams);
      const productData = products?.[0];

      if (!productData) {
        navigate("/404");
        return;
      }

      setProduct(productData);

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
            fields: "*variants.calculated_price,*images",
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
          });
          setRelatedProducts(relatedList || []);
        }
      } else if (productData.collection_id) {
        // Fallback to collection-based related products
        const { products: relatedList } = await sdk.store.product.list({
          collection_id: [productData.collection_id],
          fields: "*variants.calculated_price,*images",
          ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
          limit: 4,
        });
        setRelatedProducts(relatedList?.filter((p) => p.id !== productData.id).slice(0, 3) || []);
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

    const matchingVariant = product.variants.find((variant) => {
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
    if (variant.calculated_price?.calculated_amount) {
      const calc = variant.calculated_price;
      return {
        price: formatPrice(calc.calculated_amount, calc.currency_code),
        originalPrice: calc.original_amount > calc.calculated_amount ? formatPrice(calc.original_amount, calc.currency_code) : null,
      };
    }
    return { price: formatPrice(variant.unit_price || 0, region?.currency_code) };
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
      price: priceDetails.price,
      originalPrice: priceDetails.originalPrice,
      image: item.thumbnail,
    };
  };

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
          {selectedVariant?.sku && (
            <p className="text-sm text-stone-500">SKU: {selectedVariant.sku}</p>
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
  }, [sanityContent, selectedVariant]);

  if (loading || !region) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  const priceDetails = getVariantPriceDetails(selectedVariant);
  const images = product.images?.length > 0 ? product.images : [{ url: product.thumbnail }];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pt-10">
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7">
            {/* Mobile: Vertical Layout */}
            <div className="lg:hidden flex flex-col gap-6">
              <div className="relative w-full bg-white group select-none">
                <div className="aspect-square w-full overflow-hidden relative bg-stone-100">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt="Main View"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageChange(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
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
                        key={idx}
                        ref={(el) => (thumbnailRefs.current[idx] = el)}
                        onClick={() => handleImageChange(idx)}
                        className={`
                          flex-shrink-0 relative w-20 h-20 snap-start
                          border transition-all duration-300 ease-out overflow-hidden
                          ${currentImageIndex === idx
                            ? "border-stone-900 opacity-100"
                            : "border-transparent opacity-60 hover:opacity-100 hover:border-stone-200"}
                        `}
                      >
                        <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
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
                        key={idx}
                        ref={(el) => (thumbnailRefs.current[idx] = el)}
                        onClick={() => handleImageChange(idx)}
                        className={`
                          relative w-24 h-24 flex-shrink-0
                          border transition-all duration-300 ease-out overflow-hidden
                          ${currentImageIndex === idx
                            ? "border-stone-900 opacity-100"
                            : "border-transparent opacity-60 hover:opacity-100 hover:border-stone-200"}
                        `}
                      >
                        <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative flex-1 bg-white group select-none">
                <div className="aspect-square max-h-[650px] w-full overflow-hidden relative bg-stone-100">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt="Main View"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
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
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-stone-900 leading-none">
                    {product.title}
                  </h1>
                  <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <Heart className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-2xl font-light tracking-wide">{priceDetails.price}</span>
                  {priceDetails.originalPrice && (
                    <span className="text-stone-400 line-through font-light">{priceDetails.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Short Description from Sanity (fallback to Medusa) */}
              {(sanityContent?.shortDescription || product.description) && (
                <p className="text-stone-600 font-light leading-relaxed text-sm md:text-base">
                  {sanityContent?.shortDescription || product.description}
                </p>
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
