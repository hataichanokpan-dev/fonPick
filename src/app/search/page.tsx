/**
 * Search Page (Server Component)
 * Stock search with autocomplete functionality
 * Theme: Green-tinted dark with teal up / soft red down
 *
 * Phase 5: Enhanced with smooth transitions
 */

import { SearchClient } from './SearchClient'
import { formatNumber, formatPercentage, cn } from '@/lib/utils'
import Link from 'next/link'
import { searchStocksByPrefix } from '@/lib/rtdb'

// Mock stock data for fallback when RTDB stock list is not available
const MOCK_STOCKS = [
  { symbol: 'PTT', name: 'PTT Public Company Limited', price: 35.5, change: 5.2, sector: 'Energy' },
  { symbol: 'KBANK', name: 'Kasikornbank Public Company Limited', price: 142.0, change: 3.3, sector: 'Banking' },
  { symbol: 'ADV', name: 'Advanced Info Service Public Company Limited', price: 18.75, change: 4.1, sector: 'Technology' },
  { symbol: 'AOT', name: 'Airports of Thailand Public Company Limited', price: 68.5, change: 2.9, sector: 'Transport' },
  { symbol: 'CPF', name: 'Charoen Pokphand Foods Public Company Limited', price: 28.75, change: -1.5, sector: 'Food' },
  { symbol: 'SCB', name: 'Siam Commercial Bank Public Company Limited', price: 135.0, change: 1.8, sector: 'Banking' },
  { symbol: 'BDMS', name: 'Bangkok Dusit Medical Services Public Company Limited', price: 21.5, change: -2.1, sector: 'Healthcare' },
  { symbol: 'CPALL', name: 'CP ALL Public Company Limited', price: 62.0, change: 2.5, sector: 'Retail' },
  { symbol: 'PTTGC', name: 'PTT Global Chemical Public Company Limited', price: 58.0, change: -3.2, sector: 'Energy' },
  { symbol: 'TU', name: 'Thai Union Group Public Company Limited', price: 14.5, change: -0.9, sector: 'Food' },
  { symbol: 'BBL', name: 'Bangkok Bank Public Company Limited', price: 152.0, change: 2.1, sector: 'Banking' },
  { symbol: 'DELTA', name: 'Delta Electronics Public Company Limited', price: 48.5, change: 3.8, sector: 'Technology' },
  { symbol: 'TRUE', name: 'True Corporation Public Company Limited', price: 5.2, change: -0.5, sector: 'Technology' },
  { symbol: 'INTOUCH', name: 'Intouch Holdings Public Company Limited', price: 58.5, change: 1.5, sector: 'Technology' },
  { symbol: 'LH', name: 'Land and Houses Public Company Limited', price: 12.8, change: -1.2, sector: 'Property' },
]

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
  const query = searchParams.q || ''
  const results = query ? await searchStocks(query) : []

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div>
        <h1 className="text-xl font-bold mb-1 text-text">
          Search Stocks
        </h1>
        <p className="text-sm text-text-2">
          Find stocks by symbol or company name
        </p>
      </div>

      {/* Search Bar */}
      <SearchClient defaultValue={query} />

      {/* Search Results - Compact */}
      {query && (
        <div>
          {results.length > 0 ? (
            <div className="rounded-lg divide-y border border-border bg-surface">
              {results.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stock/${stock.symbol}`}
                  className="block transition-all duration-200 hover:bg-surface-1"
                >
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-sm text-text">
                            {stock.symbol}
                          </div>
                          <div className="text-xs truncate max-w-md text-text-2">
                            {stock.name}
                          </div>
                          <div className="text-[10px] mt-1 text-text-3 uppercase tracking-wide">
                            {stock.sector}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-3">
                      <div className="font-semibold text-sm text-text">
                        {formatNumber(stock.price, 2)}
                      </div>
                      <div
                        className={cn(
                          'text-xs font-medium transition-colors duration-200',
                          stock.change >= 0 ? 'text-up' : 'text-down'
                        )}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {formatPercentage(stock.change)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
              <p className="text-sm font-medium text-text-2">No stocks found</p>
              <p className="text-xs mt-1 text-text-3">
                Try a different search term
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
            Search for stocks
          </h3>
          <p className="max-w-md mx-auto text-sm text-text-2">
            Enter a stock symbol (e.g., PTT, KBANK) or company name to see
            detailed analysis and investment recommendations.
          </p>
        </div>
      )}
    </div>
  )
}
