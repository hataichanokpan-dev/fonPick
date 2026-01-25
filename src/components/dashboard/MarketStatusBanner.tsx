/**
 * MarketStatusBanner Component
 *
 * Sticky top banner showing live market regime, SET index, and market status.
 * Provides real-time market overview at a glance.
 *
 * Features:
 * - Regime-based color coding (Risk-On = teal, Risk-Off = red, Neutral = gray)
 * - Animated entrance with framer-motion
 * - Market status indicator (open/closed with pulse animation)
 * - Data age display (e.g., "2 min ago")
 * - Sticky positioning with backdrop blur
 * - Compact layout (max 48px height)
 * - Responsive design
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
    return `${minutes}m ago`
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}h ago`
  }

  // Days
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  return `${days}d ago`
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
      <span className="text-[10px] font-medium text-text-2">
        {isOpen ? 'Market Open' : 'Market Closed'}
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

  const changeColor = setChange >= 0 ? 'up' : 'down'

  return (
    <motion.div
      role="banner"
      aria-label={`Market status: ${regime}, SET Index: ${formatSetIndex(setIndex)}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full backdrop-blur-md border-b max-h-12"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Regime Badge */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${colors.text}15` }}
            >
              <div style={{ color: colors.text }}>{getRegimeIcon(regime)}</div>
              <span
                className="text-xs font-bold"
                style={{ color: colors.text }}
              >
                {regime}
              </span>
              <Badge size="sm" color={getConfidenceColor(confidence)}>
                {confidence}
              </Badge>
            </div>
          </div>

          {/* Center: SET Index */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-text">
                {formatSetIndex(setIndex)}
              </span>
              <span className="text-xs" style={{ color: changeColor === 'up' ? '#4ade80' : '#ff6b6b' }}>
                {formatSetChange(setChange)} ({formatSetChangePercent(setChangePercent)})
              </span>
            </div>
          </div>

          {/* Right: Market Status & Data Age */}
          <div className="flex items-center gap-3">
            <MarketStatusIndicator isOpen={isMarketOpen} />
            {lastUpdate && (
              <span className="text-[10px] text-text-muted">
                {formatTimestamp(lastUpdate)}
              </span>
            )}
            <Activity className="w-3.5 h-3.5 text-text-muted" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MarketStatusBanner
