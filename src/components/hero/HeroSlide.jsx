// components/hero/HeroSlide.jsx
import React, { forwardRef } from "react";

const HeroSlide = forwardRef(({ slide, slideIndex, isActive }, ref) => {
  if (!slide) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: isActive ? 10 : 1 }}
    >
      {slide.media?.type === "video" ? (
        <video
          src={slide.media.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-label={slide.media.alt || slide.title}
        />
      ) : (
        <img
          src={slide.media?.url}
          alt={slide.media?.alt || slide.title}
          className="w-full h-full object-cover"
          loading={slideIndex === 0 ? "eager" : "lazy"}
        />
      )}
    </div>
  );
});

HeroSlide.displayName = "HeroSlide";

export default HeroSlide;
