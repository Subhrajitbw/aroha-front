// src/components/nav/MegaMenu.jsx
import React, { useRef, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ChevronRight, ArrowRight } from "lucide-react";

const MegaMenu = forwardRef(({ isOpen, content, onClose, onMouseLeave }, ref) => {
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
        { y: -24, scale: 0.98, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.55,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        contentRef.current?.querySelectorAll(".mega-column") || [],
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.12,
        }
      );
    } else {
      gsap.to(menuRef.current, {
        y: -16,
        scale: 0.98,
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
      });

      gsap.to(backdropRef.current, {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(backdropRef.current, { display: "none" });
        },
      });
    }
  }, [isOpen]);

  const handleMenuClick = (e) => e.stopPropagation();

  if (!content || !content.columns?.length) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        className="fixed inset-x-0 top-0 h-screen z-40 pointer-events-auto"
        style={{ display: "none" }}
        onClick={onClose}
        onMouseEnter={onMouseLeave}
      />

      {/* ── Mega Menu Container ── */}
      <div
        ref={(node) => {
          menuRef.current = node;
          if (ref) {
            typeof ref === "function" ? ref(node) : (ref.current = node);
          }
        }}
        className="absolute left-0 right-0 top-full z-50 pointer-events-auto"
        style={{ visibility: "hidden", marginTop: "2px" }}
        onMouseLeave={onMouseLeave}
        onClick={handleMenuClick}
      >
        {/* ── Hover bridge (prevents gap flicker) ── */}
        <div
          className="absolute -top-5 left-0 right-0 h-5 pointer-events-auto"
          aria-hidden="true"
        />

        {/* ── Panel ── */}
        <div
          className="relative w-screen"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 15, 15, 0.85)",
            backdropFilter: "blur(60px) saturate(120%)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            overflow: "hidden",
          }}
        >
          {/* Gold hairline at top */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "64px",
              right: "64px",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.2) 20%, rgba(232, 213, 163, 0.3) 50%, rgba(201, 169, 110, 0.2) 80%, transparent)",
              opacity: 1,
              zIndex: 0,
            }}
          />

          {/* ── Inner layout ── */}
          <div
            ref={contentRef}
            className="relative z-10 flex mx-auto max-w-[1400px] px-8 md:px-16 pt-16 pb-20"
          >
            {/* ─── LEFT PANE: Directory ─── */}
            <div className="w-[55%] lg:w-[60%] pr-12 lg:pr-24 border-r border-stone-800/60 flex flex-col">
              {/* Section label */}
              <div className="flex items-center gap-4 mb-10">
                <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#c9a96e] whitespace-nowrap">
                  The Directory
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-stone-800 to-transparent" />
              </div>

              {/* Columns grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
                {content.columns.map((column, idx) => (
                  <div key={idx} className="mega-column flex flex-col">
                    {/* Column heading */}
                    <Link
                      to={column.href}
                      onClick={onClose}
                      className="group inline-flex items-center gap-2 mb-3"
                    >
                      <span className="font-serif text-sm lg:text-base tracking-[0.1em] uppercase text-stone-200 group-hover:text-[#c9a96e] transition-colors duration-300">
                        {column.title}
                      </span>
                      <ChevronRight
                        size={14}
                        strokeWidth={1.5}
                        className="text-[#c9a96e] opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                      />
                    </Link>

                    {/* Gold rule */}
                    <div className="w-8 h-[1px] bg-[#c9a96e]/40 mb-6" />

                    {/* Items */}
                    <nav className="flex flex-col gap-3">
                      {column.items?.slice(0, 5).map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          to={item.href}
                          onClick={onClose}
                          className="group flex items-center gap-3"
                        >
                          <span className="w-1 h-1 rounded-full bg-stone-700 transition-colors duration-300 group-hover:bg-[#c9a96e]" />
                          <span className="text-[11px] lg:text-xs tracking-[0.15em] uppercase text-stone-400 group-hover:text-[#c9a96e] group-hover:translate-x-1 transition-all duration-300">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </nav>

                    {column.items?.length > 5 && (
                      <Link
                        to={column.href}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 mt-5 group"
                      >
                        <span className="text-[10px] tracking-[0.2em] uppercase text-stone-600 group-hover:text-[#c9a96e] transition-colors duration-300">
                          View All
                        </span>
                        <ArrowRight
                          size={12}
                          strokeWidth={1.5}
                          className="text-stone-600 group-hover:text-[#c9a96e] group-hover:translate-x-1 transition-all duration-300"
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ─── RIGHT PANE: Curated Focus ─── */}
            <div className="w-[45%] lg:w-[40%] pl-12 lg:pl-24 flex flex-col">
              {/* Section label */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-medium tracking-[0.3em] uppercase text-[#c9a96e] whitespace-nowrap">
                    Curated Focus
                  </span>
                  <div className="w-12 h-[1px] bg-gradient-to-r from-stone-800 to-transparent" />
                </div>
                <Link
                  to="/lookbook"
                  onClick={onClose}
                  className="text-[10px] tracking-[0.2em] uppercase text-stone-500 hover:text-[#c9a96e] border-b border-stone-800 hover:border-[#c9a96e] pb-[2px] transition-colors"
                >
                  Lookbook ›
                </Link>
              </div>

              {/* Featured cards */}
              <div className="flex-1 grid grid-cols-2 gap-6 min-h-[350px]">
                {content.featured?.slice(0, 2).map((item, idx) => (
                  <Link
                    to={item.href}
                    onClick={onClose}
                    key={idx}
                    className="mega-column group relative overflow-hidden flex flex-col justify-end bg-stone-900 border border-stone-800/50"
                  >
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105 brightness-[0.7] group-hover:brightness-90"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Gold border reveal */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-[#c9a96e]/30 transition-colors duration-700 pointer-events-none z-20" />

                    {/* Card content */}
                    <div className="relative z-10 p-6 lg:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
                      <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9a96e] opacity-80 mb-3">
                        No. 0{idx + 1}
                      </p>
                      <h4 className="font-serif text-xl lg:text-3xl font-light text-stone-100 tracking-wide leading-tight group-hover:text-white transition-colors duration-500">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-[10px] lg:text-[11px] tracking-[0.2em] uppercase text-[#c9a96e]/70 mt-3 group-hover:text-[#c9a96e] transition-colors duration-500">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer strip ── */}
          <div className="relative z-1 h-[1px] mx-8 md:mx-16 bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mx-auto gap-4 md:gap-0 max-w-[1400px] px-8 md:px-16 py-6">
            <span className="font-serif text-xs md:text-sm italic text-stone-500 tracking-[0.06em]">
              "Curating spaces of undeniable intention." — Aroha
            </span>
            <div className="flex items-center gap-6 md:gap-8">
              {[
                { label: "New Arrivals", href: "/shop" },
                { label: "Editorials", href: "/lookbook" },
                { label: "Client Services", href: "/account" },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={onClose}
                  className="group inline-flex items-center gap-2"
                >
                  <span className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-stone-400 group-hover:text-[#c9a96e] transition-colors duration-300">
                    {link.label}
                  </span>
                  <ArrowRight
                    size={10}
                    strokeWidth={1.5}
                    className="text-stone-400 group-hover:text-[#c9a96e] group-hover:translate-x-1 transition-all duration-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;