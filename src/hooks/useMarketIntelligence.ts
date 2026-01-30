/**
 * useMarketIntelligence Hook
 *
 * Context-based hook for accessing market intelligence data.
 * Replaces React Query implementation with lighter Context + useState pattern.
 *
 * Features:
 * - Shared data via Context (single fetch, multiple consumers)
 * - No React Query overhead for market intelligence data
 * - Manual refetch only (no auto-refresh)
 * - Proper TypeScript types
 * - Memory efficient
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, error } = useMarketIntelligence()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorState />
 *
 *   return (
 *     <>
 *       <MarketRegimeCard data={data?.regime} />
 *       <SmartMoneyCard data={data?.smartMoney} />
 *       <SectorStrengthCard data={data?.sectorRotation} />
 *       <TabbedMovers data={data?.activeStocks} />
 *     </>
 *   )
 * }
 * ```
 */

import { useMarketIntelligenceContext } from '@/contexts/MarketIntelligenceContext'
import type {
  MarketIntelligenceData,
  MarketRegimeData,
  SmartMoneyAnalysis,
  SectorRotationAnalysis,
  ActiveStocksAnalysis,
} from '@/types/market-intelligence'

// ==================================================================
// TYPES
// ==================================================================

export interface UseMarketIntelligenceResult {
  data: MarketIntelligenceData | null
  regime: MarketRegimeData | null
  smartMoney: SmartMoneyAnalysis | null
  sectorRotation: SectorRotationAnalysis | null
  activeStocks: ActiveStocksAnalysis | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// ==================================================================
// MAIN HOOK
// ==================================================================

/**
 * Consolidated hook for fetching market intelligence data
 *
 * This hook accesses market intelligence data from Context,
 * which is fetched once on app mount and shared across all consumers.
 *
 * @returns Context-based result with market intelligence data
 */
export function useMarketIntelligence(): UseMarketIntelligenceResult {
  const context = useMarketIntelligenceContext()

  return {
    data: context.data,
    regime: context.data?.regime ?? null,
    smartMoney: context.data?.smartMoney ?? null,
    sectorRotation: context.data?.sectorRotation ?? null,
    activeStocks: context.data?.activeStocks ?? null,
    isLoading: context.isLoading,
    error: context.error,
    refetch: context.refetch,
  }
}

// ==================================================================
// SELECTOR HOOKS
// ==================================================================

/**
 * Hook for fetching only market regime data
 * Uses the same shared Context as useMarketIntelligence
 */
export function useMarketRegime() {
  const { data, isLoading, error, refetch } = useMarketIntelligence()
  return {
    data: data?.regime ?? null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching only smart money data
 * Uses the same shared Context as useMarketIntelligence
 */
export function useSmartMoney() {
  const { data, isLoading, error, refetch } = useMarketIntelligence()
  return {
    data: data?.smartMoney ?? null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching only sector rotation data
 * Uses the same shared Context as useMarketIntelligence
 */
export function useSectorRotation() {
  const { data, isLoading, error, refetch } = useMarketIntelligence()
  return {
    data: data?.sectorRotation ?? null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching only active stocks data
 * Uses the same shared Context as useMarketIntelligence
 */
export function useActiveStocks() {
  const { data, isLoading, error, refetch } = useMarketIntelligence()
  return {
    data: data?.activeStocks ?? null,
    isLoading,
    error,
    refetch,
  }
}
