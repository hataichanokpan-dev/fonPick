/**
 * DecisionBadge Component
 *
 * Displays a large badge with stock decision (BUY/WATCH/AVOID), score (0-100),
 * and type indicator (bullish/bearish/neutral).
 *
 * Features:
 * - Color-coded gradient backgrounds (green/yellow/red)
 * - Animated score counter
 * - Pulsing effect for high scores (>=80)
 * - Accessibility support (ARIA labels)
 * - Responsive sizing
 * - Tooltip on hover with details
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import type { DecisionBadge as DecisionBadgeType } from '@/types/stock-api'

export interface DecisionBadgeProps {
  /** Badge data from API */
  badge: DecisionBadgeType
  /** Additional CSS classes to apply */
  className?: string
}

/**
 * Get configuration for badge type
 */
function getBadgeConfig(type: DecisionBadgeType['type']) {
  switch (type) {
    case 'bullish':
      return {
        gradient: 'from-green-500 to-green-600',
        textColor: 'text-white',
        icon: <TrendingUp className="w-5 h-5" />,
        bgSoft: 'bg-green-500/20',
        textSoft: 'text-green-400',
      }
    case 'bearish':
      return {
        gradient: 'from-red-500 to-red-600',
        textColor: 'text-white',
        icon: <TrendingDown className="w-5 h-5" />,
        bgSoft: 'bg-red-500/20',
        textSoft: 'text-red-400',
      }
    case 'neutral':
    default:
      return {
        gradient: 'from-yellow-500 to-orange-500',
        textColor: 'text-white',
        icon: <Minus className="w-5 h-5" />,
        bgSoft: 'bg-yellow-500/20',
        textSoft: 'text-yellow-400',
      }
  }
}

/**
 * Clamp score between 0 and 100
 */
function clampScore(score: number): number {
  return Math.min(Math.max(score, 0), 100)
}

/**
 * Format label for display (ensure uppercase)
 */
function formatLabel(label: string): string {
  return label.toUpperCase() || 'N/A'
}

/**
 * DecisionBadge - Large animated badge with score
 *
 * @example
 * ```tsx
 * <DecisionBadge badge={{ label: 'BUY', score: 85, type: 'bullish' }} />
 * <DecisionBadge badge={{ label: 'WATCH', score: 50, type: 'neutral' }} />
 * <DecisionBadge badge={{ label: 'AVOID', score: 25, type: 'bearish' }} />
 * ```
 */
export function DecisionBadge({ badge, className }: DecisionBadgeProps) {
  const clampedScore = clampScore(badge.score)
  const [displayScore, setDisplayScore] = useState(0)
  const config = getBadgeConfig(badge.type)
  const formattedLabel = formatLabel(badge.label)

  // ==================================================================
  // ANIMATED SCORE COUNTER
  // ==================================================================

  useEffect(() => {
    const duration = 1000 // 1 second animation
    const steps = 60 // 60 frames for smooth animation
    const increment = clampedScore / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayScore(clampedScore)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(increment * currentStep))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [clampedScore])

  // ==================================================================
  // ARIA LABEL
  // ==================================================================

  const ariaLabel = `Decision: ${formattedLabel} with score ${clampedScore}`

  // ==================================================================
  // RENDER
  // ==================================================================

  const isHighScore = clampedScore >= 80

  return (
    <motion.div
      data-testid="decision-badge"
      className={cn(
        'relative overflow-hidden rounded-xl shadow-lg',
        'bg-gradient-to-r',
        config.gradient,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="status"
      aria-label={ariaLabel}
    >
      {/* Pulsing effect for high scores */}
      {isHighScore && (
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-white/20 to-transparent'
          )}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main content */}
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          {/* Label */}
          <motion.div
            data-testid="decision-badge-label"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full',
              'bg-white/20 backdrop-blur-sm',
              config.textColor
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {config.icon}
            <span className="text-sm md:text-base font-bold tracking-wider">
              {formattedLabel}
            </span>
          </motion.div>

          {/* Score */}
          <motion.div
            data-testid="decision-badge-score"
            className={cn(
              'text-5xl md:text-6xl lg:text-7xl font-bold',
              config.textColor
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
            aria-live="polite"
          >
            {displayScore}
          </motion.div>

          {/* Type indicator */}
          <motion.div
            data-testid="decision-badge-type"
            className={cn(
              'text-xs md:text-sm uppercase tracking-widest opacity-80',
              config.textColor
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {badge.type}
          </motion.div>
        </div>
      </div>

      {/* Tooltip */}
      <motion.div
        data-testid="decision-badge-tooltip"
        className={cn(
          'absolute bottom-2 right-2 px-2 py-1 rounded-md',
          'bg-black/30 backdrop-blur-sm',
          'text-xs text-white/80',
          'opacity-0 hover:opacity-100 transition-opacity'
        )}
      >
        Score: {clampedScore} • {badge.type}
      </motion.div>
    </motion.div>
  )
}

/**
 * Default export for convenience
 */
export default DecisionBadge
