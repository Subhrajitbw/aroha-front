/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'assets.mixkit.co',
      },
      {
        protocol: 'https',
        hostname: 'media.designcafe.com',
      },
      {
        protocol: 'https',
        hostname: 'media.arohahouse.com',
      }
    ],
  },
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
