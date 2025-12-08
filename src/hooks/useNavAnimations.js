// hooks/useNavAnimations.js
import { useEffect } from "react";
import { gsap } from "gsap";

export const useNavAnimations = (navRef, logoRef, iconsRef) => {
  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 });
    gsap.fromTo(logoRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.3)", delay: 0.5 });
    gsap.fromTo(iconsRef.current, { y: 30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)", stagger: 0.1, delay: 0.8 });
  }, [navRef, logoRef, iconsRef]);
};
