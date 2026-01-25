/**
 * RankingsImpactModule Component
 *
 * Displays cross-analysis of rankings showing:
 * - Sector distribution chart (stock counts, NOT performance)
 * - Concentration score gauge
 * - Rankings distribution by sector
 * - Breadth status
 *
 * Answers Q5: "How top ranking effect to market?"
 * Data source: /api/correlations
 *
 * NOTE: Sector performance data is shown in Q2: SectorRotationModule
 * This module focuses on rankings analysis and concentration
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { PieChart, AlertCircle, Building2, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import type { CoverageMetrics } from '@/types/correlation'

// ==================================================================
// TYPES
// ==================================================================

export interface SectorDistribution {
  /** Sector code */
  sector: string
  /** Sector name */
  name: string
  /** Number of stocks in rankings */
  count: number
  /** Percentage of rankings */
  percentage: number
  /** Sector change percent */
  change?: number
}

export interface RankingsImpactData {
  /** Overall impact level */
  impact: 'High' | 'Medium' | 'Low'
  /** Sector distribution (stock counts only, no performance data) */
  distribution: SectorDistribution[]
  /** Concentration score (0-100) */
  concentration: number
  /** Concentration level */
  concentrationLevel: 'High' | 'Medium' | 'Low'
  /** Top 3 concentration percentage */
  top3Percent: number
  /** Dominant sectors */
  dominantSectors: string[]
  /** Breadth status */
  breadthStatus: 'Broad' | 'Narrow' | 'Mixed'
  /** Key observations */
  observations: string[]
  /** Coverage metrics (Phase 2) */
  coverage?: CoverageMetrics
  /** Timestamp */
  timestamp: number
}

export interface RankingsImpactModuleProps {
  /** Pre-fetched data (optional) */
  data?: RankingsImpactData
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

// Error State Component
interface ErrorStateProps {
  onRetry: () => void
  isRetrying: boolean
}

function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertTriangle className="w-8 h-8 text-warning mb-3" />
      <h4 className="text-sm font-semibold text-text-1 mb-1">
        Data Unavailable
      </h4>
      <p className="text-xs text-text-muted mb-4 max-w-[200px]">
        Rankings impact data is currently unavailable. Please try again.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-1 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  )
}

interface ConcentrationGaugeProps {
  concentration: number
  size?: number
}

function ConcentrationGauge({ concentration, size = 56 }: ConcentrationGaugeProps) {
  const percentage = Math.max(0, Math.min(100, concentration))

  const getGaugeColor = (): { bg: string; fill: string } => {
    if (concentration >= 60) return { bg: 'rgba(244, 91, 105, 0.2)', fill: '#F45B69' }
    if (concentration >= 30) return { bg: 'rgba(247, 201, 72, 0.2)', fill: '#F7C948' }
    return { bg: 'rgba(46, 216, 167, 0.2)', fill: '#2ED8A7' }
  }

  const colors = getGaugeColor()
  const circumference = 2 * Math.PI * ((size - 8) / 2)
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.bg}
          strokeWidth="5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.fill}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold tabular-nums" style={{ color: colors.fill }}>
          {concentration}
        </span>
      </div>
    </div>
  )
}

interface SectorBarProps {
  sector: SectorDistribution
  maxCount: number
  /** Base color for the bar (not performance-based) */
  color?: string
}

function SectorBar({ sector, maxCount, color = '#3b82f6' }: SectorBarProps) {
  const barWidth = (sector.count / maxCount) * 100

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-text w-20 truncate" title={sector.name}>
        {sector.name}
      </span>
      <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums text-text-1 w-8 text-right">
        {sector.count}
      </span>
      <span className="text-xs tabular-nums text-text-muted w-10 text-right">
        {sector.percentage}%
      </span>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function RankingsImpactModule({ data: initialData, className }: RankingsImpactModuleProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  // Fetch data from API
  const { data, isLoading, error, refetch } = useQuery<RankingsImpactData>({
    queryKey: ['rankings-impact'],
    queryFn: async () => {
      const res = await fetch('/api/correlations?type=impact')
      if (!res.ok) throw new Error('Failed to fetch rankings impact data')
      return res.json()
    },
    initialData: initialData,
    refetchInterval: 60000, // Refetch every minute
  })

  const handleRetry = async () => {
    setIsRetrying(true)
    await refetch()
    setIsRetrying(false)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Rankings Impact</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
        </div>
      </Card>
    )
  }

  // Show error state instead of hiding module completely
  if (error || !data) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Rankings Impact</h3>
        </div>
        <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />
      </Card>
    )
  }

  // Get impact badge color
  const getImpactColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (data.impact) {
      case 'High':
        return 'watch'
      case 'Medium':
        return 'neutral'
      default:
        return 'buy'
    }
  }

  // Get concentration badge color
  const getConcentrationColor = (): 'buy' | 'sell' | 'neutral' | 'watch' | 'avoid' => {
    switch (data.concentrationLevel) {
      case 'High':
        return 'avoid'
      case 'Medium':
        return 'watch'
      default:
        return 'buy'
    }
  }

  // Get coverage badge color (Phase 2)
  const getCoverageColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    if (!data.coverage) return 'neutral'
    if (data.coverage.coveragePercent >= 80) return 'buy'
    if (data.coverage.coveragePercent >= 60) return 'watch'
    return 'sell'
  }

  const maxCount = Math.max(...data.distribution.map((s) => s.count), 1)

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-text-3" />
          <h3 className="text-sm font-semibold text-text-2">Rankings Impact</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Coverage Badge (Phase 2) */}
          {data.coverage && (
            <Badge size="sm" color={getCoverageColor()}>
              {data.coverage.coveragePercent}% mapped
            </Badge>
          )}
          <Badge size="sm" color={getImpactColor()}>
            {data.impact}
          </Badge>
          <Badge size="sm" color={getConcentrationColor()}>
            {data.concentrationLevel}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* Concentration Gauge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <ConcentrationGauge concentration={data.concentration} size={64} />
          <span className="text-[10px] uppercase tracking-wide text-text-3">
            Concentration
          </span>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="p-2 rounded bg-surface-2">
            <div className="flex items-center gap-1 mb-1">
              <Building2 className="w-3 h-3 text-text-3" />
              <span className="text-[10px] uppercase tracking-wide text-text-3">
                Dominant Sectors
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.dominantSectors.slice(0, 3).map((sector, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded bg-surface-3 text-text-2"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2 rounded bg-surface-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3 text-text-3" />
              <span className="text-[10px] uppercase tracking-wide text-text-3">
                Top 3 Share
              </span>
            </div>
            <span className="text-lg font-bold tabular-nums text-text">
              {data.top3Percent}%
            </span>
          </div>

          <div className="p-2 rounded bg-surface-2 col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-3 uppercase tracking-wide">
                Breadth Status
              </span>
              <Badge size="sm" color={data.breadthStatus === 'Broad' ? 'buy' : data.breadthStatus === 'Narrow' ? 'sell' : 'neutral'}>
                {data.breadthStatus}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Distribution (Stock Counts Only) */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-info" />
            <span className="text-[10px] uppercase tracking-wide text-text-3">
              Sector Distribution (Stock Count)
            </span>
          </div>
          <Link
            href="#sector-rotation"
            className="flex items-center gap-1 text-[10px] text-info hover:text-accent-blue transition-colors"
          >
            <span>View Sector Performance</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {data.distribution.slice(0, 5).map((sector) => (
            <SectorBar
              key={sector.sector}
              sector={sector}
              maxCount={maxCount}
              color={sector.sector === 'OTHER' ? '#9ca3af' : '#3b82f6'}
            />
          ))}
        </div>
      </div>

      {/* Observations */}
      {data.observations && data.observations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-text-muted leading-relaxed">
            {data.observations[0]}
          </p>
        </div>
      )}
    </Card>
  )
}

export default RankingsImpactModule
