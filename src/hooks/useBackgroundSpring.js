import { useSpring } from "@react-spring/web";
import { useState, useEffect } from "react";

export const useBackgroundSpring = (ref) => {
  const [scrollY, setScrollY] = useState(0);

  const bgSpring = useSpring({
    backgroundSize: scrollY > 0 ? "auto 100%" : "auto 200%",
    backgroundPosition: scrollY > 0 ? "center 50%" : "center 100%",
    config: { tension: 120, friction: 20 },
  });

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = ref.current?.getBoundingClientRect();
          if (rect) {
            const progress = 1 - rect.top / window.innerHeight;
            const clamped = Math.max(0, Math.min(progress, 1));
            setScrollY(prev => (Math.abs(prev - clamped) > 0.02 ? clamped : prev));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return bgSpring;
};

