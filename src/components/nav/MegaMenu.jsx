// src/components/nav/MegaMenu.jsx
import React, { useRef, useEffect, forwardRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ChevronRight, ArrowRight } from "lucide-react";

const MegaMenu = forwardRef(({ isOpen, content, onClose, onMouseLeave }, ref) => {
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isOpen) {
        if (!backdropRef.current || !menuRef.current) return;

        gsap.set(backdropRef.current, { display: "block" });
        gsap.to(backdropRef.current, {
          autoAlpha: 1,
          duration: 0.25,
          ease: "power2.out",
        });

        gsap.fromTo(
          menuRef.current,
          { y: -12, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.3,
            ease: "power3.out",
          }
        );

        const columns = contentRef.current?.querySelectorAll(".mega-column");
        if (columns?.length) {
          gsap.fromTo(
            columns,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.35,
              stagger: 0.03,
              ease: "power2.out",
              delay: 0.08,
            }
          );
        }
      } else {
        if (!menuRef.current || !backdropRef.current) return;

        gsap.to(menuRef.current, {
          y: -8,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        });

        gsap.to(backdropRef.current, {
          autoAlpha: 0,
          duration: 0.18,
          ease: "power2.in",
          onComplete: () => {
            if (backdropRef.current) {
              gsap.set(backdropRef.current, { display: "none" });
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  const handleMenuClick = (e) => e.stopPropagation();

  if (!content || !content.columns?.length) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        className="fixed inset-x-0 top-0 h-screen z-40 pointer-events-auto"
        style={{ display: "none", background: "rgba(0,0,0,0.08)" }}
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
        {/* ── Hover bridge ── */}
        <div className="absolute -top-5 left-0 right-0 h-5 pointer-events-auto" aria-hidden="true" />

        {/* ── Panel ── */}
        <div
          className="relative w-screen"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.97)",
            backdropFilter: "blur(40px) saturate(120%)",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            overflow: "hidden",
          }}
        >
          {/* Subtle top accent line */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-16 right-16 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(168,162,158,0.3) 30%, rgba(168,162,158,0.4) 50%, rgba(168,162,158,0.3) 70%, transparent)",
            }}
          />

          {/* ── Inner layout ── */}
          <div
            ref={contentRef}
            className="relative z-10 flex mx-auto max-w-[1400px] px-8 md:px-16 pt-12 pb-14"
          >
            {/* ─── LEFT PANE: Directory ─── */}
            <div className="w-full  flex flex-col">


              {/* Columns grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                {content.columns.map((column, idx) => (
                  <div key={idx} className="mega-column flex flex-col">
                    {/* Column heading */}
                    <Link
                      href={column.href}
                      onClick={onClose}
                      className="group inline-flex items-center gap-1.5 mb-4"
                    >
                      <span className="text-sm font-semibold tracking-wide uppercase text-stone-900 group-hover:text-stone-600 transition-colors duration-200">
                        {column.title}
                      </span>
                      <ChevronRight
                        size={13}
                        strokeWidth={2}
                        className="text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </Link>

                    {/* Items */}
                    <nav className="flex flex-col gap-1">
                      {column.items?.slice(0, 6).map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          onClick={onClose}
                          className="group flex items-center gap-2.5 py-1.5 rounded-lg hover:bg-stone-50 px-2 -mx-2 transition-colors duration-150"
                        >
                          <span className="w-1 h-1 rounded-full bg-stone-300 group-hover:bg-stone-900 transition-colors duration-200" />
                          <span className="text-xs tracking-wide text-stone-500 group-hover:text-stone-900 transition-colors duration-200">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </nav>

                    {column.items?.length > 6 && (
                      <Link
                        href={column.href}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 mt-3 group px-2 -mx-2"
                      >
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-400 group-hover:text-stone-900 transition-colors duration-200">
                          View All
                        </span>
                        <ArrowRight
                          size={10}
                          strokeWidth={2}
                          className="text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all duration-200"
                        />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* ── Footer strip ── */}
          <div className="h-px mx-8 md:mx-16 bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
          <div className="flex flex-col md:flex-row items-center justify-between mx-auto gap-3 md:gap-0 max-w-[1400px] px-8 md:px-16 py-4">
            <span className="font-serif text-xs italic text-stone-400 tracking-wide">
              "Curating spaces of undeniable intention." — Aroha
            </span>
            <div className="flex items-center gap-6">
              {[
                { label: "New Arrivals", href: "/shop" },
                { label: "Editorials", href: "/lookbook" },
                { label: "Client Services", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className="group inline-flex items-center gap-1.5"
                >
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-400 group-hover:text-stone-900 transition-colors duration-200">
                    {link.label}
                  </span>
                  <ArrowRight
                    size={10}
                    strokeWidth={2}
                    className="text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all duration-200"
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