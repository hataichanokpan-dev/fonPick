/**
 * TopRankings Component
 * Displays top gainers, losers, and volume leaders
 */

import { Card } from '@/components/shared'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { formatPercent, formatVolume } from '@/lib/utils'
import Link from 'next/link'

interface TopRankingsProps {
  data: {
    topGainers: Array<{ symbol: string; price: number; change: number }>
    topLosers: Array<{ symbol: string; price: number; change: number }>
    topVolume: Array<{ symbol: string; volume: number }>
    timestamp?: number
  }
}

export function TopRankings({ data }: TopRankingsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Rankings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <RankingList
          title="Top Gainers"
          icon={<TrendingUp className="w-5 h-5 text-up-600" />}
          stocks={data.topGainers.slice(0, 5)}
          type="gainer"
        />

        {/* Top Losers */}
        <RankingList
          title="Top Losers"
          icon={<TrendingDown className="w-5 h-5 text-down-600" />}
          stocks={data.topLosers.slice(0, 5)}
          type="loser"
        />

        {/* Top Volume */}
        <RankingList
          title="Top Volume"
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          stocks={data.topVolume.slice(0, 5)}
          type="volume"
        />
      </div>
    </Card>
  )
}

interface RankingListProps {
  title: string
  icon: React.ReactNode
  stocks: Array<{ symbol: string; price?: number; change?: number; volume?: number }>
  type: 'gainer' | 'loser' | 'volume'
}

function RankingList({ title, icon, stocks, type }: RankingListProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-gray-700">{title}</h4>
      </div>

      <ul className="space-y-2">
        {stocks.map((stock, index) => (
          <li key={stock.symbol}>
            <Link
              href={`/stock/${stock.symbol}`}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 w-4">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900">
                  {stock.symbol}
                </span>
              </div>

              <div className="text-right">
                {type === 'volume' ? (
                  <span className="text-sm font-medium text-gray-700">
                    {formatVolume(stock.volume || 0)}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      type === 'gainer' && 'text-up-600',
                      type === 'loser' && 'text-down-600'
                    )}
                  >
                    {stock.change !== undefined && formatPercent(stock.change)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
