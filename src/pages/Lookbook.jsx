import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sdk } from "../lib/medusaClient";

gsap.registerPlugin(ScrollTrigger);

const Lookbook = () => {
  const [loading, setLoading] = useState(true);
  const [baseProducts, setBaseProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorRef = useRef(null);
  const cursorTextRef = useRef(null);
  const gridRef = useRef(null);
  const observerTarget = useRef(null);
  const navigate = useNavigate();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024 || "ontouchstart" in window);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch Products
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const { products } = await sdk.store.product.list({
          limit: 50,
          fields: "id,title,handle,thumbnail,variants.prices"
        });
        
        const mappedProducts = products.map((p) => {
          let priceStr = "";
          if (p.variants?.[0]?.prices?.length > 0) {
            const priceVal = p.variants[0].prices[0].amount;
            priceStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(priceVal);
          }
          return {
            _id: p.id,
            name: p.title,
            image: p.thumbnail || "https://placehold.co/600x800",
            handle: p.handle,
            price: priceStr || "Price Available on Request"
          };
        }).filter(p => p.image);

        if (isMounted && mappedProducts.length > 0) {
          setBaseProducts(mappedProducts);
          setDisplayedProducts(mappedProducts);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Custom Cursor Logic
  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  // Cursor Hover Animation
  useEffect(() => {
    if (isMobile || !cursorTextRef.current || !cursorRef.current) return;
    gsap.to(cursorTextRef.current, {
      opacity: isHovering ? 1 : 0,
      scale: isHovering ? 1 : 0.8,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(cursorRef.current, {
      scale: isHovering ? 1 : 0.5,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isHovering, isMobile]);

  // Entry Animations
  useEffect(() => {
    if (loading) return;
    
    // Animate Header
    gsap.fromTo(
      ".lookbook-header",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    // Animate Grid Items incrementally
    const items = gsap.utils.toArray(".lookbook-image-wrapper");
    items.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, [loading, displayedProducts]);

  // Infinite Scroll Observer
  const loadMore = useCallback(() => {
    if (baseProducts.length === 0) return;
    // Deeply shuffle the base products so repeating scrolls look organic and never sequentially identical
    const shuffled = [...baseProducts].sort(() => Math.random() - 0.5);
    setDisplayedProducts((prev) => [...prev, ...shuffled]);
  }, [baseProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "600px" } // Triggers slightly before they hit the bottom
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [loadMore, loading]);

  // Handle Navigation
  const handleProductClick = (handle) => {
    if (handle) navigate(`/products/${handle}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-stone-900 animate-pulse origin-bottom" />
          <span className="text-xs uppercase tracking-[0.2em] font-light text-stone-500">Curating</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] text-stone-900 selection:bg-stone-900 selection:text-white pb-32">
      <style dangerouslySetInnerHTML={{
        __html: `
          body { cursor: ${isMobile ? 'auto' : 'none'}; }
          .custom-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 10px;
            height: 10px;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
          }
          .cursor-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #1c1917;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 100px;
            font-size: 11px;
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            white-space: nowrap;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />

      {/* Custom Cursor */}
      {!isMobile && (
        <div className="custom-cursor" ref={cursorRef}>
          <div className="w-2 h-2 bg-stone-900 rounded-full mix-blend-difference" />
          <div className="cursor-label" ref={cursorTextRef}>Discover</div>
        </div>
      )}

      {/* Header Section */}
      <header className="lookbook-header pt-48 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-stone-900 mb-6 font-medium">
          Volume I
        </span>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight text-stone-900 leading-[0.9]">
          The Editorials
        </h1>
        <p className="mt-10 max-w-2xl mx-auto text-sm md:text-base text-stone-700 font-normal leading-relaxed">
          A curated sequence of atmospheres. Explore the intersection of modern minimalism, structural elegance, and unapologetic comfort.
        </p>
      </header>

      {/* Masonry Editorial Grid */}
      <main className="px-4 md:px-8 lg:px-16 mx-auto max-w-[2000px] group/grid" ref={gridRef}>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-8 lg:gap-12 space-y-4 md:space-y-8 lg:space-y-12 pb-32">
          {displayedProducts.map((product, idx) => (
            <ParallaxImageItem
              key={`${product._id}-${idx}`}
              product={product}
              index={idx}
              onClick={() => handleProductClick(product.handle)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            />
          ))}
        </div>
        
        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} className="h-20 w-full flex justify-center items-center opacity-50">
           <span className="text-xs uppercase tracking-[0.2em] font-light">Endless Discovery...</span>
        </div>
      </main>
    </div>
  );
};

// Extracted Parallax Item to handle its own scroll transform
const ParallaxImageItem = ({ product, index, onClick, onMouseEnter, onMouseLeave }) => {
  const itemRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"]
  });

  // Alternating parallax directions and speeds for an asymmetric luxury feel
  const yTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? 50 : 100, index % 2 === 0 ? -50 : -100]
  );

  // Generate varied aspect ratios for a true masonry stagger
  const aspectRatios = [
    "aspect-[3/4]",
    "aspect-[4/5]",
    "aspect-[2/3]",
    "aspect-[4/5]",
    "aspect-square",
    "aspect-[3/5]"
  ];
  const aspectClass = aspectRatios[index % aspectRatios.length];

  return (
    <div
      ref={itemRef}
      className="lookbook-image-wrapper break-inside-avoid relative overflow-hidden group/item cursor-none mb-4 md:mb-8 lg:mb-12 transition-all duration-[800ms] ease-out group-hover/grid:opacity-70 hover:!opacity-100 hover:scale-[1.01] hover:shadow-2xl hover:z-20"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`w-full relative overflow-hidden bg-stone-100 ${aspectClass}`}>
        <motion.img
          style={{ y: yTransform }}
          src={product.image}
          alt={product.name}
          className="absolute top-[-15%] left-0 w-full h-[130%] object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/item:scale-105 group-hover/item:blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/40 transition-colors duration-700 ease-out" />
      </div>

      <div className="absolute inset-0 p-6 opacity-0 group-hover/item:opacity-100 transition-all duration-700 ease-out flex flex-col justify-center items-center pointer-events-none z-10">
        <h3 className="text-white text-2xl md:text-3xl font-serif tracking-widest drop-shadow-2xl text-center transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-700">
          {product.name}
        </h3>
        <p className="text-white font-medium tracking-[0.2em] mt-3 drop-shadow-md uppercase text-xs md:text-sm transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-700 delay-75">
          {product.price}
        </p>
        <div className="text-white text-xs font-bold uppercase tracking-[0.3em] mt-6 border-b border-white pb-1 transform translate-y-4 group-hover/item:translate-y-0 transition-transform duration-700 delay-150">
          Shop Editorial
        </div>
      </div>
    </div>
  );
};

export default Lookbook;
