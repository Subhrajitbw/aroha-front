// components/nav/NavIcon.jsx
import { gsap } from "gsap";

export const NavIcon = ({ as: Component = "button", href, onClick, children, className, iconRef }) => {
  const handleHover = (isEntering) => {
    gsap.to(iconRef.current, { scale: isEntering ? 1.1 : 1, duration: 0.3, ease: "power2.out" });
  };

  if (Component === "a") {
    return (
      <a href={href} ref={iconRef} className={className} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
        {children}
      </a>
    );
  }

  return (
    <button ref={iconRef} onClick={onClick} className={className} onMouseEnter={() => handleHover(true)} onMouseLeave={() => handleHover(false)}>
      {children}
    </button>
  );
};
