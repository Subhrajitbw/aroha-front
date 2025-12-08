import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MegaMenu = ({ isOpen, content, onClose, caretPosition }) => {
  if (!content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-0 top-full w-full pt-4 z-[60]" // pt-4 creates the gap for the caret
          onMouseLeave={onClose}
        >
          {/* Caret (Triangle) Pointer */}
          {caretPosition !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-[10px] w-3 h-3 bg-white border-t border-l border-neutral-100 rotate-45 z-[61]"
              style={{ left: `${caretPosition}%`, transform: 'translateX(-50%) rotate(45deg)' }}
            />
          )}

          {/* Main Container */}
          <div className="relative mx-auto max-w-7xl">
            <div className="bg-white/95 backdrop-blur-xl border border-neutral-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm overflow-hidden">
              <div className="grid grid-cols-12 min-h-[320px]">
                
                {/* Columns Section */}
                <div className="col-span-8 p-10 lg:p-12">
                  <div className="grid grid-cols-3 gap-12">
                    {content.columns?.map((col, idx) => (
                      <div key={idx} className="space-y-6">
                        {/* Column Title */}
                        <Link 
                          to={col.href}
                          className="block font-serif text-lg text-neutral-900 hover:text-neutral-600 transition-colors tracking-wide"
                        >
                          {col.title}
                        </Link>
                        
                        {/* Column Links */}
                        {col.items && col.items.length > 0 && (
                          <ul className="space-y-3">
                            {col.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link
                                  to={item.href}
                                  className="group flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-light"
                                >
                                  <span className="relative">
                                    {item.name}
                                    <span className="absolute -bottom-px left-0 w-0 h-px bg-neutral-900 transition-all duration-300 group-hover:w-full"></span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Showcase / Featured Section */}
                <div className="col-span-4 bg-neutral-50/50 border-l border-neutral-100 p-10 lg:p-12 relative">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400 mb-6 block">
                    Editorial
                  </span>

                  {content.featured && content.featured.map((feat, idx) => (
                    <Link 
                      key={idx} 
                      to={feat.href}
                      className="group block relative w-full aspect-[4/3] overflow-hidden bg-neutral-200"
                    >
                      <img 
                        src={feat.image} 
                        alt={feat.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                      
                      {/* Text Content */}
                      <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <div className="flex items-end justify-between">
                          <h4 className="font-serif text-xl leading-tight max-w-[70%]">
                            {feat.title}
                          </h4>
                          <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;