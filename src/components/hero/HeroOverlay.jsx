// components/hero/HeroOverlay.jsx
import React, { forwardRef } from "react";

const HeroOverlay = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="absolute inset-0 z-10"
      style={{ willChange: "opacity" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
    </div>
  );
});

HeroOverlay.displayName = "HeroOverlay";
export default HeroOverlay;
