import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories();
      
      // Handle different API response structures
      let categoriesData = [];
      if (Array.isArray(data)) {
        categoriesData = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        categoriesData = data.categories;
      } else if (data.data && Array.isArray(data.data)) {
        categoriesData = data.data;
      }
      
      setCategories(categoriesData);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};
