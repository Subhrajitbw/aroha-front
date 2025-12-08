import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// 1. Configure the Client
export const sanityClient = createClient({
  projectId: 'plyu49lt', // <--- Paste your ID here
  dataset: 'production',             // Default dataset name
  useCdn: true,                      // true = fast (cached), false = fresh data
  apiVersion: '2024-01-01',          // Use today's date or '2024-01-01'
});

// 2. Helper for Images
// Sanity gives you a reference ID for images. This helper turns that into a real URL.
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source) {
  return builder.image(source);
}
