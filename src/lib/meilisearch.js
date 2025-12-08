import { MeiliSearch } from 'meilisearch';

// Initialize MeiliSearch client
export const searchClient = new MeiliSearch({
  host: import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: import.meta.env.VITE_MEILISEARCH_KEY || '', // Optional: for production
});

// Index name (should match your backend setup)
export const PRODUCTS_INDEX = 'products';
