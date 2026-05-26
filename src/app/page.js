import { sdk } from '@/lib/medusaClient';
import { sanityClient } from '@/lib/sanityClient';
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
    // Use a 3-second timeout — if Medusa is slow, render immediately with empty collections.
    // The client-side TanStack Query in FrontpageClient will fetch and hydrate on mount.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const { collections } = await sdk.store.collection.list(
      { limit: 3, fields: "id,title,handle,metadata" },
      { signal: controller.signal }
    ).finally(() => clearTimeout(timeout));
    
    return collections || [];
  } catch (error) {
    // Timeout or network error — don't block the page render
    console.warn("getCollections timed out or failed, rendering without SSR collections:", error.name);
    return [];
  }
}

async function getHeroData() {
  try {
    // A dynamic cache-buster comment ensures the query string is completely unique on every single local refresh.
    // This physically prevents Next.js's native fetch cache and Sanity's API from returning stale data.
    const devCacheBuster = process.env.NODE_ENV === 'development' ? `// CacheBuster: ${Date.now()}\n` : '';
    const query = `${devCacheBuster}*[_type == "heroSlider"][0]{
      globalVideoUrl,
      slides[]{
        backgroundType, heading, subheading, badge, alignment,
        overlayStrength, autoPlayDuration, image, videoUrl,
        ctaPrimary, ctaSecondary
      }
    }`;
    
    console.log("================ SANITY REQUEST ================");
    console.log("Querying Hero Data...");

    // Force Next.js to bypass its aggressive internal Data Cache during development
    const fetchOptions = process.env.NODE_ENV === 'development' 
      ? { cache: 'no-store' } 
      : { next: { revalidate: 60 } };

    const data = await sanityClient.fetch(query, {}, fetchOptions);
    
    console.log("================ SANITY RESPONSE ================");
    console.log("Data received from Sanity:");
    console.log(JSON.stringify(data, null, 2));
    console.log("=================================================");

    if (data) {
      const validSlides = data.globalVideoUrl 
        ? data.slides 
        : data.slides?.filter(s => (s.backgroundType === "video" && s.videoUrl) || (s.backgroundType === "image" && s.image));
      return {
        globalVideoUrl: data.globalVideoUrl || null,
        slides: validSlides?.length ? validSlides.slice(0, 4) : null
      };
    }
  } catch (err) {
    console.error("Failed to fetch Hero data on server:", err);
  }
  return null;
}

export default async function HomePage() {
  // Disable server-side fetch temporarily to fix hanging/blank page
  const initialCollections = []; 
  const heroData = await getHeroData(); 
  
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
      <FrontpageClient initialCollections={initialCollections} heroData={heroData} />
    </>
  );
}
