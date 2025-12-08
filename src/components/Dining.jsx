import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Dining = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the text opacity
      gsap.fromTo(
        textRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            end: "bottom 0%",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate the background zoom out
      gsap.fromTo(
        sectionRef.current,
        { 
          backgroundSize: "auto 200%", 
          backgroundPosition: "center 100%"  // start at bottom
        },
        { 
          backgroundSize: "auto 100%", 
          backgroundPosition: "center 50%", // move upward while scrolling
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 100%",
            end: "bottom 0%",
            scrub: true,
          },
        }
      );
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full h-screen flex justify-center items-center text-center"
      style={{
        backgroundImage:
          "url('https://media.designcafe.com/wp-content/uploads/2020/06/17120906/modern-dining-room-wall-decor.jpg')",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "200% 200%", // important: width and height both at 200% initially
      }}
    >
      <h1
        ref={textRef}
        className="text-white text-5xl md:text-7xl font-semibold"
      >
        Living
      </h1>
    </div>
  );
};

export default Dining;
