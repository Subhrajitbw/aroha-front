// src/hooks/useTabSelection.js
import { useState, useCallback, useMemo } from "react";

export const useTabSelection = (tabs, defaultTab) => {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]);

  const handleTabSelect = useCallback((tab) => {
    setSelectedTab(tab);
  }, []);

  // Generate link state based on selected tab
  const linkState = useMemo(() => {
    switch (selectedTab) {
      case "New Designs":
        return { new: true, title: "New Designs" };
      case "Best Sellers":
        return { bestselling: true, title: "Best Sellers" };
      case "Sale":
        return { onsale: true, title: "Sale" };
      default:
        return { title: "Shop All" };
    }
  }, [selectedTab]);

  return {
    selectedTab,
    handleTabSelect,
    linkState,
  };
};
