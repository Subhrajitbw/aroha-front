import { sdk } from '@/lib/medusaClient';

export default async function sitemap() {
  const baseUrl = 'https://arohahouse.com';

  try {
    // Fetch all products
    const { products } = await sdk.store.product.list({ limit: 100 });
    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Fetch all categories
    const { product_categories } = await sdk.store.category.list({ limit: 100 });
    const categoryUrls = product_categories.map((category) => ({
      url: `${baseUrl}/shop/category/${category.handle}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // Static pages
    const staticUrls = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      { url: `${baseUrl}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
      { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
      { url: `${baseUrl}/lookbook`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ];

    return [...staticUrls, ...productUrls, ...categoryUrls];
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ];
  }
}
