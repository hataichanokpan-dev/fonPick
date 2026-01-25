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
