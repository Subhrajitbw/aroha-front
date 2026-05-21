'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronLeft, ArrowDown } from "lucide-react";
import { ProductInfoCard } from "../shop/ProductInfoCard";
import Breadcrumbs from "../ui/Breadcrumbs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const getRoomMeta = (label) => {
  const n = label.toLowerCase();
  if (n.includes("living")) return { title: "Living Sanctuary", vibe: "Social · Grand · Harmonic", desc: "Where life unfolds in curated silence." };
  if (n.includes("bedroom")) return { title: "Restorative Suite", vibe: "Intimate · Soft · Silent", desc: "A chamber engineered for stillness." };
  // ... other meta logic from original component
  return { title: label, vibe: "Curated · Intentional · Pure", desc: "A destination designed with absolute purpose." };
};

const RoomPOV = ({ label, products, meta }) => {
  const povWrapperRef = useRef(null);
  const povStripRef = useRef(null);
  const doorLeftRef = useRef(null);
  const doorRightRef = useRef(null);
  const enterTextRef = useRef(null);
  const hintRef = useRef(null);
  const router = useRouter();
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(enterTextRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" })
        .to(enterTextRef.current, { opacity: 0, duration: 0.8, delay: 0.8 })
        .to(doorLeftRef.current, { xPercent: -100, duration: 2, ease: "power4.inOut" })
        .to(doorRightRef.current, { xPercent: 100, duration: 2, ease: "power4.inOut" }, "<")
        .fromTo(hintRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, "-=0.5");

      if (povStripRef.current && povWrapperRef.current) {
        const distance = povStripRef.current.scrollWidth - window.innerWidth;
        if (distance > 0) {
          gsap.to(povStripRef.current, {
            x: -distance, ease: "none",
            scrollTrigger: {
              trigger: povWrapperRef.current, start: "top top", end: () => `+=${distance}`, scrub: 1, pin: true
            },
          });
        }
      }
    });
    return () => ctx.revert();
  }, [products]);

  return (
    <div className="bg-[#0e0c09] min-h-screen text-white overflow-hidden relative">
      <div className="fixed inset-0 z-50 pointer-events-none flex">
        <div ref={doorLeftRef} className="w-1/2 h-full bg-[#0a0a0a]" />
        <div ref={doorRightRef} className="w-1/2 h-full bg-[#0a0a0a]" />
        <div ref={enterTextRef} className="absolute inset-0 flex flex-col items-center justify-center">
           <h1 className="font-serif text-5xl italic text-white">{meta.title || label}</h1>
        </div>
      </div>
      <section ref={povWrapperRef} className="relative h-screen w-full overflow-hidden cursor-crosshair">
        <div ref={povStripRef} className="flex h-full">
          {products.map((product) => (
            <div key={product.handle} className="w-screen h-full flex-shrink-0 relative group" onClick={() => router.push(`/product/${product.handle}`)}>
              <img src={product.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt={product.title} />
            </div>
          ))}
        </div>
        <div ref={hintRef} className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-[10px] tracking-widest uppercase">Look around (Scroll)</div>
      </section>
    </div>
  );
};

const RoomGrid = ({ label, products, meta }) => {
  return (
    <div className="min-h-screen bg-[#efe8e0] pt-16 pb-32">
      <div className="px-12 max-w-[1600px] mx-auto">
        <h1 className="font-serif text-6xl mb-8">{label}</h1>
        <Breadcrumbs className="mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
          {products.map((p) => <ProductInfoCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

const RoomsClient = ({ rooms, initialRoomLabel }) => {
  const params = useParams();
  const roomLabel = initialRoomLabel || params.roomLabel;
  const [viewMode, setViewMode] = useState("immersive");
  
  const currentRoom = useMemo(() => 
    roomLabel ? rooms.find(r => r.label.toLowerCase().replace(/\s+/g, "-") === roomLabel) : null
  , [rooms, roomLabel]);

  const meta = useMemo(() => currentRoom ? getRoomMeta(currentRoom.label) : null, [currentRoom]);

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#efe8e0] pt-16 px-12">
        <div className="max-w-4xl mb-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-stone-500 font-bold mb-4">Curated Environments</p>
          <h1 className="font-serif text-6xl md:text-8xl mb-6 text-stone-900">Destinations</h1>
          <p className="text-xl md:text-2xl text-stone-600 font-light italic leading-relaxed">
            Shop our collections visualized within curated spaces. Select a destination to explore how our pieces harmonize to create the architecture of your life.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <Link key={room.label} href={`/rooms/${room.label.toLowerCase().replace(/\s+/g, '-')}`} className="group relative block h-[400px] overflow-hidden rounded-2xl">
              <img src={room.products[0]?.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={room.label} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-[10px] tracking-[0.4em] uppercase mb-2">Explore</p>
                <h2 className="text-4xl font-serif">{room.label}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex bg-black/60 backdrop-blur-xl rounded-full p-1.5 border border-white/20">
        <button onClick={() => setViewMode('immersive')} className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${viewMode === 'immersive' ? 'bg-white text-black font-semibold' : 'text-white/60'}`}>POV</button>
        <button onClick={() => setViewMode('grid')} className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em] transition-all ${viewMode === 'grid' ? 'bg-white text-black font-semibold' : 'text-white/60'}`}>Grid</button>
      </div>
      {viewMode === "immersive" ? <RoomPOV label={currentRoom.label} products={currentRoom.products} meta={meta} /> : <RoomGrid label={currentRoom.label} products={currentRoom.products} meta={meta} />}
    </>
  );
};

export default RoomsClient;
