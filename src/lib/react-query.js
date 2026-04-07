import { QueryClient } from "@tanstack/react-query";
import { sdk } from "./medusaClient";
import { sanityClient, urlFor } from "./sanityClient";

// -----------------------------
// Query Client
// -----------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
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