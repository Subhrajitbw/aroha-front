import { sdk } from '@/lib/medusaClient';
import FrontpageClient from '@/components/pages/FrontpageClient';
import JsonLd from '@/components/seo/JsonLd';

export const metadata = {
  title: 'Home | Aroha',
  description: 'Premium handcrafted furniture for modern living spaces. Explore our curated collections of luxury home decor.',
  openGraph: {
    title: 'Aroha | Premium Furniture',
    description: 'Explore our curated collections of luxury home decor.',
    url: 'https://arohahouse.com',
  }
};

async function getCollections() {
  try {
    const { collections } = await sdk.store.collection.list({
      limit: 3,
      fields: "id,title,handle,metadata"
    });
    return collections || [];
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialCollections = await getCollections();
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aroha',
    url: 'https://arohahouse.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://arohahouse.com/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <FrontpageClient initialCollections={initialCollections} />
    </>
  );
}
