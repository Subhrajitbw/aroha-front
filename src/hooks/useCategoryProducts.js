// src/hooks/useCategoryProducts.js
import { useState, useEffect } from "react";
import { sdk } from "../lib/medusaClient";
import { formatProductPrice } from "../utils/priceFormatter";

export const useCategoryProducts = (categoryId, regionId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      return;
    }

    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          category_id: [categoryId],
          limit: 10,
          fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*",
        };

        if (regionId) {
          queryParams.region_id = regionId;
        }

        const { products: rawProducts } = await sdk.store.product.list(queryParams);

        const mappedProducts = rawProducts.map((product) =>
          formatProductPrice(product)
        );

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryId, regionId]);

  return { products, loading, error };
};
