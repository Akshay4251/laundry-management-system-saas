// app/providers.tsx
// ✅ OPTIMIZED: Better default staleTime and retry logic

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import Script from 'next/script';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // ⚡ OPTIMIZED: Better defaults for performance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // ⚡ CHANGED: 5 minutes (was 1 minute)
            gcTime: 10 * 60 * 1000,   // ⚡ ADDED: Garbage collection time
            refetchOnWindowFocus: false,
            refetchOnReconnect: true, // ⚡ ADDED: Refetch on reconnect
            retry: 1,
            // ⚡ ADDED: Better error handling
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // ⚡ ADDED: Mutation defaults
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        // ⚡ ADDED: Reduce polling interval
        refetchInterval={5 * 60} // 5 minutes instead of default 60s
        refetchOnWindowFocus={true}
      >
        {/* ✅ REMOVED: StoreProvider (moved to unified context) */}
        {children}
        <Toaster position="top-right" richColors closeButton />
        
        {/* Razorpay Checkout Script */}
        <Script
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </SessionProvider>
      {/* ⚡ OPTIMIZED: Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}