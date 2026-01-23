/**
 * Design System Constants and Utilities
 * fonPick - Thai Stock Market Application
 *
 * This module provides type-safe access to design tokens,
 * color utilities, and helper functions for consistent styling.
 */

// ==================================================================
// COLOR CONSTANTS (Type-safe color values)
// ==================================================================

export const colors = {
  base: {
    background: '#0F172A' as const,
    surface: '#111827' as const,
    surfaceAlt: '#1F2937' as const,
    border: '#273449' as const,
  },

  text: {
    primary: '#E5E7EB' as const,
    secondary: '#9CA3AF' as const,
    muted: '#6B7280' as const,
    inverse: '#020617' as const,
  },

  signal: {
    upStrong: '#22C55E' as const,
    upSoft: '#86EFAC' as const,
    downSoft: '#FECACA' as const,
    downStrong: '#EF4444' as const,
    neutral: '#94A3B8' as const,
  },

  flow: {
    buy: '#16A34A' as const,
    sell: '#DC2626' as const,
    neutralBg: '#1F2937' as const,
    opacity: 0.7,
  },

  highlight: {
    insight: '#F59E0B' as const,
    warning: '#FB7185' as const,
    info: '#60A5FA' as const,
  },
} as const

// Color type for type-safe color usage - union of all color values
export type ColorValue =
  | typeof colors.base[keyof typeof colors.base]
  | typeof colors.text[keyof typeof colors.text]
  | typeof colors.signal[keyof typeof colors.signal]
  | typeof colors.flow[keyof typeof colors.flow]
  | typeof colors.highlight[keyof typeof colors.highlight]

// ==================================================================
// TYPOGRAPHY SCALE
// ==================================================================

export const typography = {
  fontSize: {
    xxs: '0.625rem', // 10px
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

// ==================================================================
// SPACING SCALE
// ==================================================================

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px

  // Stock-specific spacing
  stockCard: '16rem',
  chartHeight: '20rem',
  sidebar: '18rem',
} as const

// ==================================================================
// BORDER RADIUS
// ==================================================================

export const borderRadius = {
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',

  // Semantic radius
  card: '0.75rem',
  cardLg: '1rem',
  input: '0.5rem',
  button: '0.5rem',
} as const

// ==================================================================
// SHADOWS
// ==================================================================

export const shadows = {
  stockCard: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  stockCardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  glowUp: '0 0 12px rgba(34, 197, 94, 0.4)',
  glowDown: '0 0 12px rgba(239, 68, 68, 0.4)',
  glowInsight: '0 0 12px rgba(245, 158, 11, 0.4)',
} as const

// ==================================================================
// TRANSITIONS
// ==================================================================

export const transitions = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },

  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// ==================================================================
// Z-INDEX SCALE
// ==================================================================

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// ==================================================================
// BREAKPOINTS
// ==================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Determines if a price change is positive, negative, or neutral
 * and returns the appropriate color class
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-signal-up-strong'
  if (change < 0) return 'text-signal-down-strong'
  return 'text-signal-neutral'
}

/**
 * Returns the appropriate background color class for price changes
 */
export function getPriceChangeBgColor(change: number): string {
  if (change > 0) return 'bg-up-bg'
  if (change < 0) return 'bg-down-bg'
  return 'bg-flow-neutral-bg'
}

/**
 * Formats a price change percentage with color
 */
export function formatPriceChange(
  change: number,
  changePercent: number
): { value: string; colorClass: string; bgClass: string; icon: '↑' | '↓' | '−' } {
  const icon = change > 0 ? '↑' : change < 0 ? '↓' : '−'
  const value = `${icon} ${Math.abs(changePercent).toFixed(2)}%`
  const colorClass = getPriceChangeColor(changePercent)
  const bgClass = getPriceChangeBgColor(changePercent)

  return { value, colorClass, bgClass, icon }
}

/**
 * Gets the appropriate color for a verdict (BUY/SELL/WATCH)
 */
export function getVerdictColor(verdict: 'BUY' | 'SELL' | 'WATCH' | 'AVOID'): {
  bg: string
  text: string
  border: string
} {
  switch (verdict) {
    case 'BUY':
      return {
        bg: 'bg-buy-bg',
        text: 'text-flow-buy',
        border: 'border-flow-buy',
      }
    case 'SELL':
      return {
        bg: 'bg-sell-bg',
        text: 'text-flow-sell',
        border: 'border-flow-sell',
      }
    case 'WATCH':
      return {
        bg: 'bg-highlight-insight/20',
        text: 'text-highlight-insight',
        border: 'border-highlight-insight',
      }
    case 'AVOID':
      return {
        bg: 'bg-sell-bg',
        text: 'text-flow-sell',
        border: 'border-flow-sell',
      }
  }
}

/**
 * Gets market regime color (Risk On/Risk Off)
 */
export function getRegimeColor(regime: 'RISK_ON' | 'RISK_OFF'): {
  bg: string
  text: string
  border: string
} {
  switch (regime) {
    case 'RISK_ON':
      return {
        bg: 'bg-buy-bg',
        text: 'text-flow-buy',
        border: 'border-flow-buy',
      }
    case 'RISK_OFF':
      return {
        bg: 'bg-sell-bg',
        text: 'text-flow-sell',
        border: 'border-flow-sell',
      }
  }
}

/**
 * Returns a CSS variable value for a design token
 */
export function getToken(tokenPath: string): string {
  return `var(--${tokenPath})`
}

/**
 * Creates a style object with CSS variable references
 */
export function createTokenStyle(tokens: Record<string, string>): Record<string, string> {
  return Object.entries(tokens).reduce((acc, [key, value]) => {
    acc[key] = getToken(value)
    return acc
  }, {} as Record<string, string>)
}

/**
 * Determines if dark mode is active
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return true
  return document.documentElement.classList.contains('dark')
}

/**
 * Toggles dark mode
 */
export function toggleDarkMode(force?: boolean): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  const newValue = force ?? !root.classList.contains('dark')

  if (newValue) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// ==================================================================
// STOCK MARKET SPECIFIC UTILITIES
// ==================================================================

/**
 * Format Thai Baht currency
 */
export function formatThaiBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format Thai number with commas
 */
export function formatThaiNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format percentage for Thai market
 */
export function formatThaiPercentage(percent: number): string {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
}

/**
 * Get color class based on numeric value
 */
export function getValueColor(
  value: number,
  thresholds: { positive: number; negative: number } = { positive: 0, negative: 0 }
): string {
  if (value > thresholds.positive) return 'text-signal-up-strong'
  if (value < thresholds.negative) return 'text-signal-down-strong'
  return 'text-signal-neutral'
}

/**
 * Create gradient string for charts
 */
export function createChartGradient(
  color: keyof typeof colors.highlight | keyof typeof colors.signal,
  direction: 'up' | 'down' = 'up'
): string {
  // Check if color is in highlight, otherwise use signal colors
  const baseColor = color in colors.highlight
    ? colors.highlight[color as keyof typeof colors.highlight]
    : color in colors.signal
    ? colors.signal[color as keyof typeof colors.signal]
    : colors.signal.upStrong
  const opacityStart = direction === 'up' ? '0.3' : '0.1'
  const opacityEnd = '0'

  return `linear-gradient(180deg, ${baseColor}${opacityStart} 0%, ${baseColor}${opacityEnd} 100%)`
}

// ==================================================================
// COMPONENT PROP TYPE HELPERS
// ==================================================================

/**
 * Common variant options for components
 */
export type Variant = 'primary' | 'secondary' | 'ghost'

/**
 * Size options for components
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Color intent for UI elements
 */
export type ColorIntent =
  | 'buy'
  | 'sell'
  | 'neutral'
  | 'insight'
  | 'warning'
  | 'info'

/**
 * Get Tailwind classes for a variant
 */
export function getVariantClasses(variant: Variant): string {
  const variants = {
    primary: 'bg-flow-buy text-text-inverse hover:shadow-glow-up',
    secondary: 'bg-base-surface-alt text-text-primary border border-base-border hover:bg-base-border',
    ghost: 'bg-transparent text-text-secondary hover:bg-base-surface-alt hover:text-text-primary',
  }

  return variants[variant] || variants.primary
}

/**
 * Get size classes for spacing
 */
export function getSizeClasses(size: Size): string {
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  }

  return sizes[size] || sizes.md
}

// ==================================================================
// ANIMATION CONFIGURATION
// ==================================================================

export const animations = {
  fadeIn: 'fadeIn 0.2s ease-in-out',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  priceUp: 'priceUp 0.3s ease-out',
  priceDown: 'priceDown 0.3s ease-out',
  shimmer: 'shimmer 1.5s infinite',
  pulseSlow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const

// ==================================================================
// EXPORT ALL AS A SINGLE OBJECT
// ==================================================================

export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  animations,
} as const
