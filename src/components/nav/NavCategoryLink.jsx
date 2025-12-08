// components/nav/NavCategoryLink.jsx
import { Link } from "react-router-dom";
import { gsap } from "gsap";

export const NavCategoryLink = ({ href, name, className }) => {
  const handleHover = (element, isEntering) => {
    gsap.to(element, { y: isEntering ? -2 : 0, duration: 0.3, ease: "power2.out" });
  };

  return (
    <Link
      to={href}
      className={`${className} font-normal no-underline hover:no-underline text-sm lg:text-base font-light tracking-wide relative group`}
      onMouseEnter={(e) => handleHover(e.target, true)}
      onMouseLeave={(e) => handleHover(e.target, false)}
    >
      {name}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};
