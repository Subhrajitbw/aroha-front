import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown, Ruler, ShieldCheck, Truck, RotateCcw, Star, Share2 } from "lucide-react";
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
  const [customizations, setCustomizations] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [region, setRegion] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState("specs");

  const WHATSAPP_NUMBER = "919903073628";

  // Initialize Region/Cart
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
          } catch { localStorage.removeItem("cart_id"); }
        }
        const { regions } = await sdk.store.region.list();
        if (regions?.length > 0) {
          setRegion(regions[0]);
          localStorage.setItem("region_id", regions[0].id);
        }
      } catch (error) { console.error(error); }
    };
    initialize();
  }, []);

  // Fetch Medusa + Sanity Data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!region) return;
      setLoading(true);
      try {
        const sanityData = await sanityClient.fetch(
          `*[_type == "product" && handle == $handle][0]{
            ...,
            relatedProducts[]->{ medusaId, title, handle, thumbnailR2{url}, shortIntro }
          }`,
          { handle }
        );
        if (!sanityData) { navigate("/404"); return; }
        setSanityContent(sanityData);
        const { product: medusaData } = await sdk.store.product.retrieve(
          sanityData.medusaId,
          {
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
            fields: "*variants,*variants.calculated_price,*variants.inventory_quantity,*variants.allow_backorder,*variants.manage_inventory,*images,*options"
          }
        );
        setProduct(medusaData);
        if (medusaData.variants?.length > 0) {
          const firstVariant = medusaData.variants[0];
          const initialOptions = {};
          firstVariant.options?.forEach((opt) => { initialOptions[opt.option_id] = opt.value; });
          setOptionsState(initialOptions);
          setSelectedVariant(firstVariant);
        }
        setRelatedProducts(sanityData.relatedProducts || []);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally { setLoading(false); }
    };
    fetchProduct();
  }, [handle, region, cartId, navigate]);

  const activeVariant = selectedVariant || product?.variants?.[0];
  const stockStatus = useMemo(() => {
    if (!activeVariant) return { inStock: false, label: "Unavailable" };
    const isInStock = activeVariant.manage_inventory === false || activeVariant.allow_backorder === true || (Number(activeVariant.inventory_quantity) > 0);
    return { inStock: isInStock, label: isInStock ? "In Stock" : "Out of Stock" };
  }, [activeVariant]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    if (thumbnailRefs.current[index]) {
      thumbnailRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const formatPrice = (amount, currencyCode) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: (currencyCode || region?.currency_code || "inr").toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPrice = () => {
    if (!activeVariant?.calculated_price) return { price: "—" };
    const calc = activeVariant.calculated_price;
    return {
      price: formatPrice(calc.calculated_amount, calc.currency_code),
      original: calc.original_amount > calc.calculated_amount ? formatPrice(calc.original_amount, calc.currency_code) : null
    };
  };

  const accordionSections = useMemo(() => {
    const sections = [];

    if (sanityContent?.dimensions || sanityContent?.additionalSpecs || sanityContent?.careInstructions) {
      sections.push({
        id: "specs",
        label: "Specifications & Care",
        content: (
          <div className="space-y-6">
            {sanityContent.dimensions && (
              <div className="flex items-center gap-4 p-3 bg-stone-100/50 rounded-xl border border-stone-200/50">
                <Ruler className="w-4 h-4 text-stone-400" />
                <p className="text-sm tracking-tight">{sanityContent.dimensions.width}W x {sanityContent.dimensions.height}H x {sanityContent.dimensions.depth}D {sanityContent.dimensions.unit}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2 border-b border-stone-100 pb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Technical Specs</p>
              {sanityContent.additionalSpecs?.map((spec, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span className="font-medium text-stone-500">{spec.label}</span>
                  <span className="text-stone-900">{spec.value}</span>
                </div>
              ))}
            </div>
            {sanityContent.careInstructions && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Maintenance</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-stone-600 font-light">
                  {sanityContent.careInstructions.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        )
      });
    }

    if (sanityContent?.afterSales) {
      sections.push({
        id: "trust",
        label: "Warranty & After-Sales",
        content: (
          <div className="space-y-4 text-sm text-stone-600">
            <div className="flex gap-3"><Truck className="w-4 h-4 text-stone-400" /> <p><strong>Delivery:</strong> {sanityContent.afterSales.deliveryTimeline}</p></div>
            <div className="flex gap-3"><ShieldCheck className="w-4 h-4 text-stone-400" /> <p><strong>Warranty:</strong> {sanityContent.afterSales.structuralWarrantyYears}yr Structural, {sanityContent.afterSales.upholsteryWarrantyYears}yr Upholstery</p></div>
            <div className="flex gap-3"><RotateCcw className="w-4 h-4 text-stone-400" /> <p><strong>Return Policy:</strong> {sanityContent.afterSales.returnPolicy}</p></div>
            <div className="flex flex-wrap gap-2 pt-2">
              {sanityContent.trustBadges?.map((b, i) => <span key={i} className="px-2 py-1 bg-stone-100 text-[10px] uppercase font-bold tracking-widest rounded">{b}</span>)}
            </div>
          </div>
        )
      });
    }

    if (sanityContent?.testimonials) {
      sections.push({
        id: "social",
        label: "Client Experiences",
        content: (
          <div className="space-y-4">
            {sanityContent.testimonials.map((t, i) => (
              <div key={i} className="italic text-stone-600 text-sm border-l-2 border-amber-200 pl-4 py-1">
                "{t.quote}" <p className="not-italic font-bold text-stone-900 mt-1">— {t.clientName}</p>
              </div>
            ))}
          </div>
        )
      });
    }

    if (sanityContent?.faqs) {
      sections.push({
        id: "faq", label: "FAQs", content: (
          <div className="space-y-4">
            {sanityContent.faqs.map((faq, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium text-stone-900">Q: {faq.question}</p>
                <p className="mt-1 text-stone-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        )
      });
    }

    return sections;
  }, [sanityContent]);

  if (loading || !product) return <div className="min-h-screen flex items-center justify-center font-serif text-stone-400">Aroha House Crafting...</div>;

  const images = sanityContent?.galleryR2?.length > 0 ? sanityContent.galleryR2 : (product.images?.length > 0 ? product.images : [{ url: product.thumbnail }]);

  return (
    <div className="min-h-screen text-stone-900 font-sans">
      <main className="min-h-screen lg:min-h-screen max-w-[1800px] mx-auto flex flex-col lg:flex-row">

        {/* LEFT: IMAGE GALLERY - Optimized for overlap prevention and responsiveness */}
        <div className="lg:w-7/12 relative lg:h-full overflow-hidden flex items-center justify-center lg:p-[6rem] pt-24 px-4">
          <div className="relative h-full w-full lg:h-[85%] lg:w-[85%] rounded-[24px] lg:rounded-[48px] overflow-hidden ">
            <img src={images[currentImageIndex]?.url} className="w-full h-full object-cover animate-in fade-in duration-700" alt={product.title} />
          </div>

          {/* Desktop Thumbnails - Side pinned, no overlap */}
          <div className="hidden lg:flex absolute left-8 bottom-24 flex-col gap-4 max-h-[50%] overflow-y-auto scrollbar-hide z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleImageChange(idx)}
                className={`w-14 h-18 rounded-xl overflow-hidden border-2 transition-all duration-300 ${currentImageIndex === idx ? "border-stone-900 scale-110 shadow-lg" : "border-white opacity-40 hover:opacity-100"}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>

          {/* Mobile Thumbnail Strip */}
          <div className="lg:hidden absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleImageChange(idx)}
                className={`w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? "border-stone-900 scale-110" : "border-white opacity-60"}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: SCROLLABLE DETAILS */}
<div className="lg:w-5/12 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-stone-50 px-6 lg:px-16 py-10 lg:py-24 border-l border-stone-200/50">
          <div className="max-w-xl mx-auto space-y-10 lg:space-y-12 pb-20">
            <header className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold">{sanityContent.brandName || "Aroha House"}</p>
              <h1 className="font-serif text-3xl lg:text-6xl leading-[1.1] text-stone-900 font-bold tracking-tight">{sanityContent.title || product.title}</h1>
              <p className="text-stone-500 italic text-base lg:text-lg leading-relaxed font-light">{sanityContent.shortIntro}</p>

              <div className="flex items-baseline gap-4 lg:gap-6 pt-2">
                <span className="text-3xl lg:text-4xl font-light tracking-tighter">{getPrice().price}</span>
                {getPrice().original && <span className="text-stone-300 line-through text-lg lg:text-xl font-light">{getPrice().original}</span>}
                <span className={`text-[9px] lg:text-[10px] px-3 lg:px-4 py-1.5 rounded-full border uppercase tracking-widest font-bold ${stockStatus.inStock ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                  {stockStatus.label}
                </span>
              </div>
            </header>

            {/* CUSTOMIZATION GRID */}
            <div className="space-y-8 lg:space-y-10">
              {sanityContent.customizationAttributes?.map((attr) => (
                <div key={attr.attributeName} className="space-y-4 lg:space-y-5">
                  <label className="text-[11px] uppercase tracking-[0.2em] font-black text-stone-900">{attr.attributeName}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {attr.options?.map((opt) => {
                      const isSelected = customizations[attr.attributeName] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => setCustomizations(prev => ({ ...prev, [attr.attributeName]: opt.label }))}
                          className={`group flex flex-col text-left p-4 lg:p-5 rounded-2xl border-2 transition-all duration-500 relative ${isSelected
                            ? "border-stone-900 bg-stone-900 text-white shadow-xl scale-[1.02]"
                            : "border-stone-200 bg-white hover:border-stone-400 text-stone-600"
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isSelected ? "text-white" : "text-stone-900"}`}>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in duration-300" />}
                          </div>
                          {opt.description && (
                            <span className={`text-[9px] leading-tight font-light line-clamp-2 transition-colors ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                              {opt.description}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-bold">The Narrative</h2>
              <div className="prose prose-stone prose-sm text-stone-600 font-light leading-relaxed italic border-l-2 border-stone-200 pl-6">
                <PortableText value={sanityContent.description} />

                {sanityContent.keyFeatures && (
                  <div className="mt-6 space-y-2 not-italic">
                    <p className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Key Features</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-500">
                      {sanityContent.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {sanityContent.whyThisProduct && (
                  <div className="mt-6 space-y-2 not-italic">
                    <p className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Why Choose This Piece</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-500 italic">
                      {sanityContent.whyThisProduct.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* ACCORDIONS */}
            <div className="border-t border-stone-200">
              {accordionSections.map(section => (
                <div key={section.id} className="border-b border-stone-100">
                  <button onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)} className="w-full py-6 lg:py-7 flex justify-between items-center group transition-all">
                    <span className={`text-[11px] uppercase tracking-[0.2em] font-bold ${activeAccordion === section.id ? "text-stone-900" : "text-stone-400 hover:text-stone-600"}`}>{section.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${activeAccordion === section.id ? "rotate-180 text-stone-900" : "text-stone-300"}`} />
                  </button>
                  {activeAccordion === section.id && (
                    <div className="pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 pb-2">
              <button
                onClick={() => {
                  const customizationText = Object.entries(customizations).length > 0
                    ? `\n\nCustomizations:\n${Object.entries(customizations).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`
                    : '';
                  const msg = `Hi! I'm interested in the ${product.title}.${customizationText}`;
                  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full h-16 bg-stone-900 text-white rounded-[20px] flex items-center justify-between px-8 lg:px-10 hover:bg-stone-800 transition-all active:scale-[0.98] shadow-2xl group"
              >
                <div className="flex items-center gap-4">
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{sanityContent.cta?.primary || "Enquire Now"}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
              <div className="pt-20 lg:pt-24 space-y-8 lg:space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold">Curated Pairing</p>
                  <h2 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight">Complementary Pieces</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:gap-12">
                  {relatedProducts.map(item => (
                    <ProductInfoCard key={item.handle} product={{ ...item, image: item.thumbnailR2?.url, price: "View Piece" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx global>{`
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  

  /* Mobile: normal document scroll */
  @media (max-width: 1023px) {
    body {
      overflow-y: auto;
      background-color: #fafaf9;
    }
  }

  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Plus+Jakarta+Sans:wght@200;300;400;500;600;800&display=swap');
`}</style>

    </div>
  );
};

export default ProductPage;