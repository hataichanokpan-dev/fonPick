/**
 * AccumulationPatternsCard Component
 *
 * Displays 3-day accumulation/distribution patterns for stocks including:
 * - Top accumulation/distribution patterns
 * - Color-coded rows (green for accumulation, red for distribution)
 * - Days, average net flow, pattern badge
 * - Staggered entrance animation
 * - Sorting by score
 *
 * P1 Component - Flow Analysis
 * Data source: /api/market-intelligence
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, rank numbers, pattern badges
 * i18n: Supports Thai/English translations
 */

'use client'

import { Card, Badge } from '@/components/shared'
import { Activity } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

// ==================================================================
// TYPES
// ==================================================================

export type AccumulationPatternType =
  | 'Strong Accumulation'
  | 'Accumulation'
  | 'Distribution'
  | 'Strong Distribution'

export interface AccumulationPattern {
  symbol: string
  name?: string
  pattern: AccumulationPatternType
  days: number
  avgNetFlow: number
  totalNetFlow: number
  score: number
}

export interface AccumulationPatternsCardProps {
  patterns: AccumulationPattern[]
  topCount?: number
}

// ==================================================================
// CONSTANTS
// ==================================================================

const PATTERN_BADGE_COLORS: Record<
  AccumulationPatternType,
  'buy' | 'sell' | 'up' | 'down' | 'neutral'
> = {
  'Strong Accumulation': 'buy',
  'Accumulation': 'buy',
  'Distribution': 'sell',
  'Strong Distribution': 'sell',
}

const DEFAULT_TOP_COUNT = 10

// ==================================================================
// UTILITIES
// ==================================================================

/**
 * Format net flow value for display
 */
function formatNetFlow(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000_000) {
    return `${value >= 0 ? '+' : '-'}${(absValue / 1_000_000_000).toFixed(1)}B`
  }

  if (absValue >= 1_000_000) {
    return `${value >= 0 ? '+' : '-'}${(absValue / 1_000_000).toFixed(0)}M`
  }

  if (absValue >= 1_000) {
    return `${value >= 0 ? '+' : '-'}${(absValue / 1_000).toFixed(1)}K`
  }

  return `${value >= 0 ? '+' : '-'}${absValue}`
}

/**
 * Get color class based on pattern type
 */
function getPatternColorClass(pattern: AccumulationPatternType): string {
  return pattern.includes('Accumulation')
    ? 'text-up'
    : 'text-down'
}

/**
 * Check if pattern is strong (Strong Accumulation or Strong Distribution)
 */
function isStrongPattern(pattern: AccumulationPatternType): boolean {
  return pattern.startsWith('Strong')
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface PatternRowProps {
  pattern: AccumulationPattern
  rank: number
  index: number
  t: (key: string) => string
}

function PatternRow({ pattern, rank, index, t }: PatternRowProps) {
  const isAccumulation = pattern.pattern.includes('Accumulation')
  const colorClass = getPatternColorClass(pattern.pattern)
  const flowDisplay = formatNetFlow(pattern.avgNetFlow)
  const isStrong = isStrongPattern(pattern.pattern)

  return (
    <div
      data-testid={`pattern-row-${pattern.symbol}`}
      data-index={index}
      className={`flex items-center gap-2 p-2 rounded hover:bg-surface-2 transition-colors animate-fade-in-up ${
        isAccumulation ? 'accumulation' : 'distribution'
      }`}
    >
      {/* Rank */}
      <span className="text-xs font-semibold w-6 text-text-muted">
        #{rank}
      </span>

      {/* Symbol & Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text">{pattern.symbol}</span>
        </div>
        {pattern.name && (
          <span className="text-[10px] text-text-muted truncate block">
            {pattern.name}
          </span>
        )}
      </div>

      {/* Days & Flow */}
      <div className="text-right">
        <div className={`text-xs font-medium tabular-nums ${colorClass}`}>
          {flowDisplay}
        </div>
        <div className="text-[9px] text-text-muted">
          {pattern.days}d
        </div>
      </div>

      {/* Pattern Badge */}
      <Badge
        size="sm"
        color={PATTERN_BADGE_COLORS[pattern.pattern]}
        className={isStrong ? 'font-semibold' : ''}
      >
        {t(`accumulationPatterns.${pattern.pattern.toLowerCase().replace(/ /g, '')}`)}
      </Badge>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function AccumulationPatternsCard({
  patterns,
  topCount = DEFAULT_TOP_COUNT,
}: AccumulationPatternsCardProps) {
  const t = useTranslations('dashboard.accumulationPatterns')

  // Sort patterns by score (descending) - immutable
  const sortedPatterns = useMemo(() => {
    return [...patterns].sort((a, b) => b.score - a.score)
  }, [patterns])

  // Limit to topCount
  const displayPatterns = sortedPatterns.slice(0, topCount)

  // Empty state
  if (displayPatterns.length === 0) {
    return (
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">{t('title')}</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">
          {t('empty')}
        </p>
      </Card>
    )
  }

  return (
    <Card padding="sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">{t('title')}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-text-muted">
          {t('subtitle')}
        </span>
      </div>

      {/* Patterns List */}
      <div className="space-y-1">
        {displayPatterns.map((pattern, index) => (
          <PatternRow
            key={pattern.symbol}
            pattern={pattern}
            rank={index + 1}
            index={index}
            t={t}
          />
        ))}
      </div>
    </Card>
  )
}

export default AccumulationPatternsCard
