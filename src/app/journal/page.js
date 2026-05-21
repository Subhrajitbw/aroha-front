import { sanityClient } from  '@/lib/sanityClient';
import JournalClient from  '@/components/pages/JournalClient';

export const metadata = {
  title: 'Journal',
  description: 'Curated stories celebrating the art of living beautifully, design insights, and timeless inspiration from Aroha.',
  openGraph: {
    title: 'Journal | Aroha',
    description: 'Curated stories celebrating the art of living beautifully.',
    url: 'https://arohahouse.com/journal',
    type: 'website',
  },
};

async function getJournalPosts() {
  try {
    const posts = await sanityClient.fetch(
      `*[_type == "post"] | order(publishedAt desc){
        _id,
        title,
        slug,
        excerpt,
        mainImage{
          asset->{
            url
          },
          alt
        },
        publishedAt
      }`
    );
    return posts;
  } catch (error) {
    console.error("Failed to fetch journal posts:", error);
    return [];
  }
}

export default async function JournalPage() {
  const posts = await getJournalPosts();
  return <JournalClient initialPosts={posts} />;
}
