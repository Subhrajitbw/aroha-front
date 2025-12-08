import { useEffect, useRef } from "react";
import { MoveRight, ArrowUpRight, Sparkles, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";
import CategorySlider from "./CategorySlider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CategorySection() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const luxuryAccentRef = useRef(null);
  const descriptionRef = useRef(null);
  const statsRef = useRef(null);
  const sliderRef = useRef(null);
  const ctaRef = useRef(null);
  const viewAllRef = useRef(null);
  const backgroundRef = useRef(null);
  const masterTl = useRef(null);

  useEffect(() => {
    if (masterTl.current) masterTl.current.kill();

    masterTl.current = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
        once: false
      }
    });

    gsap.set(
      [
        badgeRef.current,
        titleRef.current,
        luxuryAccentRef.current,
        descriptionRef.current,
        statsRef.current,
        sliderRef.current,
        ctaRef.current,
        viewAllRef.current
      ],
      { opacity: 0, willChange: "transform, opacity" }
    );

    masterTl.current.fromTo(
      backgroundRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power1.out" }
    );

    masterTl.current.fromTo(
      badgeRef.current,
      { opacity: 0, y: 16, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
      0.1
    );

    if (titleRef.current) {
      const titleWords = titleRef.current.querySelectorAll(".word");
      masterTl.current.fromTo(
        titleWords,
        { opacity: 0, y: 24, rotationX: 8 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out"
        },
        0.2
      );
    }

    masterTl.current.fromTo(
      luxuryAccentRef.current,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        transformOrigin: "left center"
      },
      0.4
    );

    masterTl.current.fromTo(
      descriptionRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5 },
      0.5
    );

    if (statsRef.current) {
      const statItems = statsRef.current.querySelectorAll(".stat-item");
      masterTl.current.fromTo(
        statItems,
        { opacity: 0, y: 8, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(1.2)"
        },
        0.6
      );
    }

    masterTl.current.fromTo(
      sliderRef.current,
      { opacity: 0, y: 20, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
      0.7
    );

    // View All button animation
    masterTl.current.fromTo(
      viewAllRef.current,
      { opacity: 0, y: 12, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
      0.8
    );

    if (ctaRef.current) {
      const ctaButtons = ctaRef.current.querySelectorAll(".cta-button");
      masterTl.current.fromTo(
        ctaButtons,
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "back.out(1.3)"
        },
        0.9
      );
    }

    gsap.to(".luxury-orb", {
      y: -8,
      x: 4,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    const onResize = () => {
      ScrollTrigger.refresh();
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      if (masterTl.current) masterTl.current.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const handleCTAHover = (e, isEntering) => {
    const button = e.currentTarget;
    const icon = button.querySelector(".cta-icon");
    if (isEntering) {
      gsap.to(button, { scale: 1.02, y: -1, duration: 0.15, ease: "power2.out" });
      gsap.to(icon, { x: 2, duration: 0.15, ease: "power2.out" });
    } else {
      gsap.to(button, { scale: 1, y: 0, duration: 0.15, ease: "power2.out" });
      gsap.to(icon, { x: 0, duration: 0.15, ease: "power2.out" });
    }
  };

  const handleViewAllHover = (e, isEntering) => {
    const button = e.currentTarget;
    const icon = button.querySelector(".view-all-icon");
    const text = button.querySelector(".view-all-text");
    
    if (isEntering) {
      gsap.to(button, { 
        scale: 1.05, 
        y: -2, 
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        duration: 0.2, 
        ease: "power2.out" 
      });
      gsap.to(icon, { 
        rotation: 90, 
        scale: 1.1,
        duration: 0.2, 
        ease: "power2.out" 
      });
      gsap.to(text, { 
        x: 2,
        duration: 0.2, 
        ease: "power2.out" 
      });
    } else {
      gsap.to(button, { 
        scale: 1, 
        y: 0, 
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        duration: 0.2, 
        ease: "power2.out" 
      });
      gsap.to(icon, { 
        rotation: 0, 
        scale: 1,
        duration: 0.2, 
        ease: "power2.out" 
      });
      gsap.to(text, { 
        x: 0,
        duration: 0.2, 
        ease: "power2.out" 
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="bg-transparent h-screen w-full overflow-hidden flex items-center justify-center pt-48"
      aria-label="Browse categories"
    >
      {/* Background */}
      <div ref={backgroundRef} className="absolute inset-0 pointer-events-none">
        <div className="luxury-orb pointer-events-none absolute top-1/5 left-[8%] w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-amber-200/30 to-orange-300/15 rounded-full blur-3xl" />
        <div className="luxury-orb pointer-events-none absolute bottom-1/5 right-[8%] w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-gradient-to-br from-rose-200/25 to-pink-300/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-amber-50/40" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Content Container */}
      <div
        ref={containerRef}
        className="flex flex-col space-y-12 w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-4 md:space-y-4">

          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 relative overflow-hidden group"
          >
            {/* Luxury Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/40 via-white/60 to-amber-50/40 backdrop-blur-2xl" />


          </div>

          {/* Slider */}
          <div
            ref={sliderRef}
            className="w-full max-w-full"
          >
            <CategorySlider />
          </div>

          {/* View All Categories Button */}
          <div ref={viewAllRef} className="pt-4">
            <Link
              to="/categories"
              className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl text-gray-800 rounded-full text-sm font-medium tracking-wide border border-white/40 hover:border-white/60 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              onMouseEnter={(e) => handleViewAllHover(e, true)}
              onMouseLeave={(e) => handleViewAllHover(e, false)}
              aria-label="View all categories"
            >
              <Grid3X3 
                size={16} 
                className="view-all-icon text-gray-600 transition-all duration-200" 
                aria-hidden="true" 
              />
              <span className="view-all-text transition-transform duration-200">
                View All Categories
              </span>
            </Link>
          </div>

          {/* Main CTAs */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full max-w-md sm:max-w-none px-4 sm:px-0"
          >
            <Link
              to="/featured"
              className="cta-button w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full text-base font-medium tracking-wide shadow-xl shadow-black/8 hover:shadow-2xl hover:shadow-black/15 transition-shadow duration-300"
              onMouseEnter={(e) => handleCTAHover(e, true)}
              onMouseLeave={(e) => handleCTAHover(e, false)}
              aria-label="Featured Collection"
            >
              <span>Featured Collection</span>
              <ArrowUpRight size={18} className="cta-icon transition-transform duration-200" aria-hidden="true" />
            </Link>

            <Link
              to="/new-arrivals"
              className="cta-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/70 backdrop-blur-xl text-gray-800 rounded-full text-base font-light tracking-wide border border-white/50 hover:bg-white/85 transition-all duration-300 shadow-lg shadow-black/5"
              onMouseEnter={(e) => handleCTAHover(e, true)}
              onMouseLeave={(e) => handleCTAHover(e, false)}
              aria-label="New Arrivals"
            >
              <span>New Arrivals</span>
              <MoveRight size={18} className="cta-icon transition-transform duration-200" aria-hidden="true" />
            </Link>
          </div>

        </div>
      </div>

      {/* Enhanced responsive adjustments */}
      <style jsx>{`
        @media (max-height: 800px) {
          .space-y-12 > * + * { margin-top: 2rem !important; }
          .space-y-8 > * + * { margin-top: 1.5rem !important; }
          .space-y-6 > * + * { margin-top: 1.25rem !important; }
          .space-y-4 > * + * { margin-top: 1rem !important; }
        }
        @media (max-height: 700px) {
          .space-y-12 > * + * { margin-top: 1.5rem !important; }
          .space-y-8 > * + * { margin-top: 1.25rem !important; }
          .space-y-6 > * + * { margin-top: 1rem !important; }
          .space-y-4 > * + * { margin-top: 0.75rem !important; }
        }
        @media (max-height: 600px) {
          .space-y-12 > * + * { margin-top: 1rem !important; }
          .space-y-8 > * + * { margin-top: 1rem !important; }
          .space-y-6 > * + * { margin-top: 0.75rem !important; }
          .space-y-4 > * + * { margin-top: 0.5rem !important; }
        }
        @media (max-height: 500px) {
          .cta-button { padding: 0.625rem 1.25rem !important; font-size: 0.875rem !important; }
          .space-y-12 > * + * { margin-top: 0.75rem !important; }
          .space-y-8 > * + * { margin-top: 0.75rem !important; }
          .space-y-6 > * + * { margin-top: 0.5rem !important; }
          .space-y-4 > * + * { margin-top: 0.375rem !important; }
        }
      `}</style>
    </section>
  );
}
