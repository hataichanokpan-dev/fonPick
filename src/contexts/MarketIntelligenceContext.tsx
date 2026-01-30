'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { MarketIntelligenceData } from '@/types/market-intelligence'

// ============================================================================
// TYPES
// ============================================================================

interface MarketIntelligenceContextValue {
  data: MarketIntelligenceData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface MarketIntelligenceProviderProps {
  children: ReactNode
}

// ============================================================================
// CONTEXT
// ============================================================================

const MarketIntelligenceContext = createContext<MarketIntelligenceContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * MarketIntelligenceProvider
 *
 * Provides market intelligence data to all consuming components.
 * Fetches data ONCE on mount and stores it in context state.
 * No automatic refetch - manual refetch only via refetch() function.
 *
 * Features:
 * - Single fetch on mount (no polling)
 * - Shared state across all consumers
 * - Manual refetch capability
 * - Error handling with proper typing
 * - Loading state management
 */
export function MarketIntelligenceProvider({ children }: MarketIntelligenceProviderProps) {
  const [data, setData] = useState<MarketIntelligenceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/market-intelligence?includeP0=true&includeP1=true&includeP2=true')
      if (!res.ok) {
        throw new Error('Failed to fetch market intelligence data')
      }
      const json = await res.json()

      // Handle both success and error responses from API
      if (json.success && json.data) {
        setData(json.data)
      } else {
        // API returned success: false or no data
        setData(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch ONCE on mount - never refetch automatically
  useEffect(() => {
    fetchData()
  }, [])

  const value: MarketIntelligenceContextValue = {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }

  return (
    <MarketIntelligenceContext.Provider value={value}>
      {children}
    </MarketIntelligenceContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useMarketIntelligenceContext
 *
 * Hook to access market intelligence context.
 * Must be used within MarketIntelligenceProvider.
 *
 * @throws Error if used outside of MarketIntelligenceProvider
 * @returns MarketIntelligenceContextValue
 */
export function useMarketIntelligenceContext() {
  const context = useContext(MarketIntelligenceContext)
  if (!context) {
    throw new Error('useMarketIntelligenceContext must be used within MarketIntelligenceProvider')
  }
  return context
}
