// components/category/CategoryTab.jsx
import { motion } from "framer-motion";

export default function CategoryTab({ category, isSelected, onClick }) {
  const getCategoryName = () => {
    if (category?.name) return category.name;
    if (category?.title) return category.title;
    if (typeof category === 'string') return category;
    return 'Unknown Category';
  };

  const categoryName = getCategoryName();

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative px-6 py-2.5 text-xs md:text-sm font-medium tracking-[0.25em] uppercase 
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-none
        flex-shrink-0 group overflow-hidden
        ${
          isSelected
            ? "text-white"
            : "text-stone-600 hover:text-stone-900"
        }
      `}
    >
      {/* Background Layer */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isSelected ? "#1c1917" : "rgba(255, 255, 255, 0)",
          opacity: 1
        }}
        className="absolute inset-0 z-0"
      />

      {/* Hover Background - Subtle line or block */}
      {!isSelected && (
        <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-stone-900 transition-all duration-500 ease-out group-hover:w-full group-hover:left-0" />
      )}

      {/* Content */}
      <span className="relative z-10">
        {categoryName}
      </span>

      {/* Luxury Border/Accent for active state */}
      {isSelected && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 border border-stone-800 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}
