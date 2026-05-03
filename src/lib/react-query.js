import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { sdk } from "./medusaClient";
import { sanityClient, urlFor } from "./sanityClient";

// -----------------------------
// Query Client Configuration
// -----------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 30 seconds (better for development)
      staleTime: 1000 * 30,
      // Keep data in cache for 24 hours even if unused
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Aggressive caching: only refetch if data is stale
    },
  },
});

// -----------------------------
// Persistence Setup (LocalStorage)
// -----------------------------
if (typeof window !== "undefined") {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: "AROHA_QUERY_CACHE",
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// -----------------------------
// Clients
// -----------------------------
export const medusa = sdk.store;
export const sanity = sanityClient;
export const sanityUrlFor = urlFor;

// -----------------------------
// Image Prefetch (Optimized to prevent RAM bloat)
// -----------------------------
const prefetchedUrls = new Set();
export const prefetchImage = (url) => {
  if (!url || typeof window === "undefined" || prefetchedUrls.has(url)) return;
  
  // Cap prefetching to prevent RAM explosion (1GB+ RAM issues)
  if (prefetchedUrls.size > 100) return; 

  prefetchedUrls.add(url);
  const img = new Image();
  img.src = url;
};

// -----------------------------
// API Layer (IMPORTANT)
// -----------------------------
export const medusaApi = {
  async getRegion() {
    const { regions } = await sdk.store.region.list({ limit: 1 });
    return regions?.[0] || null;
  },

  async get(url, config = {}) {
    return sdk.client.fetch(url, { method: "GET", ...config });
  },

  async getCuratedCategories() {
    try {
      console.log("Fetching curated categories...");
      const response = await sdk.client.fetch(
        "/store/curated-categories",
        { method: "GET" }
      );
      console.log("Curated categories response:", response);

      const data = response?.data ?? response;
      const curated_categories = Array.isArray(data) 
        ? data 
        : (data?.curated_categories ?? []);

      return { curated_categories };
    } catch (error) {
      console.error("Curated categories fetch failed:", error);
      return { curated_categories: [] };
    }
  },

  async getNewProducts() {
    console.log("Fetching new products...");
    const response = await sdk.client.fetch("/store/custom/new", { method: "GET" });
    console.log("New products response:", response);
    return response.products || response.data || response;
  },

  async getDiscountedProducts() {
    console.log("Fetching discounted products...");
    const response = await sdk.client.fetch("/store/custom/discounted", { method: "GET" });
    console.log("Discounted products response:", response);
    return response.products || response.data || response;
  },
};
// -----------------------------
// Prefetch
// -----------------------------
export const prefetchCategories = async () => {
  await queryClient.prefetchQuery({
    queryKey: ["curated-categories"],
    queryFn: async () => {
      const data = await medusaApi.getCuratedCategories();

      data?.curated_categories?.forEach((cat) => {
        prefetchImage(cat.image);

        cat.featuredProducts?.forEach((prod) => {
          prefetchImage(prod.thumbnail);
        });
      });

      return data;
    },
  });
};

export const prefetchProductCarousel = async (tab = "New Designs") => {
  await queryClient.prefetchQuery({
    queryKey: ["products-carousel", tab],
    queryFn: async () => {
      let data = [];
      if (tab === "New Designs") {
        data = await medusaApi.getNewProducts();
      } else if (tab === "Sale") {
        data = await medusaApi.getDiscountedProducts();
      }
      
      if (Array.isArray(data)) {
        data.forEach(p => prefetchImage(p.thumbnail || p.image));
      }
      return data;
    },
  });
};

export const prefetchAllFrontpageData = async () => {
  // Fire both in parallel
  return Promise.all([
    prefetchCategories(),
    prefetchProductCarousel("New Designs"),
    prefetchProductCarousel("Sale"),
  ]);
};