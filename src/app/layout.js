import { headers } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
import ClientLayout from '@/components/layout/ClientLayout';
import JsonLd from '@/components/seo/JsonLd';

export const viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  metadataBase: new URL('https://arohahouse.com'),
  title: {
    default: 'Aroha | Premium Furniture',
    template: '%s | Aroha',
  },
  description: 'Handcrafted premium furniture and interiors for modern living spaces. Luxury design meets sustainable craftsmanship.',
  keywords: ['luxury furniture', 'handcrafted decor', 'premium interiors', 'Aroha furniture'],
  authors: [{ name: 'Aroha House' }],
  creator: 'Aroha House',
  publisher: 'Aroha House',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://arohahouse.com',
    siteName: 'Aroha',
    title: 'Aroha | Premium Furniture',
    description: 'Handcrafted premium furniture and interiors for modern living spaces.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aroha Furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aroha | Premium Furniture',
    description: 'Handcrafted premium furniture and interiors for modern living spaces.',
    creator: '@arohahouse',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Simple but effective mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isNotDesktop = isMobile || /Tablet|iPad/i.test(userAgent);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aroha',
    url: 'https://arohahouse.com',
    logo: 'https://arohahouse.com/logo.png',
    sameAs: [
      'https://instagram.com/arohahouse',
      'https://facebook.com/arohahouse',
      'https://pinterest.com/arohahouse'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXXXXXXXX',
      contactType: 'customer service'
    }
  };

  return (
    <html lang="en">
      <head>
        <JsonLd data={organizationSchema} />
      </head>
      <body className="antialiased">
        <Providers>
          <ClientLayout isMobile={isMobile} isNotDesktop={isNotDesktop}>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
