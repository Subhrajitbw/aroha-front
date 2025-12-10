// src/components/nav/MegaMenu.jsx
import React, { forwardRef } from "react";
import { MegaMenuColumn } from "./MegaMenuColumn";
import { useMegaMenuAnimation } from "../../hooks/useMegaMenuAnimation";
import { getGridColumns } from "../../utils/megaMenuLayout";

const MegaMenu = forwardRef(
  ({ isOpen, content, caretPosition, onClose, onMouseLeave }, ref) => {
    const { menuRef, backdropRef, contentRef } = useMegaMenuAnimation(isOpen);

    // Prevent click propagation on menu
    const handleMenuClick = (e) => {
      e.stopPropagation();
    };

    // Merge refs
    const setMenuRef = (node) => {
      menuRef.current = node;
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    if (!content || !content.columns?.length) return null;

    const gridColumns = getGridColumns(content.columns.length);

    return (
      <>
        {/* Backdrop overlay */}
        <div
          ref={backdropRef}
          className="fixed inset-x-0 top-0 h-screen z-40 pointer-events-auto"
          style={{ display: "none" }}
          onClick={onClose}
          onMouseEnter={onMouseLeave}
          aria-hidden="true"
        />

        {/* Mega menu container */}
        <div
          ref={setMenuRef}
          className="absolute left-0 right-0 top-full mt-3 z-50 pointer-events-auto"
          style={{ visibility: "hidden" }}
          onMouseLeave={onMouseLeave}
          onClick={handleMenuClick}
          role="menu"
          aria-label="Shop navigation"
        >
          <CaretIndicator position={caretPosition} />

          {/* Main menu panel */}
          <div className="relative">
            {/* Invisible hover bridge */}
            <div
              className="absolute -top-6 left-0 right-0 h-6 pointer-events-auto"
              aria-hidden="true"
            />

            <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-neutral-100 overflow-hidden mx-6">
              <div
                ref={contentRef}
                className="max-w-[1400px] mx-auto px-12 py-14 space-y-8"
              >
                <h2 className="text-base font-medium text-neutral-900">
                  Explore our Shop
                </h2>

                {/* Categories grid */}
                <div className={`grid ${gridColumns} gap-x-12 gap-y-10`}>
                  {content.columns.map((column, idx) => (
                    <MegaMenuColumn
                      key={column.href || idx}
                      column={column}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

// Caret indicator sub-component
const CaretIndicator = ({ position }) => {
  if (typeof position !== "number") return null;

  return (
    <div
      className="absolute w-3 h-3 bg-white transform rotate-45 pointer-events-none"
      style={{
        top: "-6px",
        left: `${position}%`,
        marginLeft: "-6px",
        boxShadow: "-2px -2px 8px rgba(0,0,0,0.05)",
        zIndex: 51,
      }}
      aria-hidden="true"
    />
  );
};

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
