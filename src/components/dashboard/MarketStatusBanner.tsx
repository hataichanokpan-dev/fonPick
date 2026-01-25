/**
 * MarketStatusBanner Component - Redesigned
 *
 * Sticky top banner showing live market regime, SET index, and market status.
 * Provides real-time market overview at a glance with mobile-first design.
 *
 * Design Goals:
 * - Mobile-first responsive design (40px on mobile, 48px on desktop)
 * - Professional visual hierarchy with clear information display
 * - Regime badge prominently displayed
 * - Better spacing and typography
 * - Touch-friendly sizing
 *
 * Features:
 * - Regime-based color coding (Risk-On = teal, Risk-Off = red, Neutral = gray)
 * - Confidence level badge (High/Medium/Low)
 * - Animated entrance with framer-motion
 * - Market status indicator (open/closed with pulse animation)
 * - Data age display (e.g., "2m ago")
 * - Sticky positioning with backdrop blur
 * - Responsive height (h-10 on mobile, h-12 on desktop)
 */

'use client'

import { Badge } from '@/components/shared/Badge'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useMemo } from 'react'

// ==================================================================
// TYPES
// ==================================================================

export interface MarketStatusBannerProps {
  /** Current market regime */
  regime: 'Risk-On' | 'Neutral' | 'Risk-Off'
  /** Confidence level of regime detection */
  confidence: 'High' | 'Medium' | 'Low'
  /** SET index value */
  setIndex: number
  /** SET index change */
  setChange: number
  /** SET index percentage change */
  setChangePercent: number
  /** Whether market is currently open */
  isMarketOpen?: boolean
  /** Last update timestamp */
  lastUpdate?: number
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  'Risk-On': {
    bg: 'rgba(46, 216, 167, 0.08)',
    border: 'rgba(46, 216, 167, 0.3)',
    text: '#2ED8A7',
  },
  'Risk-Off': {
    bg: 'rgba(244, 91, 105, 0.08)',
    border: 'rgba(244, 91, 105, 0.3)',
    text: '#F45B69',
  },
  Neutral: {
    bg: 'rgba(174, 183, 179, 0.08)',
    border: 'rgba(174, 183, 179, 0.3)',
    text: '#AEB7B3',
  },
} as const

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

function formatSetIndex(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatSetChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatSetChangePercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return 'N/A'

  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}m`
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h`
  }

  // Days
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  return `${days}d`
}

function getConfidenceColor(confidence: 'High' | 'Medium' | 'Low'): 'buy' | 'watch' | 'sell' {
  switch (confidence) {
    case 'High':
      return 'buy'
    case 'Medium':
      return 'watch'
    case 'Low':
      return 'sell'
  }
}

function getRegimeIcon(regime: 'Risk-On' | 'Neutral' | 'Risk-Off') {
  switch (regime) {
    case 'Risk-On':
      return <TrendingUp className="w-3.5 h-3.5" />
    case 'Risk-Off':
      return <TrendingDown className="w-3.5 h-3.5" />
    case 'Neutral':
      return <Minus className="w-3.5 h-3.5" />
  }
}

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

interface RegimeBadgeProps {
  regime: 'Risk-On' | 'Neutral' | 'Risk-Off'
  confidence: 'High' | 'Medium' | 'Low'
}

function RegimeBadge({ regime, confidence }: RegimeBadgeProps) {
  const icon = getRegimeIcon(regime)
  const confidenceColor = getConfidenceColor(confidence)

  return (
    <div className="flex items-center gap-2">
      {/* Regime Badge with Icon */}
      <Badge color={confidenceColor} size="sm" className="flex items-center gap-1">
        {icon}
        <span className="font-semibold">{regime}</span>
      </Badge>

      {/* Confidence Badge */}
      <Badge color={confidenceColor} size="sm" className="text-xs">
        {confidence}
      </Badge>
    </div>
  )
}

interface MarketStatusIndicatorProps {
  isOpen: boolean
}

function MarketStatusIndicator({ isOpen }: MarketStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isOpen ? '#2ED8A7' : '#AEB7B3',
        }}
        animate={isOpen ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={isOpen ? { duration: 2, repeat: Infinity } : {}}
      />
       
    </div>
  )
}

interface SetIndexDisplayProps {
  value: number
  change: number
  changePercent: number
}

function SetIndexDisplay({ value, change, changePercent }: SetIndexDisplayProps) {
  const changeColor = change >= 0 ? 'text-up-primary' : 'text-down-primary'

  return (
    <div className="flex items-baseline gap-2">
      {/* Main SET Index Value */}
      <span className="text-md font-bold text-text sm:text-base tabular-nums">
        SET : {formatSetIndex(value)}
      </span>

      {/* Change Values */}
      <span className={`text-xs font-medium ${changeColor} tabular-nums`}>
        {formatSetChange(change)} ({formatSetChangePercent(changePercent)})
      </span>
    </div>
  )
}

interface DataFreshnessDisplayProps {
  timestamp?: number
}

function DataFreshnessDisplay({ timestamp }: DataFreshnessDisplayProps) {
  if (!timestamp) return null

  return (
    <div className="flex items-center gap-1.5">
      <Activity className="w-3 h-3 text-text-3" />
      <span className="text-[10px] text-text-3 xs:text-xs tabular-nums">
        {formatTimestamp(timestamp)}
      </span>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function MarketStatusBanner({
  regime,
  confidence,
  setIndex,
  setChange,
  setChangePercent,
  isMarketOpen = true,
  lastUpdate,
}: MarketStatusBannerProps) {
  const colors = useMemo(() => COLORS[regime], [regime])

  return (
    <motion.div
      role="banner"
      aria-label={`Market status: ${regime}, SET Index: ${formatSetIndex(setIndex)}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky py-2 top-0 z-50 w-full backdrop-blur-md border-b 
      h-14 sm:h-16 rounded-md mb-2"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="h-full px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">

          {/* Left: Regime Badge with Confidence */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SetIndexDisplay
              value={setIndex}
              change={setChange}
              changePercent={setChangePercent}
            />
          </div>

          {/* Center: SET Index */}
          <div className="flex items-center justify-center flex-1 min-w-0">
            
          </div>

          {/* Right: Market Status & Data Freshness */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <MarketStatusIndicator isOpen={isMarketOpen} />
            <DataFreshnessDisplay timestamp={lastUpdate} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MarketStatusBanner
