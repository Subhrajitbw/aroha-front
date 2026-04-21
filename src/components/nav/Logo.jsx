import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ logoRef, color, onMouseEnter }) => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <Link
        to="/home"
        ref={logoRef}
        className={`text-2xl lg:text-3xl font-light tracking-[0.3em] ${color} transition-all duration-500 hover:tracking-[0.5em]`}
        style={{
          fontFamily: "Playfair Display, serif",
          textDecoration: "none",
        }}
        onMouseEnter={onMouseEnter}
      >
        AROHA
      </Link>
    </div>
  );
};

export default Logo;
