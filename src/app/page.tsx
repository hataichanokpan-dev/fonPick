/**
 * Unified Homepage (Server Component)
 * Single dashboard merging market overview and market intelligence
 *
 * Investment Decision Flow:
 * 1. Regime (Risk-On/Off foundation)
 * 2. Smart Money (Confirmation from foreign/institution)
 * 3. Sectors (Where to focus)
 * 4. Stocks (Specific opportunities)
 *
 * Data fetching strategy:
 * 1. Uses fetchUnifiedMarketData() for single-point data fetching
 * 2. Client components fetch their own analysis via /api/market-intelligence
 * 3. Handles data fetching errors gracefully
 */

import {
  SetSnapshot,
  MoneyFlowChart,
  SectorHeatmap,
  TopRankings,
  Week52Range,
  SetPERatio,
  VolatilityIndicator,
} from '@/components/home'
import { ErrorFallback, DataFreshness } from '@/components/shared'
import { ResponsiveGrid, AsymmetricWide, AsymmetricMedium, AsymmetricNarrow } from '@/components/layout'
import {
  MarketStatusBanner,
  MarketRegimeCard,
  SmartMoneyCard,
  DailyFocusList,
  SectorStrengthCard,
  AccumulationPatternsCard,
  ActiveStocksCard,
} from '@/components/dashboard'
import { fetchUnifiedMarketData } from '@/lib/unified-data'
import type { UnifiedMarketData } from '@/lib/unified-data'
import { getMarketStatus } from '@/lib/rtdb'

// ============================================================================
// TYPES
// ============================================================================

type HomepageDataResult = UnifiedMarketData | { error: string }

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch and process homepage data
 */
async function fetchHomepageData(): Promise<HomepageDataResult> {
  try {
    // Fetch all data in one call
    const data = await fetchUnifiedMarketData({
      includeP0: true,
      includeP1: true,
      includeP2: true,
      topSectorsCount: 5,
      bottomSectorsCount: 5,
      topStocksCount: 10,
    })

    // Check if we have at least some data
    const hasMarket = !!data.marketOverview
    const hasInvestor = !!data.investorType
    const hasSector = !!data.industrySector

    // If no data at all, return error info
    if (!hasMarket && !hasInvestor && !hasSector) {
      return {
        error: 'RTDB_UNAVAILABLE',
      }
    }

    return data
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Type guard to check if result is an error
 */
function isHomepageDataError(result: HomepageDataResult): result is { error: string } {
  return 'error' in result
}

/**
 * Get error message based on error type
 */
function getErrorMessage(error: string): { title: string; message: string } {
  if (error === 'RTDB_UNAVAILABLE') {
    return {
      title: 'No market data available',
      message:
        'Market data is not currently available. The system may be updating or the market might be closed. Please check back later.',
    }
  }

  if (error === 'NO_DATA_IN_LOOKBACK_PERIOD') {
    return {
      title: 'No market data available',
      message:
        'No market data found for the past 7 days. The data source may be temporarily unavailable or the market has been closed for an extended period.',
    }
  }

  if (error.includes('Permission denied')) {
    return {
      title: 'Firebase Permission Denied',
      message:
        "Your Firebase security rules don't allow read access. Please update your Realtime Database rules to allow public read access or configure authentication.",
    }
  }

  return {
    title: 'Unable to load market data',
    message: `Error: ${error}. Please check your connection and try again.`,
  }
}

// ============================================================================
// PRIORITY SECTION LABELS
// ============================================================================

/**
 * Priority Section Label Component
 * Displays priority badge (P0/P1/P2) with section title
 */
function PrioritySectionLabel({
  priority,
  label,
}: {
  priority: 'P0' | 'P1' | 'P2'
  label: string
}) {
  const colors = {
    P0: 'text-up-primary bg-up-soft/20 border-up-primary/30',
    P1: 'text-accent-blue bg-accent-blue/20 border-accent-blue/30',
    P2: 'text-warn bg-warn/20 border-warn/30',
  }

  return (
    <div
      className={`flex items-center gap-2 mb-3 px-2 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${colors[priority]}`}
    >
      <span>{priority}</span>
      <span className="text-text-secondary">{label}</span>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function HomePage() {
  const result = await fetchHomepageData()

  // Handle error case - show error message
  if (isHomepageDataError(result)) {
    const errorInfo = getErrorMessage(result.error)

    return (
      <div className="max-w-4xl mx-auto">
        <ErrorFallback title={errorInfo.title} message={errorInfo.message} />
      </div>
    )
  }

  // Extract data for easier access
  const { marketOverview, investorType, industrySector, rankings, regimeAnalysis, marketIntelligence } = result

  // Get market status for banner
  const marketStatus = marketOverview ? getMarketStatus(marketOverview) : { isOpen: false }

  // Build regime data for banner
  const bannerRegime = regimeAnalysis ?? {
    regime: 'Neutral' as const,
    confidence: 'Low' as const,
    reasons: [],
    focus: 'Insufficient data for analysis',
    caution: 'Market data not available',
  }

  // Extract isOpen from marketStatus, defaulting to false if it's an error string
  const isMarketOpen = typeof marketStatus === 'object' && 'isOpen' in marketStatus
    ? marketStatus.isOpen
    : false

  return (
    <div className="space-y-6">
      {/* 1. Sticky Status Banner */}
      {marketOverview && (
        <MarketStatusBanner
          regime={bannerRegime.regime}
          confidence={bannerRegime.confidence}
          setIndex={marketOverview.set.index}
          setChange={marketOverview.set.change}
          setChangePercent={marketOverview.set.changePercent}
          isMarketOpen={isMarketOpen}
          lastUpdate={marketOverview.timestamp}
        />
      )}

      {/* 2. Market Snapshot */}
      {marketOverview && (
        <>
          <SetSnapshot
            data={marketOverview.set}
            totalMarketCap={marketOverview.totalMarketCap}
          />
          <DataFreshness timestamp={marketOverview.timestamp} />
        </>
      )}

      {/* Market Context Row - 4 column grid */}
      {marketOverview && (
        <ResponsiveGrid preset="quad" gap="compact">
          <Week52Range
            current={marketOverview.set.index}
            high={marketOverview.set.index * 1.1}
            low={marketOverview.set.index * 0.9}
          />
          <SetPERatio currentPE={15.2} historicalAvg={14.5} />
          <VolatilityIndicator volatility={12} average={15} />
        </ResponsiveGrid>
      )}

      {/* 3. P0: Market Regime + Smart Money + Daily Focus (asymmetric grid) */}
      <section aria-labelledby="p0-heading">
        <h2 id="p0-heading" className="sr-only">
          P0: Market Overview - Market Regime and Smart Money Analysis
        </h2>
        <PrioritySectionLabel priority="P0" label="Market Overview" />
        <ResponsiveGrid preset="asymmetric" gap="compact">
          <AsymmetricWide>
            <MarketRegimeCard variant="prominent" />
          </AsymmetricWide>
          <AsymmetricMedium>
            <SmartMoneyCard />
          </AsymmetricMedium>
          <AsymmetricNarrow>
            <DailyFocusList crossRankedStocks={marketIntelligence?.activeStocks?.crossRanked || []} />
          </AsymmetricNarrow>
        </ResponsiveGrid>
      </section>

      {/* 4. P1: Sectors + Accumulation */}
      <section aria-labelledby="p1-heading">
        <h2 id="p1-heading" className="sr-only">
          P1: Sector Analysis - Sector Strength and Accumulation Patterns
        </h2>
        <PrioritySectionLabel priority="P1" label="Sector Analysis" />
        <ResponsiveGrid preset="default" gap="compact">
          <SectorStrengthCard />
          <AccumulationPatternsCard patterns={[]} />
        </ResponsiveGrid>
      </section>

      {/* 5. Money Flow + Heatmap (existing components) */}
      {investorType && industrySector && (
        <ResponsiveGrid preset="default" gap="compact">
          <MoneyFlowChart data={investorType} showTrends={false} />
          <SectorHeatmap
            data={{
              sectors: industrySector.sectors.map((s) => ({
                ...s,
                trend5Day: undefined,
              })),
            }}
            showTrends={false}
          />
        </ResponsiveGrid>
      )}

      {/* 6. P2: Active Stocks */}
      <section aria-labelledby="p2-heading">
        <h2 id="p2-heading" className="sr-only">
          P2: Active Stocks - Concentration Analysis
        </h2>
        <PrioritySectionLabel priority="P2" label="Active Stocks Concentration" />
        <ActiveStocksCard />
      </section>

      {/* 7. Top Rankings (existing component) */}
      {rankings && (
        <TopRankings
          data={{
            topGainers: rankings.topGainers.map((s) => ({
              symbol: s.symbol,
              price: s.price,
              change: s.changePct || s.change || 0,
            })),
            topLosers: rankings.topLosers.map((s) => ({
              symbol: s.symbol,
              price: s.price,
              change: s.changePct || s.change || 0,
            })),
            topVolume: rankings.topVolume.map((s) => ({
              symbol: s.symbol,
              volume: s.volume || 0,
            })),
            timestamp: rankings.timestamp,
          }}
          showTrends={false}
        />
      )}
    </div>
  )
}
