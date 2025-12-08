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

  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const imageRef = useRef(null);
  const buttonRef = useRef(null);
  const textContainerRef = useRef(null);

  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  const finalTextColor = type === "sec" ? "#fff" : textColor || "#1a1a1a";

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

  useEffect(() => {
    if (isMobile) return;

    const wrapper = imageWrapperRef.current;
    const image = imageRef.current;
    const button = buttonRef.current;

    if (!wrapper || !image || !button) return;

    const hoverTl = gsap.timeline({ paused: true });

    hoverTl
      .to(image, {
        scale: 1.1,
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
        x: x * 15,
        y: y * 15,
        rotationX: -y * 5,
        rotationY: x * 5,
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
  }, [isMobile]);

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

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col w-full cursor-pointer select-none ${className}`}
      onClick={handleProductClick}
      style={{
        maxWidth: isFluid
          ? "100%"
          : isMobile
          ? "100%"
          : cardSize === "large"
          ? "400px"
          : "320px",
        perspective: "1000px",
      }}
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-[3/4] mb-4 sm:mb-6 isolate z-10">
        <div
          ref={imageWrapperRef}
          className="relative w-full h-full overflow-hidden rounded-[1000px] bg-[#F0F0F0] shadow-lg transition-shadow duration-500 hover:shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            ref={imageRef}
            src={productImage}
            alt={productName}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ease-out ${
              imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div
            ref={buttonRef}
            className="absolute bottom-6 sm:bottom-8 left-0 right-0 mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-10 opacity-0 z-20"
          >
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* INFO SECTION */}
      <div
        ref={textContainerRef}
        className="flex flex-col justify-center items-center gap-0.5 sm:gap-1 px-2 sm:px-4 text-center z-0"
      >
        {/* Title with animated underline */}
        <h3
          className="text-sm sm:text-base lg:text-lg font-normal tracking-wide leading-tight relative inline-block line-clamp-2"
          style={{ color: finalTextColor }}
        >
          {productName}
          <span
            className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-500 ease-out group-hover:w-full opacity-60"
            style={{ backgroundColor: finalTextColor }}
          />
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 sm:gap-3 mt-1">
          <span
            className="text-xs sm:text-sm lg:text-base font-medium tracking-[0.22em] sm:tracking-[0.28em] opacity-90 uppercase"
            style={{ color: finalTextColor }}
          >
            {productPrice}
          </span>

          {product?.originalPrice && product.discount > 0 && (
            <span
              className="text-[10px] sm:text-xs lg:text-sm line-through font-light tracking-wide opacity-50"
              style={{ color: finalTextColor }}
            >
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
