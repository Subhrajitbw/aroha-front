// src/components/nav/NavLogo.jsx
import React from "react";
import { Link } from "react-router-dom";

export const NavLogo = ({ logoRef, colors, closeMegaMenu }) => {
  return (
    <Link
      to="/home"
      ref={logoRef}
      className={`text-xl lg:text-2xl font-light tracking-[0.3em] ${colors.logoColor} transition-all duration-500 hover:tracking-[0.5em]`}
      style={{
        fontFamily: "Playfair Display, serif",
        textDecoration: "none",
      }}
      onMouseEnter={closeMegaMenu}
    >
      AROHA
    </Link>
  );
};
