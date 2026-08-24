/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'media.designcafe.com' },
      { protocol: 'https', hostname: 'media.arohahouse.com' }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  // cacheComponents: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'gsap', 
      'framer-motion', 
      'swiper',
      '@medusajs/js-sdk',
      'lucide-react'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Ensure fast production builds
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;

