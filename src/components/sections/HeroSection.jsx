import React, { useState, useEffect, useRef, useCallback } from "react"
import { sanityClient } from "@/lib/sanityClient"
import gsap from "gsap"

// 4 video slides — Mixkit interior / home decor videos (verified 200 OK)
const DEFAULT_VIDEO_SLIDES = [
  {
    backgroundType: "video",
    videoUrl: "https://assets.mixkit.co/videos/4046/4046-720.mp4",
    heading: "Crafted for Living",
    subheading: "Handcrafted interiors for those who live deliberately.",
    badge: "New Season '25",
    alignment: "left",
    overlayStrength: 50,
    autoPlayDuration: 8000,
    ctaPrimary: { text: "Explore", link: "/shop" },
    ctaSecondary: { text: "Our Story", link: "/about" },
  },
  {
    backgroundType: "video",
    videoUrl: "https://assets.mixkit.co/videos/4030/4030-720.mp4",
    heading: "Spaces of Intention",
    subheading: "Where material meets meaning. Every surface refined.",
    badge: "Editorial",
    alignment: "left",
    overlayStrength: 55,
    autoPlayDuration: 8000,
    ctaPrimary: { text: "Shop Now", link: "/shop" },
    ctaSecondary: { text: "Lookbook", link: "/lookbook" },
  },
  {
    backgroundType: "video",
    videoUrl: "https://assets.mixkit.co/videos/4198/4198-720.mp4",
    heading: "Material & Form",
    subheading: "Artisan-selected textures for spaces that tell stories.",
    badge: "Curated Edit",
    alignment: "left",
    overlayStrength: 50,
    autoPlayDuration: 8000,
    ctaPrimary: { text: "View Pieces", link: "/shop" },
    ctaSecondary: { text: "Rooms", link: "/rooms" },
  },
  {
    backgroundType: "video",
    videoUrl: "https://assets.mixkit.co/videos/4047/4047-720.mp4",
    heading: "The Aroha Standard",
    subheading: "Every detail considered. Luxury without compromise.",
    badge: "Signature",
    alignment: "left",
    overlayStrength: 55,
    autoPlayDuration: 8000,
    ctaPrimary: { text: "Discover", link: "/shop" },
    ctaSecondary: { text: "Contact", link: "/contact" },
  },
]

const HeroSection = ({ heroData }) => {
  const [slides, setSlides] = useState(heroData?.slides || DEFAULT_VIDEO_SLIDES)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [globalVideoUrl, setGlobalVideoUrl] = useState(heroData?.globalVideoUrl || null)

  const videoRefs = useRef([])
  const heroRef = useRef(null)
  const progressRef = useRef(null)
  const autoplayRef = useRef(null)

  // Removed manual video preload effect to save memory

  // ── Play/pause on slide change ──
  useEffect(() => {
    if (!slides.length) return
    slides.forEach((slide, idx) => {
      const video = videoRefs.current[idx]
      if (!video || slide.backgroundType !== "video") return
      if (idx === current) {
        video.currentTime = 0
        video.play().catch(() => { })
      } else {
        video.pause()
      }
    })
  }, [current, slides])

  // ── Progress bar + text animation ──
  useEffect(() => {
    if (loading || !slides.length) return
    const duration = slides[current]?.autoPlayDuration ? slides[current].autoPlayDuration / 1000 : 8

    // Reset & animate progress
    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0 })
      gsap.to(progressRef.current, { scaleX: 1, duration, ease: "linear" })
    }

    // Animate text in
    const ctx = gsap.context(() => {
      // Check if elements exist in scope before animating to avoid warnings
      if (document.querySelector(".hero-heading")) {
        gsap.fromTo(".hero-heading", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.1 })
      }
      if (document.querySelector(".hero-sub")) {
        gsap.fromTo(".hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", delay: 0.2 })
      }
      if (document.querySelector(".hero-cta")) {
        gsap.fromTo(".hero-cta", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "expo.out", delay: 0.3 })
      }
      if (document.querySelector(".hero-badge")) {
        gsap.fromTo(".hero-badge", { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "expo.out", delay: 0.15 })
      }
    }, heroRef.current) // Pass .current as the scope

    return () => ctx.revert()
  }, [current, slides])

  // ── Autoplay ──
  useEffect(() => {
    if (!slides.length || isPaused) return
    const duration = slides[current]?.autoPlayDuration || 8000
    autoplayRef.current = setTimeout(() => nextSlide(), duration)
    return () => clearTimeout(autoplayRef.current)
  }, [current, slides, isPaused])

  const nextSlide = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length])
  const prevSlide = useCallback(() => setCurrent(c => c === 0 ? slides.length - 1 : c - 1), [slides.length])

  // Helper to convert Google Drive share links to direct video stream URLs
  const getDirectVideoUrl = (url) => {
    if (!url) return url;

    // Match /file/d/ID/view or /d/ID
    let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

    // Match ?id=ID
    if (!match) {
      match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    }

    if (match && match[1]) {
      // confirm=t attempts to bypass the large file virus scan warning
      return `https://drive.google.com/uc?export=download&confirm=t&id=${match[1]}`;
    }

    return url;
  }


  if (!slides.length) return null

  const slide = slides[current]

  return (
    <section ref={heroRef} className="relative h-screen w-full bg-stone-950 overflow-hidden text-white select-none">

      {/* ═══════ VIDEO LAYERS ═══════ */}
      <div className="absolute inset-0">
        {globalVideoUrl ? (
          <video
            src={getDirectVideoUrl(globalVideoUrl)}
            autoPlay muted loop playsInline disablePictureInPicture
            className="w-full h-full object-cover"
            style={{ willChange: "transform" }}
          />
        ) : (
          slides.map((s, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: idx === current ? 1 : 0 }}
            >
              {s.backgroundType === "video" ? (
                <video
                  ref={el => (videoRefs.current[idx] = el)}
                  src={getDirectVideoUrl(s.videoUrl)}
                  muted loop playsInline preload="metadata" disablePictureInPicture
                  className="w-full h-full object-cover"
                  style={{ willChange: "transform" }}
                />
              ) : (
                <img src={s.image?.url} alt={s.heading} className="w-full h-full object-cover" style={{ willChange: "transform" }} />
              )}
            </div>
          ))
        )}

        {/* ═══════ CINEMATIC OVERLAY SYSTEM (Optimized to single layer) ═══════ */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to top, rgba(28,25,23,1) 0%, rgba(28,25,23,0.4) 40%, transparent 100%),
              linear-gradient(to right, rgba(28,25,23,0.7) 0%, rgba(28,25,23,0.2) 50%, transparent 100%),
              linear-gradient(to bottom, rgba(28,25,23,0.5) 0%, transparent 30%),
              rgba(28,25,23,0.2)
            `
          }}
        />
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-32 sm:pb-32 lg:pb-36 px-6 sm:px-10 lg:px-20">
        <div className="max-w-4xl">

          {/* Badge */}
          {slide.badge && (
            <div className="hero-badge mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-medium text-white/60">
                <span className="w-6 h-px bg-white/40" />
                {slide.badge}
              </span>
            </div>
          )}

          {/* Heading */}
          <h1 className="hero-heading text-[clamp(2.5rem,8vw,7rem)] font-serif font-light leading-[0.95] tracking-[-0.02em] text-white mb-5 sm:mb-6">
            {slide.heading}
          </h1>

          {/* Subheading */}
          {slide.subheading && (
            <p className="hero-sub text-sm sm:text-base lg:text-lg text-white/50 font-light max-w-lg leading-relaxed mb-8 sm:mb-10">
              {slide.subheading}
            </p>
          )}

          {/* CTAs */}
          {(slide.ctaPrimary?.text || slide.ctaSecondary?.text) && (
            <div className="hero-cta flex items-center gap-4 sm:gap-5">
              {slide.ctaPrimary?.text && (
                <a
                  href={slide.ctaPrimary.link}
                  className="group flex items-center gap-3 px-7 py-3.5 bg-white text-stone-950 text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-stone-100 transition-all duration-300"
                >
                  {slide.ctaPrimary.text}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {slide.ctaSecondary?.text && (
                <a
                  href={slide.ctaSecondary.link}
                  className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium text-white/50 hover:text-white border-b border-white/20 hover:border-white/60 pb-1 transition-all duration-300"
                >
                  {slide.ctaSecondary.text}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ RIGHT SIDE — VERTICAL SLIDE INDICATOR ═══════ */}
      <div className="absolute right-6 sm:right-10 lg:right-16 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="group relative flex items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-500 ${idx === current
                  ? "w-[3px] h-10 bg-white"
                  : "w-[3px] h-4 bg-white/25 group-hover:bg-white/50 group-hover:h-6"
                }`}
            />
          </button>
        ))}
      </div>

      {/* ═══════ BOTTOM — PROGRESS + COUNTER ═══════ */}
      <div className="absolute bottom-0 left-0 right-0 z-20 hidden sm:block">
        {/* Progress bar */}
        <div className="h-[1px] bg-white/10">
          <div ref={progressRef} className="h-full bg-white/40 origin-left" style={{ transform: "scaleX(0)" }} />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 lg:px-20 py-5 sm:py-6">
          {/* Counter */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-white/80 tabular-nums">
              {String(current + 1).padStart(2, "0")}
            </span>
            <span className="w-8 h-px bg-white/20" />
            <span className="text-[11px] font-mono text-white/30 tabular-nums">
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Scroll hint */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/25 font-medium">
            <span>Scroll</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ═══════ BRAND WATERMARK ═══════ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-full overflow-hidden z-[1] pointer-events-none select-none flex justify-center items-center">
        <span
          className="block text-[20vw] sm:text-[15vw] font-serif text-white/[0.02] leading-none tracking-[-0.05em] whitespace-nowrap"
          style={{ fontStyle: "italic" }}
        >
          Aroha
        </span>
      </div>

    </section>
  )
}

export default HeroSection