/**
 * Stock Detail Page (Server Component)
 * Detailed stock analysis with verdict engine results
 * Theme: Green-tinted dark with teal up / soft red down
 *
 * Phase 2: Enhanced with API data fetching using useStockData hook
 */

import {
  DecisionHeader,
  VerdictBullets,
  EvidenceCards,
  LensScores,
  WatchlistButton,
  StockPageSkeleton,
  StockPageErrorBoundary,
} from '@/components/stock'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchStockWithPeers, createMockStock } from '@/lib/rtdb'
import { generateVerdict } from '@/services/verdict'
import { analyzeMarketRegime } from '@/services/market-regime'
import { cn } from '@/lib/utils'
import type { StockVerdict } from '@/services/verdict'
import type { MarketRegime } from '@/types/market'
import { StockPageClient } from './stock-page-client'

interface StockPageData {
  stock: {
    symbol: string
    name: string
    price: number
    change: number
    changePct: number
    volume?: number
    marketCap?: number
    pe?: number
    pbv?: number
    dividendYield?: number
    sector?: string
  }
  verdict: StockVerdict
  peers: Array<{ symbol: string; name: string; verdict: 'Buy' | 'Watch' | 'Avoid' }>
  sectorAverages: {
    pe?: number
    pbv?: number
  }
}

/**
 * Fetch stock data and generate verdict
 */
async function fetchStockData(symbol: string): Promise<StockPageData | null> {
  try {
    // Fetch stock data from RTDB
    const stockData = await fetchStockWithPeers(symbol, 5)

    // If no data from RTDB, create mock data for development
    const stock = stockData.stock || await createMockStock(symbol)

    if (!stock) {
      return null
    }

    // Get market regime for timing analysis
    const regimeResult = await analyzeMarketRegime({
      overview: null,
      investor: null,
      sector: null,
    })

    // Extract just the regime string for the verdict engine
    const marketRegime: MarketRegime | null = regimeResult?.regime || null

    // Generate verdict using the verdict engine
    const verdict = generateVerdict({
      stock,
      marketRegime,
      avgVolume: stock.volume || 0,
    })

    // Get peer data
    const peers = stockData.peers || []

    // Calculate sector averages from peers
    const sectorPeers = peers.filter((p) => p.sectorId === stock.sectorId)
    const sectorAverages = {
      pe: sectorPeers.length > 0
        ? sectorPeers.reduce((sum, p) => sum + (p.pe || 0), 0) / sectorPeers.length
        : undefined,
      pbv: sectorPeers.length > 0
        ? sectorPeers.reduce((sum, p) => sum + (p.pbv || 0), 0) / sectorPeers.length
        : undefined,
    }

    return {
      stock: {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePct: stock.changePct,
        volume: stock.volume,
        marketCap: stock.marketCap,
        pe: stock.pe,
        pbv: stock.pbv,
        dividendYield: stock.dividendYield,
        sector: stock.sector,
      },
      verdict,
      peers: peers.map((p) => ({
        symbol: p.symbol,
        name: p.name,
        verdict: 'Watch' as const, // Default to Watch for peers
      })),
      sectorAverages,
    }
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error)
    return null
  }
}

export default async function StockPage({
  params,
}: {
  params: { symbol: string }
}) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase()
  const data = await fetchStockData(symbol)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-3">
      {/* Back Button and Title - Compact */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs transition-all duration-200 hover:text-text active:opacity-70"
          style={{ color: '#B8C1BD' }}
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Back to Market
        </Link>
        <WatchlistButton symbol={symbol} />
      </div>

      {/* Stock Name and Price - Compact */}
      <div className="rounded-lg p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-text">{data.stock.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold text-text">
                {data.stock.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold transition-colors duration-200',
                  data.stock.changePct >= 0 ? 'text-up' : 'text-down'
                )}
              >
                {data.stock.changePct >= 0 ? '+' : ''}
                {data.stock.changePct.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="text-xs text-text-2">
            <div>Sector: {data.stock.sector || 'N/A'}</div>
            {data.stock.marketCap && (
              <div>Market Cap: {(data.stock.marketCap / 1_000_000_000).toFixed(0)}B THB</div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Header - Compact */}
      <DecisionHeader
        verdict={data.verdict.verdict}
        confidence={data.verdict.confidence}
        symbol={symbol}
      />

      {/* Verdict Bullets - Compact */}
      <VerdictBullets bullets={data.verdict.bullets} />

      {/* Lens Scores and Evidence Cards - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <LensScores lenses={data.verdict.lenses} />
        <EvidenceCards
          metrics={{
            pe: data.stock.pe,
            pbv: data.stock.pbv,
            dividendYield: data.stock.dividendYield,
          }}
          sector={data.stock.sector}
          sectorAverages={data.sectorAverages}
          peers={data.peers}
        />
      </div>

      {/* Next Step - Compact */}
      {data.verdict.nextStep && (
        <div className="rounded-lg p-3 bg-info/10 border border-info/30">
          <div className="flex items-start gap-2">
            <span className="text-sm text-info">➜</span>
            <div>
              <h3 className="font-semibold mb-1 text-xs text-info">
                Next Step
              </h3>
              <p className="text-xs text-text">
                {data.verdict.nextStep}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Completeness Disclaimer - Compact */}
      <div className="text-[10px] text-center text-text-3">
        Analysis based on {data.verdict.dataCompleteness}% data completeness.
        Always verify with additional research before making investment decisions.
      </div>
    </div>
  )
}
