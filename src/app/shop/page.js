import { sdk, customFetch } from '@/lib/medusaClient';
import ShopClient from '@/components/pages/ShopClient';


export const metadata = {
  title: 'Shop | Aroha',
  description: 'Discover our curated collection of premium handcrafted furniture.',
};

async function getInitialData() {
  try {
    // Get default region to ensure prices are calculated
    const regionRes = await sdk.store.region.list({ limit: 1 });
    const regionId = regionRes.regions?.[0]?.id;

    // 1. Fetch products and collections using standard SDK
    const [productsRes, collectionsRes] = await Promise.all([
      sdk.store.product.list({ limit: 12, region_id: regionId, fields: "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants,*variants.calculated_price,*variants.prices,*variants.options,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*collection,*type,*tags,material,weight,origin_country,metadata" }),
      sdk.store.collection.list({ fields: "id,title,handle" }),
    ]);

    // 2. Attempt specialized sidebar categories fetch, fallback to standard if it fails
    let categories = [];
    try {
      const categoriesRes = await customFetch("/store/sidebar-categories");
      categories = categoriesRes.categories || [];
    } catch (e) {
      console.warn("Sidebar categories custom fetch failed, falling back to standard list", e);
      let catOffset = 0;
      let catTotal = 1;
      while (categories.length < catTotal) {
        const res = await sdk.store.category.list({ limit: 100, offset: catOffset, fields: "id,name,handle,parent_category_id,*products" });
        const batch = res.product_categories || [];
        categories = [...categories, ...batch];
        catTotal = res.count || 0;
        catOffset += 100;
        if (batch.length === 0) break;
      }
    }

    return {
      products: productsRes.products || [],
      collections: collectionsRes.collections || [],
      categories,
      regionId,
      totalCount: productsRes.count || 0
    };
  } catch (error) {
    console.error("Shop initial data fetch failed:", error);
    return { products: [], collections: [], categories: [], totalCount: 0 };
  }
}

import { Suspense } from 'react';

export default async function ShopPage() {
  const data = await getInitialData();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-pulse text-stone-400 font-serif text-xl tracking-widest uppercase">Loading Collections...</div>
      </div>
    }>
      <ShopClient initialData={data} />
    </Suspense>
  );
}
