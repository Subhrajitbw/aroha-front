// src/hooks/useCategorySelection.js
import { useState, useEffect, useCallback } from "react";

export const useCategorySelection = (categories) => {
  const [selectedSlug, setSelectedSlug] = useState(null);

  // Auto-select first category
  useEffect(() => {
    if (categories.length > 0 && !selectedSlug) {
      setSelectedSlug(categories[0].id);
    }
  }, [categories, selectedSlug]);

  const handleTabClick = useCallback((id) => {
    setSelectedSlug(id);
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === selectedSlug);

  return {
    selectedSlug,
    selectedCategory,
    handleTabClick,
  };
};
