import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { MoveLeft, MoveRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const MegaMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/categories`, {headers: {
    "ngrok-skip-browser-warning": "true",
  },}
        );
        const topLevelCategories = response.data
          .filter((cat) => cat.parent?.name === "Root")
          .map((cat) => ({
            id: cat._id,
            name: cat.name,
            image: cat.image,
          }));

        setCategories(topLevelCategories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [swiperInstance]);

  return (
    <section className="h-screen w-full px-4 md:px-12 py-10 md:py-20 flex flex-col justify-center">
      <div className="text-center mb-24 md:mb-12">
        <h2 className="text-4xl md:text-6xl lg:text-9xl text-gray-900 mb-2">
          Top Categories
        </h2>
        <h6 className="text-gray-500 mt-2 font-nav-item text-base md:text-lg">
          Explore our top categories
        </h6>{" "}
      </div>

      {loading ? (
        <div className="text-gray-500 text-center">Loading categories...</div>
      ) : error ? (
        <div className="text-red-500 text-center">Error: {error}</div>
      ) : (
        <div className="flex items-center justify-center w-full">
          {/* Prev Button */}
          <button
            ref={prevRef}
            className="text-gray-700 hover:text-black p-2 rounded-full transition mr-4 bg-transparent"
          >
            <MoveLeft className="w-6 h-6" />
          </button>

          {/* Swiper Carousel */}
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onSwiper={setSwiperInstance}
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              1280: { slidesPerView: 4, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 16 },
              480: { slidesPerView: 1, spaceBetween: 12 },
            }}
            className="w-full"
          >
            {categories.map((category) => (
              <SwiperSlide
                key={category.id}
                className="p-4 flex justify-center"
              >
                <Link
                  to="/shop"
                  state={{ categoryId: category.id }}
                  className="group relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 ease-in-out"
                >
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-4">
                    <img
                      src={category.image || "https://via.placeholder.com/150"}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full border-2 border-gray-100 group-hover:border-black transition duration-300"
                    />
                    <div className="absolute inset-0 rounded-full group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 pointer-events-none" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-800 group-hover:text-black transition-colors duration-300">
                      {category.name}
                    </h3>
                    <span className="mt-1 block text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                      Explore →
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Next Button */}
          <button
            ref={nextRef}
            className="text-gray-700 hover:text-black p-2 rounded-full transition ml-4 bg-transparent"
          >
            <MoveRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};

export default MegaMenu;
