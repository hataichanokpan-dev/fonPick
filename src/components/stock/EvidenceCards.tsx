/**
 * EvidenceCards Component
 * Displays key metrics (P/E, P/BV, Dividend) and peer comparison
 */

import { Card, Badge } from '@/components/shared'
import Link from 'next/link'

interface EvidenceCardsProps {
  metrics: {
    pe?: number
    pbv?: number
    dividendYield?: number
  }
  sector?: string
  sectorAverages?: {
    pe?: number
    pbv?: number
  }
  peers?: Array<{
    symbol: string
    name: string
    verdict: 'Buy' | 'Watch' | 'Avoid'
  }>
}

export function EvidenceCards({
  metrics,
  sector,
  sectorAverages,
  peers,
}: EvidenceCardsProps) {
  type MetricData = {
    label: string
    value: number | undefined
    average?: number
    format: (v: number) => string
    better: 'lower' | 'higher'
  }

  const metricsData: MetricData[] = [
    {
      label: 'P/E',
      value: metrics.pe,
      average: sectorAverages?.pe,
      format: (v: number) => v.toFixed(1),
      better: 'lower',
    },
    {
      label: 'P/BV',
      value: metrics.pbv,
      average: sectorAverages?.pbv,
      format: (v: number) => v.toFixed(2),
      better: 'lower',
    },
    {
      label: 'Dividend',
      value: metrics.dividendYield,
      format: (v: number) => `${v.toFixed(1)}%`,
      better: 'higher',
    },
  ]

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Key Metrics
        {sector && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            vs {sector} sector
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricsData.map((metric) => {
          if (metric.value === undefined) return null

          const isBetter =
            metric.better === 'lower'
              ? metric.average !== undefined && metric.value < metric.average
              : metric.average !== undefined && metric.value > metric.average

          return (
            <div
              key={metric.label}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
              <div className="text-2xl font-bold text-gray-900">
                {metric.format(metric.value)}
              </div>
              {metric.average !== undefined && (
                <div
                  className={cn(
                    'text-xs mt-1',
                    isBetter ? 'text-up-600' : 'text-down-600'
                  )}
                >
                  Sector: {metric.format(metric.average)}
                  {isBetter ? ' ✓' : ' ✗'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Peer Comparison */}
      {peers && peers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Peer Comparison</h4>
          <div className="space-y-2">
            {peers.map((peer) => (
              <Link
                key={peer.symbol}
                href={`/stock/${peer.symbol}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {peer.symbol}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {peer.name}
                  </div>
                </div>
                <Badge
                  color={
                    peer.verdict === 'Buy'
                      ? 'buy'
                      : peer.verdict === 'Watch'
                      ? 'watch'
                      : 'avoid'
                  }
                  size="sm"
                >
                  {peer.verdict}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
