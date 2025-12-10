// src/hooks/useCategorySectionAnimation.js
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useCategorySectionAnimation = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const backgroundRef = useRef(null);
  
  // Content refs
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const luxuryAccentRef = useRef(null);
  const descriptionRef = useRef(null);
  const statsRef = useRef(null);
  const sliderRef = useRef(null);
  const ctaRef = useRef(null);
  const viewAllRef = useRef(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
          once: false,
        },
      });

      // Set initial state for all animated elements
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          luxuryAccentRef.current,
          descriptionRef.current,
          statsRef.current,
          sliderRef.current,
          ctaRef.current,
          viewAllRef.current,
        ].filter(Boolean),
        { opacity: 0, willChange: "transform, opacity" }
      );

      // Background fade in
      timeline.fromTo(
        backgroundRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power1.out" }
      );

      // Badge entrance
      timeline.fromTo(
        badgeRef.current,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
        0.1
      );

      // Title words stagger
      if (titleRef.current) {
        const titleWords = titleRef.current.querySelectorAll(".word");
        if (titleWords.length > 0) {
          timeline.fromTo(
            titleWords,
            { opacity: 0, y: 24, rotationX: 8 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: "power3.out",
            },
            0.2
          );
        }
      }

      // Luxury accent
      if (luxuryAccentRef.current) {
        timeline.fromTo(
          luxuryAccentRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            transformOrigin: "left center",
          },
          0.4
        );
      }

      // Description
      if (descriptionRef.current) {
        timeline.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          0.5
        );
      }

      // Stats items
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll(".stat-item");
        if (statItems.length > 0) {
          timeline.fromTo(
            statItems,
            { opacity: 0, y: 8, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              stagger: 0.08,
              ease: "back.out(1.2)",
            },
            0.6
          );
        }
      }

      // Slider entrance
      timeline.fromTo(
        sliderRef.current,
        { opacity: 0, y: 20, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
        0.7
      );

      // View All button
      timeline.fromTo(
        viewAllRef.current,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
        0.8
      );

      // CTA buttons
      if (ctaRef.current) {
        const ctaButtons = ctaRef.current.querySelectorAll(".cta-button");
        if (ctaButtons.length > 0) {
          timeline.fromTo(
            ctaButtons,
            { opacity: 0, y: 16, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              stagger: 0.1,
              ease: "back.out(1.3)",
            },
            0.9
          );
        }
      }

      // Floating orbs animation
      gsap.to(".luxury-orb", {
        y: -8,
        x: 4,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  // Handle resize
  useEffect(() => {
    const onResize = () => {
      ScrollTrigger.refresh();
      if (containerRef.current) {
        containerRef.current.scrollLeft = 0;
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return {
    sectionRef,
    containerRef,
    backgroundRef,
    badgeRef,
    titleRef,
    luxuryAccentRef,
    descriptionRef,
    statsRef,
    sliderRef,
    ctaRef,
    viewAllRef,
  };
};
