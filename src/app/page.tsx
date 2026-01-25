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

import { ErrorFallback, DataFreshness, CompactSectionLabel, CompactMetricStrip } from '@/components/shared'
import { ResponsiveGrid, AsymmetricWide, AsymmetricMedium, AsymmetricNarrow } from '@/components/layout'
import {
  MarketStatusBanner,
  MarketRegimeCard,
  SmartMoneyCard,
  DailyFocusList,
  SectorStrengthCard,
  TabbedMovers,
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
  const { marketOverview, marketIntelligence } = result

  // Get market status for banner
  const marketStatus = marketOverview ? getMarketStatus(marketOverview) : { isOpen: false }

 
 
  // Extract isOpen from marketStatus, defaulting to false if it's an error string
  const isMarketOpen = typeof marketStatus === 'object' && 'isOpen' in marketStatus
    ? marketStatus.isOpen
    : false

  return (
    <div className="space-y-3">
      {/* 1. Sticky Status Banner with Data Freshness */}
      <div className="sticky top-0 z-10">
        {marketOverview && (
          <MarketStatusBanner          
            setIndex={marketOverview.set.index}
            setChange={marketOverview.set.change}
            setChangePercent={marketOverview.set.changePercent}
            isMarketOpen={isMarketOpen}
            lastUpdate={marketOverview.timestamp}
          />
        )}
        {marketOverview && (
          <DataFreshness timestamp={marketOverview.timestamp} />
        )}
      </div>

      {/* 2. Compact Metrics Strip */}
      <CompactMetricStrip
        metrics={[
          { label: '52W Range', value: `${((marketOverview?.set.index || 0) * 1.1 / 1000).toFixed(1)}K` },
          { label: 'Total Cap', value: marketOverview?.totalMarketCap ? `${(marketOverview.totalMarketCap / 1000).toFixed(1)}B` : 'N/A' },
        ]}
        className="my-3"
      />

      {/* 3. P0: Market Regime + Smart Money + Daily Focus (asymmetric grid) */}
      <section aria-labelledby="p0-heading">
        <h2 id="p0-heading" className="sr-only">
          P0: Market Overview - Market Regime and Smart Money Analysis
        </h2>
        <CompactSectionLabel priority="P0" label="Market Overview" />
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

      {/* 4. P1: Sectors (SectorStrengthCard only) */}
      <section aria-labelledby="p1-heading">
        <h2 id="p1-heading" className="sr-only">
          P1: Sector Analysis - Sector Strength
        </h2>
        <CompactSectionLabel priority="P1" label="Sector Analysis" />
        <SectorStrengthCard />
      </section>

      {/* 5. P2: Market Movers (TabbedMovers) */}
      <section aria-labelledby="p2-heading">
        <h2 id="p2-heading" className="sr-only">
          P2: Market Movers - Active Stocks and Top Rankings
        </h2>
        <CompactSectionLabel priority="P2" label="Market Movers" />
        <TabbedMovers topCount={5} />
      </section>
      
      <section aria-labelledby="spacer-heading">
        <h2 id="spacer-heading" className="sr-only">
          Spacer Section
        </h2>
        <div className="h-10" />
      </section>
    </div>
  )
}
