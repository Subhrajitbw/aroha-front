// src/hooks/useCarouselAnimation.js
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Generic carousel animation hook
 * Can be used for both ProductCarousel and CategorySlider
 */
export const useCarouselAnimation = (isInitialized, isMobile) => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const sliderRef = useRef(null);
  const ctaRef = useRef(null);

  useGSAP(
    () => {
      if (!isInitialized) return;

      gsap.set(
        [headerRef.current, tabsRef.current, sliderRef.current, ctaRef.current],
        {
          opacity: 0,
          clearProps: "transform",
        }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
      })
        .to(
          tabsRef.current,
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.5"
        )
        .from(
          tabsRef.current?.children || [],
          {
            x: isMobile ? 20 : 30,
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.6"
        )
        .to(
          sliderRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
    },
    { scope: sectionRef, dependencies: [isInitialized, isMobile] }
  );

  return {
    sectionRef,
    headerRef,
    tabsRef,
    sliderRef,
    ctaRef,
  };
};
