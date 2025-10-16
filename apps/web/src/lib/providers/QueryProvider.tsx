'use client';

/**
 * React Query Provider
 *
 * Configura React Query para toda la aplicación con:
 * - Cache automático de requests
 * - Revalidación en background
 * - Stale time configurado
 * - Retry logic inteligente
 * - DevTools en desarrollo
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data por 5 minutos
            staleTime: 1000 * 60 * 5,

            // Mantener data en cache por 10 minutos después de no usarse
            gcTime: 1000 * 60 * 10,

            // Reintentar failed queries 1 vez
            retry: 1,

            // Revalidar cuando la ventana recupera foco
            refetchOnWindowFocus: true,

            // Revalidar cuando se reconecta a internet
            refetchOnReconnect: true,

            // No refetch automático en mount (usar staleTime)
            refetchOnMount: false,
          },
          mutations: {
            // Reintentar mutations fallidas 0 veces (deben ser intencionales)
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}
