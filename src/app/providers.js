'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from  '@/lib/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SiteProvider } from '../context/SiteContext';
import { AuthModalProvider } from '../context/AuthModalContext';

export function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <SiteProvider>
          <AuthModalProvider>
            {children}
          </AuthModalProvider>
        </SiteProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
