import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Parallax effect for sections
export const initSectionParallax = (section) => {
  const elements = section.querySelectorAll('.parallax-element');
  
  elements.forEach(element => {
    gsap.to(element, {
      y: () => element.dataset.speed || '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });
};

// Lighting effect animation
export const initLightingEffect = (section) => {
  const light = section.querySelector('.hanging-light');
  if (!light) return;

  gsap.set(light, { opacity: 0, scale: 0.8 });

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top center+=100',
      toggleActions: 'play none none reverse'
    }
  })
  .to(light, {
    opacity: 1,
    scale: 1,
    duration: 0.6,
    ease: 'power2.out'
  })
  .to(light.querySelector('.light-glow'), {
    opacity: 0.8,
    duration: 0.4,
    repeat: -1,
    yoyo: true
  });
};

// Content reveal animation
export const initContentReveal = (section) => {
  const content = section.querySelector('.section-content');
  if (!content) return;

  gsap.from(content.children, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: section,
      start: 'top center+=100',
      toggleActions: 'play none none reverse'
    }
  });
};