export default function manifest() {
  return {
    name: 'Aroha House',
    short_name: 'Aroha',
    description: 'Handcrafted premium furniture and interiors for modern living spaces.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf9',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
