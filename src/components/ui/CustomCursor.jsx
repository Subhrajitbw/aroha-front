import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Completely hide default system cursor globally
    const style = document.createElement("style");
    style.id = "hide-default-cursor";
    style.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const onMouseMove = (e) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out",
        });
      }
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.6,
          ease: "power3.out",
        });
      }
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer')) {
        setIsHovering(true);
        if (ringRef.current) gsap.to(ringRef.current, { scale: 1.8, backgroundColor: "rgba(255, 255, 255, 0.1)", duration: 0.3 });
        if (cursorRef.current) gsap.to(cursorRef.current, { scale: 0, duration: 0.2 });
      } else {
        setIsHovering(false);
        if (ringRef.current) gsap.to(ringRef.current, { scale: 1, backgroundColor: "transparent", duration: 0.3 });
        if (cursorRef.current) gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", onMouseMove);
      const injectedStyle = document.getElementById("hide-default-cursor");
      if (injectedStyle) injectedStyle.remove();
    };
  }, []);

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/60 pointer-events-none z-[9999] hidden md:block"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      {/* Inner Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] hidden md:block"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  );
};

export default CustomCursor;
