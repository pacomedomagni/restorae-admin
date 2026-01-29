
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import axios from 'axios';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            // Retry cancelled requests (waiting for auth) but not 401s
            retry: (failureCount, error: any) => {
              // If cancelled due to no token, retry (session loading)
              if (axios.isCancel(error)) {
                return failureCount < 5;
              }
              // Don't retry 401s
              if (error?.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(500 * (attemptIndex + 1), 2000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
