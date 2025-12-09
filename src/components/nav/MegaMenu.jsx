// src/components/nav/MegaMenu.jsx
import React, { useRef, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ChevronRight, ArrowRight } from "lucide-react";

const MegaMenu = forwardRef(({ isOpen, content, caretPosition, onClose, onMouseLeave }, ref) => {
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.set(backdropRef.current, { display: "block" });
      gsap.to(backdropRef.current, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      
      gsap.fromTo(
        menuRef.current,
        { y: -30, scale: 0.95 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        contentRef.current?.querySelectorAll(".mega-column") || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.1,
        }
      );
    } else {
      gsap.to(menuRef.current, {
        y: -20,
        scale: 0.98,
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      
      gsap.to(backdropRef.current, {
        autoAlpha: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(backdropRef.current, { display: "none" });
        },
      });
    }
  }, [isOpen]);

  // Prevent click propagation on menu to avoid closing when clicking inside
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  if (!content || !content.columns?.length) return null;

  return (
    <>
      {/* Backdrop overlay - MODIFIED: Added pointer-events control */}
      <div
        ref={backdropRef}
        className="fixed inset-x-0 top-0 h-screen  z-40 pointer-events-auto"
        style={{ display: "none" }}
        onClick={onClose}
        onMouseEnter={onMouseLeave}
      />

      {/* Mega menu container - MODIFIED: Better event handling */}
      <div
        ref={(node) => {
          menuRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        className="absolute left-0 right-0 top-full mt-3 z-50 pointer-events-auto"
        style={{ visibility: "hidden" }}
        onMouseLeave={onMouseLeave}
        onClick={handleMenuClick}
      >
        {/* Caret indicator - properly positioned */}
        {typeof caretPosition === "number" && (
          <div
            className="absolute w-3 h-3 bg-white transform rotate-45 pointer-events-none"
            style={{
              top: "-6px",
              left: `${caretPosition}%`,
              marginLeft: "-6px",
              boxShadow: "-2px -2px 8px rgba(0,0,0,0.05)",
              zIndex: 51,
            }}
          />
        )}

        {/* Main menu panel - MODIFIED: Added hover bridge */}
        <div className="relative">
          {/* Invisible hover bridge to prevent gap issues */}
          <div 
            className="absolute -top-6 left-0 right-0 h-6 pointer-events-auto"
            aria-hidden="true"
          />
          
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-neutral-100 overflow-hidden mx-6">
            <div
              ref={contentRef}
              className="max-w-[1400px] mx-auto px-12 py-14 space-y-8"
            >
              <h2>Explore our Shop</h2>
              {/* Categories grid - full width */}
              <div className={`grid ${
                content.columns.length <= 3 ? 'grid-cols-3' : 
                content.columns.length <= 4 ? 'grid-cols-4' : 
                content.columns.length <= 6 ? 'grid-cols-5' :
                'grid-cols-6'
              } gap-x-12 gap-y-10`}>
                {content.columns.map((column, idx) => (
                  <div key={idx} className="mega-column">
                    {/* Column header */}
                    <Link
                      to={column.href}
                      onClick={onClose}
                      className="group block mb-6"
                    >
                      <h3 className="text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-900 group-hover:text-neutral-600 transition-colors duration-300 flex items-center gap-2 mb-3">
                        {column.title}
                        <ChevronRight
                          size={12}
                          strokeWidth={2}
                          className="translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
                        />
                      </h3>
                      <div className="h-[1px] bg-gradient-to-r from-neutral-200 via-neutral-300 to-transparent" />
                    </Link>

                    {/* Column items */}
                    <nav className="space-y-4">
                      {column.items?.slice(0, 5).map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.href}
                          onClick={onClose}
                          className="group flex items-start gap-3 text-[13px] text-neutral-600 hover:text-neutral-900 transition-all duration-300"
                        >
                          <span className="mt-1.5 w-[3px] h-[3px] rounded-full bg-neutral-300 group-hover:bg-neutral-900 group-hover:w-[5px] group-hover:h-[5px] transition-all duration-300 flex-shrink-0" />
                          <span className="leading-relaxed tracking-wide group-hover:translate-x-0.5 transition-transform duration-300">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </nav>

                    {/* View all link */}
                    {column.items?.length > 5 && (
                      <Link
                        to={column.href}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors mt-5 tracking-wide"
                      >
                        <span>View all</span>
                        <ArrowRight size={11} strokeWidth={2} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;
