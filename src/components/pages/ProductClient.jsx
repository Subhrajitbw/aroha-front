'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronLeft, ChevronRight, Check, MessageCircle, ChevronDown, Ruler, ShieldCheck, Truck, RotateCcw, Star, Share2 } from "lucide-react";
import { PortableText } from '@portabletext/react';
import { ProductInfoCard } from "../shop/ProductInfoCard";
import CustomDropdown from "../ui/CustomDropdown";
import Breadcrumbs from "../ui/Breadcrumbs";
import { FauxARViewer } from "../ui/FauxARViewer";
import { motion } from 'framer-motion'
import { AnimatePresence } from "framer-motion";
const ProductClient = ({ initialData }) => {
  const router = useRouter();
  const desktopThumbnailRefs = useRef([]);
  const mobileThumbnailRefs = useRef([]);
  const mobileGalleryRef = useRef(null);

  const { sanityContent, medusaProduct, resolvedCustomization, resolvedAfterSales, resolvedTrust } = initialData;

  const [product] = useState(medusaProduct);
  const [selectedVariant, setSelectedVariant] = useState(medusaProduct.variants?.[0] || null);
  const [optionsState, setOptionsState] = useState(() => {
    const initialOptions = {};
    medusaProduct.variants?.[0]?.options?.forEach((opt) => {
      initialOptions[opt.option_id] = opt.value;
    });
    return initialOptions;
  });
  const [customizations, setCustomizations] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState("specs");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const cleanPortableText = (blocks) => {
    if (!Array.isArray(blocks)) return blocks;
    return blocks.map(block => {
      if (block._type === 'block' && block.children) {
        return {
          ...block,
          children: block.children.map(child => ({
            ...child,
            text: child.text?.replace(/\[cite:\s*\d+\]/g, '') || child.text
          }))
        };
      }
      return block;
    });
  };

  const WHATSAPP_NUMBER = "919830483628";

  const activeVariant = selectedVariant || product?.variants?.[0];

  const formatPrice = (amount, currencyCode) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: (currencyCode || "INR").toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getPrice = () => {
    if (!activeVariant?.calculated_price) return { price: "—" };
    const calc = activeVariant.calculated_price;
    if (!calc.calculated_amount || Number(calc.calculated_amount) === 0) return { price: "—" };
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
    if (desktopThumbnailRefs.current[index]) {
      desktopThumbnailRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (mobileThumbnailRefs.current[index]) {
      mobileThumbnailRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
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
              <>
                <span className="text-sm font-medium text-stone-500 break-words">Dimensions</span>
                <div className="flex items-center gap-4 p-3 bg-stone-100/50 rounded-xl border border-stone-200/50">
                  <Ruler className="w-4 h-4 text-stone-400" />
                  <p className="text-sm tracking-tight">{sanityContent.dimensions.width}W x {sanityContent.dimensions.height}H x {sanityContent.dimensions.depth}D {sanityContent.dimensions.unit}</p>
                </div>
              </>
            )}
            <div className="divide-y divide-stone-100 pb-4">
              {sanityContent.additionalSpecs?.map((spec, i) => (
                <div key={i} className="py-3 grid grid-cols-1 md:grid-cols-2 md:gap-6">
                  <span className="text-sm font-medium text-stone-500 break-words">{spec.label}</span>
                  <span className="text-xs text-stone-600 font-light md:text-right break-words">{spec.value}</span>
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
          <div className="space-y-8">
            {resolvedAfterSales?.deliveryOptions && (
              <div className="group/item bg-stone-50/50 border border-stone-100 rounded-3xl p-6 transition-all hover:bg-stone-50 hover:border-stone-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
                    <Truck className="w-5 h-5 text-stone-900" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-400">Concierge Delivery</h4>
                    <p className="text-xs text-stone-500 font-medium">Safe & Professional Handling</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {resolvedAfterSales.deliveryOptions.map((option, i) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="block text-sm font-semibold text-stone-900">{option.type}</span>
                        {option.description && <span className="block text-xs text-stone-500 mt-1 leading-relaxed">{option.description}</span>}
                      </div>
                      {option.timeline && (
                        <span className="shrink-0 text-[10px] uppercase tracking-widest font-bold bg-stone-900 text-white px-3 py-1.5 rounded-full">
                          {option.timeline}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resolvedAfterSales?.warranties && (
              <div className="group/item bg-stone-50/50 border border-stone-100 rounded-3xl p-6 transition-all hover:bg-stone-50 hover:border-stone-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
                    <ShieldCheck className="w-5 h-5 text-stone-900" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-400">Aroha Warranty</h4>
                    <p className="text-xs text-stone-500 font-medium">Quality Guaranteed Protection</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {resolvedAfterSales.warranties.map((warranty, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-stone-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-stone-900 uppercase tracking-tight">{warranty.title}</span>
                        {warranty.duration && <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">{warranty.duration}</span>}
                      </div>
                      {warranty.description && (
                        <div className="text-xs text-stone-600 leading-loose">
                          {warranty.description.split(/\b(Excludes|Includes|Important|Warning|Void)\b/i).map((part, idx) => {
                            if (/^(Excludes|Includes|Important|Warning|Void)$/i.test(part)) {
                              return (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 mr-1.5">
                                  {part}
                                </span>
                              );
                            }
                            return <span key={idx}>{part}</span>;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      });
    }
    return sections;
  }, [sanityContent, resolvedAfterSales]);

  const images = sanityContent?.galleryR2?.length > 0 ? sanityContent.galleryR2 : (product.images?.length > 0 ? product.images : [{ url: product.thumbnail }]);

  return (
    <div className="relative text-stone-900 font-sans pt-2 lg:pt-[var(--nav-height,80px)]">
      <main className="max-w-[1920px] mx-auto lg:grid lg:grid-cols-12 relative">
        {/* LEFT: IMAGE GALLERY — Acts as a track for the inner sticky element */}
        <div className="w-full lg:col-span-7 h-full">
          <div className="lg:sticky lg:top-[var(--nav-height,64px)] lg:h-[calc(100vh-var(--nav-height,64px))] flex flex-col items-center justify-center pt-4 sm:pt-6 lg:pt-0 px-0 lg:px-12 xl:px-24 bg-white z-10">
            <div className="relative w-full max-w-[650px] aspect-square sm:rounded-[40px] overflow-hidden lg:shadow-sm lg:border border-stone-100/50 bg-stone-50 touch-pan-y">
              {images[currentImageIndex]?.url ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                      const swipe = offset.x;
                      if (swipe < -50 && currentImageIndex < images.length - 1) {
                        handleImageChange(currentImageIndex + 1);
                      } else if (swipe > 50 && currentImageIndex > 0) {
                        handleImageChange(currentImageIndex - 1);
                      }
                    }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {/* Skeleton for main image */}
                    <div className="absolute inset-0 bg-stone-100 animate-pulse" />
                    <img
                      src={images[currentImageIndex]?.url || null}
                      decoding="async"
                      className="relative w-full h-full object-cover z-10 pointer-events-none"
                      alt={product.title}
                    />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-sm italic">Selection visualization unavailable</div>
              )}

              {/* AR Viewer */}
              {images[currentImageIndex]?.url && (
                <FauxARViewer 
                  imageUrl={images[currentImageIndex].url}
                  dimensions={sanityContent?.dimensions}
                  title={sanityContent?.title || product?.title}
                />
              )}
            </div>

            {/* Mobile Thumbnails */}
            {images.length > 1 && (
              <div className="flex lg:hidden overflow-x-auto gap-3 py-4 mt-4 w-full max-w-[650px] scrollbar-hide scroll-smooth px-4 sm:px-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    ref={(el) => (mobileThumbnailRefs.current[idx] = el)}
                    onClick={() => handleImageChange(idx)}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx ? "border-stone-900 shadow-md scale-105" : "border-transparent bg-stone-50 opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.url || null} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
                {/* Spacer to prevent last item cutoff */}
                <div className="w-4 shrink-0 sm:hidden"></div>
              </div>
            )}

            {/* Desktop Vertical Thumbnails */}
            {images.length > 1 && (
              <div className="hidden lg:flex absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 flex-col gap-4 max-h-[70%] overflow-y-auto scrollbar-hide scroll-smooth z-10 py-8 px-2 -ml-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    ref={(el) => (desktopThumbnailRefs.current[idx] = el)}
                    onClick={() => handleImageChange(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx ? "border-stone-900 scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"}`}
                  >
                    <img src={img.url || null} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
                {/* Spacer to prevent last item cutoff vertically */}
                <div className="h-4 shrink-0"></div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DETAILS — Drives the height of the page */}
        <div className="w-full lg:col-span-5 bg-stone-50 px-5 sm:px-10 lg:px-12 xl:px-16 py-10 lg:py-20 xl:py-24 border-t lg:border-t-0 lg:border-l border-stone-200/50">
          <div className="max-w-xl mx-auto space-y-8 pb-20">
            <Breadcrumbs className="mb-0" />
            <header className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold">{sanityContent.brandName || "Aroha House"}</p>
              <div className="flex justify-between items-start gap-4">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-stone-900 font-bold tracking-tight">{sanityContent.title || product.title}</h1>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-3 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors shrink-0 mt-2"
                >
                  <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-stone-900 text-stone-900' : 'text-stone-400'}`} />
                </button>
              </div>
              <p className="text-stone-500 italic text-lg leading-relaxed font-light">
                {(sanityContent.shortIntro || "").replace(/\[cite:\s*\d+\]/g, '')}
              </p>

            </header>

            {/* CUSTOMIZATION */}
            <div className="space-y-8">
              {resolvedCustomization?.map((attr) => (
                <CustomDropdown
                  key={attr.attributeName}
                  label={attr.attributeName}
                  options={attr.options}
                  value={customizations[attr.attributeName]}
                  onChange={(val) => setCustomizations((prev) => ({ ...prev, [attr.attributeName]: val }))}
                />
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">The Narrative</h2>
              <div className="prose prose-stone prose-sm sm:prose-base text-stone-600 font-light leading-relaxed italic border-l-2 border-stone-200 pl-6">
                <PortableText value={cleanPortableText(sanityContent.description)} />
              </div>
            </section>

            {/* ACCORDIONS */}
            <div className="border-t border-stone-200">
              {accordionSections.map(section => (
                <div key={section.id} className="border-b border-stone-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === section.id ? null : section.id)} className="w-full py-6 flex justify-between items-center group">
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${activeAccordion === section.id ? "text-stone-900" : "text-stone-400"}`}>{section.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${activeAccordion === section.id ? "rotate-180 text-stone-900" : "text-stone-300"}`} />
                  </button>
                  {activeAccordion === section.id && <div className="pb-8 animate-in fade-in slide-in-from-top-4 duration-500">{section.content}</div>}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-6">
              <button
                onClick={() => {
                  const customizationText = Object.entries(customizations).length > 0
                    ? `\n\nCustomizations:\n${Object.entries(customizations).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`
                    : '';
                  const msg = `Hi! I'm interested in the ${product.title}.${customizationText}`;
                  const cleanNumber = (resolvedAfterSales?.supportContact?.phone || WHATSAPP_NUMBER).replace(/\D/g, '');
                  window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full h-16 bg-stone-900 text-white rounded-[20px] flex items-center justify-between px-10 hover:bg-stone-800 transition-all shadow-2xl group"
              >
                <div className="flex items-center gap-4">
                  <MessageCircle className="w-5 h-5 group-hover:animate-pulse" />
                  <span className="uppercase tracking-[0.3em] text-[10px] font-bold">{sanityContent.cta?.primary || "Enquire Now"}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>

            {/* RELATED PRODUCTS */}
            {sanityContent.relatedProducts?.length > 0 && (
              <div className="pt-24 space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-stone-400 font-bold">Curated Pairing</p>
                  <h2 className="font-serif text-3xl font-bold tracking-tight">Complementary Pieces</h2>
                </div>
                <div className="grid grid-cols-1 gap-12">
                  {sanityContent.relatedProducts.map(item => (
                    <ProductInfoCard key={item.handle} product={{ ...item, image: item.thumbnailUrl, price: "Enquire" }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ProductClient;