// src/utils/navThemeStyles.js
export const getNavColors = (scrolled, effectiveTheme) => {
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
    navTextColor:
      effectiveTheme === "light" ? "text-neutral-900" : "text-white",
    navHoverColor:
      effectiveTheme === "light"
        ? "hover:text-neutral-700"
        : "hover:text-neutral-300",
    logoColor: effectiveTheme === "light" ? "text-neutral-900" : "text-white",
  };
};

export const getFloatingStyles = (scrolled, effectiveTheme, colorAnalysis) => {
  if (scrolled) {
    if (effectiveTheme === "dark") {
      return {
        backgroundColor: colorAnalysis?.hasHighContrast
          ? "rgba(0, 0, 0, 0.15)"
          : "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(20px) saturate(150%)",
        WebkitBackdropFilter: "blur(20px) saturate(150%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: colorAnalysis?.hasHighContrast
          ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 16px rgba(0, 0, 0, 0.15)"
          : "0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 16px rgba(0, 0, 0, 0.1)",
      };
    }
    return {
      backgroundColor: colorAnalysis?.hasHighContrast
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(255, 255, 255, 0.2)",
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
};

export const getFloatingPosition = (scrolled, isMobile) => {
  if (scrolled) {
    return !isMobile ? "top-1 left-2 right-2" : "bottom-1 left-2 right-2";
  }
  return "top-0 left-0 right-0";
};
