/**
 * CollapsibleCard Component
 * fonPick - Thai Stock Market Application
 *
 * Wrapper for mobile progressive disclosure with responsive behavior.
 * Features:
 * - Header always visible with title and optional subtitle
 * - Chevron icon on mobile only (hidden on desktop: md+)
 * - Smooth expand/collapse animation using framer-motion
 * - Desktop: always expanded (no chevron visible)
 * - Mobile: respects defaultExpanded prop
 * - Optional padding control (none, sm, md)
 * - Keyboard accessible (Enter/Space)
 *
 * @example Mobile - Collapsible
 * <CollapsibleCard title="Filters" defaultExpanded={false}>
 *   <FilterControls />
 * </CollapsibleCard>
 *
 * @example Desktop - Always Expanded
 * <CollapsibleCard title="Market Overview">
 *   <MarketStats />
 * </CollapsibleCard>
 *
 * Based on: docs/design_rules.md
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

export type CollapsibleCardPadding = 'none' | 'sm' | 'md'

export interface CollapsibleCardProps {
  /** Card title (always visible) */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Initial expanded state (mobile only). Defaults to true */
  defaultExpanded?: boolean
  /** Card content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Content padding: 'none' | 'sm' | 'md' (default: 'md') */
  padding?: CollapsibleCardPadding
}

// ==================================================================
// CONSTANTS
// ==================================================================

const PADDING_CLASSES: Record<CollapsibleCardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 md:p-6', // 16px mobile, 24px desktop
}

const ANIMATION_EASE = [0.04, 0.62, 0.23, 0.98] as const

// ==================================================================
// COMPONENT
// ==================================================================

/**
 * CollapsibleCard - Responsive card with mobile progressive disclosure
 *
 * Mobile (< md): Collapsible with chevron toggle
 * Desktop (>= md): Always expanded, no chevron
 */
export function CollapsibleCard({
  title,
  subtitle,
  defaultExpanded = true,
  children,
  className,
  padding = 'md',
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Memoize padding classes
  const paddingClasses = useMemo(
    () => PADDING_CLASSES[padding],
    [padding]
  )

  // Handlers
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleToggle()
      }
    },
    [handleToggle]
  )

  return (
    <div
      className={cn(
        'bg-surface',
        'border border-border-subtle',
        'rounded-lg',
        className
      )}
    >
      {/* Header */}
      <div
        data-testid="collapsible-header"
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3 md:p-4',
          'cursor-pointer',
          'transition-all duration-200',
          'hover:bg-surface-2',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-accent-blue/30',
          'rounded-t-lg'
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="collapsible-content"
      >
        {/* Title and Subtitle */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p
              data-testid="collapsible-card-subtitle"
              className="text-sm text-text-secondary mt-1"
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Chevron - Mobile only */}
        <motion.div
          className={cn('flex md:hidden flex-shrink-0 ml-3')}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            data-testid="chevron-icon"
            className="w-5 h-5 text-text-secondary"
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* Content - Mobile (collapsible) */}
      <motion.div
        id="collapsible-content"
        data-testid="collapsible-content"
        className={cn('overflow-hidden md:hidden', paddingClasses)}
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: ANIMATION_EASE,
        }}
      >
        {children}
      </motion.div>

      {/* Content - Desktop (always visible) */}
      <div
        data-testid="collapsible-content-desktop"
        className={cn('hidden md:block', paddingClasses)}
      >
        {children}
      </div>
    </div>
  )
}
