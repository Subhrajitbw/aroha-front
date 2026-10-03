import { sdk } from  '@/lib/medusaClient';
import { sanityClient } from  '@/lib/sanityClient';
import RoomsClient from  '@/components/pages/RoomsClient';

export const metadata = {
  title: 'Rooms',
  description: 'Explore our curated environments and discover objects that speak to the architecture of your life. Luxury home settings by Aroha.',
  openGraph: {
    title: 'Rooms | Aroha',
    description: 'Explore our curated environments and luxury home settings.',
    url: 'https://arohahouse.com/rooms',
    type: 'website',
  },
};

const ROOM_KEYWORDS = [
  "bedroom", "living", "studio", "lounge", "dining",
  "kitchen", "office", "bathroom", "entryway", "outdoor",
  "terrace", "balcony", "library", "den", "suite"
];

async function getRoomsData() {
  try {
    // 8-second overall timeout to prevent hanging Vercel static builds.
    // Rooms does batched sequential fetches that can easily exceed 60s on slow backends.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const sanityProducts = await sanityClient.fetch(
      `*[_type == "product" && defined(perfectFor)]{ handle, perfectFor }`
    );
    
    if (!sanityProducts?.length) {
      clearTimeout(timeout);
      return [];
    }

    // Check if we've already timed out
    if (controller.signal.aborted) throw new Error('Timeout');

    const roomHandleMap = {};
    sanityProducts.forEach((item) => {
      const tags = Array.isArray(item.perfectFor) ? item.perfectFor : [item.perfectFor];
      tags.forEach((tag) => {
        const lower = tag.toLowerCase().trim();
        const kw = ROOM_KEYWORDS.find((k) => lower.includes(k));
        if (kw) {
          const displayLabel = lower.split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
          if (!roomHandleMap[displayLabel]) roomHandleMap[displayLabel] = new Set();
          roomHandleMap[displayLabel].add(item.handle);
        }
      });
    });

    const allHandles = [...new Set(sanityProducts.map((p) => p.handle))];
    
    // Fetch Medusa products in batches
    const medusaProducts = [];
    for (let i = 0; i < allHandles.length; i += 20) {
      if (controller.signal.aborted) throw new Error('Timeout');
      const { products } = await sdk.store.product.list({
        handle: allHandles.slice(i, i + 20),
        fields: "id,title,handle,thumbnail,images,*variants,*variants.calculated_price",
        limit: 20
      });
      if (products) medusaProducts.push(...products);
    }

    clearTimeout(timeout);

    const medusaMap = {};
    medusaProducts.forEach((p) => {
      let price = null;
      const v = p.variants?.[0];
      if (v?.calculated_price?.calculated_amount) {
        price = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v.calculated_price.calculated_amount);
      }
      medusaMap[p.handle] = { id: p.id, title: p.title, handle: p.handle, image: p.thumbnail || p.images?.[0]?.url || "", price: price || "" };
    });

    const roomArray = Object.entries(roomHandleMap)
      .map(([label, handleSet]) => ({
        label,
        products: [...handleSet].map((h) => medusaMap[h]).filter(Boolean).filter((p) => p.image),
      }))
      .filter((r) => r.products.length > 0)
      .sort((a, b) => b.products.length - a.products.length);

    return roomArray;
  } catch (error) {
    console.warn("Rooms SSR fetch timed out or failed, rendering without data:", error.name);
    return [];
  }
}

export default async function RoomsPage() {
  const rooms = await getRoomsData();
  return <RoomsClient rooms={rooms} />;
}
