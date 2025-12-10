// src/hooks/useNavTheme.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  rafThrottle,
  sampleBackgroundAtPoint,
  getColorAnalysis,
} from "../utils/backgroundSampler";

export const useNavTheme = (
  variant,
  navRef,
  isMobile,
  location,
  megaMenuOpen
) => {
  const [navTheme, setNavTheme] = useState(
    variant === "dark" ? "dark" : "light"
  );
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [samplingActive, setSamplingActive] = useState(true);
  const [lastSampleTime, setLastSampleTime] = useState(0);
  const [themeFrozen, setThemeFrozen] = useState(false);

  // Freeze theme when mega menu is open
  useEffect(() => {
    setThemeFrozen(megaMenuOpen);
  }, [megaMenuOpen]);

  const performBackgroundSampling = useCallback(async () => {
    if (!samplingActive || !navRef.current || themeFrozen) return;

    const now = Date.now();
    if (now - lastSampleTime < 100) return;
    setLastSampleTime(now);

    try {
      const rect = navRef.current.getBoundingClientRect();
      const y = rect.bottom + 2;
      const x = Math.max(
        10,
        Math.min(window.innerWidth - 10, Math.floor(window.innerWidth / 2))
      );

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
  }, [
    samplingActive,
    navRef.current,
    navTheme,
    lastSampleTime,
    isMobile,
    variant,
    themeFrozen,
  ]);

  // Background sampling effect
  useEffect(() => {
    let active = true;
    let rafId = null;
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

    rafId = requestAnimationFrame(() => {
      if (active) {
        setTimeout(debouncedSample, 100);
      }
    });

    return () => {
      active = false;
      setSamplingActive(false);
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [location.pathname, performBackgroundSampling]);

  // Trigger sampling on route change
  useEffect(() => {
    setSamplingActive(true);
    const timer = setTimeout(() => {
      performBackgroundSampling();
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname, performBackgroundSampling]);

  return {
    navTheme,
    colorAnalysis,
  };
};
