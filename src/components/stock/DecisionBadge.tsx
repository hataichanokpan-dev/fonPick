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
    <div
      data-testid="decision-badge"
      className={cn(
        'relative overflow-hidden rounded-xl shadow-lg animate-scale-in',
        'bg-gradient-to-r',
        config.gradient,
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      {/* Pulsing effect for high scores - using CSS animation for memory efficiency */}
      {isHighScore && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-white/20 to-transparent',
            'animate-pulse-glow'
          )}
        />
      )}

      {/* Main content */}
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          {/* Label */}
          <div
            data-testid="decision-badge-label"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in-up',
              'bg-white/20 backdrop-blur-sm',
              config.textColor
            )}
            style={{ animationDelay: '0.1s' }}
          >
            {config.icon}
            <span className="text-sm md:text-base font-bold tracking-wider">
              {formattedLabel}
            </span>
          </div>

          {/* Score */}
          <div
            data-testid="decision-badge-score"
            className={cn(
              'text-5xl md:text-6xl lg:text-7xl font-bold animate-scale-in',
              config.textColor
            )}
            style={{ animationDelay: '0.2s' }}
            aria-live="polite"
          >
            {displayScore}
          </div>

          {/* Type indicator */}
          <div
            data-testid="decision-badge-type"
            className={cn(
              'text-xs md:text-sm uppercase tracking-widest opacity-80 animate-fade-in',
              config.textColor
            )}
            style={{ animationDelay: '0.3s' }}
          >
            {badge.type}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div
        data-testid="decision-badge-tooltip"
        className={cn(
          'absolute bottom-2 right-2 px-2 py-1 rounded-md',
          'bg-black/30 backdrop-blur-sm',
          'text-xs text-white/80',
          'opacity-0 hover:opacity-100 transition-opacity'
        )}
      >
        Score: {clampedScore} • {badge.type}
      </div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default DecisionBadge
