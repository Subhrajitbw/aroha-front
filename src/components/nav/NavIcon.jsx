import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export const NavIcon = ({ as: Component = "button", href, onClick, children, className, iconRef }) => {
  const localRef = useRef(null);

  // Sync localRef with external iconRef (could be a function or a ref object)
  useEffect(() => {
    if (!iconRef) return;
    if (typeof iconRef === "function") {
      iconRef(localRef.current);
    } else {
      iconRef.current = localRef.current;
    }
  }, [iconRef]);

  const handleHover = (isEntering) => {
    if (localRef.current) {
      gsap.to(localRef.current, { 
        scale: isEntering ? 1.1 : 1, 
        duration: 0.3, 
        ease: "power2.out" 
      });
    }
  };

  if (Component === "a") {
    return (
      <a 
        href={href} 
        ref={localRef} 
        className={className} 
        onMouseEnter={() => handleHover(true)} 
        onMouseLeave={() => handleHover(false)}
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      ref={localRef} 
      onClick={onClick} 
      className={className} 
      onMouseEnter={() => handleHover(true)} 
      onMouseLeave={() => handleHover(false)}
    >
      {children}
    </button>
  );
};
