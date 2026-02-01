/**
 * EvidenceCards Component
 * Displays key metrics (P/E, P/BV, Dividend) and peer comparison
 * Theme: Green-tinted dark with teal up / soft red down
 *
 * Phase 5: Enhanced with smooth transitions and hover effects
 */

'use client'

import { Card, Badge } from '@/components/shared'
import Link from 'next/link'
import { cn, safeToFixed } from '@/lib/utils'

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
      format: (v: number) => safeToFixed(v, 1),
      better: 'lower',
    },
    {
      label: 'P/BV',
      value: metrics.pbv,
      average: sectorAverages?.pbv,
      format: (v: number) => safeToFixed(v, 2),
      better: 'lower',
    },
    {
      label: 'Dividend',
      value: metrics.dividendYield,
      format: (v: number) => `${safeToFixed(v, 1)}%`,
      better: 'higher',
    },
  ]

  return (
    <Card variant="compact">
      <h3 className="text-base font-semibold mb-3 text-text">
        Key Metrics
        {sector && (
          <span className="text-xs font-normal ml-2 text-text-2">
            vs {sector} sector
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metricsData.map((metric) => {
          if (metric.value === undefined) return null

          const isBetter =
            metric.better === 'lower'
              ? metric.average !== undefined && metric.value < metric.average
              : metric.average !== undefined && metric.value > metric.average

          return (
            <div
              key={metric.label}
              className="rounded-lg p-3 bg-surface-2 border border-border transition-all duration-200 hover:shadow-soft"
            >
              <div className="text-xs mb-1 text-text-2">{metric.label}</div>
              <div className="text-xl font-bold text-text">
                {metric.format(metric.value)}
              </div>
              {metric.average !== undefined && (
                <div
                  className={cn(
                    'text-[10px] mt-1 transition-colors duration-200',
                    isBetter ? 'text-up' : 'text-down'
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

      {/* Peer Comparison - Compact */}
      {peers && peers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <h4 className="text-sm font-medium mb-2 text-text">Peer Comparison</h4>
          <div className="space-y-2">
            {peers.map((peer) => (
              <Link
                key={peer.symbol}
                href={`/stock/${peer.symbol}`}
                className="flex items-center justify-between p-2 rounded-lg transition-all duration-200 bg-surface-2 hover:bg-surface-1 hover:shadow-sm"
              >
                <div>
                  <div className="text-sm font-medium text-text">
                    {peer.symbol}
                  </div>
                  <div className="text-[10px] truncate max-w-[150px] text-text-2">
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
