// components/ProductGrid.jsx
import { motion } from "framer-motion";
import { ProductInfoCard } from "../ProductInfoCard";

const getGridConfig = (width) => {
  if (width >= 1920) return { columns: "grid-cols-5", spacing: "gap-8" };
  if (width >= 1536) return { columns: "grid-cols-4", spacing: "gap-6" };
  if (width >= 1280) return { columns: "grid-cols-3", spacing: "gap-6" };
  if (width >= 1024) return { columns: "grid-cols-3", spacing: "gap-5" };
  if (width >= 640) return { columns: "grid-cols-2", spacing: "gap-4" }; // Changed from 768 to 640
  return { columns: "grid-cols-2", spacing: "gap-3" }; // Changed from 1 column to 2 columns with tighter spacing
};

export const ProductGrid = ({ 
  products, 
  loading, 
  dimensions,
  className = ""
}) => {
  const gridConfig = getGridConfig(dimensions.width);

  if (loading) {
    return (
      <div className={`grid ${gridConfig.columns} ${gridConfig.spacing} ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-2xl animate-pulse" // Reduced from rounded-3xl
          >
            <div className="p-4"> {/* Reduced padding from p-6 */}
              <div className="aspect-square bg-stone-200/80 rounded-xl mb-4" /> {/* Reduced margins and border radius */}
              <div className="space-y-3"> {/* Reduced spacing */}
                <div className="h-5 bg-stone-200/80 rounded-lg w-3/4" /> {/* Reduced height */}
                <div className="h-4 bg-stone-200/80 rounded w-1/2" />
                <div className="h-6 bg-stone-200/80 rounded-xl w-2/3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridConfig.columns} ${gridConfig.spacing} ${className}`}>
      {products.map((product, idx) => (
        <motion.div
          key={product._id || product.id || idx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: idx * 0.05,
            ease: "easeOut" 
          }}
          className="w-full"
        >
          <ProductInfoCard
            product={product}
            bg="white/60"
            className="h-full transform transition-all duration-500 hover:scale-[1.02]"
          />
        </motion.div>
      ))}
    </div>
  );
};
