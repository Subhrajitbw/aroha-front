// components/hero/ProgressBar.jsx
import React from "react";

const ProgressBar = ({ progress, isTransitioning }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-white/10 z-30">
      <div
        className="h-full bg-gradient-to-r from-white via-white/90 to-white/70"
        style={{
          width: `${progress}%`,
          willChange: "width",
          transition: isTransitioning ? "none" : "width 0.1s ease-linear",
        }}
      />
    </div>
  );
};

export default ProgressBar;
