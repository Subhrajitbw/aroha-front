import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, Plus } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    tags: [
      { id: "1a", name: "Series 11 5 Drawer Dresser", price: "$2,750", image: "/bg.png", x: "20%", y: "50%" },
      { id: "1b", name: "Rocking Chair", price: "$1,299", image: "/bg.png", x: "75%", y: "30%" },
      { id: "1c", name: "Modern Lamp", price: "$399", image: "/bg.png", x: "50%", y: "95%" },
    ],
  },
  {
    id: 2,
    image: "https://media.designcafe.com/wp-content/uploads/2020/04/11170923/dining-room-wall-decor-for-your-home.jpg",
    tags: [
      { id: "2a", name: "Dining Set", price: "$3,899", image: "/bg.png", x: "40%", y: "55%" },
      { id: "2b", name: "Pendant Light", price: "$599", image: "/bg.png", x: "60%", y: "20%" },
      { id: "2c", name: "Wall Decor", price: "$249", image: "/bg.png", x: "80%", y: "75%" },
    ],
  },
];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1025 : false);
  const [selectedTag, setSelectedTag] = useState(null);
  const imageRefs = useRef([]);
  const sliderRef = useRef();
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      const width = isMobile ? containerWidth : containerWidth * 0.8; // 80% slide width on desktop
      setSlideWidth(width);
    }
  }, [isMobile]);

  const handleDragEnd = (_, info) => {
    const threshold = 100;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -threshold || velocity < -500) {
      setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      setSelectedTag(null);
    } else if (offset > threshold || velocity > 500) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setSelectedTag(null);
    }
  };

  const getPopupPosition = (xPercent, yPercent, slideIndex) => {
    const imageEl = imageRefs.current[slideIndex];
    if (!imageEl) return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

    const rect = imageEl.getBoundingClientRect();
    const x = (parseFloat(xPercent) / 100) * rect.width;
    const y = (parseFloat(yPercent) / 100) * rect.height;

    const popupWidth = isMobile ? rect.width * 0.6 : 220;
    const popupHeight = 160;
    const margin = 12;
    const gapFromButton = 16;

    let left = x + gapFromButton;
    let top = y + gapFromButton;

    if (left + popupWidth + margin > rect.width) {
      left = x - popupWidth - gapFromButton;
      if (left < margin) left = rect.width - popupWidth - margin;
    }

    if (top + popupHeight + margin > rect.height) {
      top = y - popupHeight - gapFromButton - (isMobile ? 70 : 50);
      if (top < margin) top = rect.height - popupHeight - margin;
    }

    return { left: `${left}px`, top: `${top}px` };
  };

  const calcX = () => {
    if (isMobile) {
      return -currentIndex * slideWidth;
    } else {
      const gap = sliderRef.current ? (sliderRef.current.offsetWidth - slideWidth) / 2 : 0;
      return -currentIndex * (slideWidth + 32) + gap;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex justify-center items-center">
      <div ref={sliderRef} className="w-full max-w-[1400px] relative">
        <motion.div
          className="flex items-center"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ x: calcX() }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-shrink-0 overflow-hidden"
              style={{
                width: isMobile ? "80%%" : "80%",
                marginRight: isMobile ? "0" : "32px",
                padding: isMobile ? "0px" : "0px",
                height: "60vh",
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {slide.tags.map((tag) => (
                <motion.button
                  key={tag.id}
                  onClick={() =>
                    setSelectedTag((prev) =>
                      prev?.id === tag.id && prev?.parentId === slide.id ? null : { ...tag, parentId: slide.id, slideIndex: index }
                    )
                  }
                  className={`absolute rounded-full flex items-center justify-center ${
                    selectedTag?.id === tag.id && selectedTag.parentId === slide.id
                      ? "bg-white text-black w-10 h-10"
                      : "bg-black/70 text-white w-8 h-8 hover:bg-black"
                  } transition duration-300`}
                  style={{
                    top: tag.y,
                    left: tag.x,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Plus size={18} />
                </motion.button>
              ))}

              <AnimatePresence>
                {selectedTag && selectedTag.parentId === slide.id && (
                  <motion.div
                    key={selectedTag.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute bg-white shadow-lg rounded-md p-4 text-black z-20"
                    style={{
                      ...getPopupPosition(selectedTag.x, selectedTag.y, index),
                      width: isMobile ? "60%" : "220px",
                    }}
                  >
                    <img src={selectedTag.image} alt={selectedTag.name} className="w-24 h-24 object-contain rounded mb-2" />
                    <p className="text-md">{selectedTag.name}</p>
                    <p>{selectedTag.price}</p>
                    <button className="text-black flex gap-2 justify-center items-center text-xs mt-2">
                      <span>Shop Now</span>
                      <MoveRight size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Slider;
