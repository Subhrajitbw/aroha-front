// src/hooks/useCategoryData.js
import { useState, useEffect } from "react";
import { sdk } from "../lib/medusaClient";

export const useCategoryData = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRootCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { product_categories } = await sdk.store.category.list({
          parent_category_id: "null",
          fields: "id,name,handle,description",
          limit: 20,
        });

        setCategories(product_categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRootCategories();
  }, []);

  return { categories, loading, error };
};
