/**
 * Providers Component
 *
 * Client-side providers for the application.
 * Includes:
 * - QueryClientProvider: React Query for features that still need it (watchlist, etc.)
 * - MarketIntelligenceProvider: Context-based provider for market intelligence data
 *
 * This is a Client Component to ensure QueryClient is created on the client side.
 * This prevents hydration mismatches and ensures proper React Query functionality.
 *
 * Architecture Change:
 * - Market intelligence data now uses Context + useState pattern
 * - React Query reserved for other features with dynamic data needs
 * - Reduced QueryClient maxSize since market data moved to Context
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MarketIntelligenceProvider } from '@/contexts/MarketIntelligenceContext'
import { useState, type ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Providers wrapper component
 *
 * Wraps the application with necessary providers:
 * - QueryClientProvider: React Query for other features (watchlist, etc.)
 * - MarketIntelligenceProvider: Context for market intelligence data
 */
export function Providers({ children }: ProvidersProps) {
  // Minimal QueryClient for other features (watchlist, etc.)
  // Reduced from 50 to 20 since market data now in Context
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Conservative stale time for remaining features
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Don't refetch on window focus, mount, or reconnect
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            // Reduced retry to save memory
            retry: 1,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Keep cache for 10 minutes (reduced from 24 hours)
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
        // CRITICAL: Limit cache size to prevent unbounded memory growth
        // Reduced from 50 to 20 since market intelligence data is now in Context
        maxSize: 20, // Maximum number of queries in cache
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <MarketIntelligenceProvider>{children}</MarketIntelligenceProvider>
    </QueryClientProvider>
  )
}
