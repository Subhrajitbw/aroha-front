// src/hooks/useProductCarouselData.js
import { useState, useEffect } from "react";
import { sdk } from "../lib/medusaClient";
import { formatProductPrice } from "../utils/priceFormatter";

const mapCarouselProducts = (rawProducts) => {
  if (!Array.isArray(rawProducts)) return [];

  return rawProducts.map((product) => {
    let amount = 0;
    let originalAmount = 0;
    let discount = 0;
    let currencyCode = "INR";

    // Handle custom endpoint format (sale_price, discount_percentage)
    if (
      product.sale_price !== undefined ||
      product.discount_percentage !== undefined
    ) {
      amount = product.sale_price || 0;
      originalAmount = product.original_price || 0;
      discount =
        product.discount_percentage ||
        (originalAmount > 0
          ? Math.round(((originalAmount - amount) / originalAmount) * 100)
          : 0);
      if (product.currency_code) {
        currencyCode = product.currency_code.toUpperCase();
      }
    } else {
      // Handle standard Medusa product format
      const defaultVariant = product.variants?.[0];
      const priceData = defaultVariant?.calculated_price;
      amount = priceData?.calculated_amount || 0;
      originalAmount = priceData?.original_amount || 0;
      if (priceData?.currency_code) {
        currencyCode = priceData.currency_code.toUpperCase();
      }
      if (originalAmount > amount) {
        discount = Math.round(
          ((originalAmount - amount) / originalAmount) * 100
        );
      }
    }

    const formatPrice = (val) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    };

    const isSale = discount > 0;

    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      image:
        product.thumbnail ||
        product.images?.[0]?.url ||
        "https://placehold.co/400",
      price: formatPrice(amount),
      originalPrice: isSale ? formatPrice(originalAmount) : null,
      discount: discount,
      collection:
        product.collection?.title || (isSale ? "Sale" : "New Arrival"),
      status: isSale ? "sale" : "new",
    };
  });
};

export const useProductCarouselData = (selectedTab) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let rawData = [];

        switch (selectedTab) {
          case "New Designs": {
            const result = await sdk.client.fetch("/store/custom/new");
            rawData = result.products || result.data || result;
            break;
          }
          case "Sale": {
            const result = await sdk.client.fetch("/store/custom/discounted");
            rawData = result.products || result.data || result;
            break;
          }
          case "Best Sellers": {
            const { products } = await sdk.store.product.list({
              limit: 10,
              fields:
                "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*",
            });
            rawData = products;
            break;
          }
          default:
            rawData = [];
        }

        setProducts(mapCarouselProducts(rawData));
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedTab]);

  return { products, loading, error };
};
