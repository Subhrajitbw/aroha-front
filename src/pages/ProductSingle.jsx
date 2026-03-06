import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown, Ruler, ShieldCheck, Truck, RotateCcw, Star, Share2 } from "lucide-react";
import { sdk } from "../lib/medusaClient";
import { sanityClient } from "../lib/sanityClient";
import { PortableText } from '@portabletext/react';
import { ProductInfoCard } from "../components/ProductInfoCard";
import CustomDropdown from "../components/ui/CustomDropdown";

const ProductPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const thumbnailRefs = useRef([]);

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
  const mobileGalleryRef = useRef(null);

  const WHATSAPP_NUMBER = "919830483628";

  // REGION INIT (unchanged)
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

  // FETCH PRODUCT + RESOLVE MASTERS
  useEffect(() => {
    const fetchProduct = async () => {
      if (!region) return;
      setLoading(true);

      try {
        // STEP 1: get medusaType
        const baseProduct = await sanityClient.fetch(
          `*[_type == "product" && handle == $handle][0]`,
          { handle }
        );

        if (!baseProduct) {
          navigate("/404");
          return;
        }

        // STEP 2: full resolved query
        const fullProduct = await sanityClient.fetch(
          `*[_type == "product" && handle == $handle][0]{
            ...,
            customizationOverride->{customizationAttributes},
            afterSalesOverride->{
              deliveryOptions,
              shipping,
              installationSupport,
              returnPolicy,
              lifetimeSupportServices,
              supportContact,
              warranties
            },
            trustOverride->{content},

            "defaultCustomization": *[_type=="customizationMaster" && $medusaType in applicableMedusaTypes && isDefault==true][0]{customizationAttributes},
            "defaultPolicy": *[_type=="policyDocument" && policyType=="afterSales" && $medusaType in applicableMedusaTypes && isDefault==true][0]{
              deliveryOptions,
              shipping,
              installationSupport,
              returnPolicy,
              lifetimeSupportServices,
              supportContact,
              warranties
            },
            "defaultTrust": *[_type=="trustMaster" && isDefault==true][0]{content},

            relatedProducts[]->{ medusaId, title, handle, thumbnailR2{url}, shortIntro }
          }`,
          { handle, medusaType: baseProduct.medusaType }
        );

        setSanityContent(fullProduct);

        const { product: medusaData } = await sdk.store.product.retrieve(
          fullProduct.medusaId,
          {
            ...(cartId ? { cart_id: cartId } : { region_id: region.id }),
            fields: "*variants,*variants.calculated_price,*variants.inventory_quantity,*variants.allow_backorder,*variants.manage_inventory,*images,*options"
          }
        );

        setProduct(medusaData);

        if (medusaData.variants?.length > 0) {
          const firstVariant = medusaData.variants[0];
          const initialOptions = {};
          firstVariant.options?.forEach((opt) => {
            initialOptions[opt.option_id] = opt.value;
          });
          setOptionsState(initialOptions);
          setSelectedVariant(firstVariant);
        }

        setRelatedProducts(fullProduct.relatedProducts || []);
      } catch (error) {
        console.error(error);
      } finally { setLoading(false); }
    };

    fetchProduct();
  }, [handle, region, cartId, navigate]);

  // RESOLVED DATA (NEW BUT SAFE)
  const resolvedCustomization =
    sanityContent?.customizationOverride?.customizationAttributes ||
    sanityContent?.defaultCustomization?.customizationAttributes ||
    [];

  const resolvedAfterSales =
    sanityContent?.afterSalesOverride ||
    sanityContent?.defaultPolicy ||
    null;

  const resolvedTrust =
    sanityContent?.trustOverride?.content ||
    sanityContent?.defaultTrust?.content ||
    null;

  // EVERYTHING BELOW THIS LINE REMAINS 100% YOUR ORIGINAL UI

  const activeVariant = selectedVariant || product?.variants?.[0];

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



  const accordionSections = useMemo(() => {
    const sections = [];

    if (sanityContent?.dimensions || sanityContent?.additionalSpecs || sanityContent?.careInstructions) {
      sections.push({
        id: "specs",
        label: "Specifications & Care",
        content: (
          <div className="spce-y-6">

            {sanityContent.dimensions && (
              <>
                <span className="text-sm font-medium text-stone-500 break-words">
                  Dimensions
                </span>


                <div className="flex items-center gap-4 p-3 bg-stone-100/50 rounded-xl border border-stone-200/50">
                  <Ruler className="w-4 h-4 text-stone-400" />
                  <p className="text-sm tracking-tight">{sanityContent.dimensions.width}W x {sanityContent.dimensions.height}H x {sanityContent.dimensions.depth}D {sanityContent.dimensions.unit}</p>
                </div>
              </>
            )}
            <div className="divide-y divide-stone-100 pb-4">
              {sanityContent.additionalSpecs?.map((spec, i) => (
                <div
                  key={i}
                  className="py-3 grid grid-cols-1 md:grid-cols-2 md:gap-6"
                >
                  <span className="text-sm font-medium text-stone-500 break-words">
                    {spec.label}
                  </span>

                  <span className="text-xs text-stone-600 font-light md:text-right break-words">
                    {spec.value}
                  </span>
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

    if (resolvedAfterSales) {
      sections.push({
        id: "trust",
        label: "Warranty & After-Sales",
        content: (
          <div className="space-y-10 text-sm text-stone-700">

            {/* Delivery */}
            {resolvedAfterSales?.deliveryOptions && (
              <div className="flex gap-3">
                <Truck className="w-4 h-4 mt-1 text-stone-400 shrink-0" />

                <div className="w-full">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">
                    Delivery
                  </p>

                  {resolvedAfterSales?.deliveryOptions?.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2 text-stone-600 text-sm">
                      {resolvedAfterSales.deliveryOptions.map((option, i) => (
                        <li key={i}>
                          <span className="font-medium text-stone-900">
                            {option.type}
                          </span>
                          {option.timeline && (
                            <span className="text-stone-500">
                              {" "}– {option.timeline}
                            </span>
                          )}
                          {option.description && (
                            <span className="block text-stone-600 mt-1">
                              {option.description}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                </div>
              </div>
            )}

            {resolvedAfterSales?.shipping && (
              <div className="flex gap-3">
                <Truck className="w-4 h-4 mt-1 text-stone-400 shrink-0" />

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    Shipping
                  </p>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {resolvedAfterSales.shipping}
                  </p>
                </div>
              </div>
            )}

            {/* Installation Support */}
            {resolvedAfterSales?.installationSupport && (
              <div className="flex gap-3">
                <ShieldCheck className="w-4 h-4 mt-1 text-stone-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    Installation Support
                  </p>
                  <p className="text-stone-600">
                    {resolvedAfterSales.installationSupport}
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic Warranties */}
            {resolvedAfterSales?.warranties?.length > 0 && (
              <div className="flex gap-3">
                <ShieldCheck className="w-4 h-4 mt-1 text-stone-400 shrink-0" />

                <div className="space-y-8 w-full">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    Warranty
                  </p>

                  {resolvedAfterSales.warranties.map((warranty, i) => (
                    <div key={i} className="space-y-4">

                      {/* Title + Years */}
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="font-medium text-stone-900">
                          {warranty.title}
                        </p>


                      </div>

                      {/* Included */}
                      {warranty.included?.length > 0 && (
                        <div>
                          <ul className="list-disc pl-5 space-y-1 text-stone-600">
                            {warranty.included.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Excluded */}
                      {warranty.excluded?.length > 0 && (
                        <div>

                          <ul className="list-disc pl-5 space-y-1 text-stone-600">
                            {warranty.excluded.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return Policy */}
            {resolvedAfterSales?.returnPolicy && (
              <div className="flex gap-3">
                <RotateCcw className="w-4 h-4 mt-1 text-stone-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    Return Policy
                  </p>
                  <p className="text-stone-600">
                    {resolvedAfterSales.returnPolicy}
                  </p>
                </div>
              </div>
            )}

            {/* Lifetime Support Services */}
            {resolvedAfterSales?.lifetimeSupportServices?.length > 0 && (
              <div className="flex gap-3">
                <ShieldCheck className="w-4 h-4 mt-1 text-stone-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                    Lifetime Support
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-stone-600">
                    {resolvedAfterSales.lifetimeSupportServices.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Support Contact */}
            {resolvedAfterSales?.supportContact && (
              <div className="pt-4 border-t border-stone-100">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                  Support Contact
                </p>
                <div className="space-y-1 text-stone-600">
                  {resolvedAfterSales.supportContact.email && (
                    <p>Email: {resolvedAfterSales.supportContact.email}</p>
                  )}
                  {resolvedAfterSales.supportContact.phone && (
                    <p>Phone: {resolvedAfterSales.supportContact.phone}</p>
                  )}
                </div>
              </div>
            )}

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

    if (resolvedTrust) {
      sections.push({
        id: "social",
        label: "Client Experiences",
        content: (
          <div className="space-y-4">
            {resolvedTrust.map((t, i) => (
              <div key={i} className="italic text-stone-600 text-sm border-l-2 border-amber-200 pl-4 py-1">
                "{t.quote}" <p className="not-italic font-bold text-stone-900 mt-1">— {t.clientName}</p>
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
      <main className="min-h-screen max-w-[1920px] mx-auto flex flex-col lg:flex-row">
        {/* LEFT: IMAGE GALLERY - Premium Mobile Swiping + Fixed Thumbnails */}
        <div className="w-full lg:w-7/12 relative flex flex-col items-center justify-center 
  pt-24 sm:pt-24 lg:pt-0 
  px-0 lg:px-12 xl:px-24
  min-h-[50vh] sm:min-h-[60vh] lg:h-screen lg:sticky lg:top-0 bg-white"
        >
          {/* MOBILE SWIPE GALLERY - One image at a time logic */}
          <div className="lg:hidden w-full px-4 sm:px-10">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-stone-100/50">
              <div
                ref={mobileGalleryRef}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                onScroll={(e) => {
                  const container = e.currentTarget;
                  const slideWidth = container.clientWidth;
                  const index = Math.round(container.scrollLeft / slideWidth);
                  if (index !== currentImageIndex) {
                    setCurrentImageIndex(index);
                  }
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full flex-shrink-0 snap-center"
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover"
                      alt={`${product.title} ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP SINGLE IMAGE */}
          <div className="hidden lg:block relative w-full max-w-[500px] xl:max-w-[650px] 
    aspect-square rounded-2xl sm:rounded-3xl xl:rounded-[40px] overflow-hidden 
    shadow-sm border border-stone-100/50"
          >
            <img
              src={images[currentImageIndex]?.url}
              className="w-full h-full object-cover transition-all duration-700 ease-out animate-in fade-in"
              alt={product.title}
            />
          </div>

          {/* Desktop Thumbnails - Side Pinned */}
          <div className="hidden lg:flex absolute left-6 xl:left-12 top-1/2 -translate-y-1/2 flex-col gap-4 max-h-[70%] overflow-y-auto scrollbar-hide z-10 py-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                ref={el => thumbnailRefs.current[idx] = el}
                onClick={() => handleImageChange(idx)}
                className={`w-14 h-14 xl:w-16 xl:h-16 rounded-xl overflow-hidden border-2 transition-all duration-500 shrink-0 ${currentImageIndex === idx
                  ? "border-stone-900 scale-110 shadow-lg"
                  : "border-transparent opacity-30 hover:opacity-100 hover:scale-105"
                  }`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>

          {/* Mobile/Tablet Thumbnail Strip - Fixed clipping with padding */}
          <div className="lg:hidden w-full flex justify-start gap-4 mt-8 pb-6 overflow-x-auto scrollbar-hide px-6">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentImageIndex(idx);
                  if (mobileGalleryRef.current) {
                    const slideWidth = mobileGalleryRef.current.clientWidth;
                    mobileGalleryRef.current.scrollTo({
                      left: slideWidth * idx,
                      behavior: "smooth"
                    });
                  }
                }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${currentImageIndex === idx
                  ? "border-stone-900 scale-105 shadow-md"
                  : "border-stone-100 opacity-60"
                  }`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt={`thumb ${idx}`} />
              </button>
            ))}
            {/* Transparent spacer to prevent clipping on the right end */}
            <div className="w-6 shrink-0" />
          </div>
        </div>
        {/* RIGHT: SCROLLABLE DETAILS - Responsive spacing and font scaling */}
        <div className="w-full lg:w-5/12 bg-stone-50 px-5 sm:px-10 lg:px-12 xl:px-16 py-10 lg:py-20 xl:py-24 border-l border-stone-200/50">
          <div className="max-w-xl mx-auto space-y-8 sm:space-y-10 lg:space-y-12 pb-20">
            <header className="space-y-4">
              <p className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-stone-400 font-bold">{sanityContent.brandName || "Aroha House"}</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-stone-900 font-bold tracking-tight">
                {sanityContent.title || product.title}
              </h1>
              <p className="text-stone-500 italic text-base sm:text-lg leading-relaxed font-light">{sanityContent.shortIntro}</p>

              <div className="flex flex-wrap items-baseline gap-4 lg:gap-6 pt-2">
                <span className="text-3xl lg:text-4xl font-light tracking-tighter">{getPrice().price}</span>
                {getPrice().original && <span className="text-stone-300 line-through text-lg lg:text-xl font-light">{getPrice().original}</span>}
                <span className={`text-[9px] lg:text-[10px] px-3 lg:px-4 py-1.5 rounded-full border uppercase tracking-widest font-bold ${stockStatus.inStock ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                  {stockStatus.label}
                </span>
              </div>
            </header>

            {/* CUSTOMIZATION DROPDOWN */}
            <div className="space-y-8 lg:space-y-10">
              {resolvedCustomization?.map((attr) => (
                <CustomDropdown
                  key={attr.attributeName}
                  label={attr.attributeName}
                  options={attr.options}
                  value={customizations[attr.attributeName]}
                  onChange={(val) =>
                    setCustomizations((prev) => ({
                      ...prev,
                      [attr.attributeName]: val,
                    }))
                  }
                />
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-stone-400 font-bold">The Narrative</h2>
              <div className="prose prose-stone prose-sm sm:prose-base text-stone-600 font-light leading-relaxed italic border-l-2 border-stone-200 pl-5 sm:pl-6">
                <PortableText value={sanityContent.description} />

                {sanityContent.keyFeatures && (
                  <div className="mt-6 space-y-2 not-italic">
                    <p className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Key Features</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-500 text-sm">
                      {sanityContent.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                {sanityContent.whyThisProduct && (
                  <div className="mt-6 space-y-2 not-italic">
                    <p className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Why Choose This Piece</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-500 italic text-sm">
                      {sanityContent.whyThisProduct.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* ACCORDIONS */}
            <div className="border-t border-stone-200">
              {accordionSections.map(section => (
                <div key={section.id} className="border-b border-stone-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)} className="w-full py-5 sm:py-7 flex justify-between items-center group transition-all">
                    <span className={`text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold ${activeAccordion === section.id ? "text-stone-900" : "text-stone-400 hover:text-stone-600"}`}>{section.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${activeAccordion === section.id ? "rotate-180 text-stone-900" : "text-stone-300"}`} />
                  </button>
                  {activeAccordion === section.id && (
                    <div className="pb-8 sm:pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                      {section.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA BUTTON - Sticky on Mobile */}
            <div className="pt-6 pb-2 bottom-4 lg:relative lg:bottom-0 z-30">
              <button
                onClick={() => {
                  const customizationText = Object.entries(customizations).length > 0
                    ? `\n\nCustomizations:\n${Object.entries(customizations).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`
                    : '';
                  const msg = `Hi! I'm interested in the ${product.title}.${customizationText}`;
                  const rawNumber = resolvedAfterSales?.supportContact?.phone || WHATSAPP_NUMBER;
                  const cleanNumber = rawNumber.replace(/\D/g, '');

                  window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full h-14 sm:h-16 bg-stone-900 text-white rounded-xl sm:rounded-[20px] flex items-center justify-between px-6 sm:px-10 hover:bg-stone-800 transition-all active:scale-[0.98] shadow-2xl group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] font-bold">{sanityContent.cta?.primary || "Enquire Now"}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>

            {/* RELATED PRODUCTS - Responsive Grid */}
            {relatedProducts.length > 0 && (
              <div className="pt-16 sm:pt-20 lg:pt-24 space-y-8 lg:space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold">Curated Pairing</p>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Complementary Pieces</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12">
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