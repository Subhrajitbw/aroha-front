import { useState, useEffect, useCallback, useMemo } from "react";
import { rafThrottle, sampleBackgroundAtPoint, getColorAnalysis } from "../utils/backgroundSampler";

export const useNavTheming = (navRef, variant, location, isMobile) => {
  const [scrolled, setScrolled] = useState(false);
  const [navTheme, setNavTheme] = useState(variant === "dark" ? "dark" : "light");
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [samplingActive, setSamplingActive] = useState(true);
  const [lastSampleTime, setLastSampleTime] = useState(0);
  const [themeFrozen, setThemeFrozen] = useState(false);

  const isDark = variant === "dark";
  const shouldUseBackgroundSampling = variant === "light" || location.pathname.startsWith("/products/");

  useEffect(() => {
    setNavTheme(variant === "dark" ? "dark" : "light");
    setSamplingActive(shouldUseBackgroundSampling);
    if (!shouldUseBackgroundSampling) {
      setColorAnalysis(null);
    }
  }, [variant, location.pathname, shouldUseBackgroundSampling]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const performBackgroundSampling = useCallback(async () => {
    if (!samplingActive || !navRef.current || themeFrozen) return;

    const now = Date.now();
    if (now - lastSampleTime < 100) return;
    setLastSampleTime(now);

    try {
      const rect = navRef.current.getBoundingClientRect();
      const y = rect.bottom + 2;
      const x = Math.max(10, Math.min(window.innerWidth - 10, Math.floor(window.innerWidth / 2)));

      const samplingOptions = {
        log: false,
        sampleRadius: isMobile ? 6 : 10,
        sampleCount: isMobile ? 5 : 9,
        clusterThreshold: 25,
      };

      const result = await sampleBackgroundAtPoint(x, y, samplingOptions);
      if (!result) return;

      const analysis = getColorAnalysis(result);
      if (result.theme !== navTheme) {
        setNavTheme(result.theme);
        setColorAnalysis(analysis);
      }
    } catch {
      if (navTheme !== variant) {
        setNavTheme(variant);
      }
    }
  }, [samplingActive, navRef, navTheme, lastSampleTime, isMobile, variant, themeFrozen]);

  useEffect(() => {
    let active = true;
    let timeoutId = null;

    const debouncedSample = rafThrottle(async () => {
      if (!active) return;
      await performBackgroundSampling();
    });

    const onScroll = rafThrottle(() => {
      if (!active) return;
      debouncedSample();
    });

    const onResize = rafThrottle(() => {
      if (!active) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(debouncedSample, 150);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const rafId = requestAnimationFrame(() => {
      if (active) setTimeout(debouncedSample, 100);
    });

    return () => {
      active = false;
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [location.pathname, performBackgroundSampling]);

  useEffect(() => {
    if (!shouldUseBackgroundSampling) return;
    setSamplingActive(true);
    const timer = setTimeout(() => {
      performBackgroundSampling();
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname, performBackgroundSampling, shouldUseBackgroundSampling]);

  const effectiveTheme = navTheme;

  const colors = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          navTextColor: "text-neutral-100",
          navHoverColor: "hover:text-neutral-300",
          logoColor: "text-white",
        };
      }
      return {
        navTextColor: "text-neutral-900",
        navHoverColor: "hover:text-neutral-700",
        logoColor: "text-neutral-900",
      };
    }
    return {
      navTextColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
      navHoverColor: effectiveTheme === "light" ? "hover:text-neutral-700" : "hover:text-neutral-300",
      logoColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
    };
  }, [scrolled, effectiveTheme]);

  const floatingStyles = useMemo(() => {
    if (scrolled) {
      if (effectiveTheme === "dark") {
        return {
          backgroundColor: colorAnalysis?.hasHighContrast ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: colorAnalysis?.hasHighContrast
            ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 16px rgba(0, 0, 0, 0.15)"
            : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 16px rgba(0, 0, 0, 0.1)",
        };
      }
      return {
        backgroundColor: colorAnalysis?.hasHighContrast ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: colorAnalysis?.hasHighContrast
          ? "0 8px 32px rgba(255, 255, 255, 0.2), 0 2px 16px rgba(255, 255, 255, 0.15)"
          : "0 8px 32px rgba(255, 255, 255, 0.15), 0 2px 16px rgba(255, 255, 255, 0.1)",
      };
    }
    return {
      backgroundColor: "transparent",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  }, [scrolled, effectiveTheme, colorAnalysis]);

  const floatingPosition = useMemo(() => {
    if (scrolled) {
      return !isMobile ? "top-1 left-2 right-2" : "bottom-1 left-2 right-2";
    }
    return "top-0 left-0 right-0";
  }, [scrolled, isMobile]);

  return {
    scrolled,
    effectiveTheme,
    colorAnalysis,
    colors,
    floatingStyles,
    floatingPosition,
    setThemeFrozen
  };
};
