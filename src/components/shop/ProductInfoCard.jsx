import React, { useState, useRef, useEffect } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useResponsive } from "@/hooks/useResponsive";
import { useWishlistStore } from "@/stores/useWishlistStore";

// SKELETON COMPONENT FOR LOADING STATES
export const ProductSkeleton = ({ className = "" }) => {
  return (
    <div className={`flex flex-col w-full gap-4 ${className}`}>
      {/* Image Skeleton */}
      <div className="relative w-full aspect-[3/4] rounded-[1000px] bg-stone-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }} />
      </div>

      {/* Text Skeletons */}
      <div className="flex flex-col items-center gap-2 px-4">
        <div className="h-4 w-3/4 bg-stone-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-3 w-1/2 bg-stone-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        <div className="h-5 w-1/3 bg-stone-100 rounded-full mt-2 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

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

  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product?.id || product?._id || product?.handle);

  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const imageRef = useRef(null);
  const buttonRef = useRef(null);
  const textContainerRef = useRef(null);

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const router = useRouter();

  const finalTextColor = type === "sec" ? "#fff" : textColor || "#1a1a1a";

  // Detect touch device
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  // Initial animation and cached image check
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
    }

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

  // Touch interaction - show button on tap
  const handleTouchStart = () => {
    if (!isTouchDevice || !buttonRef.current || !imageRef.current) return;

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
    if (!isTouchDevice || !buttonRef.current || !imageRef.current) return;

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
    // Save scroll position for restoration on back navigation
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shop_scroll_pos', window.scrollY.toString());
    }

    if (product?.handle) {
      router.push(`/product/${product.handle}`);
    } else if (product?.id) {
      router.push(`/product/${product.id}`);
    }
  };

  const productName = product?.title || "Product Name";
  const productPrice = product?.price || "₹0";
  const productDescription = product?.shortIntro || product?.description || product?.subtitle || "";
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
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.08] ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

        </div>

        {/* Wishlist Button - Moved outside overflow-hidden to prevent cropping by the pill shape */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-stone-600'}`}
          />
        </button>

        {/* Action button - larger touch target */}
        <div
          ref={buttonRef}
          className="absolute bottom-4 xs:bottom-5 sm:bottom-6 md:bottom-8 left-0 right-0 mx-auto w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] z-20"
          style={{
            minWidth: isTouchDevice ? "48px" : "auto",
            minHeight: isTouchDevice ? "48px" : "auto",
          }}
        >
          <ArrowUpRight className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-black stroke-[1.5]" />
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

        {productDescription && (
          <p className="text-[10px] xs:text-xs text-stone-500 font-light line-clamp-1 xs:line-clamp-2 opacity-80 mt-1 max-w-[90%] mx-auto hidden sm:block">
            {productDescription}
          </p>
        )}

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
