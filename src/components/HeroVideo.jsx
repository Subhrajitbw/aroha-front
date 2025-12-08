import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroVideo = () => {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Initial animation timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    // Fade in video and scale up slightly
    tl.fromTo(videoRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5 }
    );

    // Fade in overlay with slight delay
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 0.4, duration: 1 },
      '-=1'
    );

    // Animate in content
    tl.fromTo(contentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      '-=0.5'
    );

    // Parallax effect on scroll
    gsap.to(videoRef.current, {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: videoRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div ref={videoRef} className="absolute inset-0 w-full h-full">
        <iframe
          src="https://player.vimeo.com/video/1029309810?background=1&autoplay=1&loop=1&muted=1&autopause=0&title=0&byline=0&portrait=0"
          className="w-full h-full object-cover"
          frameBorder="0"
          allow="autoplay; fullscreen"
          title="Background Video"
        />
      </div>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black opacity-40"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6">AROHA</h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto">
          Crafting timeless furniture pieces that transform your space into a sanctuary of style and comfort.
        </p>
      </div>
    </div>
  );
};

export default HeroVideo;