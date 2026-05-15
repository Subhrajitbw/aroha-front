import { sdk } from  '@/lib/medusaClient';
import ShopClient from '@/components/pages/ShopClient';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params }) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  try {
    const { product_categories } = await sdk.store.category.list({ handle, limit: 1 });
    const category = product_categories?.[0];
    const title = `${category?.name || 'Category'} | Aroha Shop`;
    const description = category?.description || `Browse our exclusive ${category?.name} collection at Aroha.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://arohahouse.com/shop/category/${handle}`,
        type: 'website',
      }
    };
  } catch (error) {
    return { title: 'Category | Aroha Shop' };
  }
}

async function getInitialData(categoryHandle) {
  try {
    // First get the category ID from handle
    const { product_categories } = await sdk.store.category.list({ handle: categoryHandle, limit: 1 });
    const category = product_categories?.[0];
    const regionRes = await sdk.store.region.list({ limit: 1 });
    const regionId = regionRes.regions?.[0]?.id;
    
    const [productsRes, collectionsRes, categoriesRes] = await Promise.all([
      category 
        ? sdk.store.product.list({ category_id: [category.id], limit: 12, region_id: regionId, fields: "id,title,handle,thumbnail,variants.calculated_price,variants.prices.*,images,created_at,collection_id,tags" })
        : { products: [], count: 0 },
      sdk.store.collection.list({ fields: "id,title,handle" }),
      sdk.store.category.list({ limit: 100, fields: "id,name,handle,description,parent_category_id,*products" })
    ]);

    return {
      products: productsRes.products || [],
      collections: collectionsRes.collections || [],
      categories: categoriesRes.product_categories || [],
      regionId,
      totalCount: productsRes.count || 0,
      selectedCategoryHandle: categoryHandle
    };
  } catch (error) {
    console.error("Category initial data fetch failed:", error);
    return { products: [], collections: [], categories: [], totalCount: 0 };
  }
}

export default async function CategoryPage({ params }) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  const data = await getInitialData(handle);
  const categoryName = data.categories.find(c => c.handle === handle)?.name || 'Shop';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://arohahouse.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://arohahouse.com/shop'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `https://arohahouse.com/shop/category/${rawHandle}`
      }
    ]
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <ShopClient initialData={data} />
    </>
  );
}
