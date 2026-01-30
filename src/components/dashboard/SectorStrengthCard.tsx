/**
 * SectorStrengthCard Component
 *
 * Displays sector rotation analysis including:
 * - Top 5 leaders (green)
 * - Bottom 5 laggards (red)
 * - Buy/Avoid/Watch signals
 * - Rotation pattern badge
 * - Market concentration indicator
 *
 * Answers Q2: "What sector is heavy market up or down because xxx sector?"
 * Data source: /api/market-intelligence
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import {
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react'
import { formatPercentage } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { SectorPerformance } from '@/types/sector-rotation'
import { useSectorRotation } from '@/hooks/useMarketIntelligence'

// ==================================================================
// TYPES
// ==================================================================

export interface SectorStrengthCardProps {
  /** Additional CSS classes */
  className?: string
  /** Number of sectors to show */
  topCount?: number
  /** Include laggards */
  showLaggards?: boolean
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  up: '#2ED8A7',
  down: '#F45B69',
  warn: '#F7C948',
  neutral: '#AEB7B3',
}

const DEFAULT_TOP_COUNT = 5

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface SectorRowProps {
  sector: SectorPerformance
  showRank?: boolean
  variant: 'leader' | 'laggard'
}

function SectorRow({ sector, showRank = true, variant }: SectorRowProps) {
  const isLeader = variant === 'leader'
  const valueColor = isLeader ? COLORS.up : COLORS.down
  const bgColor = isLeader
    ? 'rgba(46, 216, 167, 0.08)'
    : 'rgba(244, 91, 105, 0.08)'

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

  // Get sector name from RTDBSector
  const sectorName = sector.sector.name || sector.sector.id

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
        {sectorName}
      </span>

      {/* Change Percent (vsMarket) */}
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: valueColor }}
      >
         
        {formatPercentage(sector.vsMarket)}
      </span>

      {/* Signal Badge */}
      <Badge size="sm" color={getSignalColor()}>
        {sector.signal}
      </Badge>
    </motion.div>
  )
}

// Loading Skeleton
function SectorStrengthSkeleton() {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">Sector Strength</h3>
      </div>
      <div className="animate-pulse space-y-2">
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
      </div>
    </Card>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SectorStrengthCard({
  className,
  topCount = DEFAULT_TOP_COUNT,
  showLaggards = true,
}: SectorStrengthCardProps) {
  // Use consolidated market intelligence hook
  const { data: sectorData, isLoading, error } = useSectorRotation()

  if (isLoading) {
    return <SectorStrengthSkeleton />
  }

  if (error || !sectorData) {
    return (
      <Card padding="sm" className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">Sector Strength</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">
          Unable to load sector data
        </p>
      </Card>
    )
  }

  // Get pattern badge color
  const getPatternColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (sectorData.pattern) {
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

  // Determine concentration bar color
  const getConcentrationColor = () => {
    if (sectorData.leadership.concentration > 60) return COLORS.down
    if (sectorData.leadership.concentration > 30) return COLORS.warn
    return COLORS.up
  }

  // Get leaders and laggards from the leadership object
  const leaders = sectorData.leadership?.leaders || []
  const laggards = sectorData.leadership?.laggards || []
  const concentration = sectorData.leadership?.concentration || 0

  return (
    <Card padding="sm" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Sector Strength</h3>
        </div>
        <Badge size="sm" color={getPatternColor()}>
          {sectorData.pattern}
        </Badge>
      </div>

      {/* Leaders Section */}
      {leaders.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3 text-up" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Top {topCount} Leaders
            </span>
          </div>
          <div className="space-y-1">
            {leaders.slice(0, topCount).map((sector) => (
              <SectorRow
                key={sector.sector.id}
                sector={sector}
                variant="leader"
              />
            ))}
          </div>
        </div>
      )}

      {/* Laggards Section */}
      {showLaggards && laggards.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <TrendingDown className="w-3 h-3 text-down" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Bottom {topCount} Laggards
            </span>
          </div>
          <div className="space-y-1">
            {laggards.slice(0, topCount).map((sector) => (
              <SectorRow
                key={sector.sector.id}
                sector={sector}
                variant="laggard"
              />
            ))}
          </div>
        </div>
      )}

      {/* Concentration Bar */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            Concentration
          </span>
          <span className="text-xs font-medium text-text">
            {formatPercentage(concentration)}
          </span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, concentration)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: getConcentrationColor() }}
          />
        </div>

        {/* Actionable Sectors */}
        {(sectorData.focusSectors.length > 0 ||
          sectorData.avoidSectors.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sectorData.focusSectors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-wide text-text-muted">
                  Buy:
                </span>
                {sectorData.focusSectors.slice(0, 3).map((s) => (
                  <Badge key={s} size="sm" color="buy">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {sectorData.avoidSectors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-wide text-text-muted">
                  Avoid:
                </span>
                {sectorData.avoidSectors.slice(0, 3).map((s) => (
                  <Badge key={s} size="sm" color="sell">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Observation */}
        {sectorData.observations && sectorData.observations.length > 0 && (
          <p className="mt-3 text-xs text-text-muted leading-relaxed">
            {sectorData.observations[0]}
          </p>
        )}
      </div>
    </Card>
  )
}

export default SectorStrengthCard
