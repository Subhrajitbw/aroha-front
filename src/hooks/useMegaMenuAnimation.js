// src/hooks/useMegaMenuAnimation.js
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export const useMegaMenuAnimation = (isOpen) => {
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      if (!menuRef.current || !backdropRef.current) return;

      if (isOpen) {
        // Show backdrop
        gsap.set(backdropRef.current, { display: "block" });
        gsap.to(backdropRef.current, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });

        // Animate menu entrance
        gsap.fromTo(
          menuRef.current,
          { y: -30, scale: 0.95 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power3.out",
          }
        );

        // Stagger columns
        const columns = contentRef.current?.querySelectorAll(".mega-column");
        if (columns) {
          gsap.fromTo(
            columns,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.05,
              ease: "power2.out",
              delay: 0.1,
            }
          );
        }
      } else {
        // Animate menu exit
        gsap.to(menuRef.current, {
          y: -20,
          scale: 0.98,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.in",
        });

        // Hide backdrop
        gsap.to(backdropRef.current, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(backdropRef.current, { display: "none" });
          },
        });
      }
    },
    { dependencies: [isOpen], scope: menuRef }
  );

  return { menuRef, backdropRef, contentRef };
};
