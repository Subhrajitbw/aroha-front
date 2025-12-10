// src/hooks/useIsMobile.js
import { useState, useEffect } from "react";

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId;
    const checkDevice = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(
        () => setIsMobile(window.innerWidth < breakpoint),
        100
      );
    };

    checkDevice();
    window.addEventListener("resize", checkDevice, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkDevice);
    };
  }, [breakpoint]);

  return isMobile;
};
