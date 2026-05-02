import React from "react";
import Link from "next/link";

const Logo = ({ logoRef, color, onMouseEnter }) => {
  return (
    <div className="flex items-center justify-center shrink-0 mx-4">
      <Link
        href="/"
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
