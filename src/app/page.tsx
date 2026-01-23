/**
 * Homepage (Server Component)
 * Main market overview page with all dashboard components
 *
 * Fetches data from RTDB and analyzes market regime
 * Falls back to mock data in development if RTDB is unavailable
 */

import {
  SetSnapshot,
  MoneyFlowChart,
  SectorHeatmap,
  TopRankings,
  MarketRegimeSummary,
} from '@/components/home'
import { ErrorFallback } from '@/components/shared'
import { fetchHomepageData as fetchRTDBData } from '@/lib/rtdb'
import { analyzeMarketRegime } from '@/services/market-regime'
import type { RegimeResult } from '@/types/market'

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
    topGainers: Array<{ symbol: string; price: number; change: number }>
    topLosers: Array<{ symbol: string; price: number; change: number }>
    topVolume: Array<{ symbol: string; volume: number }>
    timestamp?: number
  }
  regime: RegimeResult
  isMockData?: boolean
}

/**
 * Create mock data for development/testing when RTDB is unavailable
 */
function createMockData(): HomepageData {
  const now = Date.now()

  const mockRegime: RegimeResult = {
    regime: 'Risk-On',
    confidence: 'Medium',
    reasons: [
      'Using mock data - RTDB connection not available',
      'Configure Firebase credentials to use real data',
      'Check Firebase security rules for RTDB access',
    ],
    focus: 'Configure Firebase credentials to access real market data',
    caution: 'Currently displaying mock data for demonstration purposes',
  }

  return {
    market: {
      set: {
        index: 1450.23,
        change: 17.82,
        changePercent: 1.23,
      },
      totalMarketCap: 15_200_000_000_000,
      timestamp: now,
    },
    investor: {
      foreign: { buy: 5000, sell: 3200, net: 1800 },
      institution: { buy: 4200, sell: 3800, net: 400 },
      retail: { buy: 2800, sell: 3500, net: -700 },
      prop: { buy: 1500, sell: 1200, net: 300 },
      timestamp: now,
    },
    sector: {
      sectors: [
        { name: 'Banking', changePercent: 2.3, marketCap: 3_500_000_000_000 },
        { name: 'Energy', changePercent: -1.2, marketCap: 2_800_000_000_000 },
        { name: 'Technology', changePercent: 3.1, marketCap: 1_200_000_000_000 },
        { name: 'Consumer', changePercent: 0.8, marketCap: 2_100_000_000_000 },
        { name: 'Healthcare', changePercent: 1.5, marketCap: 800_000_000_000 },
        { name: 'Property', changePercent: -0.5, marketCap: 1_500_000_000_000 },
        { name: 'Auto', changePercent: 1.1, marketCap: 900_000_000_000 },
        { name: 'Food', changePercent: 0.3, marketCap: 1_100_000_000_000 },
        { name: 'Transport', changePercent: -0.8, marketCap: 700_000_000_000 },
        { name: 'ICT', changePercent: 2.8, marketCap: 650_000_000_000 },
      ],
      timestamp: now,
    },
    rankings: {
      topGainers: [
        { symbol: 'PTT', price: 35.5, change: 5.2 },
        { symbol: 'ADV', price: 18.75, change: 4.1 },
        { symbol: 'KBANK', price: 142.0, change: 3.3 },
        { symbol: 'AOT', price: 68.5, change: 2.9 },
        { symbol: 'CPALL', price: 62.0, change: 2.5 },
      ],
      topLosers: [
        { symbol: 'PTTGC', price: 58.0, change: -3.2 },
        { symbol: 'BDMS', price: 21.5, change: -2.1 },
        { symbol: 'CPF', price: 28.75, change: -1.5 },
        { symbol: 'HMPRO', price: 32.0, change: -1.2 },
        { symbol: 'TU', price: 14.5, change: -0.9 },
      ],
      topVolume: [
        { symbol: 'PTT', volume: 2_500_000_000 },
        { symbol: 'KBANK', volume: 1_800_000_000 },
        { symbol: 'SCB', volume: 1_200_000_000 },
        { symbol: 'AOT', volume: 950_000_000 },
        { symbol: 'CPF', volume: 850_000_000 },
      ],
      timestamp: now,
    },
    regime: mockRegime,
    isMockData: true,
  }
}

/**
 * Fetch and process homepage data
 */
async function fetchHomepageData(): Promise<HomepageData | { error: string }> {
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

    // If partial data, we can still work with it
    // But for now, require all three for regime analysis
    if (!hasMarket || !hasInvestor || !hasSector) {
      return {
        error: 'RTDB_PARTIAL',
      }
    }

    // Analyze market regime
    const regime = analyzeMarketRegime({
      overview: rtdbData.market,
      investor: rtdbData.investor,
      sector: rtdbData.sector,
    })

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

    return {
      market,
      investor,
      sector,
      rankings: transformedRankings,
      regime,
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get error message based on error type
 */
function getErrorMessage(error: string): { title: string; message: string } {
  if (error === 'RTDB_UNAVAILABLE') {
    return {
      title: 'Database Connection Error',
      message: 'Unable to connect to Firebase Realtime Database. Please check your Firebase configuration and security rules.',
    }
  }

  if (error.includes('Permission denied')) {
    return {
      title: 'Firebase Permission Denied',
      message: 'Your Firebase security rules don\'t allow read access. Please update your Realtime Database rules to allow public read access or configure authentication.',
    }
  }

  return {
    title: 'Unable to load market data',
    message: `Error: ${error}. Please check your connection and try again.`,
  }
}

export default async function HomePage() {
  const result = await fetchHomepageData()

  // Handle error case
  if ('error' in result) {
    const errorInfo = getErrorMessage(result.error)
    const isDevelopment = process.env.NODE_ENV === 'development'

    // In development, show mock data with a warning banner
    if (isDevelopment) {
      const mockData = createMockData()
      const summary = {
        title: 'Development Mode - Using Mock Data',
        text: result.error === 'RTDB_UNAVAILABLE' || result.error.includes('Permission')
          ? 'Configure Firebase credentials in .env.local and update Firebase security rules to use real data.'
          : `RTDB Error: ${result.error}. Displaying mock data for development.`,
      }

      return (
        <div className="space-y-6">
          {/* Development Warning Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  {summary.title}
                </h3>
                <p className="text-sm text-yellow-800">
                  {summary.text}
                </p>
                <div className="mt-2 text-xs text-yellow-700">
                  <p>To fix:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Ensure NEXT_PUBLIC_FIREBASE_* variables are set in .env.local</li>
                    <li>Update Firebase Realtime Database security rules</li>
                    <li>Example rules: {`{ ".read": true, ".write": false }`}</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Display mock data */}
          <SetSnapshot data={mockData.market.set} totalMarketCap={mockData.market.totalMarketCap} />
          <MarketRegimeSummary regime={mockData.regime} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MoneyFlowChart data={mockData.investor} />
            <SectorHeatmap data={mockData.sector} />
          </div>
          <TopRankings data={mockData.rankings} />
        </div>
      )
    }

    // In production, show error with retry
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorFallback
          title={errorInfo.title}
          message={errorInfo.message}
        />
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
          text: regime.focus || 'Market showing positive momentum. Focus on quality sectors showing strength.',
        }
      case 'Risk-Off':
        return {
          title: 'Cautious Market Conditions',
          text: regime.caution || 'Market under pressure. Consider defensive positions and wait for clarity.',
        }
      case 'Neutral':
        return {
          title: 'Mixed Market Signals',
          text: 'Market lacking clear direction. Stay selective and focus on individual stock quality.',
        }
    }
  }

  const summary = getMarketSummary(data.regime)

  return (
    <div className="space-y-6">
      {/* Mock Data Warning Banner */}
      {data.isMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Demo Mode - Mock Data
              </h3>
              <p className="text-sm text-yellow-800">
                Configure Firebase credentials to display real market data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Snapshot */}
      <SetSnapshot data={data.market.set} totalMarketCap={data.market.totalMarketCap} />

      {/* Market Regime Summary */}
      <MarketRegimeSummary regime={data.regime} />

      {/* Two-column layout for Money Flow and Sector Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoneyFlowChart data={data.investor} />
        <SectorHeatmap data={data.sector} />
      </div>

      {/* Top Rankings */}
      <TopRankings data={data.rankings} />

      {/* Dynamic Market Summary based on regime */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">💡</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              {summary.title}
            </h3>
            <p className="text-sm text-blue-800">
              {summary.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
