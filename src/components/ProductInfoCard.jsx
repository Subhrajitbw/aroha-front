import React, { useState, useRef, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useResponsive } from "../hooks/useResponsive";

export const ProductInfoCard = ({
  product,
  cardSize = "default",
  className = "",
  textColor,
  type,
  isFluid,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const imageRef = useRef(null);
  const buttonRef = useRef(null);
  const textContainerRef = useRef(null);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const navigate = useNavigate();

  const finalTextColor = type === "sec" ? "#fff" : textColor || "#1a1a1a";

  // Detect touch device
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Initial animation
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          clearProps: "all",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Desktop hover animations
  useEffect(() => {
    if (isMobile || isTouchDevice) return;

    const wrapper = imageWrapperRef.current;
    const image = imageRef.current;
    const button = buttonRef.current;

    if (!wrapper || !image || !button) return;

    const hoverTl = gsap.timeline({ paused: true });

    hoverTl
      .to(image, {
        scale: 1.08,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(
        button,
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );

    const handleMouseMove = (e) => {
      const { left, top, width, height } = wrapper.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / width;
      const y = (e.clientY - top - height / 2) / height;

      gsap.to(wrapper, {
        x: x * 10,
        y: y * 10,
        rotationX: -y * 3,
        rotationY: x * 3,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseEnter = () => {
      hoverTl.play();
    };

    const handleMouseLeave = () => {
      hoverTl.reverse();
      gsap.to(wrapper, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      });
    };

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseenter", handleMouseEnter);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseenter", handleMouseEnter);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      hoverTl.kill();
    };
  }, [isMobile, isTouchDevice]);

  // Touch interaction - show button on tap
  const handleTouchStart = () => {
    if (!isTouchDevice || !buttonRef.current) return;
    
    gsap.to(imageRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
    
    gsap.to(buttonRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice) return;
    
    gsap.to(imageRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    
    gsap.to(buttonRef.current, {
      y: 10,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    });
  };

  const handleProductClick = () => {
    if (product?.handle) {
      navigate(`/products/${product.handle}`);
    } else if (product?.id) {
      navigate(`/products/${product.id}`);
    }
  };

  const productName = product?.title || "Product Name";
  const productPrice = product?.price || "₹0";
  const productImage =
    product?.image ||
    product?.thumbnail ||
    "https://placehold.co/600x800/f0f0f0/e0e0e0";

  // Responsive max width
  const getMaxWidth = () => {
    if (isFluid) return "100%";
    if (isMobile) return "100%";
    if (isTablet) return cardSize === "large" ? "360px" : "280px";
    return cardSize === "large" ? "400px" : "320px";
  };

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col w-full cursor-pointer select-none ${className}`}
      onClick={handleProductClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        maxWidth: getMaxWidth(),
        perspective: "1000px",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-[3/4] mb-3 xs:mb-4 sm:mb-5 md:mb-6 isolate z-10">
        <div
          ref={imageWrapperRef}
          className="relative w-full h-full overflow-hidden rounded-[1000px] bg-neutral-100 shadow-md sm:shadow-lg transition-shadow duration-500 hover:shadow-xl active:shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Image with loading state */}
          <img
            ref={imageRef}
            src={productImage}
            alt={productName}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ease-out ${
              imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
            style={{
              touchAction: "none",
            }}
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
          )}

          {/* Hover/active overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Action button - larger touch target */}
          <div
            ref={buttonRef}
            className="absolute bottom-4 xs:bottom-5 sm:bottom-6 md:bottom-8 left-0 right-0 mx-auto w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-10 opacity-0 z-20"
            style={{
              minWidth: isTouchDevice ? "48px" : "auto",
              minHeight: isTouchDevice ? "48px" : "auto",
            }}
          >
            <ArrowUpRight className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-black stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div
        ref={textContainerRef}
        className="flex flex-col justify-center items-center gap-1 xs:gap-1.5 sm:gap-2 px-1 xs:px-2 sm:px-3 md:px-4 text-center z-0"
      >
        {/* Title with animated underline */}
        <h3
          className="text-xs xs:text-sm sm:text-base md:text-lg font-normal tracking-wide leading-snug relative inline-block line-clamp-2 w-full"
          style={{ 
            color: finalTextColor,
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          {productName}
          <span
            className="absolute -bottom-0.5 xs:-bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-500 ease-out group-hover:w-full opacity-60"
            style={{ backgroundColor: finalTextColor }}
          />
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline justify-center gap-1.5 xs:gap-2 sm:gap-3 mt-0.5 xs:mt-1">
          <span
            className="text-xs xs:text-sm sm:text-base md:text-lg font-medium tracking-[0.18em] xs:tracking-[0.22em] sm:tracking-[0.28em] opacity-90 uppercase"
            style={{ color: finalTextColor }}
          >
            {productPrice}
          </span>

          {product?.originalPrice && product.discount > 0 && (
            <span
              className="text-[10px] xs:text-xs sm:text-sm md:text-base line-through font-light tracking-wide opacity-50"
              style={{ color: finalTextColor }}
            >
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Optional: Discount badge for mobile */}
        {isMobile && product?.discount > 0 && (
          <span className="text-[10px] xs:text-xs text-emerald-600 font-medium tracking-wide mt-1">
            {product.discount}% OFF
          </span>
        )}
      </div>
    </div>
  );
};
