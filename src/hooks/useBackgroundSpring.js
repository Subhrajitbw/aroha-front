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
    const onScroll = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const progress = 1 - rect.top / window.innerHeight;
      setScrollY(Math.max(0, Math.min(progress, 1)));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return bgSpring;
};

