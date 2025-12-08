import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { ProductInfoCard } from "../ProductInfoCard";

const SliderColumn = ({
  products,
  isDesktop,
  inView,
  desktopEntered,
  invertLayout,
  desktopControls,
  mobileSliderControls,
  cardSize = "md",
  gap = 16,
  textColor = "#fff"
}) => {
  
  const cardWidths = useMemo(() => ({
    xs: 160,
    sm: 192,
    md: 224,
    lg: 256,
    xl: 288,
  }), []);
  
  const currentCardWidth = cardWidths[cardSize] || cardWidths.md;

  // --- Desktop Layout ---
  if (isDesktop) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: desktopEntered && inView ? "0%" : "100%" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`hidden md:block w-1/2 h-screen overflow-hidden ${
          desktopEntered && inView ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <motion.div
          style={{ marginTop: "6rem", gap: `${gap * 2}px` }}
          initial={{ y: "6rem" }}
          animate={desktopControls}
          className={`flex flex-col pb-20 ${
            invertLayout ? "items-start pl-10" : "items-end pr-10"
          }`}
        >
          {[...products, ...products].map((product, idx) => (
            <div 
              key={`${product.id}-${idx}`} 
              className="flex-shrink-0"
              style={{ width: `${currentCardWidth}px` }}
            >
              <ProductInfoCard 
                product={product} 
                isFluid={true} 
                type="sec"
              />
            </div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // --- Mobile Layout ---
  console.log("🔵 Mobile Layout - Rendering with type='sec'"); // Debug log
  
  return (
    <div className="block md:hidden w-full mt-6 overflow-hidden">
      <motion.div
        animate={mobileSliderControls}
        className="flex overflow-x-auto snap-x snap-mandatory pb-8 hide-scrollbar"
        style={{
           gap: `${gap}px`,
           paddingLeft: `${gap}px`,
           paddingRight: `${gap}px`,
           WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="snap-center shrink-0"
            style={{ width: `${currentCardWidth}px` }}
          >
            <ProductInfoCard 
              product={product} 
              isFluid={true} 
              type="sec"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SliderColumn;
