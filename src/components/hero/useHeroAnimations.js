// components/hero/useHeroAnimations.js
import { useEffect, useRef } from "react";
import gsap from "gsap";

export const useHeroAnimations = ({ 
  activeSlide, 
  isTransitioning, 
  slideDirection = 'next',
  refs, 
  slides 
}) => {
  const masterTl = useRef(null);
  const prevSlideRef = useRef(activeSlide);
  const isInitialized = useRef(false);

  // Initial setup animation (run once)
  useEffect(() => {
    if (isInitialized.current) return;
    
    // Wait for all refs to be available
    const checkRefs = () => {
      const essentialRefs = [
        refs.image?.current,
        refs.overlay?.current,
        refs.accent?.current,
        refs.headline?.current
      ];
      
      return essentialRefs.every(ref => ref !== null);
    };

    if (!checkRefs()) {
      // Retry after a short delay
      const timeout = setTimeout(() => {
        if (checkRefs()) {
          initializeAnimation();
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    } else {
      initializeAnimation();
    }

    function initializeAnimation() {
      isInitialized.current = true;
      
      const initialTl = gsap.timeline();
      
      // Set initial states with null checks
      const setInitialState = (element, props) => {
        if (element) {
          gsap.set(element, props);
        }
      };

      setInitialState(refs.image?.current, { opacity: 0, scale: 1.2 });
      setInitialState(refs.overlay?.current, { opacity: 0 });
      
      const contentElements = [
        refs.accent?.current,
        refs.headline?.current,
        refs.subText?.current,
        refs.cta?.current
      ].filter(Boolean);
      
      if (contentElements.length > 0) {
        gsap.set(contentElements, { opacity: 0, y: 50, rotationX: 15 });
      }

      const controlElements = [
        refs.quickActions?.current,
        refs.navBox?.current
      ].filter(Boolean);
      
      if (controlElements.length > 0) {
        gsap.set(controlElements, { opacity: 0, y: 30 });
      }

      // Animate in sequence
      initialTl
        .to(refs.image?.current || {}, {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power3.out"
        })
        .to(refs.overlay?.current || {}, {
          opacity: 1,
          duration: 1,
          ease: "power2.out"
        }, 0.3);

      if (contentElements.length > 0) {
        initialTl.to(contentElements, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "back.out(1.7)"
        }, 0.5);
      }

      if (controlElements.length > 0) {
        initialTl.to(controlElements, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(2)"
        }, 0.8);
      }
    }
  }, [refs]);

  // Slide transition animations
  useEffect(() => {
    if (!isInitialized.current || !isTransitioning) return;

    // Kill existing animations
    if (masterTl.current) {
      masterTl.current.kill();
    }

    const isNext = slideDirection === 'next';
    const direction = isNext ? 1 : -1;

    // Create master timeline
    masterTl.current = gsap.timeline({
      onComplete: () => {
        // Reset any transforms that might cause issues
        const resetElements = [
          refs.image?.current,
          refs.overlay?.current,
          ...([
            refs.accent?.current,
            refs.headline?.current,
            refs.subText?.current,
            refs.cta?.current
          ].filter(Boolean))
        ].filter(Boolean);

        if (resetElements.length > 0) {
          gsap.set(resetElements, { clearProps: "transform" });
        }
      }
    });

    // Image animation with null check
    if (refs.image?.current) {
      masterTl.current
        .set(refs.image.current, { 
          scale: 1.1,
          x: -30 * direction,
          opacity: 0.7,
          filter: "brightness(0.8) blur(2px)"
        })
        .to(refs.image.current, {
          scale: 1,
          x: 0,
          opacity: 1,
          filter: "brightness(1) blur(0px)",
          duration: 1.2,
          ease: "power3.out"
        }, 0);
    }

    // Overlay animation with null check
    if (refs.overlay?.current) {
      masterTl.current
        .set(refs.overlay.current, { opacity: 0.5 })
        .to(refs.overlay.current, { 
          opacity: 1, 
          duration: 1, 
          ease: "power2.out" 
        }, 0.2);
    }

    // Content animations with null checks
    const contentElements = [
      refs.accent?.current,
      refs.headline?.current,
      refs.subText?.current,
      refs.cta?.current
    ].filter(Boolean);

    if (contentElements.length > 0) {
      masterTl.current
        .set(contentElements, {
          x: 40 * direction,
          opacity: 0,
          rotationY: 20 * direction,
          transformOrigin: "center center"
        })
        .to(contentElements, {
          x: 0,
          opacity: 1,
          rotationY: 0,
          duration: 1,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }, 0.4);
    }

    // Controls animations with null checks
    if (refs.quickActions?.current) {
      masterTl.current
        .set(refs.quickActions.current, { 
          y: 20, 
          opacity: 0, 
          scale: 0.9 
        })
        .to(refs.quickActions.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(2)"
        }, 0.6);
    }

    if (refs.navBox?.current) {
      masterTl.current
        .set(refs.navBox.current, {
          x: 30 * direction,
          opacity: 0
        })
        .to(refs.navBox.current, {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        }, 0.5);
    }

    // Progress bars animation with null checks
    if (refs.progressBars?.current && Array.isArray(refs.progressBars.current)) {
      refs.progressBars.current.forEach((bar, index) => {
        if (bar) {
          masterTl.current.to(bar, {
            scaleX: index === activeSlide ? 1 : 0.8,
            opacity: index === activeSlide ? 1 : 0.6,
            duration: 0.6,
            ease: "power2.out"
          }, 0.7);
        }
      });
    }

    prevSlideRef.current = activeSlide;

  }, [activeSlide, isTransitioning, slideDirection, refs, slides]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (masterTl.current) {
        masterTl.current.kill();
      }
    };
  }, []);
};
