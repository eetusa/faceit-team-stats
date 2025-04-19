'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './globals.css';
import { Suspense } from 'react';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Suspense>
      </body>
    </html>
  );
}