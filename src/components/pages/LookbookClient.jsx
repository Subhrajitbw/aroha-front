'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LookbookClient = ({ initialProducts }) => {
  const router = useRouter();
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null);
  const gridRef = useRef(null);
  const observerTarget = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.15 });
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile || !cursorTextRef.current || !cursorRef.current) return;
    gsap.to(cursorTextRef.current, { opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 0.8, duration: 0.3 });
    gsap.to(cursorRef.current, { scale: isHovering ? 1 : 0.5, duration: 0.3 });
  }, [isHovering, isMobile]);

  const loadMore = useCallback(() => {
    if (initialProducts.length === 0) return;
    const shuffled = [...initialProducts].sort(() => Math.random() - 0.5);
    setDisplayedProducts((prev) => [...prev, ...shuffled]);
  }, [initialProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.1, rootMargin: "600px" });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen w-full bg-[#fafafa] text-stone-900 pb-32">
      <style dangerouslySetInnerHTML={{ __html: `
        body { cursor: ${isMobile ? 'auto' : 'none'}; }
        .custom-cursor { position: fixed; top: 0; left: 0; width: 10px; height: 10px; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); }
        .cursor-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1c1917; color: #fff; padding: 12px 24px; border-radius: 100px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; white-space: nowrap; opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      `}} />
      {!isMobile && <div className="custom-cursor" ref={cursorRef}><div className="w-2 h-2 bg-stone-900 rounded-full" /><div className="cursor-label" ref={cursorTextRef}>Discover</div></div>}
      
      <header className="pt-48 pb-24 px-12 flex flex-col items-center text-center">
        <h1 className="font-serif text-9xl leading-[0.9]">The Editorials</h1>
        <p className="mt-10 max-w-2xl text-stone-700 leading-relaxed">A curated sequence of atmospheres. Explore the intersection of modern minimalism and structural elegance.</p>
      </header>

      <main className="px-16 mx-auto max-w-[2000px]">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-12 space-y-12">
          {displayedProducts.map((product, idx) => (
            <ParallaxImageItem key={`${product._id}-${idx}`} product={product} index={idx} onClick={() => router.push(`/product/${product.handle}`)} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} />
          ))}
        </div>
        <div ref={observerTarget} className="h-20 flex justify-center items-center opacity-50 uppercase text-[10px] tracking-widest">Endless Discovery...</div>
      </main>
    </div>
  );
};

const ParallaxImageItem = ({ product, index, onClick, onMouseEnter, onMouseLeave }) => {
  const itemRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: itemRef, offset: ["start end", "end start"] });
  const yTransform = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? 50 : 100, index % 2 === 0 ? -50 : -100]);
  const aspectClass = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-[4/5]", "aspect-square", "aspect-[3/5]"][index % 6];

  return (
    <div ref={itemRef} className="break-inside-avoid relative overflow-hidden group cursor-none mb-12" onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className={`w-full relative overflow-hidden bg-stone-100 ${aspectClass}`}>
        <motion.img style={{ y: yTransform }} src={product.image} alt={product.name} className="absolute top-[-15%] left-0 w-full h-[130%] object-cover transition-all duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />
      </div>
      <div className="absolute inset-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center pointer-events-none text-white text-center">
        <h3 className="text-3xl font-serif">{product.name}</h3>
        <p className="tracking-widest mt-3 uppercase text-xs">{product.price}</p>
      </div>
    </div>
  );
};

export default LookbookClient;
