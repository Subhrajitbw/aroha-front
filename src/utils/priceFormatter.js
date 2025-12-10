// src/utils/priceFormatter.js

/**
 * Formats product with price information
 * Handles both calculated prices and raw price arrays
 */
export const formatProductPrice = (product) => {
  const defaultVariant = product.variants?.[0];

  // Priority 1: Calculated Price (if Medusa context is working)
  let amount = defaultVariant?.calculated_price?.calculated_amount;
  let originalAmount = defaultVariant?.calculated_price?.original_amount;
  let currencyCode = defaultVariant?.calculated_price?.currency_code;

  // Priority 2: Raw Price Array (Fallback)
  if (amount === undefined || amount === null) {
    const prices = defaultVariant?.prices || [];

    // Try to find INR specific price
    let priceObj = prices.find((p) => p.currency_code?.toLowerCase() === "inr");

    // If no INR, take the first available
    if (!priceObj) priceObj = prices[0];

    if (priceObj) {
      amount = priceObj.amount;
      originalAmount = priceObj.amount;
      currencyCode = priceObj.currency_code;
    }
  }

  // Defaults
  amount = amount || 0;
  originalAmount = originalAmount || 0;
  currencyCode = (currencyCode || "INR").toUpperCase();

  // Calculate Discount %
  let discount = 0;
  if (originalAmount > amount) {
    discount = Math.round(((originalAmount - amount) / originalAmount) * 100);
  }

  const isSale = discount > 0;

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    image:
      product.thumbnail ||
      product.images?.[0]?.url ||
      "https://placehold.co/600x800/f5f5f5/e0e0e0",
    price: formatPrice(amount),
    originalPrice: isSale ? formatPrice(originalAmount) : null,
    discount: discount,
    status: isSale ? "sale" : "new",
  };
};
