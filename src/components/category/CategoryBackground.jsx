// src/components/category/CategoryBackground.jsx
import React, { forwardRef } from "react";

const CategoryBackground = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {/* Floating orbs */}
      <div className="luxury-orb pointer-events-none absolute top-1/5 left-[8%] w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-amber-200/30 to-orange-300/15 rounded-full blur-3xl" />
      <div className="luxury-orb pointer-events-none absolute bottom-1/5 right-[8%] w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-gradient-to-br from-rose-200/25 to-pink-300/10 rounded-full blur-3xl" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-amber-50/40" />
      
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

CategoryBackground.displayName = "CategoryBackground";

export default CategoryBackground;
