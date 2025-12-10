// src/components/nav/MegaMenuColumn.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import { MEGA_MENU_CONFIG } from "../../utils/megaMenuLayout";

export const MegaMenuColumn = ({ column, onClose }) => {
  const maxItems = MEGA_MENU_CONFIG.MAX_ITEMS_PER_COLUMN;
  const displayItems = column.items?.slice(0, maxItems) || [];
  const hasMoreItems = (column.items?.length || 0) > maxItems;

  return (
    <div className="mega-column">
      {/* Column header */}
      <Link to={column.href} onClick={onClose} className="group block mb-6">
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
        {displayItems.map((item, itemIdx) => (
          <MegaMenuItem key={itemIdx} item={item} onClose={onClose} />
        ))}
      </nav>

      {/* View all link */}
      {hasMoreItems && (
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
  );
};

const MegaMenuItem = ({ item, onClose }) => (
  <Link
    to={item.href}
    onClick={onClose}
    className="group flex items-start gap-3 text-[13px] text-neutral-600 hover:text-neutral-900 transition-all duration-300"
  >
    <span className="mt-1.5 w-[3px] h-[3px] rounded-full bg-neutral-300 group-hover:bg-neutral-900 group-hover:w-[5px] group-hover:h-[5px] transition-all duration-300 flex-shrink-0" />
    <span className="leading-relaxed tracking-wide group-hover:translate-x-0.5 transition-transform duration-300">
      {item.name}
    </span>
  </Link>
);
