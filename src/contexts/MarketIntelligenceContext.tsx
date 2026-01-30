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

  const fetchData = async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/market-intelligence?includeP0=true&includeP1=true&includeP2=true', {
        signal,
      })
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
      // Don't set error if request was aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch ONCE on mount - never refetch automatically
  useEffect(() => {
    const abortController = new AbortController()
    fetchData(abortController.signal)

    // Cleanup function to abort fetch on unmount
    return () => {
      abortController.abort()
    }
  }, [])

  // CRITICAL: Clear data after 30 minutes to prevent memory accumulation
  useEffect(() => {
    const cleanupTimer = setTimeout(() => {
      // Clear old data to free memory
      setData(null)
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearTimeout(cleanupTimer)
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
