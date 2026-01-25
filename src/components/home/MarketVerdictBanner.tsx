/**
 * MarketVerdictBanner Component
 *
 * Displays the market verdict prominently at the top of the homepage
 * Based on: docs/design_rules.md
 *
 * Theme: Green-tinted dark with teal up / soft red down
 */

'use client'

import { memo } from 'react'
import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ==================================================================
// TYPES
// ==================================================================

export type MarketVerdict = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
export type MarketAction = 'Buy' | 'Sell' | 'Hold' | 'Wait'

export interface MarketVerdictBannerProps {
  /** The market verdict */
  verdict: MarketVerdict
  /** Confidence level 0-100 */
  confidence: number
  /** One sentence rationale */
  rationale: string
  /** Recommended action */
  action: MarketAction
  /** Top 2-3 focus sectors */
  focusSectors: string[]
  /** Primary market driver */
  primaryDriver: string
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// COLOR THEME CONFIGURATION
// ==================================================================

interface VerdictTheme {
  bg: string
  border: string
  verdictText: string
  icon: React.ElementType
  iconColor: string
  badgeBg: string
  badgeText: string
}

function getVerdictTheme(verdict: MarketVerdict): VerdictTheme {
  if (verdict === 'Strong Buy' || verdict === 'Buy') {
    return {
      bg: 'bg-up-soft',
      border: 'border-up-primary/20',
      verdictText: 'text-up-primary',
      icon: TrendingUp,
      iconColor: 'text-up-primary',
      badgeBg: 'bg-up-primary/20',
      badgeText: 'text-up-primary',
    }
  }

  if (verdict === 'Strong Sell' || verdict === 'Sell') {
    return {
      bg: 'bg-down-soft',
      border: 'border-down-primary/20',
      verdictText: 'text-down-primary',
      icon: TrendingDown,
      iconColor: 'text-down-primary',
      badgeBg: 'bg-down-primary/20',
      badgeText: 'text-down-primary',
    }
  }

  // Hold - neutral theme
  return {
    bg: 'bg-surface-2',
    border: 'border-border-default',
    verdictText: 'text-neutral',
    icon: Minus,
    iconColor: 'text-neutral',
    badgeBg: 'bg-surface-3',
    badgeText: 'text-secondary',
  }
}

function getActionTheme(action: MarketAction): { bg: string; text: string } {
  if (action === 'Buy') {
    return {
      bg: 'bg-up-primary/20',
      text: 'text-up-primary',
    }
  }
  if (action === 'Sell') {
    return {
      bg: 'bg-down-primary/20',
      text: 'text-down-primary',
    }
  }
  // Hold or Wait
  return {
    bg: 'bg-surface-3',
    text: 'text-secondary',
  }
}

// ==================================================================
// SUBCOMPONENTS
// ==================================================================

interface VerdictHeaderProps {
  verdict: MarketVerdict
  confidence: number
  theme: VerdictTheme
}

function VerdictHeader({ verdict, confidence, theme }: VerdictHeaderProps) {
  const Icon = theme.icon

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={cn('w-5 h-5', theme.iconColor)} />
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Market Verdict
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-lg font-bold tabular-nums', theme.verdictText)}>
          {verdict.toUpperCase()}
        </span>
        <span className={cn(
          'px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums',
          theme.badgeBg,
          theme.badgeText
        )}>
          {confidence}%
        </span>
      </div>
    </div>
  )
}

interface InfoCardsProps {
  action: MarketAction
  focusSectors: string[]
  primaryDriver: string
}

function InfoCards({ action, focusSectors, primaryDriver }: InfoCardsProps) {
  const actionTheme = getActionTheme(action)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
      {/* Action Card */}
      <div className="bg-surface border border-border-subtle rounded-lg p-3">
        <span className="text-[10px] uppercase tracking-wide text-text-tertiary block mb-1">
          Action
        </span>
        <div className={cn(
          'inline-flex px-3 py-1 rounded-md font-semibold text-sm',
          actionTheme.bg,
          actionTheme.text
        )}>
          {action.toUpperCase()}
        </div>
      </div>

      {/* Focus Sectors Card */}
      <div className="bg-surface border border-border-subtle rounded-lg p-3">
        <span className="text-[10px] uppercase tracking-wide text-text-tertiary block mb-1">
          Focus Sectors
        </span>
        <ul className="space-y-0.5">
          {focusSectors.slice(0, 3).map((sector, index) => (
            <li key={index} className="text-sm text-text-secondary flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-text-tertiary" />
              {sector}
            </li>
          ))}
        </ul>
      </div>

      {/* Primary Driver Card */}
      <div className="bg-surface border border-border-subtle rounded-lg p-3">
        <span className="text-[10px] uppercase tracking-wide text-text-tertiary block mb-1">
          Primary Driver
        </span>
        <p className="text-sm text-text-secondary font-medium">
          {primaryDriver}
        </p>
      </div>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

function MarketVerdictBanner({
  verdict,
  confidence,
  rationale,
  action,
  focusSectors,
  primaryDriver,
  className,
}: MarketVerdictBannerProps) {
  const theme = getVerdictTheme(verdict)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-4',
        theme.bg,
        theme.border,
        className
      )}
      role="region"
      aria-label="Market Verdict Banner"
    >
      {/* Header with verdict and confidence */}
      <VerdictHeader verdict={verdict} confidence={confidence} theme={theme} />

      {/* Rationale */}
      <div className="flex items-start gap-2 mt-4">
        <Lightbulb className={cn('w-4 h-4 mt-0.5 flex-shrink-0', theme.iconColor)} />
        <p className="text-sm text-text-secondary leading-relaxed">
          {rationale}
        </p>
      </div>

      {/* Info cards */}
      <InfoCards
        action={action}
        focusSectors={focusSectors}
        primaryDriver={primaryDriver}
      />
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
const MemoizedMarketVerdictBanner = memo(MarketVerdictBanner, (prevProps, nextProps) => {
  return (
    prevProps.verdict === nextProps.verdict &&
    prevProps.confidence === nextProps.confidence &&
    prevProps.rationale === nextProps.rationale &&
    prevProps.action === nextProps.action &&
    prevProps.focusSectors.join(',') === nextProps.focusSectors.join(',') &&
    prevProps.primaryDriver === nextProps.primaryDriver
  )
})

// Named export for convenience
export { MemoizedMarketVerdictBanner as MarketVerdictBanner }

// Default export
export default MemoizedMarketVerdictBanner
