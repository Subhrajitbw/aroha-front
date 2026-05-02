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
    const { products } = await sdk.store.product.list({
      limit: 50,
      fields: "id,title,handle,thumbnail,variants.prices"
    });
    
    return products.map((p) => {
      let priceStr = "";
      if (p.variants?.[0]?.prices?.length > 0) {
        const priceVal = p.variants[0].prices[0].amount;
        priceStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(priceVal);
      }
      return {
        _id: p.id,
        name: p.title,
        image: p.thumbnail || "https://placehold.co/600x800",
        handle: p.handle,
        price: priceStr || "Price Available on Request"
      };
    }).filter(p => p.image);
  } catch (error) {
    console.error("Failed to fetch lookbook data:", error);
    return [];
  }
}

export default async function LookbookPage() {
  const products = await getLookbookData();
  return <LookbookClient initialProducts={products} />;
}
