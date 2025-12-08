// components/productSlider/SliderContent.jsx
import { animated } from "@react-spring/web";
import { ProductInfoCard } from "../ProductInfoCard";
import SliderEmptyState from "./SliderEmptyState";

export default function SliderContent({
  products,
  cardWidth,
  gap,
  isDragging,
  x,
  draggableRef,
  cardSize,
  containerRef,
  bg
}) {
  return (
    <div
      className="overflow-hidden flex-1"
      ref={containerRef}
      role="region"
      aria-label="Product slider"
    >
      {products.length === 0 ? (
        <SliderEmptyState />
      ) : (
        <animated.div
          ref={draggableRef}
          className="flex select-none"
          style={{
            width: `${products.length * (cardWidth + gap) - gap}px`,
            transform: x.to((xVal) => `translate3d(${xVal}px, 0, 0)`),
            gap: `${gap}px`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {products.map((product, idx) => (
            <div
              key={product._id || product.id || idx}
              style={{ width: `${cardWidth}px`, flexShrink: 0 }}
            >
              <ProductInfoCard 
                product={product} 
                size={cardSize} 
                className="h-full"
                bg={bg}
              />
            </div>
          ))}
        </animated.div>
      )}
    </div>
  );
}
