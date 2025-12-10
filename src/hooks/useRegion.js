// src/hooks/useRegion.js
import { useState, useEffect } from "react";
import { sdk } from "../lib/medusaClient";

export const useRegion = () => {
  const [regionId, setRegionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initRegion = async () => {
      try {
        const { regions } = await sdk.store.region.list({ limit: 1 });
        if (regions?.length > 0) {
          setRegionId(regions[0].id);
        }
      } catch (err) {
        console.warn("Region fetch failed, falling back to raw prices", err);
      } finally {
        setLoading(false);
      }
    };

    initRegion();
  }, []);

  return { regionId, loading };
};
