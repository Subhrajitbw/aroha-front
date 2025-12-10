// src/components/nav/NavLeft.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Menu, X, BookOpen, ChevronDown } from "lucide-react";
import { NavIcon } from "./NavIcon";

export const NavLeft = ({
  isMobile,
  colors,
  menuOpen,
  toggleMenu,
  iconsRef,
  shopButtonRef,
  chevronRef,
  megaMenuOpen,
  handleShopClick,
  handleChevronHover,
  closeMegaMenu,
}) => {
  if (isMobile) {
    return (
      <>
        <NavIcon
          onClick={toggleMenu}
          className={`${colors.navTextColor} ${colors.navHoverColor}`}
          iconRef={(el) => (iconsRef.current[0] = el)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </NavIcon>

        <Link
          to="/lookbook"
          className={`${colors.navTextColor} ${colors.navHoverColor} transition-colors flex items-center justify-center`}
          aria-label="View Lookbook"
        >
          <BookOpen size={18} strokeWidth={2} />
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          ref={shopButtonRef}
          type="button"
          onClick={handleShopClick}
          className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
        >
          Shop
        </button>
        <button
          ref={chevronRef}
          type="button"
          onMouseEnter={handleChevronHover}
          className={`${colors.navTextColor} ${colors.navHoverColor} transition-all`}
          aria-label="Open shop menu"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              megaMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <Link
        to="/lookbook"
        className={`text-xs tracking-[0.24em] uppercase ${colors.navTextColor} ${colors.navHoverColor} transition-colors`}
        onMouseEnter={closeMegaMenu}
      >
        Lookbook
      </Link>
    </>
  );
};
