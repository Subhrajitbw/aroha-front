// src/hooks/useInitialized.js
import { useState, useEffect } from "react";

/**
 * Tracks initialization state based on loading
 */
export const useInitialized = (loading) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && !loading) {
      setIsInitialized(true);
    }
  }, [loading, isInitialized]);

  return isInitialized;
};
