/**
 * SectorRotationModule Component
 *
 * Displays sector rotation analysis including:
 * - Top 3 leaders (green)
 * - Bottom 3 laggards (red)
 * - Rotation signal badge (Entry/Exit/Hold)
 *
 * Answers Q2: "What sector is heavy market up or down because xxx sector?"
 * Data source: /api/sector-rotation
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { TrendingUp, TrendingDown, ArrowRightLeft, AlertCircle } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

// ==================================================================
// TYPES
// ==================================================================

export interface SectorData {
  /** Sector code */
  sector: string
  /** Sector name */
  name: string
  /** Change percent */
  change: number
  /** Rotation signal */
  signal: 'Entry' | 'Accumulate' | 'Hold' | 'Distribute' | 'Exit'
  /** Performance rank */
  rank: number
  /** Trading value (millions) */
  value?: number
}

export interface SectorRotationData {
  /** Top performing sectors */
  leaders: SectorData[]
  /** Bottom performing sectors */
  laggards: SectorData[]
  /** Rotation pattern */
  pattern: 'Risk-On Rotation' | 'Risk-Off Rotation' | 'Broad-Based Advance' | 'Broad-Based Decline' | 'Mixed/No Clear Pattern'
  /** Market driver sector */
  marketDriver?: SectorData
  /** Concentration score (0-100) */
  concentration: number
  /** Key observations */
  observations: string[]
  /** Timestamp */
  timestamp: number
}

export interface SectorRotationModuleProps {
  /** Pre-fetched data (optional) */
  data?: SectorRotationData
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface SectorRowProps {
  sector: SectorData
  showRank?: boolean
  variant: 'leader' | 'laggard'
}

function SectorRow({ sector, showRank = true, variant }: SectorRowProps) {
  const isLeader = variant === 'leader'
  const valueColor = isLeader ? '#2ED8A7' : '#F45B69'
  const bgColor = isLeader ? 'rgba(46, 216, 167, 0.08)' : 'rgba(244, 91, 105, 0.08)'

  const getSignalColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (sector.signal) {
      case 'Entry':
      case 'Accumulate':
        return 'buy'
      case 'Exit':
      case 'Distribute':
        return 'sell'
      default:
        return 'neutral'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeader ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 p-2 rounded"
      style={{ backgroundColor: bgColor }}
    >
      {/* Rank */}
      {showRank && (
        <span className="text-xs font-semibold w-4 text-text-muted">
          {sector.rank ?? '-'}
        </span>
      )}

      {/* Sector Name */}
      <span className="text-sm font-medium text-text flex-1 min-w-0">
        {sector.name}
      </span>

      {/* Change Percent */}
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: valueColor }}
      >
        {formatPercentage(sector.change)}
      </span>

      {/* Signal Badge */}
      <Badge size="sm" color={getSignalColor()}>
        {sector.signal}
      </Badge>
    </motion.div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SectorRotationModule({ data: initialData, className }: SectorRotationModuleProps) {
  // Fetch data from API
  const { data, isLoading, error } = useQuery<SectorRotationData>({
    queryKey: ['sector-rotation'],
    queryFn: async () => {
      const res = await fetch('/api/sector-rotation')
      if (!res.ok) throw new Error('Failed to fetch sector rotation data')
      return res.json()
    },
    initialData: initialData,
    refetchInterval: 60000, // Refetch every minute
  })

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Sector Rotation</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-12 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
        </div>
      </Card>
    )
  }

  // Hide module completely when data is unavailable (Phase 1.2 fix: removed empty check)
  // The percentile-based selection now always returns 3+ leaders and 3+ laggards
  if (error || !data) {
    return null
  }

  // Get pattern badge color
  const getPatternColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (data.pattern) {
      case 'Risk-On Rotation':
      case 'Broad-Based Advance':
        return 'buy'
      case 'Risk-Off Rotation':
      case 'Broad-Based Decline':
        return 'sell'
      default:
        return 'neutral'
    }
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Sector Rotation</h3>
        </div>
        <Badge size="sm" color={getPatternColor()}>
          {data.pattern}
        </Badge>
      </div>

      {/* Leaders Section */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          <TrendingUp className="w-3 h-3 text-up" />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Leaders
          </span>
        </div>
        <div className="space-y-1">
          {data.leaders.slice(0, 3).map((sector) => (
            <SectorRow key={sector.sector} sector={sector} variant="leader" />
          ))}
        </div>
      </div>

      {/* Laggards Section */}
      <div className="mb-3">
        <div className="flex items-center gap-1 mb-2">
          <TrendingDown className="w-3 h-3 text-down" />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Laggards
          </span>
        </div>
        <div className="space-y-1">
          {data.laggards.slice(0, 3).map((sector) => (
            <SectorRow key={sector.sector} sector={sector} variant="laggard" />
          ))}
        </div>
      </div>

      {/* Market Driver */}
      {data.marketDriver && (
        <div className="mb-3 p-2 rounded-lg bg-surface-2 border border-border">
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3 text-warn" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Market Driver
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">
              {data.marketDriver.name}
            </span>
            <span className="text-sm font-bold tabular-nums text-up">
              {formatPercentage(data.marketDriver.change)}
            </span>
          </div>
        </div>
      )}

      {/* Concentration & Observations */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            Concentration
          </span>
          <span className="text-xs font-medium text-text-1">
            {formatPercentage(data.concentration)}
          </span>
        </div>
        {/* Concentration bar */}
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.concentration}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              backgroundColor:
                data.concentration > 60
                  ? '#F45B69'
                  : data.concentration > 30
                    ? '#F7C948'
                    : '#2ED8A7',
            }}
          />
        </div>
        {data.observations && data.observations.length > 0 && (
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            {data.observations[0]}
          </p>
        )}
      </div>
    </Card>
  )
}

export default SectorRotationModule
