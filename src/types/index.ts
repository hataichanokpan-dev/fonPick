/**
 * Type exports
 */

export * from './rtdb'
export * from './market'
export * from './stock'
export * from './verdict'
export * from './market-breadth'
export * from './sector-rotation'
export * from './smart-money'
export * from './insights'
export * from './correlation'
export * from './market-intelligence'

/**
 * Common UI Props
 * Based on: docs/design_rules.md
 */

// Re-export enhanced Card types from Card.types.ts
export type {
  CardProps,
  CardVariant,
  CardPadding,
  CardBorder,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from '@/components/shared/Card.types'

export interface BadgeProps {
  children: React.ReactNode
  color?: 'up' | 'down' | 'neutral' | 'buy' | 'sell' | 'watch' | 'avoid' | 'insight' | 'warning' | 'up-strong' | 'down-strong'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'insight'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

/**
 * CompactCard Props
 */
export interface CompactCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated' | 'success' | 'warning' | 'danger'
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Badge element for header */
  headerBadge?: React.ReactNode
  /** Footer content */
  footer?: React.ReactNode
}

/**
 * AccessibleSignal Props
 * Color-blind friendly signal badge component
 */
export interface AccessibleSignalProps {
  /** Signal type */
  type: 'up' | 'down' | 'neutral'
  /** Optional label text */
  label?: string
  /** Optional value to display */
  value?: string | number
  /** Show icon indicator */
  showIcon?: boolean
  /** Show pattern overlay for accessibility */
  showPattern?: boolean
  /** Component size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Enable animation on mount/state change */
  animated?: boolean
}

/**
 * SwipeableCard Props
 * Swipe gesture enabled card component
 */
export interface SwipeableCardProps {
  /** Card content */
  children: React.ReactNode
  /** Callback when left swipe threshold is reached */
  onSwipeLeft?: () => void
  /** Callback when right swipe threshold is reached */
  onSwipeRight?: () => void
  /** Left swipe action configuration */
  leftAction?: {
    /** Custom icon component */
    icon?: React.ReactNode
    /** Action label text */
    label: string
    /** Background color class or custom color value */
    color?: string // default: 'bg-down-primary'
  }
  /** Right swipe action configuration */
  rightAction?: {
    /** Custom icon component */
    icon?: React.ReactNode
    /** Action label text */
    label: string
    /** Background color class or custom color value */
    color?: string // default: 'bg-up-primary'
  }
  /** Swipe distance threshold in pixels to trigger action */
  threshold?: number // default: 100
  /** Additional CSS classes */
  className?: string
  /** Disable swipe functionality */
  disabled?: boolean
  /** Enable haptic feedback on mobile devices */
  hapticFeedback?: boolean
}

/**
 * AnimatedPrice Props
 * Animated price display component with flash effect on value changes
 */
export interface AnimatedPriceProps {
  /** Current price value */
  value: number
  /** Previous value for calculating change */
  previousValue?: number
  /** Prefix to display before the value (e.g., '฿', '$', 'THB') */
  prefix?: string
  /** Suffix to display after the value (e.g., '%', 'M', 'B') */
  suffix?: string
  /** Whether to show the percentage change indicator */
  showChange?: boolean
  /** Whether to show the trend icon */
  showIcon?: boolean
  /** Size variant for the component */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes to apply */
  className?: string
  /** Number of decimal places to display (default: 2) */
  decimals?: number
  /** ARIA label for accessibility */
  ariaLabel?: string
}

/**
 * PullToRefresh Props
 * Pull gesture enabled refresh component for mobile
 */
export interface PullToRefreshProps {
  /** Async callback function triggered when pull threshold is reached */
  onRefresh: () => Promise<void>
  /** Content to be wrapped with pull-to-refresh functionality */
  children: React.ReactNode
  /** Pull distance threshold in pixels to trigger refresh (default: 80) */
  threshold?: number
  /** Additional CSS classes */
  className?: string
  /** Disable pull gesture when needed */
  disabled?: boolean
  /** ARIA label for accessibility */
  ariaLabel?: string
  /** Test ID for testing */
  testId?: string
}
