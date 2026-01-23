/**
 * Stock Detail Page (Server Component)
 * Detailed stock analysis with verdict engine results
 */

import {
  DecisionHeader,
  VerdictBullets,
  EvidenceCards,
  LensScores,
  WatchlistButton,
} from '@/components/stock'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchStockWithPeers, createMockStock } from '@/lib/rtdb'
import { generateVerdict } from '@/services/verdict'
import { analyzeMarketRegime } from '@/services/market-regime'
import type { StockVerdict } from '@/services/verdict'
import type { MarketRegime } from '@/types/market'

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
    const sectorPeers = peers.filter((p) => p.pe && stock.sectorId === p.sectorId)
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button and Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Market
        </Link>
        <WatchlistButton symbol={symbol} />
      </div>

      {/* Stock Name and Price */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.stock.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {data.stock.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold',
                  data.stock.changePct >= 0 ? 'text-up-600' : 'text-down-600'
                )}
              >
                {data.stock.changePct >= 0 ? '+' : ''}
                {data.stock.changePct.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <div>Sector: {data.stock.sector || 'N/A'}</div>
            {data.stock.marketCap && (
              <div>Market Cap: {(data.stock.marketCap / 1_000_000_000).toFixed(0)}B THB</div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Header */}
      <DecisionHeader
        verdict={data.verdict.verdict}
        confidence={data.verdict.confidence}
        symbol={symbol}
      />

      {/* Verdict Bullets */}
      <VerdictBullets bullets={data.verdict.bullets} />

      {/* Lens Scores and Evidence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Next Step */}
      {data.verdict.nextStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-xl">➜</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Next Step
              </h3>
              <p className="text-sm text-blue-800">
                {data.verdict.nextStep}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Completeness Disclaimer */}
      <div className="text-xs text-gray-500 text-center">
        Analysis based on {data.verdict.dataCompleteness}% data completeness.
        Always verify with additional research before making investment decisions.
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
