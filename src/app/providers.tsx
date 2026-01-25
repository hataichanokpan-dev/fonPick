/**
 * Providers Component
 *
 * Client-side providers for the application.
 * Includes React Query for data fetching and caching.
 *
 * This is a Client Component to ensure QueryClient is created on the client side.
 * This prevents hydration mismatches and ensures proper React Query functionality.
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers wrapper component
 *
 * Wraps the application with necessary providers:
 * - QueryClientProvider: React Query for data fetching
 */
export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance on client side
  // Using useState ensures the client is created once and persists across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 1 minute
            staleTime: 60 * 1000,
            // Don't refetch on window focus (reduces unnecessary network requests)
            refetchOnWindowFocus: false,
            // Retry failed requests up to 3 times
            retry: 3,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
            // Cache time: 5 minutes (GC time for unused queries)
            gcTime: 5 * 60 * 1000,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
