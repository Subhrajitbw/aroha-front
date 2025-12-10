// src/utils/responsiveConfig.js
export const getResponsiveSliderConfig = (viewport) => ({
  gap: viewport.isMobile ? 12 : viewport.isTablet ? 16 : 20,
  showNavigation: !viewport.isMobile,
  showDots: viewport.isMobile,
  slidesToShow: viewport.isMobile ? 2 : viewport.isTablet ? 3 : 4,
});

// Alias for clarity in different contexts
export const getResponsiveCarouselConfig = getResponsiveSliderConfig;
