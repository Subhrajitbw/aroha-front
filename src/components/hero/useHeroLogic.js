// components/hero/useHeroLogic.js
import { useState, useCallback, useRef, useEffect } from "react";

export const useHeroLogic = (slides) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLiked, setIsLiked] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next'); // Add direction tracking

  const progressTl = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const SLIDE_DURATION = 7000;
  const TRANSITION_DURATION = 1200; // Longer for GSAP animations

  // Navigation functions with direction tracking
  const nextSlide = useCallback(() => {
    if (isTransitioning || !slides || slides.length === 0) return;
    const next = (activeSlide + 1) % slides.length;
    setSlideDirection('next');
    setIsTransitioning(true);
    setActiveSlide(next);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [activeSlide, isTransitioning, slides]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || !slides || slides.length === 0) return;
    const prev = (activeSlide - 1 + slides.length) % slides.length;
    setSlideDirection('prev');
    setIsTransitioning(true);
    setActiveSlide(prev);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [activeSlide, isTransitioning, slides]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === activeSlide || !slides || slides.length === 0) return;
    
    // Determine direction based on index comparison
    setSlideDirection(index > activeSlide ? 'next' : 'prev');
    setIsTransitioning(true);
    setActiveSlide(index);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  }, [activeSlide, isTransitioning, slides]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Autoplay functionality with direction
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying || isHovered || isTransitioning || !slides || slides.length <= 1) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setSlideDirection('next'); // Always go forward on autoplay
      setActiveSlide(prev => (prev + 1) % slides.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isTransitioning, activeSlide, slides, SLIDE_DURATION]);

  // Progress animation
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!isPlaying || isHovered || isTransitioning || !slides || slides.length <= 1) {
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, isHovered, isTransitioning, activeSlide, slides, SLIDE_DURATION]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    activeSlide,
    isPlaying,
    progress,
    isTransitioning,
    isLiked,
    isHovered,
    slideDirection, // Export direction
    nextSlide,
    prevSlide,
    goToSlide,
    togglePlayPause,
    handleMouseEnter,
    handleMouseLeave,
    setProgress,
    progressTl,
    SLIDE_DURATION,
  };
};
