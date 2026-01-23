/**
 * Search Page (Server Component)
 * Stock search with autocomplete functionality
 *
 * NOTE: Stock list data not yet available in RTDB.
 * Using mock data for demonstration until stock endpoint is implemented.
 */

import { SearchClient } from './SearchClient'
import { formatNumber, formatPercent } from '@/lib/utils'
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
  { symbol: 'INTUCH', name: 'Intouch Holdings Public Company Limited', price: 58.5, change: 1.5, sector: 'Technology' },
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
          Search Stocks
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          Find stocks by symbol or company name
        </p>
      </div>

      {/* Search Bar */}
      <SearchClient defaultValue={query} />

      {/* Search Results */}
      {query && (
        <div>
          {results.length > 0 ? (
            <div className="rounded-lg divide-y" style={{ backgroundColor: '#111827', border: '1px solid #273449' }}>
              {results.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stock/${stock.symbol}`}
                  className="block transition-colors"
                  style={{ borderBottom: '1px solid #273449' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold" style={{ color: '#E5E7EB' }}>
                            {stock.symbol}
                          </div>
                          <div className="text-sm truncate max-w-md" style={{ color: '#9CA3AF' }}>
                            {stock.name}
                          </div>
                          <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            {stock.sector}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-semibold" style={{ color: '#E5E7EB' }}>
                        {formatNumber(stock.price, 2)}
                      </div>
                      <div
                        className={cn(
                          'text-sm font-medium',
                          stock.change >= 0 ? 'text-signal-up-strong' : 'text-signal-down-strong'
                        )}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {formatPercent(stock.change)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-2" style={{ color: '#6B7280' }}>
                <svg
                  className="w-12 h-12 mx-auto"
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
              <p className="font-medium" style={{ color: '#9CA3AF' }}>No stocks found</p>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                Try a different search term
              </p>
            </div>
          )}
        </div>
      )}

      {/* No search state */}
      {!query && (
        <div className="text-center py-12">
          <div className="mb-4" style={{ color: '#6B7280' }}>
            <svg
              className="w-16 h-16 mx-auto"
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
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#E5E7EB' }}>
            Search for stocks
          </h3>
          <p className="max-w-md mx-auto" style={{ color: '#9CA3AF' }}>
            Enter a stock symbol (e.g., PTT, KBANK) or company name to see
            detailed analysis and investment recommendations.
          </p>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
