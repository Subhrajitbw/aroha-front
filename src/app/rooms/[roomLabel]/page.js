import { sdk } from  '@/lib/medusaClient';
import { sanityClient } from  '@/lib/sanityClient';
import RoomsClient from  '@/components/pages/RoomsClient';

export async function generateMetadata({ params }) {
  const label = params.roomLabel.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${label} | Aroha Rooms`,
    description: `Explore our curated selection of pieces for your ${label}.`,
  };
}

async function getRoomsData() {
  // Reuse the same data fetching logic (ideally this would be cached)
  // For now I'll repeat it or ideally I'd have a shared helper
  // ... (Keeping it simple for now)
  try {
    const sanityProducts = await sanityClient.fetch(`*[_type == "product" && defined(perfectFor)]{ handle, perfectFor }`);
    if (!sanityProducts?.length) return [];
    const roomHandleMap = {};
    sanityProducts.forEach((item) => {
      const tags = Array.isArray(item.perfectFor) ? item.perfectFor : [item.perfectFor];
      tags.forEach((tag) => {
        const lower = tag.toLowerCase().trim();
        const kw = ["bedroom", "living", "studio", "lounge", "dining", "kitchen", "office", "bathroom", "entryway", "outdoor", "terrace", "balcony", "library", "den", "suite"].find((k) => lower.includes(k));
        if (kw) {
          const displayLabel = lower.split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(" ");
          if (!roomHandleMap[displayLabel]) roomHandleMap[displayLabel] = new Set();
          roomHandleMap[displayLabel].add(item.handle);
        }
      });
    });
    const allHandles = [...new Set(sanityProducts.map((p) => p.handle))];
    const medusaProducts = [];
    for (let i = 0; i < allHandles.length; i += 20) {
      const { products } = await sdk.store.product.list({
        handle: allHandles.slice(i, i + 20),
        fields: "id,title,handle,thumbnail,images,*variants,*variants.calculated_price",
        limit: 20
      });
      if (products) medusaProducts.push(...products);
    }
    const medusaMap = {};
    medusaProducts.forEach((p) => {
      let price = null;
      const v = p.variants?.[0];
      if (v?.calculated_price?.calculated_amount) {
        price = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v.calculated_price.calculated_amount);
      }
      medusaMap[p.handle] = { id: p.id, title: p.title, handle: p.handle, image: p.thumbnail || p.images?.[0]?.url || "", price: price || "" };
    });
    return Object.entries(roomHandleMap).map(([label, handleSet]) => ({
      label,
      products: [...handleSet].map((h) => medusaMap[h]).filter(Boolean).filter((p) => p.image),
    })).filter((r) => r.products.length > 0);
  } catch (error) { return []; }
}

export default async function RoomDetailPage({ params }) {
  const rooms = await getRoomsData();
  const currentRoomLabel = params.roomLabel.replace(/-/g, ' ');
  const currentRoom = rooms.find(r => r.label.toLowerCase() === currentRoomLabel.toLowerCase());
  
  return <RoomsClient rooms={rooms} initialRoomLabel={params.roomLabel} />;
}
