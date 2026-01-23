/**
 * Type exports
 */

export * from './rtdb'
export * from './market'
export * from './stock'
export * from './verdict'

/**
 * Common UI Props
 */
export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
}

export interface BadgeProps {
  children: React.ReactNode
  color?: 'up' | 'down' | 'neutral' | 'buy' | 'watch' | 'avoid'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}
