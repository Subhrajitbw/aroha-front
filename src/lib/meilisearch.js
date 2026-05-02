import { MeiliSearch } from 'meilisearch';

// Initialize MeiliSearch client
export const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY || '', // Optional: for production
});

// Index name (should match your backend setup)
export const PRODUCTS_INDEX = 'products';
