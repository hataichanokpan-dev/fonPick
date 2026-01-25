/**
 * VolatilityModule Component
 *
 * Displays market breadth indicators including:
 * - A/D ratio with gauge/visual indicator
 * - New high/low counts
 * - Breadth status indicator (Healthy/Weak/etc)
 *
 * Answers Q1: "How about market now? Aggressive vol or not?"
 * Data source: /api/market-breadth
 *
 * Note: For Risk-On/Off signals from smart money flow, see SmartMoneyModule (Q3)
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { TrendingUp, TrendingDown, Minus, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react'
import { formatNumber, formatDecimal } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

// ==================================================================
// TYPES
// ==================================================================

export interface MarketBreadthData {
  /** Advance/Decline ratio */
  adRatio: number
  /** Number of advancing stocks */
  advances: number
  /** Number of declining stocks */
  declines: number
  /** New 52-week highs */
  newHighs: number
  /** New 52-week lows */
  newLows: number
  /** Breadth status */
  status: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish'
  /** Volatility level */
  volatility: 'Aggressive' | 'Moderate' | 'Calm'
  /** Breadth trend */
  trend: 'Improving' | 'Stable' | 'Deteriorating'
  /** Confidence score (0-100) */
  confidence: number
  /** Key observations */
  observations: string[]
  /** Timestamp */
  timestamp: number
}

export interface VolatilityModuleProps {
  /** Pre-fetched data (optional) */
  data?: MarketBreadthData
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// DATA STATE TYPES
// ==================================================================

type DataState = 'current' | 'stale' | 'unavailable'

function getDataState(data: MarketBreadthData | undefined): DataState {
  if (!data) return 'unavailable'
  // Confidence of 0 is still valid data - only treat as unavailable if there's a fetch error
  // Low confidence (< 30) indicates stale data
  if (data.confidence < 30) return 'stale'
  return 'current'
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface ADRatioGaugeProps {
  ratio: number
  size?: number
}

function ADRatioGauge({ ratio, size = 64 }: ADRatioGaugeProps) {
  // Calculate gauge arc based on ratio (0-3+)
  const normalizedRatio = Math.max(0, Math.min(3, ratio))
  const percentage = (normalizedRatio / 3) * 100

  // Determine color based on ratio
  const getGaugeColor = (): { bg: string; fill: string } => {
    if (ratio >= 2) return { bg: 'rgba(46, 216, 167, 0.2)', fill: '#2ED8A7' }
    if (ratio >= 1) return { bg: 'rgba(174, 183, 179, 0.2)', fill: '#AEB7B3' }
    if (ratio >= 0.5) return { bg: 'rgba(247, 161, 170, 0.2)', fill: '#F7A1AA' }
    return { bg: 'rgba(244, 91, 105, 0.2)', fill: '#F45B69' }
  }

  const colors = getGaugeColor()
  const circumference = 2 * Math.PI * ((size - 8) / 2)
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.bg}
          strokeWidth="6"
        />
        {/* Foreground arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.fill}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold tabular-nums" style={{ color: colors.fill }}>
          {formatDecimal(ratio, 2)}
        </span>
      </div>
    </div>
  )
}

interface MetricItemProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  highlight?: boolean
}

function MetricItem({ label, value, trend, highlight }: MetricItemProps) {
  const getTrendColor = () => {
    if (trend === 'up') return '#2ED8A7'
    if (trend === 'down') return '#F45B69'
    return '#AEB7B3'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {trend && <span style={{ color: getTrendColor() }}>{getTrendIcon()}</span>}
        <span
          className={`font-semibold tabular-nums ${highlight ? 'text-2xl' : 'text-base'} text-text`}
        >
          {typeof value === 'number' ? formatNumber(value, 0) : value}
        </span>
      </div>
    </div>
  )
}

// Stale Badge Component
interface StaleBadgeProps {
  timestamp: number
}

function StaleBadge({ timestamp }: StaleBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-warning/10 border border-warning/20">
      <AlertTriangle className="w-3 h-3 text-warning" />
      <span className="text-[10px] font-medium text-warning">Stale</span>
      <span className="text-[9px] text-text-muted ml-auto">
        {formatTimestamp(timestamp)}
      </span>
    </div>
  )
}

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
        Market volatility data is currently unavailable. Please try again.
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

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function VolatilityModule({ data: initialData, className }: VolatilityModuleProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  // Fetch data from API
  const { data, isLoading, error, refetch } = useQuery<MarketBreadthData>({
    queryKey: ['market-breadth'],
    queryFn: async () => {
      const res = await fetch('/api/market-breadth')
      if (!res.ok) throw new Error('Failed to fetch market breadth data')
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

  // Determine data state
  const dataState = getDataState(data)

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Market Volatility</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-surface-2 rounded" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-surface-2 rounded" />
            <div className="h-12 bg-surface-2 rounded" />
            <div className="h-12 bg-surface-2 rounded" />
          </div>
        </div>
      </Card>
    )
  }

  // Unavailable state (P0 - Dedicated error state)
  if (error || !data || dataState === 'unavailable') {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Market Volatility</h3>
        </div>
        <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />
      </Card>
    )
  }

  // Stale state (P0 - Normal display + "Stale" badge + timestamp)
  const isStale = dataState === 'stale'

  // Determine status badge color
  const getStatusColor = (): 'up' | 'down' | 'neutral' | 'buy' | 'sell' | 'watch' | 'avoid' => {
    switch (data.status) {
      case 'Strongly Bullish':
      case 'Bullish':
        return 'buy'
      case 'Strongly Bearish':
      case 'Bearish':
        return 'sell'
      default:
        return 'neutral'
    }
  }

  // Get volatility badge color
  const getVolatilityColor = (): 'up' | 'down' | 'neutral' | 'watch' => {
    switch (data.volatility) {
      case 'Aggressive':
        return 'watch'
      case 'Moderate':
        return 'neutral'
      default:
        return 'up'
    }
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">Market Volatility</h3>
        <div className="flex items-center gap-2">
          {isStale && <StaleBadge timestamp={data.timestamp} />}
          <Badge size="sm" color={getStatusColor()}>
            {data.status}
          </Badge>
          <Badge size="sm" color={getVolatilityColor()}>
            {data.volatility}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* A/D Ratio Gauge */}
        <div className="flex-shrink-0">
          <ADRatioGauge ratio={data.adRatio} size={64} />
        </div>

        {/* Metrics Grid */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          <MetricItem
            label="A/D Ratio"
            value={formatDecimal(data.adRatio, 2)}
            trend={data.adRatio > 1 ? 'up' : data.adRatio < 1 ? 'down' : 'neutral'}
            highlight
          />
          <MetricItem
            label="Adv/Dec"
            value={`${formatNumber(data.advances, 0)}/${formatNumber(data.declines, 0)}`}
          />
          <MetricItem
            label="New Hi/Lo"
            value={`${data.newHighs}/${data.newLows}`}
            trend={data.newHighs > data.newLows ? 'up' : data.newHighs < data.newLows ? 'down' : 'neutral'}
          />
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            Trend
          </span>
          <div className="flex items-center gap-1">
            {data.trend === 'Improving' && <TrendingUp className="w-3 h-3 text-up" />}
            {data.trend === 'Deteriorating' && <TrendingDown className="w-3 h-3 text-down" />}
            {data.trend === 'Stable' && <Minus className="w-3 h-3 text-flat" />}
            <span className="text-xs text-text-1">{data.trend}</span>
          </div>
        </div>
        {data.observations && data.observations.length > 0 && (
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            {data.observations[0]}
          </p>
        )}
      </div>

      {/* Reference to Smart Money Module */}
      <div className="mt-3 pt-2 border-t border-border">
        <Link
          href="#smart-money"
          className="group flex items-center gap-1 text-[10px] text-info hover:text-info/80 transition-colors"
        >
          <span>View Smart Money for flow details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  )
}

export default VolatilityModule
