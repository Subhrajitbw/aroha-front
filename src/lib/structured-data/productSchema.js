export function generateProductSchema({
  product,
  sanity,
  price,
  currency = "INR",
  inStock,
  url,
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product?.title,
    image: product?.thumbnail || product?.images?.[0]?.url,
    description:
      sanity?.seo?.aiSummary ||
      sanity?.shortDescription ||
      product?.description ||
      "",
    brand: {
      "@type": "Brand",
      name: "Aroha House",
    },
    sku: product?.variants?.[0]?.sku || product?.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
