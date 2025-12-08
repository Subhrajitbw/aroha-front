// components/sections/MobileSlider.jsx
import { motion } from "framer-motion";
import { ProductInfoCard } from "../ProductInfoCard";

const MobileSlider = ({
  products,
  isDesktop,
  desktopEntered,
  inView,
  mobileSliderControls,
}) => {
    console.log(products)
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: !isDesktop && desktopEntered && inView ? "0%" : "100%" }}
      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      className={`w-screen overflow-hidden ${
        !isDesktop && desktopEntered && inView
          ? ""
          : "pointer-events-none opacity-1"
      }`}
    >
      <motion.div
        className="flex gap-6 min-w-max"
        style={{ marginLeft: "3rem" }}
        initial={{ x: "3rem" }}
        animate={mobileSliderControls}
      >
        {[...products, ...products].map((product, idx) => (
          <div key={idx} className="flex-shrink-0">
            <ProductInfoCard product={product} size="300x400" isSmall={false} textColor="#fff" type="sec" />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MobileSlider;
