import { Suspense } from 'react';
import './globals.css';
import { Providers } from './providers';
import ClientLayout from '@/components/layout/ClientLayout';
import JsonLd from '@/components/seo/JsonLd';
import PwaPrompt from '@/components/layout/PwaPrompt';

export const viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL('https://arohahouse.com'),
  manifest: '/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aroha',
  },
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
  // REMOVED dynamic headers() call to enable Static Site Generation (SSG).
  // Mobile detection is now handled gracefully on the client side in ClientLayout/NavBar.
  
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
        {/* PWA / Mobile optimization */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aroha" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Service Worker Registration — Disabled in Dev to prevent interference with HMR */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registered');
                      
                      // Check for updates on every page load
                      registration.update();

                      // Listen for the waiting service worker
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available; auto-reload to apply it
                            window.location.reload();
                          }
                        });
                      });
                    },
                    function(err) { console.log('Service Worker registration failed: ', err); }
                  );
                });

                // Listen for controlling service worker change
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <PwaPrompt />
        </Providers>
      </body>
    </html>
  );
}
