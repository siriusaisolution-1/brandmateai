// src/components/query-provider.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

// Dinamički učitaj Devtools SAMO u development modu; u prod je no-op.
// Ako paket nije instaliran, catch vraća praznu komponentu (bez greške).
const Devtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@tanstack/react-query-devtools')
            .then((m) => m.ReactQueryDevtools)
            .catch(() => () => null),
        { ssr: false }
      )
    : (() => null);

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Devtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

