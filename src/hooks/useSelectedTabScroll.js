// src/hooks/useSelectedTabScroll.js
import { useEffect } from "react";

export const useSelectedTabScroll = (selectedSlug, tabsRef) => {
  useEffect(() => {
    if (!selectedSlug || !tabsRef.current) return;

    const selectedTab = tabsRef.current.querySelector(
      `[data-slug="${selectedSlug}"]`
    );

    if (selectedTab?.scrollIntoView) {
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedSlug, tabsRef]);
};
