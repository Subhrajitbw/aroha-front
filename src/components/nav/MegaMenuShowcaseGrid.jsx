import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animation for each individual item in the showcase
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const MegaMenuShowcaseGrid = ({ showcase = [] }) => {
  if (!showcase || showcase.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-neutral-400 text-sm">No featured products</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }} // Stagger the animation of children
      // --- This is the core of the dynamic masonry layout ---
      // 'columns-2' creates a 2-column layout.
      // 'gap-3' creates the space between items.
      // 'space-y-3' adds vertical space between items in the same column.
      className="columns-2 gap-3 space-y-3"
    >
      {showcase.slice(0, 6).map((item) => (
        <motion.div
          key={item.href}
          variants={itemVariants}
          // 'break-inside-avoid' is crucial to prevent items from breaking across columns.
          className="break-inside-avoid"
        >
          <Link
            to={item.href}
            className="group block w-full h-full overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.name || 'Showcase product'}
              className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              loading="lazy"
            />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MegaMenuShowcaseGrid;
