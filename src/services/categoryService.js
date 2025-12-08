import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const categoryService = {
  // Fetch all categories
  getCategories: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories`,{headers: {
    "ngrok-skip-browser-warning": "true",
  },});
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Fetch products by category
  getProductsByCategory: async (categoryId, limit = 8) => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/products/${categoryId}`, {
        headers: {
    "ngrok-skip-browser-warning": "true",
  },
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products for category:', error);
      throw error;
    }
  },

  // Fetch featured categories
  getFeaturedCategories: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/featured`, {headers: {
    "ngrok-skip-browser-warning": "true",
  },});
      return response.data;
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      throw error;
    }
  }
};
