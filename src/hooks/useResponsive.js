import { useCallback, useEffect, useState } from "react";

export const useResponsive = () => {
  // Enhanced initial state with comprehensive screen size detection

    const getBreakpoint = (width) => {
    if (width < 576) return 'xs';
    if (width < 768) return 'sm';
    if (width < 992) return 'md';
    if (width < 1200) return 'lg';
    if (width < 1400) return 'xl';
    return 'xxl';
  };

  // Helper function to determine device type
  const getDeviceType = (width) => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Helper function to determine screen type (more granular)
  const getScreenType = (width, height) => {
    const aspectRatio = width / height;
    
    if (width < 480) return 'phone-small';
    if (width < 768) return 'phone-large';
    if (width < 992) {
      return aspectRatio > 1.3 ? 'tablet-landscape' : 'tablet-portrait';
    }
    if (width < 1200) return 'laptop-small';
    if (width < 1440) return 'laptop-large';
    if (width < 1920) return 'desktop-standard';
    if (width < 2560) return 'desktop-large';
    return 'desktop-ultra-wide';
  };

  // Touch device detection
  const detectTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  };

  // Enhanced viewport update function
  const updateViewport = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const aspectRatio = width / height;

    setViewport({
      width,
      height,
      // Basic device detection (maintaining your original logic)
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      // Extended breakpoints
      isXs: width < 576,
      isSm: width >= 576 && width < 768,
      isMd: width >= 768 && width < 992,
      isLg: width >= 992 && width < 1200,
      isXl: width >= 1200 && width < 1400,
      isXxl: width >= 1400,
      // Orientation
      isLandscape: width > height,
      isPortrait: width <= height,
      // Current breakpoint
      breakpoint: getBreakpoint(width),
      // Device categorization
      deviceType: getDeviceType(width),
      screenType: getScreenType(width, height),
      // Additional properties
      aspectRatio: parseFloat(aspectRatio.toFixed(2)),
      pixelRatio,
      isRetina: pixelRatio > 1,
      touchDevice: detectTouchDevice(),
    });
  }, []);

  useEffect(() => {
    // Enhanced debounce resize handler with orientation change support
    let timeoutId;
    let orientationTimeoutId;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100);
    };

    // Handle orientation changes (especially important for mobile devices)
    const handleOrientationChange = () => {
      clearTimeout(orientationTimeoutId);
      // Longer timeout for orientation changes to account for viewport adjustments
      orientationTimeoutId = setTimeout(updateViewport, 300);
    };

    // Add event listeners
    window.addEventListener('resize', debouncedResize, { passive: true });
    
    // Listen for orientation changes
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(orientationTimeoutId);
      window.removeEventListener('resize', debouncedResize);
      
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, [updateViewport]);

  const getInitialViewport = () => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        // Basic device detection
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        // Extended breakpoints
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        isXxl: false,
        // Orientation
        isLandscape: true,
        isPortrait: false,
        // Current breakpoint
        breakpoint: 'lg',
        // Device categorization
        deviceType: 'desktop',
        screenType: 'desktop',
        // Additional properties
        aspectRatio: 1.33,
        pixelRatio: 1,
        isRetina: false,
        touchDevice: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const aspectRatio = width / height;

    return {
      width,
      height,
      // Basic device detection (your original logic)
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      // Extended breakpoints following Tailwind/Bootstrap standards
      isXs: width < 576,      // Extra small devices
      isSm: width >= 576 && width < 768,   // Small devices
      isMd: width >= 768 && width < 992,   // Medium devices  
      isLg: width >= 992 && width < 1200,  // Large devices
      isXl: width >= 1200 && width < 1400, // Extra large devices
      isXxl: width >= 1400,  // Extra extra large devices
      // Orientation
      isLandscape: width > height,
      isPortrait: width <= height,
      // Current breakpoint
      breakpoint: getBreakpoint(width),
      // Device categorization
      deviceType: getDeviceType(width),
      screenType: getScreenType(width, height),
      // Additional properties
      aspectRatio: parseFloat(aspectRatio.toFixed(2)),
      pixelRatio,
      isRetina: pixelRatio > 1,
      touchDevice: detectTouchDevice(),
    };
  };

  const [viewport, setViewport] = useState(getInitialViewport);

  // Helper function to determine breakpoint


  // Utility methods for enhanced functionality
  const utilities = {
    // Check if current breakpoint matches any of the provided breakpoints
    isBreakpoint: (...breakpoints) => breakpoints.includes(viewport.breakpoint),
    
    // Check if screen width is within range
    isWithinRange: (min, max) => viewport.width >= min && viewport.width <= max,
    
    // Get responsive value based on breakpoint
    getResponsiveValue: (values) => {
      const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      const currentIndex = breakpointOrder.indexOf(viewport.breakpoint);
      
      // Find the appropriate value by looking backwards from current breakpoint
      for (let i = currentIndex; i >= 0; i--) {
        const breakpoint = breakpointOrder[i];
        if (values[breakpoint] !== undefined) {
          return values[breakpoint];
        }
      }
      
      return values.default || null;
    },

    // Get card size based on current breakpoint
    getCardSize: () => {
      const { breakpoint, isMobile, isTablet, touchDevice, width } = viewport;
      
      if (touchDevice && isMobile) {
        if (width < 375) return 'sm';
        if (width < 414) return 'md';
        return 'md';
      }
      
      if (isTablet) {
        return viewport.isPortrait ? 'md' : 'md';
      }
      
      // Desktop breakpoint mapping
      const sizeMap = {
        xs: 'xs',
        sm: 'sm', 
        md: 'md',
        lg: 'lg',
        xl: 'xl',
        xxl: 'xl'
      };
      
      return sizeMap[breakpoint] || 'md';
    },

    // Check device categories
    isMobileDevice: () => viewport.deviceType === 'mobile',
    isTabletDevice: () => viewport.deviceType === 'tablet', 
    isDesktopDevice: () => viewport.deviceType === 'desktop',
    
    // Screen size checks
    isSmallScreen: () => viewport.width < 768,
    isMediumScreen: () => viewport.width >= 768 && viewport.width < 1200,
    isLargeScreen: () => viewport.width >= 1200,
    
    // Aspect ratio checks
    isWideScreen: () => viewport.aspectRatio > 1.6,
    isSquareScreen: () => viewport.aspectRatio >= 0.9 && viewport.aspectRatio <= 1.1,
  };

  return {
    ...viewport,
    ...utilities,
  };
};
