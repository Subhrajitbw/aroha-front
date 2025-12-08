"use client";

import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";
import CarouselCard from "./CarouselCard";

const VerticalSlider = ({ products }) => {
  const [index, setIndex] = useState(0);
  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const bind = useDrag(({ down, movement: [, my], direction: [, dy], distance, cancel }) => {
    if (down && distance > 100) {
      if (dy > 0 && index > 0) {
        setIndex(index - 1);
        cancel();
      } else if (dy < 0 && index < products.length - 1) {
        setIndex(index + 1);
        cancel();
      }
    }
    api.start({ y: down ? my : 0 });
  });

  return (
    <div className="relative w-full h-full flex flex-col items-end overflow-hidden">
      <animated.div
        {...bind()}
        style={{ y }}
        className="flex flex-col will-change-transform"
      >
        {products.map((product, i) => (
          <div key={i} className="w-full mb-8">
            <CarouselCard product={product} color="bg-white" />
          </div>
        )).slice(index, index + 3)}
      </animated.div>
    </div>
  );
};

export default VerticalSlider;
