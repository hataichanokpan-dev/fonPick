/**
 * Data Insight API Endpoint
 *
 * Analyzes conflicting market signals and provides a unified verdict.
 * Uses Thai SET-specific resolution rules.
 *
 * Query Parameters:
 * - None required
 *
 * Caching:
 * - Cache-Control: public, s-maxage=60, stale-while-revalidate=120
 *
 * Error Handling:
 * - Always returns 200 status with valid structure
 * - Sets null for dataInsight if insufficient data
 * - Includes error field if critical failure occurs
 */

import { NextRequest, NextResponse } from 'next/server'
import { aggregateMarketIntelligence } from '@/services/market-intelligence'
import { resolveSignals } from '@/services/data-insight'
import type { DataInsight } from '@/types/data-insight'
import type { SectorRotationAnalysis } from '@/types/sector-rotation'

// ============================================================================
// RTDB FETCHERS
// ============================================================================

import { fetchMarketOverview } from '@/lib/rtdb/market-overview'
import { fetchInvestorType } from '@/lib/rtdb/investor-type'
import { fetchIndustrySector } from '@/lib/rtdb/industry-sector'

// ============================================================================
// TYPES
// ============================================================================

interface DataInsightResponse {
  success: boolean
  data?: {
    dataInsight: DataInsight | null
  }
  error?: string
  meta?: {
    timestamp: number
    processingTime: number
    sourcesFetched: {
      marketOverview: boolean
      investorType: boolean
      industrySector: boolean
    }
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  'CDN-Cache-Control': 'public, s-maxage=60',
  'Vary': 'Accept-Encoding',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build source tracking object
 */
interface SourceTracker {
  marketOverview: boolean
  investorType: boolean
  industrySector: boolean
}

function createSourceTracker(): SourceTracker {
  return {
    marketOverview: false,
    investorType: false,
    industrySector: false,
  }
}

/**
 * Format error message for client
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Convert regime confidence string to numeric value
 */
function convertRegimeConfidence(confidence: string | number): number {
  if (typeof confidence === 'number') return confidence

  // Map string confidence levels to numeric percentages
  const confidenceMap: Record<string, number> = {
    'High': 85,
    'Medium': 60,
    'Low': 30,
  }

  return confidenceMap[confidence] ?? 50 // Default to 50 if unknown
}

/**
 * Transform market intelligence data to data insight input
 */
function transformToDataInsightInput(marketData: {
  regime: { regime: string; confidence: string | number; focus: string; caution: string } | null
  smartMoney: {
    score: number
    combinedSignal: string
    riskSignal: string
    confidence: number
    investors: {
      foreign: { todayNet: number; strength: string }
      institution: { todayNet: number; strength: string }
      retail: { todayNet: number; strength: string }
      prop: { todayNet: number; strength: string }
    }
    primaryDriver?: string
  } | null
  sectorRotation: SectorRotationAnalysis | null
}) {
  // Return null if any critical data is missing
  if (!marketData.regime || !marketData.smartMoney || !marketData.sectorRotation) {
    return null
  }

  // Map SectorPerformance to expected format
  const mapSectorPerformance = (perf: Array<{ sector: { name: string }; vsMarket: number }>) =>
    perf.map(p => ({
      sector: { name: p.sector.name },
      vsMarket: p.vsMarket,
    }))

  return {
    regime: {
      type: marketData.regime.regime as 'Risk-On' | 'Neutral' | 'Risk-Off',
      confidence: convertRegimeConfidence(marketData.regime.confidence),
      focus: marketData.regime.focus,
      caution: marketData.regime.caution,
    },
    smartMoney: {
      score: marketData.smartMoney.score,
      combinedSignal: marketData.smartMoney.combinedSignal,
      riskSignal: marketData.smartMoney.riskSignal,
      confidence: marketData.smartMoney.confidence,
      investors: marketData.smartMoney.investors,
      primaryDriver: marketData.smartMoney.primaryDriver,
    },
    sector: {
      pattern: marketData.sectorRotation.pattern,
      concentration: marketData.sectorRotation.leadership.concentration,
      focusSectors: marketData.sectorRotation.focusSectors,
      avoidSectors: marketData.sectorRotation.avoidSectors,
      leadership: {
        leaders: mapSectorPerformance(marketData.sectorRotation.leadership.leaders),
        laggards: mapSectorPerformance(marketData.sectorRotation.leadership.laggards),
      },
    },
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const sourcesFetched = createSourceTracker()

  try {
    // Fetch required RTDB data sources in parallel
    const [marketOverview, investorType, industrySector] = await Promise.allSettled([
      fetchMarketOverview(),
      fetchInvestorType(),
      fetchIndustrySector(),
    ])

    // Track which sources were successfully fetched
    sourcesFetched.marketOverview =
      marketOverview.status === 'fulfilled' && marketOverview.value !== null
    sourcesFetched.investorType =
      investorType.status === 'fulfilled' && investorType.value !== null
    sourcesFetched.industrySector =
      industrySector.status === 'fulfilled' && industrySector.value !== null

    // Extract values or null
    const marketOverviewData =
      marketOverview.status === 'fulfilled' ? marketOverview.value : null
    const investorTypeData = investorType.status === 'fulfilled' ? investorType.value : null
    const industrySectorData =
      industrySector.status === 'fulfilled' ? industrySector.value : null

    // Build input for market intelligence aggregator
    const input = {
      marketOverview: marketOverviewData
        ? {
            setIndex: marketOverviewData.set.index,
            setChange: marketOverviewData.set.change,
            setChangePercent: marketOverviewData.set.changePercent,
            totalValue: marketOverviewData.totalValue,
            totalVolume: marketOverviewData.totalVolume,
            timestamp: marketOverviewData.timestamp,
          }
        : null,
      investorType: investorTypeData
        ? {
            foreign: investorTypeData.foreign,
            institution: investorTypeData.institution,
            retail: investorTypeData.retail,
            prop: investorTypeData.prop,
            timestamp: investorTypeData.timestamp,
          }
        : null,
      industrySector: industrySectorData
        ? {
            sectors: industrySectorData.sectors,
            timestamp: industrySectorData.timestamp,
          }
        : null,
      rankings: null, // Not needed for data insight
      historical: undefined,
    }

    // Aggregate market intelligence (P0 only: regime + smart money + sector)
    const marketIntelligence = await aggregateMarketIntelligence(input, {
      includeP0: true,
      includeP1: true,
      includeP2: false, // Not needed for data insight
    })

    // Transform to data insight input
    const dataInsightInput = transformToDataInsightInput({
      regime: marketIntelligence.regime,
      smartMoney: marketIntelligence.smartMoney,
      sectorRotation: marketIntelligence.sectorRotation,
    })

    let dataInsight: DataInsight | null = null

    // Only resolve if we have complete data
    if (dataInsightInput) {
      dataInsight = resolveSignals(dataInsightInput)
    }

    const processingTime = Date.now() - startTime

    const response: DataInsightResponse = {
      success: true,
      data: {
        dataInsight,
      },
      meta: {
        timestamp: Date.now(),
        processingTime,
        sourcesFetched,
      },
    }

    return NextResponse.json(response, {
      status: 200,
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime

    // Return error response with valid structure
    const response: DataInsightResponse = {
      success: false,
      error: formatError(error),
      data: {
        dataInsight: null,
      },
      meta: {
        timestamp: Date.now(),
        processingTime,
        sourcesFetched,
      },
    }

    return NextResponse.json(response, {
      status: 200, // Always return 200 with error field
      headers: CACHE_HEADERS,
    })
  }
}

// ============================================================================
// EDGE RUNTIME CONFIG
// ============================================================================

export const runtime = 'nodejs' // Use Node.js runtime for RTDB operations
export const dynamic = 'force-dynamic' // Force dynamic rendering
