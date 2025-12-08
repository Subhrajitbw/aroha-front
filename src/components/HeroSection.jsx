import React, { useState, useEffect, useRef } from "react";
import { sanityClient, urlFor } from "../lib/sanityClient"; 
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const HeroSection = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const imageRef = useRef(null);
  const textContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  // ---------------------------------------------------------
  // 1. Fetch Data
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const query = `*[_type == "heroSlider"][0]{
          slides[]{
            heading,
            subheading,
            ctaText,
            ctaLink,
            image,
            "videoUrl": video.asset->url 
          }
        }`;
        const data = await sanityClient.fetch(query);
        if (data?.slides) setSlides(data.slides);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchSlides();
  }, []);

  // ---------------------------------------------------------
  // 2. GSAP Animation (Centered Float-up)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!slides.length) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(imageRef.current, { scale: 1.2, opacity: 0 }); 
      gsap.set(".hero-text-item", { y: 50, opacity: 0 });
      // Removed the border animation since we are centering

      tl.to(imageRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: "power2.out"
      })
      .to(".hero-text-item", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
      }, "-=1.2");

      gsap.fromTo(progressBarRef.current, 
        { scaleX: 0 }, 
        { scaleX: 1, duration: 6, ease: "linear", paused: isPaused }
      );

    }, textContainerRef);

    return () => ctx.revert();
  }, [current, slides.length, isPaused]);

  // ---------------------------------------------------------
  // 3. Auto-play
  // ---------------------------------------------------------
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [current, slides.length, isPaused]);

  const nextSlide = () => setCurrent(c => (c + 1) % slides.length);
  const prevSlide = () => setCurrent(c => (c === 0 ? slides.length - 1 : c - 1));

  if (loading) return <div className="h-screen w-full bg-black" />;
  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden text-white select-none">
      
      {/* === BACKGROUND === */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div ref={imageRef} className="w-full h-full relative">
          {slide.videoUrl ? (
            <video
              src={slide.videoUrl}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <img
              src={slide.image ? urlFor(slide.image).width(2400).quality(90).url() : ""}
              alt={slide.heading}
              className="w-full h-full object-cover opacity-70"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>
      </div>

      {/* === CONTENT (Centered) === */}
      <div ref={textContainerRef} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
        
        {/* Max-width container forces nice line breaks */}
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          
          {/* Heading */}
          <h1 className="hero-text-item text-5xl md:text-7xl lg:text-9xl font-light tracking-tighter leading-[1.1] text-white">
            {slide.heading}
          </h1>

          {/* Subheading */}
          {slide.subheading && (
            <p className="hero-text-item text-lg md:text-xl text-white/90 font-light max-w-2xl leading-relaxed">
              {slide.subheading}
            </p>
          )}

          {/* CTA */}
          {slide.ctaText && (
            <div className="hero-text-item pt-4">
              <a
                href={slide.ctaLink || "#"}
                className="
                  group relative inline-flex items-center gap-3 px-10 py-4 
                  border border-white/30 hover:border-white
                  rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/10
                  text-sm uppercase tracking-[0.2em] 
                  transition-all duration-300 ease-out
                "
              >
                <span>{slide.ctaText}</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* === CONTROLS === */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div ref={progressBarRef} className="h-full bg-white origin-left" />
      </div>

      <div className="absolute bottom-12 w-full flex justify-center items-center gap-8 z-20">
         {/* Prev */}
         <button onClick={prevSlide} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <ChevronLeft size={28} strokeWidth={1} />
          </button>

         {/* Slide Counter */}
         <div className="text-sm font-mono tracking-widest text-white/50">
            <span className="text-white">{String(current + 1).padStart(2, '0')}</span>
            <span className="mx-2">/</span>
            {String(slides.length).padStart(2, '0')}
          </div>

         {/* Next */}
         <button onClick={nextSlide} className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <ChevronRight size={28} strokeWidth={1} />
          </button>
      </div>

    </section>
  );
};

export default HeroSection;
