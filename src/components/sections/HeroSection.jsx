import React, { useState, useEffect, useRef, useCallback } from "react"
import { sanityClient } from "../../lib/sanityClient"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HeroSection = () => {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const imageRef = useRef(null)
  const textContainerRef = useRef(null)
  const progressBarRef = useRef(null)
  const autoplayRef = useRef(null)

  // ---------------------------------------------------------
  // 1️⃣ Fetch Slides from Sanity
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const query = `*[_type == "heroSlider"][0]{
          slides[]{
            backgroundType,
            heading,
            subheading,
            badge,
            alignment,
            overlayStrength,
            autoPlayDuration,
            image,
            videoUrl,
            ctaPrimary,
            ctaSecondary
          }
        }`

        const data = await sanityClient.fetch(query)
        if (data?.slides) setSlides(data.slides)
      } catch (err) {
        console.error("Hero fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // ---------------------------------------------------------
  // 2️⃣ GSAP Animation
  // ---------------------------------------------------------
  useEffect(() => {
    if (!slides.length) return

    const ctx = gsap.context(() => {
      // Set to final states immediately
      gsap.set(imageRef.current, { scale: 1, opacity: 1 })
      gsap.set(".hero-text-item", { y: 0, opacity: 1 })
      gsap.set(progressBarRef.current, { scaleX: 0 })

      // Only progress bar animation
      gsap.to(
        progressBarRef.current,
        {
          scaleX: 1,
          duration:
            slides[current]?.autoPlayDuration
              ? slides[current].autoPlayDuration / 1000
              : 6,
          ease: "linear"
        }
      )
    }, textContainerRef)

    return () => ctx.revert()
  }, [current, slides])

  // ---------------------------------------------------------
  // 3️⃣ Auto Play (Duration from CMS)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!slides.length || isPaused) return

    const duration =
      slides[current]?.autoPlayDuration || 6000

    autoplayRef.current = setTimeout(() => {
      nextSlide()
    }, duration)

    return () => clearTimeout(autoplayRef.current)
  }, [current, slides, isPaused])

  const nextSlide = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrent((c) =>
      c === 0 ? slides.length - 1 : c - 1
    )
  }, [slides.length])

  if (loading)
    return <div className="h-screen w-full bg-black" />

  if (!slides.length) return null

  const slide = slides[current]

  // Alignment Classes
  const alignmentClasses = {
    center:
      "justify-center items-center text-center",
    left:
      "justify-start items-center text-left pl-12 md:pl-24",
    right:
      "justify-end items-center text-right pr-12 md:pr-24"
  }

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden text-white">

      {/* ================= Background ================= */}
      <div className="absolute inset-0 w-full h-full">
        <div ref={imageRef} className="w-full h-full relative">

          {slide.backgroundType === "video" ? (
            <video
              src={slide.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <img
              src={slide.image?.url}
              alt={slide.heading}
              className="w-full h-full object-cover opacity-70"
            />
          )}

          {/* Dynamic Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                rgba(0,0,0,${
                  (slide.overlayStrength || 60) / 200
                }),
                transparent,
                rgba(0,0,0,${
                  (slide.overlayStrength || 60) / 100
                })
              )`
            }}
          />
        </div>
      </div>

      {/* ================= Content ================= */}
      <div
        ref={textContainerRef}
        className={`absolute inset-0 flex px-6 ${
          alignmentClasses[slide.alignment || "center"]
        }`}
      >
        <div className="max-w-5xl flex flex-col gap-8">

          {/* Badge */}
          {slide.badge && (
            <div className="hero-text-item">
              <span className="px-4 py-1 text-xs uppercase tracking-widest border border-white/40 bg-white/10 backdrop-blur-sm">
                {slide.badge}
              </span>
            </div>
          )}

          {/* Heading */}
          <h1 className="hero-text-item text-5xl md:text-7xl lg:text-9xl font-light tracking-tight leading-[1.1]">
            {slide.heading}
          </h1>

          {/* Subheading */}
          {slide.subheading && (
            <p className="hero-text-item text-lg md:text-xl text-white/90 max-w-2xl">
              {slide.subheading}
            </p>
          )}

          {/* CTA Buttons */}
          {(slide.ctaPrimary?.text ||
            slide.ctaSecondary?.text) && (
            <div className="hero-text-item flex gap-4 flex-wrap pt-4">

              {slide.ctaPrimary?.text && (
                <a
                  href={slide.ctaPrimary.link}
                  className="px-8 py-4 border border-white rounded-full bg-white/10 hover:bg-white/20 transition-all uppercase text-sm tracking-widest"
                >
                  {slide.ctaPrimary.text}
                </a>
              )}

              {slide.ctaSecondary?.text && (
                <a
                  href={slide.ctaSecondary.link}
                  className="px-8 py-4 border border-white/30 rounded-full hover:border-white transition-all uppercase text-sm tracking-widest opacity-80"
                >
                  {slide.ctaSecondary.text}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= Progress Bar ================= */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div
          ref={progressBarRef}
          className="h-full bg-white origin-left"
        />
      </div>

      {/* ================= Controls ================= */}
      <div className="absolute bottom-12 w-full flex justify-center items-center gap-8 z-20">

        <button
          onClick={prevSlide}
          className="p-3 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="text-sm tracking-widest">
          {String(current + 1).padStart(2, "0")} /
          {String(slides.length).padStart(2, "0")}
        </div>

        <button
          onClick={nextSlide}
          className="p-3 hover:bg-white/10 rounded-full transition"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  )
}

export default HeroSection