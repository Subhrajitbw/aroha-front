export default function manifest() {
  return {
    name: 'Aroha House',
    short_name: 'Aroha',
    description: 'Handcrafted premium furniture and interiors for modern living spaces.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fdfbf9',
    theme_color: '#1c1917',
    icons: [
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png?v=2',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
