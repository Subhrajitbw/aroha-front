export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart/', '/checkout/'],
    },
    sitemap: 'https://arohahouse.com/sitemap.xml',
  };
}
