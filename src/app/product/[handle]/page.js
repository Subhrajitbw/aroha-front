import { sdk } from '@/lib/medusaClient';
import { sanityClient } from '@/lib/sanityClient';
import ProductClient from '@/components/pages/ProductClient';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { handle } = await params;
  try {
    const sanityProduct = await sanityClient.fetch(
      `*[_type == "product" && handle == $handle][0]{
        title,
        shortIntro,
        "imageUrl": coalesce(galleryR2[0].url, galleryR2[0].asset->url),
        "keywords": seoKeywords
      }`,
      { handle }
    );

    if (!sanityProduct) return { title: 'Product | Aroha' };

    return {
      title: `${sanityProduct.title} | Aroha`,
      description: sanityProduct.shortIntro || 'Premium handcrafted furniture.',
      keywords: sanityProduct.keywords || [],
      openGraph: {
        title: `${sanityProduct.title} | Aroha`,
        description: sanityProduct.shortIntro,
        url: `https://arohahouse.com/product/${handle}`,
        images: sanityProduct.imageUrl ? [{ url: sanityProduct.imageUrl, alt: sanityProduct.title }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: sanityProduct.title,
        description: sanityProduct.shortIntro,
        images: sanityProduct.imageUrl ? [sanityProduct.imageUrl] : [],
      }
    };
  } catch (error) {
    return { title: 'Product | Aroha' };
  }
}

async function getProductData(handle) {
  try {
    console.log(`[DEBUG] Fetching Sanity base product with handle: ${handle}`);

    const baseProduct = await sanityClient.fetch(
      `*[_type == "product" && (handle == $handle || slug.current == $handle)][0]`,
      { handle }
    );

    // Log the base product details instead of just a boolean
    console.log(`[DEBUG] Sanity baseProduct:`, baseProduct ? {
      title: baseProduct.title,
      medusaId: baseProduct.medusaId,
      handle: baseProduct.handle,
      slug: baseProduct.slug?.current
    } : 'Not found');

    if (!baseProduct) return null;

    console.log(`[DEBUG] Fetching full Sanity product data with medusaType: ${baseProduct.medusaType}`);

    const fullSanityProduct = await sanityClient.fetch(
      `*[_type == "product" && (handle == $handle || slug.current == $handle)][0]{
        ...,
        "galleryR2": galleryR2[]{ "url": coalesce(url, asset->url) },
        customizationOverride->{customizationAttributes},
        afterSalesOverride->{
          deliveryOptions,
          shipping,
          installationSupport,
          returnPolicy,
          lifetimeSupportServices,
          supportContact,
          warranties
        },
        trustOverride->{content},
        "defaultCustomization": *[_type=="customizationMaster" && $medusaType in applicableMedusaTypes && isDefault==true][0]{customizationAttributes},
        "defaultPolicy": *[_type=="policyDocument" && policyType=="afterSales" && $medusaType in applicableMedusaTypes && isDefault==true][0]{
          deliveryOptions,
          shipping,
          installationSupport,
          returnPolicy,
          lifetimeSupportServices,
          supportContact,
          warranties
        },
        "defaultTrust": *[_type=="trustMaster" && isDefault==true][0]{content},
        relatedProducts[]->{ medusaId, title, handle, "thumbnailUrl": thumbnailR2.url, shortIntro }
      }`,
      { handle, medusaType: baseProduct.medusaType }
    );

    console.log(`[DEBUG] Full Sanity product retrieved:`, fullSanityProduct ? {
      title: fullSanityProduct.title,
      customizationOverrideSet: !!fullSanityProduct.customizationOverride,
      relatedProductsLength: fullSanityProduct.relatedProducts?.length || 0
    } : 'Not found');

    // 2. Fetch from Medusa
    console.log(`[DEBUG] Fetching from Medusa with ID: ${fullSanityProduct.medusaId}`);

    const { product: medusaData } = await sdk.store.product.retrieve(
      fullSanityProduct.medusaId,
      {
        fields: "id,title,subtitle,description,handle,thumbnail,*images,*options,*variants,*variants.calculated_price,*variants.prices,*variants.options,*variants.sku,*variants.manage_inventory,*variants.inventory_quantity,*collection,*type,*tags,material,weight,origin_country,metadata"
      }
    );

    console.log(`[DEBUG] Medusa product retrieved. Variants: ${medusaData.variants || 0}`);

    // 3. Resolve Overrides (Server-side)
    const resolvedData = {
      sanityContent: fullSanityProduct,
      medusaProduct: medusaData,
      resolvedCustomization:
        fullSanityProduct.customizationOverride?.customizationAttributes ||
        fullSanityProduct.defaultCustomization?.customizationAttributes ||
        [],
      resolvedAfterSales:
        fullSanityProduct.afterSalesOverride ||
        fullSanityProduct.defaultPolicy ||
        null,
      resolvedTrust:
        fullSanityProduct.trustOverride?.content ||
        fullSanityProduct.defaultTrust?.content ||
        null,
    };

    console.log(`[DEBUG] Resolved product data for ${handle} successfully.`);
    return resolvedData;
  } catch (error) {
    console.error(`[ERROR] Product data fetch failed for handle: ${handle}`, error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const data = await getProductData(handle);

  if (!data) {
    notFound();
  }

  const { sanityContent, medusaProduct } = data;
  const price = medusaProduct.variants?.[0]?.calculated_price?.calculated_amount;
  const currency = medusaProduct.variants?.[0]?.calculated_price?.currency_code?.toUpperCase();

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanityContent.title,
    description: sanityContent.shortIntro,
    image: sanityContent.galleryR2?.map(img => img.url) || [],
    sku: medusaProduct.variants?.[0]?.sku,
    brand: {
      '@type': 'Brand',
      name: 'Aroha'
    },
    offers: {
      '@type': 'Offer',
      url: `https://arohahouse.com/product/${handle}`,
      priceCurrency: currency || 'INR',
      price: price || 0,
      availability: medusaProduct.variants?.[0]?.inventory_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Aroha'
      }
    }
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <ProductClient initialData={data} />
    </>
  );
}