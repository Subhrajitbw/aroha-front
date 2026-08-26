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

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animationFrameId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    const render = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    document.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
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
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[9999] hidden md:block mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      {/* Inner Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000] hidden md:block mix-blend-difference"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </>
  );
};

export default CustomCursor;
