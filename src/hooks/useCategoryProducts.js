import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

// In useCategoryProducts hook
export const useCategoryProducts = (categoryId, limit = 8) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!categoryId) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      
      const response = await categoryService.getProductsByCategory(categoryId, limit);
      
      
      // Handle different API response structures
      let productsData = [];
      if (response.success && response.data && response.data.products) {
        productsData = response.data.products;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
    } catch (err) {
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
