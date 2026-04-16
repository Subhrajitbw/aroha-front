import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight, ChevronLeft, ArrowDown } from "lucide-react";
import NavBar from "../components/NavBar";
import { sanityClient } from "../lib/sanityClient";
import { sdk } from "../lib/medusaClient";
import LoadingOverlay from "../components/LoadingOverlay";
import { ProductInfoCard } from "../components/ProductInfoCard";

gsap.registerPlugin(ScrollTrigger);

const ROOM_KEYWORDS = [
  "bedroom", "living", "studio", "lounge", "dining",
  "kitchen", "office", "bathroom", "entryway", "outdoor",
  "terrace", "balcony", "library", "den", "suite"
];

const getRoomMeta = (label) => {
  const n = label.toLowerCase();
  if (n.includes("living")) return { title: "Living Sanctuary", vibe: "Social · Grand · Harmonic", desc: "Where life unfolds in curated silence. Each object anchors a conversation between light, material, and ritual." };
  if (n.includes("bedroom")) return { title: "Restorative Suite", vibe: "Intimate · Soft · Silent", desc: "A chamber engineered for stillness. Designed to dissolve the weight of the day." };
  if (n.includes("studio")) return { title: "Creative Atelier", vibe: "Focused · Raw · Inspired", desc: "Raw geometry meets precision. A space that sharpens thought and rewards detail." };
  if (n.includes("dining")) return { title: "Culinary Stage", vibe: "Shared · Elegant · Ritualistic", desc: "The table as theatre. Objects that elevate the act of gathering into art." };
  if (n.includes("lounge")) return { title: "Evening Retreat", vibe: "Shadowed · Deep · Velvety", desc: "Designed for the hours after sundown. Deep textures, absolute comfort." };
  if (n.includes("office")) return { title: "Command Centre", vibe: "Decisive · Precise · Calm", desc: "Where focus meets material truth. Architecture-grade objects for the executive mind." };
  return { title: label, vibe: "Curated · Intentional · Pure", desc: "A destination designed with absolute purpose. Every object earns its place." };
};

/* ═══════════════════════════════════════════════════════════
   ROOM POV (Immersive Mode)
   Simulates entering a room (doors open) and panning
   ═══════════════════════════════════════════════════════════ */
const RoomPOV = ({ label, products, meta }) => {
  const povWrapperRef = useRef(null);
  const povStripRef = useRef(null);
  const doorLeftRef = useRef(null);
  const doorRightRef = useRef(null);
  const enterTextRef = useRef(null);
  const hintRef = useRef(null);
  const navigate = useNavigate();

  const [tooltip, setTooltip] = useState(null);

  const handleItemHover = useCallback((e, product) => {
    const rect = povWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const side = x > rect.width / 2 ? "left" : "right";
    setTooltip({ name: product.title, x, y, side, handle: product.handle });
  }, []);

  const handleItemMove = useCallback((e) => {
    setTooltip(prev => {
      if (!prev) return null;
      const rect = povWrapperRef.current?.getBoundingClientRect();
      if (!rect) return prev;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const side = x > rect.width / 2 ? "left" : "right";
      return { ...prev, x, y, side };
    });
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(enterTextRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      )
      .to(enterTextRef.current, { opacity: 0, duration: 0.8, delay: 0.8 })
      .to(doorLeftRef.current, { xPercent: -100, duration: 2, ease: "power4.inOut" }, "-=0.2")
      .to(doorRightRef.current, { xPercent: 100, duration: 2, ease: "power4.inOut" }, "<")
      .fromTo(hintRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.5");

      gsap.to(hintRef.current, { y: 8, repeat: -1, yoyo: true, duration: 1.5, ease: "power1.inOut" });

      if (povStripRef.current && povWrapperRef.current) {
        const stripWidth = povStripRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const distance = stripWidth - viewportWidth;
        
        if (distance > 0) {
          gsap.to(povStripRef.current, {
            x: -distance, ease: "none",
            scrollTrigger: {
              trigger: povWrapperRef.current, start: "top top",
              end: () => `+=${distance}`,
              scrub: 1, pin: true, anticipatePin: 1,
            },
          });

          // Intense internal parallax to simulate true point-of-view 3D panning
          const images = povStripRef.current.querySelectorAll('.pov-parallax-img');
          images.forEach((img) => {
            gsap.fromTo(img, 
              { x: "-15vw" }, 
              { 
                x: "15vw", ease: "none",
                scrollTrigger: {
                  trigger: povWrapperRef.current, start: "top top",
                  end: () => `+=${distance}`, scrub: 1
                }
              }
            );
          });
        }
      }
    });

    document.body.style.overflowX = "hidden";
    return () => {
      ctx.revert();
      document.body.style.overflowX = "auto";
    };
  }, [products]);

  return (
    <div className="bg-[#0e0c09] min-h-screen text-white overflow-hidden relative">
      {/* Top Left Exit */}
      <div className="absolute top-8 left-6 md:left-12 z-[60]">
        <Link to="/rooms" className="group inline-flex items-center gap-3">
          <ChevronLeft size={16} className="text-white/60 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-colors font-medium">Exit Room</span>
        </Link>
      </div>

      {/* DOORS OVERLAY */}
      <div className="fixed inset-0 z-50 pointer-events-none flex overflow-hidden">
        <div ref={doorLeftRef} className="w-1/2 h-full bg-[#0a0a0a] border-r border-white/5" />
        <div ref={doorRightRef} className="w-1/2 h-full bg-[#0a0a0a] border-l border-white/5" />
        <div ref={enterTextRef} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
           <p className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase text-[#c9a96e] mb-4">Entering</p>
           <h1 className="font-serif text-5xl md:text-7xl italic text-white leading-none">{meta.title || label}</h1>
        </div>
      </div>

      {/* POV PANORAMA */}
      <section ref={povWrapperRef} className="relative h-screen w-full overflow-hidden cursor-crosshair bg-[#0e0c09]" onMouseMove={handleItemMove} onMouseLeave={handleLeave}>
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(14,12,9,0.95) 0%, transparent 10%, transparent 90%, rgba(14,12,9,0.95) 100%)" }} />

        <div ref={povStripRef} className="flex items-stretch h-full will-change-transform" style={{ gap: "2px" }}>
          {products.map((product, idx) => (
            <div
              key={product.handle}
              className="relative flex-shrink-0 h-full group/pov cursor-pointer overflow-hidden"
              style={{ width: "100vw", minWidth: "100vw" }}
              onMouseEnter={(e) => handleItemHover(e, product)}
              onMouseLeave={handleLeave}
              onClick={() => navigate(`/products/${product.handle}`)}
            >
              <div className="absolute inset-0 w-[130vw] h-full left-1/2 -translate-x-1/2">
                <img src={product.image} alt={product.title} className="pov-parallax-img w-full h-full object-cover opacity-60 group-hover/pov:opacity-100 transition-all duration-1000 ease-out group-hover/pov:scale-105" />
              </div>
              <div className="absolute inset-0 bg-[#0e0c09]/30 group-hover/pov:bg-transparent transition-colors duration-700 pointer-events-none" />
              <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#0e0c09] to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#0e0c09] to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {tooltip && (
          <div className="absolute z-30 pointer-events-none" style={{
            left: tooltip.side === "right" ? `${tooltip.x + 24}px` : undefined,
            right: tooltip.side === "left" ? `${(povWrapperRef.current?.offsetWidth || 0) - tooltip.x + 24}px` : undefined,
            top: `${tooltip.y - 18}px`,
          }}>
            <div className="bg-white text-[#0e0c09] px-5 py-2.5 shadow-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full flex-shrink-0" />
              <p className="text-[11px] md:text-sm font-medium tracking-wide whitespace-nowrap">{tooltip.name}</p>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 w-0 h-0" style={{
              ...(tooltip.side === "right" ? { left: "-6px", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "6px solid white" } : { right: "-6px", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "6px solid white" }),
            }} />
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-20">
          <div className="w-10 h-10 border border-white/40 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/80 rounded-full" />
        </div>

        <div ref={hintRef} className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-0 pointer-events-none">
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/50 backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full border border-white/10">Look around (Scroll)</span>
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOM GRID (Catalog Mode)
   Uses standard ProductInfoCard for sensible browsing
   ═══════════════════════════════════════════════════════════ */
const RoomGrid = ({ label, products, meta }) => {
  const PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);
  const hasMore = visibleCount < products.length;

  return (
    <div className="min-h-screen bg-[#efe8e0] pt-32 md:pt-40 pb-32">
      <div className="px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link to="/rooms" className="group inline-flex items-center gap-2">
                <ChevronLeft size={14} className="text-stone-500 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-stone-500 group-hover:text-stone-900 transition-colors font-medium">Exit</span>
              </Link>
              <div className="h-3 w-[1px] bg-stone-300" />
              <p className="text-[9px] tracking-[0.5em] uppercase text-stone-500 font-semibold">{meta.vibe}</p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl text-[#1a1a1a] tracking-tight leading-none">{label}</h1>
          </div>
          <p className="text-sm md:text-base text-stone-600 max-w-sm leading-relaxed">{meta.desc}</p>
        </div>

        {/* Product Grid using ProductInfoCard — Editorial Asymmetrical Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 lg:gap-x-16 gap-y-24 md:gap-y-32 mt-16 md:mt-24 pb-12">
          {products.slice(0, visibleCount).map((product, idx) => {
            // Asymmetrical staggering based on column
            const isMiddle = (idx % 3 === 1);
            const isRight = (idx % 3 === 2);

            return (
              <div 
                key={product.handle} 
                className={`relative room-grid-item flex flex-col items-center ${isMiddle ? 'xl:mt-32' : ''} ${isRight ? 'xl:mt-16' : ''}`}
              >
                {/* Massive Editorial Watermark Index */}
                <div className="absolute -top-16 -left-6 md:-top-24 md:-left-16 text-[10rem] md:text-[18rem] font-serif italic text-stone-300/30 select-none pointer-events-none z-0 leading-none tracking-tighter">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                
                {/* Delicate architectural accent line */}
                <div className="w-[1px] h-16 bg-gradient-to-b from-stone-400/0 to-stone-400/50 mb-8 mx-auto hidden xl:block z-10" />
                
                <div className="relative z-10 w-full flex justify-center pb-2">
                  <ProductInfoCard product={product} />
                </div>
                
                {/* Artifact notation */}
                <div className="relative z-10 mt-6 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                   <div className="w-1 h-1 bg-[#8b7355] rounded-full" />
                   <p className="text-[9px] uppercase tracking-[0.4em] text-stone-500 font-semibold">
                     Artifact {String(idx + 1).padStart(2, "0")}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Details */}
        {hasMore && (
          <div className="flex justify-center mt-16 md:mt-24">
            <button onClick={() => setVisibleCount(v => Math.min(v + PER_PAGE, products.length))}
              className="group flex flex-col items-center gap-3 py-6 px-12 border border-stone-300 hover:border-stone-900 hover:bg-stone-900 hover:text-white text-stone-700 transition-all duration-500">
              <span className="text-[11px] tracking-[0.4em] uppercase font-medium">Discover More</span>
              <ArrowDown size={16} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
        {!hasMore && products.length > PER_PAGE && (
          <div className="text-center mt-20">
            <div className="h-[1px] w-24 bg-stone-300 mx-auto mb-8" />
            <p className="text-[10px] tracking-[0.5em] uppercase text-stone-400 font-medium">End of Collection — {products.length} Objects</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Main Wrapper -> toggles between POV and GRID
   ═══════════════════════════════════════════════════════════ */
const RoomExperience = ({ label, products }) => {
  const [viewMode, setViewMode] = useState("immersive");
  const meta = useMemo(() => getRoomMeta(label), [label]);

  return (
    <>
      <div className="fixed bottom-8 max-md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex bg-black/60 backdrop-blur-xl rounded-full p-1.5 border border-white/20 shadow-2xl">
        <button onClick={() => setViewMode('immersive')} className={`px-6 py-2 rounded-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'immersive' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}>POV</button>
        <button onClick={() => setViewMode('grid')} className={`px-6 py-2 rounded-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'grid' ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}>Grid</button>
      </div>

      <NavBar variant={viewMode === "immersive" ? "dark" : "light"} />

      {viewMode === "immersive" ? (
        <RoomPOV label={label} products={products} meta={meta} />
      ) : (
        <RoomGrid label={label} products={products} meta={meta} />
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOM DIRECTORY — /rooms  (full-width stacked immersive cards)
   ═══════════════════════════════════════════════════════════ */
const RoomDirectory = ({ rooms }) => {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = headerRef.current?.querySelectorAll(".dir-reveal");
      if (els?.length) {
        gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power3.out", delay: 0.15 });
      }
      cardsRef.current.forEach((card) => {
        if (!card) return;
        const img = card.querySelector(".card-bg-img");
        const text = card.querySelectorAll(".card-text");
        gsap.fromTo(card, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" }
        });
        if (img) {
          gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
        }
        if (text?.length) {
          gsap.fromTo(text, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 70%" } });
        }
      });
    });
    return () => ctx.revert();
  }, [rooms]);

  const usedImages = useRef(new Set());
  usedImages.current.clear();

  return (
    <div className="min-h-screen bg-[#efe8e0]">
      <div ref={headerRef} className="pt-32 md:pt-40 lg:pt-48 pb-10 md:pb-16 px-6 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-16">
          <div>
            <p className="dir-reveal text-[10px] md:text-[11px] tracking-[0.5em] uppercase text-stone-500 font-semibold mb-4">Virtual Residency</p>
            <h1 className="dir-reveal font-serif text-5xl md:text-7xl lg:text-8xl text-[#1a1a1a] tracking-tight leading-[0.85]">
              Select a <br className="hidden md:block" /><span className="italic text-[#8b7355]">Destination</span>
            </h1>
          </div>
          <p className="dir-reveal text-sm md:text-base text-stone-600 leading-relaxed max-w-md lg:pb-3">
            Each room is a thesis in restraint. Browse curated environments and discover objects that speak to the architecture of your life.
          </p>
        </div>
        <div className="dir-reveal h-[1px] bg-stone-300 mt-10 md:mt-14" />
      </div>

      <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-8 lg:px-12 pb-24 md:pb-32 max-w-[1600px] mx-auto">
        {rooms.map((room, idx) => {
          const meta = getRoomMeta(room.label);
          const heroProduct = room.products.find((p) => p.image && !usedImages.current.has(p.image)) || room.products[0];
          if (heroProduct?.image) usedImages.current.add(heroProduct.image);
          const previews = room.products.filter((p) => p.image && p.image !== heroProduct?.image).slice(0, 3);
          const isEven = idx % 2 === 0;

          return (
            <Link key={room.label} ref={(el) => (cardsRef.current[idx] = el)}
              to={`/rooms/${room.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group relative block overflow-hidden" style={{ opacity: 0 }}>
              <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} min-h-[400px] md:min-h-[520px] lg:min-h-[600px]`}>
                <div className="relative w-full md:w-[60%] h-[300px] md:h-auto overflow-hidden">
                  {heroProduct?.image ? (
                    <img src={heroProduct.image} alt={room.label}
                      className="card-bg-img absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]" />
                  ) : (<div className="absolute inset-0 bg-stone-300" />)}
                  <div className={`absolute inset-0 ${isEven
                    ? "bg-gradient-to-r from-transparent via-transparent to-[#efe8e0]/60 hidden md:block"
                    : "bg-gradient-to-l from-transparent via-transparent to-[#efe8e0]/60 hidden md:block"}`} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#efe8e0] md:hidden" />
                  <div className={`absolute top-6 ${isEven ? "left-6" : "right-6"} z-10`}>
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[10px] tracking-[0.3em] uppercase text-stone-800 font-semibold shadow-sm">0{idx + 1}</span>
                  </div>
                </div>
                <div className="w-full md:w-[40%] flex flex-col justify-center px-6 md:px-10 lg:px-16 py-8 md:py-12 bg-[#efe8e0]">
                  <p className="card-text text-[10px] tracking-[0.5em] uppercase text-[#8b7355] font-semibold mb-4">{meta.vibe}</p>
                  <h2 className="card-text font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#1a1a1a] leading-[0.88] tracking-tight mb-5 md:mb-8">{room.label}</h2>
                  <p className="card-text text-sm md:text-base text-stone-600 leading-relaxed mb-8 md:mb-10 max-w-sm">{meta.desc}</p>
                  {previews.length > 0 && (
                    <div className="card-text flex gap-2 md:gap-3 mb-8 md:mb-10">
                      {previews.map((p, pIdx) => (
                        <div key={pIdx} className="w-14 h-14 md:w-[72px] md:h-[72px] lg:w-20 lg:h-20 overflow-hidden bg-stone-200 border border-stone-300/50 transition-transform duration-500 group-hover:scale-[1.05]">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-14 h-14 md:w-[72px] md:h-[72px] lg:w-20 lg:h-20 flex items-center justify-center bg-stone-200/60 border border-stone-300/50 text-stone-500">
                        <span className="text-[10px] tracking-widest uppercase font-medium">+{room.products.length - previews.length}</span>
                      </div>
                    </div>
                  )}
                  <div className="card-text flex items-center gap-4">
                    <span className="text-[11px] tracking-[0.3em] uppercase text-stone-800 font-medium group-hover:text-[#8b7355] transition-colors duration-500">Enter Room</span>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-stone-300 flex items-center justify-center group-hover:bg-stone-900 group-hover:border-stone-900 transition-all duration-500">
                      <ArrowRight size={16} className="text-stone-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN — Sanity → Medusa data bridge
   ═══════════════════════════════════════════════════════════ */
const Rooms = () => {
  const { roomLabel } = useParams();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const sanityProducts = await sanityClient.fetch(
          `*[_type == "product" && defined(perfectFor)]{ handle, perfectFor }`
        );
        if (!sanityProducts?.length) { setLoading(false); return; }

        const roomHandleMap = {};
        sanityProducts.forEach((item) => {
          const tags = Array.isArray(item.perfectFor) ? item.perfectFor : [item.perfectFor];
          tags.forEach((tag) => {
            const lower = tag.toLowerCase().trim();
            const kw = ROOM_KEYWORDS.find((k) => lower.includes(k));
            if (kw) {
              const displayLabel = lower.split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
              if (!roomHandleMap[displayLabel]) roomHandleMap[displayLabel] = new Set();
              roomHandleMap[displayLabel].add(item.handle);
            }
          });
        });

        const allHandles = [...new Set(sanityProducts.map((p) => p.handle))];
        let regionId;
        try { const { regions } = await sdk.store.region.list({ limit: 1 }); regionId = regions?.[0]?.id; } catch (e) {}

        const medusaProducts = [];
        for (let i = 0; i < allHandles.length; i += 20) {
          try {
            const { products: bp } = await sdk.store.product.list({
              handle: allHandles.slice(i, i + 20), fields: "id,title,handle,thumbnail,images,*variants,*variants.calculated_price", limit: 20,
              ...(regionId ? { region_id: regionId } : {}),
            });
            if (bp) medusaProducts.push(...bp);
          } catch (e) {}
        }

        const medusaMap = {};
        medusaProducts.forEach((p) => {
          let price = null;
          const v = p.variants?.[0];
          if (v?.calculated_price?.calculated_amount) {
            price = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v.calculated_price.calculated_amount);
          }
          medusaMap[p.handle] = { id: p.id, title: p.title, handle: p.handle, image: p.thumbnail || p.images?.[0]?.url || "", price: price || "" };
        });

        const roomArray = Object.entries(roomHandleMap)
          .map(([label, handleSet]) => ({
            label,
            products: [...handleSet].map((h) => medusaMap[h]).filter(Boolean).filter((p) => p.image),
          }))
          .filter((r) => r.products.length > 0)
          .sort((a, b) => b.products.length - a.products.length);

        setRooms(roomArray);
      } catch (err) { console.error("Failed to fetch rooms:", err); }
      finally { setLoading(false); }
    };
    fetchRooms();
  }, []);

  if (loading) return roomLabel ? <div className="min-h-screen bg-[#0e0c09] w-full" /> : <LoadingOverlay />;

  const currentRoom = roomLabel
    ? rooms.find((r) => r.label.toLowerCase().replace(/\s+/g, "-") === roomLabel)
    : null;

  return (
    <div className={`min-h-screen ${currentRoom ? "bg-[#0e0c09]" : "bg-[#efe8e0]"}`}>
      {!currentRoom && <NavBar variant="light" />}
      {currentRoom ? (
        <RoomExperience label={currentRoom.label} products={currentRoom.products} />
      ) : (
        <RoomDirectory rooms={rooms} />
      )}
    </div>
  );
};

export default Rooms;
