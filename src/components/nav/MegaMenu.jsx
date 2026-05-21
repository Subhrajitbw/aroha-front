// src/components/nav/MegaMenu.jsx
import React, { useRef, useEffect, forwardRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ChevronRight } from "lucide-react";

const MegaMenu = forwardRef(({ isOpen, content, caretPosition, onClose, onMouseLeave }, ref) => {
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!menuRef.current || !backdropRef.current) return;

    if (isOpen) {
      gsap.set(backdropRef.current, { display: "block" });
      gsap.to(backdropRef.current, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(
        menuRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out" }
      );
      gsap.fromTo(
        contentRef.current?.querySelectorAll(".mega-column") || [],
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: "power2.out", delay: 0.08 }
      );
    } else {
      gsap.to(menuRef.current, { y: -8, autoAlpha: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(backdropRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => gsap.set(backdropRef.current, { display: "none" }),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!content || !content.columns?.length) return null;

  const colCount = content.columns.length;
  const gridCols =
    colCount <= 3 ? "grid-cols-3" :
    colCount <= 4 ? "grid-cols-4" :
    colCount <= 5 ? "grid-cols-5" :
    "grid-cols-6";

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40 pointer-events-auto"
        style={{ display: "none" }}
        onClick={onClose}
        onMouseEnter={onMouseLeave}
      />

      {/* Menu container */}
      <div
        ref={(node) => {
          menuRef.current = node;
          if (ref) {
            if (typeof ref === "function") ref(node);
            else ref.current = node;
          }
        }}
        className="absolute left-0 right-0 top-full mt-2 z-50 pointer-events-auto"
        style={{ visibility: "hidden" }}
        onMouseLeave={onMouseLeave}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caret */}
        {caretPosition != null && (
          <div
            className="absolute w-2.5 h-2.5 bg-white rotate-45 pointer-events-none z-[51]"
            style={{
              top: "-5px",
              left: `${caretPosition}px`,
              marginLeft: "-5px",
              boxShadow: "-1px -1px 4px rgba(0,0,0,0.06)",
            }}
          />
        )}

        {/* Hover bridge */}
        <div className="absolute -top-4 left-0 right-0 h-4 pointer-events-auto" aria-hidden="true" />

        {/* Panel */}
        <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-neutral-100/80 overflow-hidden mx-2">
          <div ref={contentRef} className="px-8 py-6">
            <div className={`grid ${gridCols} gap-x-8`}>
              {content.columns.map((column, idx) => (
                <div key={idx} className="mega-column min-w-0">
                  {/* Column title */}
                  <Link
                    href={column.href}
                    onClick={onClose}
                    className="group flex items-center gap-1.5 mb-3"
                  >
                    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-900 group-hover:text-neutral-600 transition-colors whitespace-nowrap">
                      {column.title}
                    </span>
                    <ChevronRight
                      size={10}
                      strokeWidth={2.5}
                      className="text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>

                  {/* Separator */}
                  <div className="h-px bg-neutral-100 mb-3" />

                  {/* Items */}
                  <ul className="space-y-1.5">
                    {column.items?.slice(0, 6).map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="block text-[12.5px] text-neutral-500 hover:text-neutral-900 transition-colors whitespace-nowrap truncate py-0.5"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured section (if available) */}
            {content.featured?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center gap-6">
                {content.featured.slice(0, 2).map((feat, idx) => (
                  <Link
                    key={idx}
                    href={feat.href}
                    onClick={onClose}
                    className="group flex items-center gap-3"
                  >
                    {feat.image && (
                      <img
                        src={feat.image}
                        alt={feat.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <span className="text-[11px] font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors whitespace-nowrap">
                        {feat.title}
                      </span>
                      {feat.subtitle && (
                        <span className="block text-[10px] text-neutral-400">{feat.subtitle}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
