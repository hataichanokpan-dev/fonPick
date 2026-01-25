/**
 * PageHeader Component
 * fonPick - Thai Stock Market Application
 *
 * Consistent page header with title, subtitle, and action buttons.
 * Supports back button navigation for mobile/desktop.
 *
 * Based on: docs/design_rules.md
 * Phase 2: Enhanced Layout Component Structure
 */

'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ==================================================================
// TYPES
// ==================================================================

/**
 * Page header props
 */
export interface PageHeaderProps {
  /** Page title */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Action buttons/components on the right side */
  actions?: ReactNode
  /** Show back button */
  showBack?: boolean
  /** Back button click handler */
  onBack?: () => void
  /** Header size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Header alignment */
  align?: 'left' | 'center' | 'right'
  /** Additional CSS classes */
  className?: string
  /** Sticky positioning for scroll behavior */
  sticky?: boolean
  /** Background variant */
  background?: 'transparent' | 'surface' | 'primary'
}

/**
 * Size variants for header text
 */
type SizeVariant = 'sm' | 'md' | 'lg'

/**
 * Alignment classes
 */
type Alignment = 'left' | 'center' | 'right'

// ==================================================================
// PROP MAPPINGS
// ==================================================================

/**
 * Title size classes
 */
const titleSizeClasses: Record<SizeVariant, string> = {
  sm: 'text-lg font-semibold',
  md: 'text-xl font-bold',
  lg: 'text-2xl font-bold tracking-tight',
}

/**
 * Subtitle size classes
 */
const subtitleSizeClasses: Record<SizeVariant, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

/**
 * Alignment classes
 */
const alignmentClasses: Record<Alignment, string> = {
  left: 'justify-start',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
}

/**
 * Background variant classes
 */
const backgroundClasses = {
  transparent: '',
  surface: 'bg-bg-surface border-b border-border-subtle',
  primary: 'bg-bg-primary border-b border-border-subtle',
}

/**
 * Sticky positioning classes
 */
const stickyClasses = 'sticky top-0 z-[1020] backdrop-blur-md'

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

/**
 * BackButton - Back navigation button component
 */
interface BackButtonProps {
  onClick: () => void
  label?: string
}

function BackButton({ onClick, label = 'Go back' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 -ml-2 rounded-lg',
        'hover:bg-bg-surface-2',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue',
        // Icon styling
        'text-text-secondary hover:text-text-primary'
      )}
      aria-label={label}
      type="button"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

/**
 * PageHeader - Consistent page header with title and actions
 *
 * Provides a standardized header layout with:
 * - Optional back button for navigation
 * - Title and optional subtitle
 * - Action buttons/controls on the right
 * - Responsive sizing and alignment
 * - Sticky positioning option
 *
 * @example Basic usage
 * ```tsx
 * <PageHeader title="Dashboard" />
 * ```
 *
 * @example With subtitle and actions
 * ```tsx
 * <PageHeader
 *   title="Market Overview"
 *   subtitle="Real-time SET market data"
 *   actions={<Button>Refresh</Button>}
 * />
 * ```
 *
 * @example With back navigation
 * ```tsx
 * <PageHeader
 *   title="Stock Details"
 *   showBack
 *   onBack={() => router.back()}
 * />
 * ```
 *
 * @example Sticky header with background
 * ```tsx
 * <PageHeader
 *   title="Portfolio"
 *   sticky
 *   background="surface"
 *   actions={<MenuButton />}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  showBack = false,
  onBack,
  size = 'md',
  align = 'left',
  className,
  sticky = false,
  background = 'transparent',
}: PageHeaderProps) {
  // Build header container classes
  const headerClasses = cn(
    // Flex layout
    'flex items-center',
    // Gap between title and actions
    'gap-4',
    // Bottom margin
    'mb-6',
    // Alignment
    alignmentClasses[align],
    // Background
    backgroundClasses[background],
    // Sticky positioning
    sticky && cn(stickyClasses, 'py-4'),
    // Custom classes
    className
  )

  // Build content wrapper for centered/right alignment
  const contentWrapperClasses = cn(
    'flex items-center gap-4',
    align === 'center' && 'flex-col sm:flex-row',
    align === 'right' && 'flex-row-reverse'
  )

  return (
    <header className={headerClasses}>
      {align === 'left' ? (
        // Left aligned: back button, title, actions
        <>
          <div className={cn('flex items-center gap-4', 'flex-1')}>
            {showBack && onBack && <BackButton onClick={onBack} />}
            <div>
              <h1 className={cn(
                titleSizeClasses[size],
                'text-text-primary',
                // Tighter line height for larger headings
                size === 'lg' && 'leading-tight'
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  subtitleSizeClasses[size],
                  'text-text-secondary mt-0.5'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </>
      ) : (
        // Center or right aligned
        <div className={contentWrapperClasses}>
          {showBack && onBack && (
            <div className={align === 'right' ? 'ml-auto' : 'absolute left-0'}>
              <BackButton onClick={onBack} />
            </div>
          )}
          <div className={cn(
            'flex-1',
            align === 'center' && 'text-center',
            align === 'right' && 'text-right'
          )}>
            <h1 className={cn(
              titleSizeClasses[size],
              'text-text-primary'
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                subtitleSizeClasses[size],
                'text-text-secondary mt-0.5'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className={cn(
              'flex items-center gap-2',
              align === 'right' && 'ml-0',
              align === 'center' && 'sm:absolute sm:right-0'
            )}>
              {actions}
            </div>
          )}
        </div>
      )}
    </header>
  )
}

// ==================================================================
// CONVENIENT VARIANTS
// ==================================================================

/**
 * PageHeader.Compact - Smaller header variant
 */
PageHeader.Compact = function PageHeaderCompact(props: Omit<PageHeaderProps, 'size'>) {
  return <PageHeader size="sm" {...props} />
}

/**
 * PageHeader.Large - Larger header variant for hero sections
 */
PageHeader.Large = function PageHeaderLarge(props: Omit<PageHeaderProps, 'size'>) {
  return <PageHeader size="lg" {...props} />
}

/**
 * PageHeader.Centered - Centered alignment variant
 */
PageHeader.Centered = function PageHeaderCentered(props: Omit<PageHeaderProps, 'align'>) {
  return <PageHeader align="center" {...props} />
}
