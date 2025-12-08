// components/ProductListView.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Star, Sparkles, Plus, ShoppingCart } from "lucide-react";

const FlatProductItem = ({ product, index, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group py-4 sm:py-5 lg:py-6 border-b border-stone-100 hover:bg-stone-50/30 transition-all duration-500 cursor-pointer"
    >
      {/* Mobile Layout (< 768px) */}
      <div className="block md:hidden">
        <div className="flex gap-4">
          {/* Mobile Image */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-stone-50 rounded-lg overflow-hidden shrink-0">
            <motion.img
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              src={product.image || product.images?.[0] || "/api/placeholder/400/400"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/api/placeholder/400/400";
              }}
            />
          </div>

          {/* Mobile Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <h3 className="text-base font-semibold text-stone-900 line-clamp-2 leading-tight">
                {product.name || "Exquisite Artisan Piece"}
              </h3>
              {product.category && (
                <span className="inline-block mt-1 px-2 py-1 bg-stone-100 text-stone-600 text-xs font-medium rounded-full">
                  {product.category}
                </span>
              )}
            </div>
            
            <p className="text-stone-500 text-sm mb-3 line-clamp-2">
              {product.description || product.shortDescription || "Masterfully crafted with uncompromising attention to detail."}
            </p>
            
            {/* Mobile Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${
                      i < (product.rating || 5) 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-stone-200 fill-stone-200'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-stone-600 font-medium">
                {product.rating || 4.9}
              </span>
              <span className="text-xs text-stone-400">
                ({product.reviewCount || Math.floor(Math.random() * 150) + 50})
              </span>
            </div>

            {/* Mobile Price & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-stone-900">
                    ₹{(product.price?.amount || product.price || Math.floor(Math.random() * 125000) + 35000).toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-semibold">
                      Save ₹{(product.originalPrice - (product.price?.amount || product.price)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddToCart && onAddToCart(product)}
                className="p-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet & Desktop Layout (≥ 768px) */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        {/* Desktop/Tablet Image */}
        <div className="relative w-32 h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 bg-stone-50 rounded-xl overflow-hidden shrink-0">
          <motion.img
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={product.image || product.images?.[0] || "/api/placeholder/400/400"}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/api/placeholder/400/400";
            }}
          />
          
          {/* Hover Actions - Desktop Only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3"
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white rounded-lg shadow-sm"
            >
              <Heart className="w-5 h-5 text-stone-600" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white rounded-lg shadow-sm"
            >
              <Eye className="w-5 h-5 text-stone-600" />
            </motion.button>
          </motion.div>
        </div>

        {/* Desktop/Tablet Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg lg:text-xl font-semibold text-stone-900 truncate pr-4">
              {product.name || "Exquisite Artisan Piece"}
            </h3>
            {product.category && (
              <span className="px-3 py-1.5 bg-stone-100 text-stone-600 text-sm font-medium rounded-full whitespace-nowrap">
                {product.category}
              </span>
            )}
          </div>
          
          <p className="text-stone-500 text-sm lg:text-base mb-4 line-clamp-2 leading-relaxed">
            {product.description || product.shortDescription || "Masterfully crafted with uncompromising attention to detail and sophisticated design philosophy."}
          </p>
          
          {/* Desktop/Tablet Rating */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 lg:w-5 lg:h-5 ${
                    i < (product.rating || 5) 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-stone-200 fill-stone-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm lg:text-base text-stone-600 font-medium">
              {product.rating || 4.9}
            </span>
            <span className="text-xs lg:text-sm text-stone-400">
              ({product.reviewCount || Math.floor(Math.random() * 150) + 50} reviews)
            </span>
          </div>
        </div>

        {/* Desktop/Tablet Price & Actions */}
        <div className="text-right space-y-4">
          <div>
            <div className="flex items-baseline gap-3 justify-end">
              <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-stone-900">
                ₹{(product.price?.amount || product.price || Math.floor(Math.random() * 125000) + 35000).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm lg:text-base text-stone-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <div className="flex items-center gap-1.5 justify-end mt-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-semibold">
                  Save ₹{(product.originalPrice - (product.price?.amount || product.price)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 lg:px-5 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-300 text-sm font-semibold"
            >
              Add to Collection
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddToCart && onAddToCart(product)}
              className="px-5 lg:px-6 py-2.5 bg-stone-900 text-white hover:bg-stone-800 rounded-lg transition-all duration-300 text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Acquire
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductListView = ({ 
  products, 
  loading,
  onAddToCart,
  className = ""
}) => {
  if (loading) {
    return (
      <div className={`space-y-0 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="py-4 sm:py-5 lg:py-6 border-b border-stone-100 animate-pulse"
          >
            {/* Mobile Skeleton */}
            <div className="block md:hidden">
              <div className="flex gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-stone-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-3 bg-stone-200 rounded w-2/3" />
                  <div className="h-4 bg-stone-200 rounded w-20" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-stone-200 rounded w-24" />
                    <div className="w-10 h-10 bg-stone-200 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop/Tablet Skeleton */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <div className="w-32 h-32 lg:w-40 lg:h-40 xl:w-44 xl:h-44 bg-stone-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-5 bg-stone-200 rounded w-40" />
              </div>
              <div className="text-right space-y-3">
                <div className="h-8 bg-stone-200 rounded w-32" />
                <div className="h-10 bg-stone-200 rounded w-28" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Responsive Header */}
      <div className="flex items-center justify-between py-4 sm:py-5 lg:py-6 border-b border-stone-200 mb-2">
        <div className="flex items-center gap-3 lg:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </h2>
          <span className="px-3 sm:px-4 py-1 sm:py-2 bg-stone-100 text-stone-600 text-xs sm:text-sm font-medium rounded-full">
            Curated Selection
          </span>
        </div>
      </div>

      {/* Responsive Product List */}
      <div className="space-y-0">
        {products.map((product, idx) => (
          <FlatProductItem
            key={product._id || product.id || idx}
            product={product}
            index={idx}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Responsive Footer */}
      {products.length > 0 && (
        <div className="py-6 sm:py-8 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 sm:px-8 py-3 border-2 border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base"
          >
            Load More Products
          </motion.button>
        </div>
      )}
    </div>
  );
};
