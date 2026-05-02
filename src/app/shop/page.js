import { sdk } from  '@/lib/medusaClient';
import ShopClient from  '@/components/pages/ShopClient';

export const metadata = {
  title: 'Shop | Aroha',
  description: 'Discover our curated collection of premium handcrafted furniture.',
};

async function getInitialData() {
  try {
    const [productsRes, collectionsRes, categoriesRes] = await Promise.all([
      sdk.store.product.list({ limit: 12, fields: "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants,*variants.calculated_price,*variants.prices,*variants.options,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*collection,*type,*tags,material,weight,origin_country,metadata" }),
      sdk.store.collection.list({ fields: "id,title,handle" }),
      sdk.store.category.list({ limit: 100, fields: "id,name,handle,description,parent_category_id" })
    ]);

    return {
      products: productsRes.products || [],
      collections: collectionsRes.collections || [],
      categories: categoriesRes.product_categories || [],
      totalCount: productsRes.count || 0
    };
  } catch (error) {
    console.error("Shop initial data fetch failed:", error);
    return { products: [], collections: [], categories: [], totalCount: 0 };
  }
}

export default async function ShopPage() {
  const data = await getInitialData();
  return <ShopClient initialData={data} />;
}
