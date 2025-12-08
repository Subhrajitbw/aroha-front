"use client";

import { useRef, useState } from "react";
import Slider from "react-slick";
import CarouselCard from "./CarouselCard";
import { MoveLeft, MoveRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HorizontalSlider = ({ products }) => {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);  
  const currentIndex = useState(0);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1.5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleSlide = (direction) => {
    if (sliderRef.current) {
      direction === "left"
        ? sliderRef.current.slickPrev()
        : sliderRef.current.slickNext();
    }
  };

  return (
    <div className="relative w-full overflow-hidden mt-32" ref={containerRef}>
      {/* Navigation Buttons */}

      {/* Slider Container */}
      <Slider ref={sliderRef} {...settings} className="slider-container">
        {products.map((product, idx) => (
          <div key={idx} className="px-2">
            <CarouselCard product={product} color="bg-white" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HorizontalSlider;