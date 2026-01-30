/**
 * Search Page (Server Component)
 * Stock search with autocomplete functionality
 * Theme: Green-tinted dark with teal up / soft red down
 *
 * Enhanced to show stock information like stock detail page
 */

import { SearchClient } from './SearchClient'
import { formatNumber, formatPercentage, formatMarketCap, cn } from '@/lib/utils'
import Link from 'next/link'
import { searchStocksByPrefix } from '@/lib/rtdb'
import { Badge } from '@/components/shared/Badge'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

// Mock stock data for fallback when RTDB stock list is not available
// Enhanced with more detailed information
const MOCK_STOCKS = [
  { symbol: 'PTT', name: 'PTT Public Company Limited', price: 35.5, change: 5.2, sector: 'Energy', marketCap: 992000000000, volume: 15000000 },
  { symbol: 'KBANK', name: 'Kasikornbank Public Company Limited', price: 142.0, change: 3.3, sector: 'Banking', marketCap: 520000000000, volume: 8000000 },
  { symbol: 'ADV', name: 'Advanced Info Service Public Company Limited', price: 18.75, change: 4.1, sector: 'Technology', marketCap: 560000000000, volume: 12000000 },
  { symbol: 'AOT', name: 'Airports of Thailand Public Company Limited', price: 68.5, change: 2.9, sector: 'Transport', marketCap: 280000000000, volume: 5000000 },
  { symbol: 'CPF', name: 'Charoen Pokphand Foods Public Company Limited', price: 28.75, change: -1.5, sector: 'Food', marketCap: 350000000000, volume: 7000000 },
  { symbol: 'SCB', name: 'Siam Commercial Bank Public Company Limited', price: 135.0, change: 1.8, sector: 'Banking', marketCap: 480000000000, volume: 6000000 },
  { symbol: 'BDMS', name: 'Bangkok Dusit Medical Services Public Company Limited', price: 21.5, change: -2.1, sector: 'Healthcare', marketCap: 180000000000, volume: 4000000 },
  { symbol: 'CPALL', name: 'CP ALL Public Company Limited', price: 62.0, change: 2.5, sector: 'Retail', marketCap: 420000000000, volume: 9000000 },
  { symbol: 'PTTGC', name: 'PTT Global Chemical Public Company Limited', price: 58.0, change: -3.2, sector: 'Energy', marketCap: 320000000000, volume: 5500000 },
  { symbol: 'TU', name: 'Thai Union Group Public Company Limited', price: 14.5, change: -0.9, sector: 'Food', marketCap: 95000000000, volume: 3000000 },
  { symbol: 'BBL', name: 'Bangkok Bank Public Company Limited', price: 152.0, change: 2.1, sector: 'Banking', marketCap: 550000000000, volume: 6500000 },
  { symbol: 'DELTA', name: 'Delta Electronics Public Company Limited', price: 48.5, change: 3.8, sector: 'Technology', marketCap: 280000000000, volume: 4500000 },
  { symbol: 'TRUE', name: 'True Corporation Public Company Limited', price: 5.2, change: -0.5, sector: 'Technology', marketCap: 150000000000, volume: 25000000 },
  { symbol: 'INTOUCH', name: 'Intouch Holdings Public Company Limited', price: 58.5, change: 1.5, sector: 'Technology', marketCap: 170000000000, volume: 3500000 },
  { symbol: 'LH', name: 'Land and Houses Public Company Limited', price: 12.8, change: -1.2, sector: 'Property', marketCap: 85000000000, volume: 2000000 },
]

/**
 * Get decision badge based on change percentage (simplified logic)
 */
function getDecisionBadge(changePct: number, t: (key: string) => string): { label: string; color: 'buy' | 'watch' | 'sell' | 'neutral' } {
  if (changePct >= 3) return { label: t('decision.buy'), color: 'buy' }
  if (changePct >= 1) return { label: t('decision.watch'), color: 'watch' }
  if (changePct <= -2) return { label: t('decision.avoid'), color: 'sell' }
  return { label: t('decision.hold'), color: 'neutral' }
}

async function searchStocks(query: string): Promise<
  Array<{ symbol: string; name: string; price: number; change: number; sector: string }>
> {
  if (!query || query.length < 2) return []

  const searchTerm = query.toLowerCase()

  // Try RTDB search first
  try {
    const rtdbResults = await searchStocksByPrefix(searchTerm, 20)
    if (rtdbResults.length > 0) {
      return rtdbResults.map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.changePct || stock.change || 0,
        sector: stock.sector || 'N/A',
      }))
    }
  } catch {
    // Fall back to mock data if RTDB search fails
  }

  // Fallback to mock data
  return MOCK_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm) ||
      stock.name.toLowerCase().includes(searchTerm)
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const t = await getTranslations('stock')
  const query = searchParams.q || ''
  const results = query ? await searchStocks(query) : []

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div>
        <h1 className="text-xl font-bold mb-1 text-text">
          {t('search.title')}
        </h1>
        <p className="text-sm text-text-2">
          {t('search.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <SearchClient defaultValue={query} />

      {/* Search Results - Enhanced with stock details */}
      {query && (
        <div>
          {results.length > 0 ? (
            <div className="rounded-lg divide-y border border-border bg-surface overflow-hidden">
              {results.map((stock) => {
                const decision = getDecisionBadge(stock.change, t)
                const isPositive = stock.change >= 0
                return (
                  <Link
                    key={stock.symbol}
                    href={`/stock/${stock.symbol}`}
                    className="block transition-all duration-200 hover:bg-surface-1"
                  >
                    <div className="p-4">
                      {/* Top row: Symbol, Name, Decision Badge, Price */}
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Symbol and Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-text">
                              {stock.symbol}
                            </span>
                            <Badge size="sm" color={decision.color}>
                              {decision.label}
                            </Badge>
                            <Badge size="sm" color="neutral" className="text-[10px] uppercase">
                              {stock.sector}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-2 truncate max-w-md">
                            {stock.name}
                          </p>
                        </div>

                        {/* Right: Price and Change */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-text tabular-nums">
                            ฿{formatNumber(stock.price, 2)}
                          </div>
                          <div className={cn(
                            'text-sm font-medium flex items-center justify-end gap-1',
                            isPositive ? 'text-up' : 'text-down'
                          )}>
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {isPositive && '+'}
                            {formatPercentage(stock.change)}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Additional details */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-subtle text-xs text-text-2">
                        {/* Market Cap */}
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-text-3" />
                          <span>{t('search.mcap')}: {formatMarketCap((stock as any).marketCap || 0)}</span>
                        </div>

                        {/* Volume (if available) */}
                        {(stock as any).volume && (
                          <div className="flex items-center gap-1">
                            <span>{t('search.vol')}: {((stock as any).volume / 1000000).toFixed(1)}M</span>
                          </div>
                        )}

                        {/* Recommendation indicator */}
                        <div className="ml-auto">
                          {decision.color === 'buy' && (
                            <span className="text-up font-medium">{t('decision.strongBuy')}</span>
                          )}
                          {decision.color === 'watch' && (
                            <span className="text-warn font-medium">{t('decision.watchClosely')}</span>
                          )}
                          {decision.color === 'sell' && (
                            <span className="text-down font-medium">{t('decision.highRisk')}</span>
                          )}
                          {decision.color === 'neutral' && (
                            <span className="text-text-muted font-medium">{t('decision.holdLabel')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-2 text-text-3">
                <svg
                  className="w-10 h-10 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-2">{t('search.noResults')}</p>
              <p className="text-xs mt-1 text-text-3">
                {t('search.tryDifferent')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* No search state - Compact */}
      {!query && (
        <div className="text-center py-12">
          <div className="mb-4 text-text-3">
            <svg
              className="w-14 h-14 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-2 text-text">
            {t('search.searchFor')}
          </h3>
          <p className="max-w-md mx-auto text-sm text-text-2">
            {t('search.searchPrompt')}
          </p>
        </div>
      )}
    </div>
  )
}
