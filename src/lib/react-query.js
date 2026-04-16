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
      // Data is fresh for 1 hour by default (adjust as needed for dynamic stores)
      staleTime: 1000 * 60 * 60,
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
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "AROHA_QUERY_CACHE",
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

// -----------------------------
// Clients
// -----------------------------
export const medusa = sdk.store;
export const sanity = sanityClient;
export const sanityUrlFor = urlFor;

// -----------------------------
// Image Prefetch
// -----------------------------
export const prefetchImage = (url) => {
  if (!url) return;
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
      const response = await sdk.client.fetch(
        "/store/curated-categories",
        { method: "GET" }
      );

      // handle both shapes
      const data = response?.data ?? response;
      return data.curated_categories ?? { curated_categories: [] };
    } catch (error) {
      console.error("Curated categories fetch failed:", error);
      return { curated_categories: [] };
    }
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