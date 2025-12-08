"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { ShoppingCart, Heart, MoveLeft, MoveRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const FeaturedSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const cardRefs = useRef([]); // Store refs for each product card
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`, {headers: {
    "ngrok-skip-browser-warning": "true",}
  },);
        const filtered = response.data.products.filter((p) => p.isNewProduct);
        setProducts(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [swiperInstance]);

  useEffect(() => {
    // Cinematic entrance for section
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 80, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2,
      }
    );
    // Parallax effect for section on scroll
    gsap.to(sectionRef.current, {
      y: 40,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
      ease: "none",
    });
    // Animate heading
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          delay: 0.5,
        }
      );
    }
    // Animate cards staggered
    if (cardRefs.current && cardRefs.current.length > 0) {
      gsap.fromTo(
        cardRefs.current,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.7,
        }
      );
    }
  }, [loading]);

  const handleCardHover = (el) => {
    if (!el) return;
    gsap.to(el, {
      scale: 1.03,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleCardLeave = (el) => {
    if (!el) return;
    gsap.to(el, {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <div ref={sectionRef} className="bg-transparent w-full px-4 md:px-12 mt-8 md:mt-16 pb-8 border border-white/10 rounded-lg">
      <div className="text-center mb-8 md:mb-12">
        <h2 ref={headingRef} className="text-4xl md:text-9xl text-[#333]">New Arrivals</h2>
        <h6 className="text-gray-500 mt-2 font-nav-item text-base md:text-lg">
          Explore our latest luxury designs
        </h6>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : (
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {/* Prev Arrow */}
          <button
            ref={prevRef}
            className="text-black p-2 rounded-full border border-gray-300 transition"
          >
            <MoveLeft className="w-6 h-6" />
          </button>

          {/* Swiper Carousel */}
          <Swiper
            modules={[Navigation]}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onSwiper={setSwiperInstance}
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              1024: { slidesPerView: 3, spaceBetween: 24 },
              768: { slidesPerView: 2, spaceBetween: 16 },
              480: { slidesPerView: 1, spaceBetween: 8 },
            }}
          >
            {products.map((product, index) => (
              <SwiperSlide
                key={product._id}
                className="flex justify-center items-center"
              >
                <div
                  ref={(el) => (cardRefs.current[index] = el)}
                  onMouseEnter={() => handleCardHover(cardRefs.current[index])}
                  onMouseLeave={() => handleCardLeave(cardRefs.current[index])}
                  className="group relative m-2 md:m-4 w-full max-w-xs flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-transform hover:shadow-lg"
                >
                  {/* Product Image */}
                  <a
                    href="#"
                    className="relative block h-48 md:h-64 overflow-hidden rounded-t-xl"
                  >
                    <img
                      src={
                        product.images?.[0] || "https://via.placeholder.com/300"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white z-10">
                        {product.discount}% OFF
                      </span>
                    )}
                  </a>

                  {/* Product Details */}
                  <div className="px-4 pt-4 pb-5">
                    <h2 className="text-xl md:text-4xl text-[#333] mb-1 font-heading-large">
                      {product.name}
                    </h2>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-lg md:text-xl text-[#333] mb-1 font-nav-item font-bold">
                          ₹{product.price.amount.toLocaleString()}
                        </span>
                        {product.price.isDiscounted && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹
                            {(
                              product.price.amount +
                              product.price.discountAmount
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="text-yellow-500 text-sm font-medium">
                        ★ {product.rating || "5.0"}
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 md:gap-4">
                        <button className="action-button bg-slate-900 text-white rounded-xl p-2 md:p-4">
                          <ShoppingCart size={20} md:size={24} />
                          <span className="action-text hidden md:inline">Add to Cart</span>
                        </button>

                        <button className="action-button border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-500 rounded-xl p-2 md:p-4">
                          <Heart size={20} md:size={24} />
                          <span className="action-text hidden md:inline">Wishlist</span>
                        </button>
                      </div>
                      <button className="p-2 rounded-full border border-gray-300 text-gray-500 bg-transparent transform transition-transform duration-300 hover:scale-125">
                        <MoveRight size={20} md:size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Next Arrow */}
          <button
            ref={nextRef}
            className="text-black p-2 rounded-full border border-gray-300 transition"
          >
            <MoveRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedSection;
