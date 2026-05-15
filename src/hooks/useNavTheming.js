import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { rafThrottle, sampleBackgroundAtPoint, getColorAnalysis } from "../utils/backgroundSampler";
import { useMenuStore } from "../stores/useMenuStore";

export const useNavTheming = (navRef, variant, pathname, isMobile) => {
  const currentSection = useMenuStore((state) => state.currentSection);
  const isAppReady = useMenuStore((state) => state.isAppReady);
  const navThemeOverride = useMenuStore((state) => state.navThemeOverride);
  const [localScrolled, setLocalScrolled] = useState(false);
  
  const scrolled = localScrolled || currentSection > 0;
  const [navTheme, setNavTheme] = useState(variant === "dark" ? "dark" : "light");
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [samplingActive, setSamplingActive] = useState(true);
  const lastSampleTime = useRef(0);
  const [themeFrozen, setThemeFrozen] = useState(false);

  const isDark = variant === "dark";
  const isFrontpage = pathname === "/" || pathname === "/home";
  // Enable sampling on frontpage (sections change between dark/light),
  // light-variant pages, and product pages
  // Enable sampling on frontpage (sections change between dark/light),
  // light-variant pages, and product pages. 
  // CRITICAL: Disable background sampling on mobile to prevent UI thread freezing.
  const shouldUseBackgroundSampling = !isMobile && (isFrontpage || variant === "light" || (pathname && pathname.startsWith("/product/")));

  useEffect(() => {
    setNavTheme(variant === "dark" ? "dark" : "light");
    setSamplingActive(shouldUseBackgroundSampling);
    if (!shouldUseBackgroundSampling) {
      setColorAnalysis(null);
    }
  }, [variant, pathname, shouldUseBackgroundSampling]);

  useEffect(() => {
    const handleScroll = () => setLocalScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const performBackgroundSampling = useCallback(async () => {
    if (!samplingActive || !navRef.current || themeFrozen) return;

    const now = Date.now();
    // Increase sampling interval on mobile even if active
    const interval = isMobile ? 1000 : 150; 
    if (now - lastSampleTime.current < interval) return;
    lastSampleTime.current = now;

    try {
      const rect = navRef.current.getBoundingClientRect();
      const y = rect.bottom + 2;
      
      // Sample 3 points: Left (10%), Center (50%), Right (90%)
      const sampleXPoints = [
        Math.floor(window.innerWidth * 0.1),
        Math.floor(window.innerWidth * 0.5),
        Math.floor(window.innerWidth * 0.9)
      ];

      const samplingOptions = {
        log: false,
        sampleRadius: isMobile ? 4 : 10,
        sampleCount: isMobile ? 2 : 5,
        clusterThreshold: 25,
      };

      const results = await Promise.all(sampleXPoints.map(x => sampleBackgroundAtPoint(x, y, samplingOptions)));
      
      const themes = results.map(r => r.theme);
      const darkCount = themes.filter(t => t === "dark").length;
      const finalTheme = darkCount >= 1 ? "dark" : "light";

      if (finalTheme !== navTheme) {
        setNavTheme(finalTheme);
        setColorAnalysis(getColorAnalysis(results[1]));
      }
    } catch {
      if (navTheme !== variant) {
        setNavTheme(variant);
      }
    }
  }, [samplingActive, navRef, navTheme, isMobile, variant, themeFrozen]);

  useEffect(() => {
    if (!samplingActive) return;
    
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
  }, [pathname, performBackgroundSampling, samplingActive]); // samplingActive added to deps

  // Re-sample when sections change on the frontpage (globalScrolled updates),
  // when isAppReady fires (loading overlay dismissed), or on route change.
  // Uses staggered timers to catch late-loading content (videos buffering).
  useEffect(() => {
    if (!shouldUseBackgroundSampling) return;
    setSamplingActive(true);
    
    // Staggered samples: immediate, then 500ms, 2s, 5s
    // The later samples catch videos that need time to buffer their first frame
    const timers = [
      setTimeout(performBackgroundSampling, 0),
      setTimeout(performBackgroundSampling, 500),
      setTimeout(performBackgroundSampling, 2000),
      setTimeout(performBackgroundSampling, 5000)
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [pathname, isAppReady, currentSection, shouldUseBackgroundSampling, performBackgroundSampling]); // currentSection changes on every section transition

  // Override takes priority (instant, set by FrontpageClient), then sampling, then variant default
  const effectiveTheme = navThemeOverride || navTheme;

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
