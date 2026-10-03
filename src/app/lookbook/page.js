import { sdk } from  '@/lib/medusaClient';
import LookbookClient from  '@/components/pages/LookbookClient';

export const metadata = {
  title: 'Lookbook',
  description: 'A curated sequence of atmospheres. Explore the intersection of modern minimalism and structural elegance with Aroha.',
  openGraph: {
    title: 'Lookbook | Aroha',
    description: 'Explore the intersection of modern minimalism and structural elegance.',
    url: 'https://arohahouse.com/lookbook',
    type: 'website',
  },
};

async function getLookbookData() {
  try {
    // 5-second timeout to prevent hanging Vercel static builds.
    // If Medusa is slow, render with empty data — client-side will hydrate.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { products } = await sdk.store.product.list(
      {
        limit: 50,
        fields: "id,title,handle,thumbnail,variants.prices"
      },
      { signal: controller.signal }
    ).finally(() => clearTimeout(timeout));
    
    return products.map((p) => {
      let priceStr = "";
      if (p.variants?.[0]?.prices?.length > 0) {
        const priceVal = p.variants[0].prices[0].amount;
        priceStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(priceVal);
      }
      return {
        _id: p.id,
        name: p.title,
        image: p.thumbnail || "/placeholder.jpg",
        handle: p.handle,
        price: priceStr || "Price Available on Request"
      };
    }).filter(p => p.image);
  } catch (error) {
    console.warn("Lookbook SSR fetch timed out or failed, rendering without data:", error.name);
    return [];
  }
}

export default async function LookbookPage() {
  const products = await getLookbookData();
  return <LookbookClient initialProducts={products} />;
}
