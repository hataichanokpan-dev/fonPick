/**
 * Homepage (Server Component)
 * Main market overview page with all dashboard components
 *
 * Fetches data from RTDB, calculates trends, and analyzes market regime
 * Falls back to mock data in development if RTDB is unavailable
 */

import {
  SetSnapshot,
  MoneyFlowChart,
  SectorHeatmap,
  TopRankings,
  MarketRegimeSummary,
  Week52Range,
  SetPERatio,
  VolatilityIndicator,
} from '@/components/home'
import { ErrorFallback, DataFreshness, Card } from '@/components/shared'
import { ResponsiveGrid } from '@/components/layout'
import { fetchHomepageData as fetchRTDBData } from '@/lib/rtdb'
import { calculateAllSectorTrends } from '@/lib/trends'
import { analyzeMarketRegime } from '@/services/market-regime'
import type { RegimeResult } from '@/types/market'
import type { TrendValue } from '@/lib/trends/types'

interface HomepageData {
  market: {
    set: {
      index: number
      change: number
      changePercent: number
    }
    totalMarketCap?: number
    timestamp?: number
  }
  investor: {
    foreign: { buy: number; sell: number; net: number }
    institution: { buy: number; sell: number; net: number }
    retail: { buy: number; sell: number; net: number }
    prop: { buy: number; sell: number; net: number }
    timestamp?: number
  }
  sector: {
    sectors: Array<{
      name: string
      changePercent: number
      marketCap?: number
    }>
    timestamp?: number
  }
  rankings: {
    topGainers: Array<{
      symbol: string
      price?: number
      change?: number
      changePct?: number
      volume?: number
      value?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    topLosers: Array<{
      symbol: string
      price?: number
      change?: number
      changePct?: number
      volume?: number
      value?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    topVolume: Array<{
      symbol: string
      volume?: number
      value?: number
      price?: number
      change?: number
      changePct?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    topValue?: Array<{
      symbol: string
      volume?: number
      value?: number
      price?: number
      change?: number
      changePct?: number
      sectorCode?: string
      marketCapGroup?: 'L' | 'M' | 'S'
    }>
    timestamp?: number
  }
  regime: RegimeResult

  // New trend data
  setTrends?: {
    fiveDay?: TrendValue
    twentyDay?: TrendValue
    ytd?: TrendValue
  }
  sectorTrends?: Map<string, TrendValue>
  investorTrends?: Map<string, number>
}

/**
 * Fetch trend data for SET index from historical RTDB data
 */
async function fetchSetIndexTrends() {
  try {
    // Try to fetch historical data for 5D, 20D, YTD
    // For now, return null - to be implemented with actual RTDB historical queries
    return null
  } catch (error) {
    console.error('Error fetching SET index trends:', error)
    return null
  }
}

/**
 * Fetch and process homepage data with trends
 */
type HomepageDataResult = HomepageData | { error: string }

async function fetchHomepageData(): Promise<HomepageDataResult> {
  try {
    // Fetch data from RTDB
    const rtdbData = await fetchRTDBData()

    // Check if we have at least some data
    const hasMarket = !!rtdbData.market
    const hasInvestor = !!rtdbData.investor
    const hasSector = !!rtdbData.sector

    // If no data at all, return error info
    if (!hasMarket && !hasInvestor && !hasSector) {
      return {
        error: 'RTDB_UNAVAILABLE',
      }
    }


    // Analyze market regime
    let regime: RegimeResult | undefined = undefined
    if (hasMarket && hasInvestor && hasSector) {
      const regimeResult = analyzeMarketRegime({
      overview: rtdbData.market!,
      investor: rtdbData.investor!,
      sector: rtdbData.sector!,
    })

      regime = regimeResult ?? undefined
    }

    if (!regime) {
      return {
        error: 'REGIME_FAILED',
      }
    }

    // Transform data to match component expectations
    const market = {
      set: {
        index: rtdbData.market!.set.index,
        change: rtdbData.market!.set.change,
        changePercent: rtdbData.market!.set.changePercent,
      },
      totalMarketCap: rtdbData.market!.totalMarketCap,
      timestamp: rtdbData.market!.timestamp,
    }

    const investor = {
      foreign: rtdbData.investor!.foreign,
      institution: rtdbData.investor!.institution,
      retail: rtdbData.investor!.retail,
      prop: rtdbData.investor!.prop,
      timestamp: rtdbData.investor!.timestamp,
    }

    const sector = {
      sectors: rtdbData.sector!.sectors.map((s) => ({
        name: s.name,
        changePercent: s.changePercent,
        marketCap: s.marketCap,
      })),
      timestamp: rtdbData.sector!.timestamp,
    }

    // Transform rankings data
    const rankings = rtdbData.rankings || {
      topGainers: [],
      topLosers: [],
      topVolume: [],
      timestamp: Date.now(),
    }

    const transformedRankings = {
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
    }

    // Fetch trend data
    const [setTrends, sectorTrendsRaw] = await Promise.all([
      fetchSetIndexTrends(),
      calculateAllSectorTrends().catch(() => null),
    ])

    // Create sector trends map
    const sectorTrends = new Map()
    if (sectorTrendsRaw) {
      for (const trend of sectorTrendsRaw) {
        if (trend.fiveDay) {
          sectorTrends.set(trend.sectorName, {
            change: trend.fiveDay.change,
            changePercent: trend.fiveDay.changePercent,
          })
        }
      }
    }

    return {
      market,
      investor,
      sector,
      rankings: transformedRankings,
      regime,
      setTrends: setTrends || undefined,
      sectorTrends: sectorTrends.size > 0 ? sectorTrends : undefined,
    }
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
function isHomepagedataError(result: HomepageDataResult): result is { error: string } {
  return 'error' in result
}

/**
 * Get error message based on error type
 */
function getErrorMessage(error: string): { title: string; message: string } {
  if (error === 'RTDB_UNAVAILABLE') {
    return {
      title: 'Database Connection Error',
      message:
        'Unable to connect to Firebase Realtime Database. Please check your Firebase configuration and security rules.',
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

export default async function HomePage() {
  const result = await fetchHomepageData()

  // Handle error case - show error message, no mock data
  if (isHomepagedataError(result)) {
    const errorInfo = getErrorMessage(result.error)

    return (
      <div className="max-w-4xl mx-auto">
        <ErrorFallback title={errorInfo.title} message={errorInfo.message} />
      </div>
    )
  }

  // Handle successful data fetch
  const data = result

  // Generate dynamic market summary based on regime
  const getMarketSummary = (regime: RegimeResult) => {
    switch (regime.regime) {
      case 'Risk-On':
        return {
          title: 'Bullish Market Conditions',
          text:
            regime.focus ||
            'Market showing positive momentum. Focus on quality sectors showing strength.',
        }
      case 'Risk-Off':
        return {
          title: 'Cautious Market Conditions',
          text:
            regime.caution ||
            'Market under pressure. Consider defensive positions and wait for clarity.',
        }
      case 'Neutral':
        return {
          title: 'Mixed Market Signals',
          text:
            'Market lacking clear direction. Stay selective and focus on individual stock quality.',
        }
    }
  }

  const summary = getMarketSummary(data.regime)

  return (
    <div className="space-y-6">
      {/* Market Snapshot with trends */}
      <SetSnapshot
        data={data.market.set}
        totalMarketCap={data.market.totalMarketCap}
        trends={data.setTrends}
      />
      <DataFreshness timestamp={data.market.timestamp} />

      {/* Market Context Row - 4 column grid */}
      <ResponsiveGrid preset="quad" gap="compact">
        <Week52Range
          current={data.market.set.index}
          high={data.market.set.index * 1.1}
          low={data.market.set.index * 0.9}
        />
        <SetPERatio currentPE={15.2} historicalAvg={14.5} />
        <VolatilityIndicator volatility={12} average={15} />
      </ResponsiveGrid>

      {/* Market Regime Summary */}
      <MarketRegimeSummary regime={data.regime} />

      {/* Two-column layout for Money Flow and Sector Heatmap with trends */}
      <ResponsiveGrid preset="default" gap="standard">
        <MoneyFlowChart
          data={{
            ...data.investor,
            foreign: { ...data.investor.foreign, trend5Day: data.investorTrends?.get('foreign') },
            institution: { ...data.investor.institution, trend5Day: data.investorTrends?.get('institution') },
            retail: { ...data.investor.retail, trend5Day: data.investorTrends?.get('retail') },
            prop: { ...data.investor.prop, trend5Day: data.investorTrends?.get('prop') },
          }}
          showTrends={!!data.investorTrends}
        />
        <SectorHeatmap
          data={{
            sectors: data.sector.sectors.map((s) => ({
              ...s,
              trend5Day: data.sectorTrends?.get(s.name),
            })),
          }}
          showTrends={!!data.sectorTrends}
        />
      </ResponsiveGrid>

      {/* Top Rankings */}
      <TopRankings data={data.rankings} showTrends={!!data.investorTrends} />

      {/* Dynamic Market Summary based on regime */}
      <Card
        variant="default"
        padding="md"
        className="border-accent-blue/30 bg-accent-blue/10"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM12 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <div>
            <h3 className="font-semibold mb-1 text-accent-blue text-sm">
              {summary.title}
            </h3>
            <p className="text-xs text-accent-blue/80">{summary.text}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
