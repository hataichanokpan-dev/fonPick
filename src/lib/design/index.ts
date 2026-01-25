/**
 * Design System Constants and Utilities
 * fonPick - Thai Stock Market Application
 *
 * This module provides type-safe access to design tokens,
 * color utilities, and helper functions for consistent styling.
 *
 * Color Theme: Professional dark with green up / soft red down
 * Based on: docs/design_rules.md
 */

// ==================================================================
// COLOR CONSTANTS (from design_rules.md)
// ==================================================================

export const colors = {
  // Background Hierarchy
  background: {
    primary: '#0a0e17' as const,  // Deep near-black - main background
    surface: '#111827' as const,   // Card background
    surface2: '#1f2937' as const,  // Elevated surface, hover states
    surface3: '#374151' as const,  // Active states
  },

  // Border System
  border: {
    subtle: '#1f2937' as const,   // Subtle borders
    default: '#374151' as const,  // Component borders
    strong: '#4b5563' as const,   // Focus states
  },

  // Typography Colors
  text: {
    primary: '#ffffff' as const,   // Main content, hero numbers
    secondary: '#a0a0a0' as const, // Supporting text
    tertiary: '#6b7280' as const,  // Labels, metadata
    disabled: '#4b5563' as const,  // Disabled states
  },

  // Signal Colors - Market Data
  up: {
    primary: '#4ade80' as const,               // Green - gains, positive
    soft: 'rgba(74, 222, 128, 0.15)' as const, // Background tint
    mobile: '#4CAF50' as const,                // Mobile green 500
  },

  down: {
    primary: '#ff6b6b' as const,                 // Red - losses, negative
    soft: 'rgba(255, 107, 107, 0.15)' as const, // Background tint
    mobile: '#F44336' as const,                 // Mobile red 500
  },

  neutral: '#9ca3af' as const, // Flat, no change

  // Accent Colors
  accent: {
    blue: '#3b82f6' as const,       // Charts, links, primary actions
    blueDark: '#1e40af' as const,   // Chart fill
    insight: '#f59e0b' as const,    // Gold - AI insights
    warning: '#f97316' as const,    // Orange - warnings
  },

  // Legacy aliases (for backward compatibility)
  base: {
    background: '#0a0e17' as const,
    surface: '#111827' as const,
    surfaceAlt: '#1f2937' as const,
    border: '#1f2937' as const,
  },

  signal: {
    upStrong: '#4ade80' as const,
    upSoft: 'rgba(74, 222, 128, 0.15)' as const,
    downSoft: 'rgba(255, 107, 107, 0.15)' as const,
    downStrong: '#ff6b6b' as const,
    neutral: '#9ca3af' as const,
  },

  flow: {
    buy: '#4ade80' as const,
    sell: '#ff6b6b' as const,
    neutralBg: '#1f2937' as const,
  },

  highlight: {
    insight: '#f59e0b' as const,
    warning: '#f97316' as const,
    info: '#3b82f6' as const,
  },

  chart: {
    bg: '#111827' as const,
    grid: '#1f2937' as const,
    axis: '#6b7280' as const,
    line: '#ffffff' as const,
    volume: '#4b5563' as const,
    crosshair: '#1f2937' as const,
    tooltipBg: '#1f2937' as const,
    tooltipBorder: '#374151' as const,
  },
} as const

// Color type for type-safe color usage - union of all color values
export type ColorValue =
  | typeof colors.background[keyof typeof colors.background]
  | typeof colors.border[keyof typeof colors.border]
  | typeof colors.text[keyof typeof colors.text]
  | typeof colors.up[keyof typeof colors.up]
  | typeof colors.down[keyof typeof colors.down]
  | typeof colors.accent[keyof typeof colors.accent]
  | typeof colors.signal[keyof typeof colors.signal]

// ==================================================================
// TYPOGRAPHY SCALE (from design_rules.md)
// ==================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
  },

  // Number display sizes
  number: {
    hero: {
      fontSize: '2rem',      // 32px
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    primary: {
      fontSize: '1.5rem',    // 24px
      fontWeight: 600,
      lineHeight: 1.2,
    },
    secondary: {
      fontSize: '1rem',      // 16px
      fontWeight: 600,
      lineHeight: 1.25,
    },
    tertiary: {
      fontSize: '0.875rem',  // 14px
      fontWeight: 500,
      lineHeight: 1.25,
    },
  },

  // Standard typography scale
  fontSize: {
    hero: '2rem',         // 32px - Hero Numbers
    h1: '1.5rem',         // 24px - Section Titles
    h2: '1.125rem',       // 18px - Card Titles
    body: '1rem',         // 16px - Data Values, Body Text
    label: '0.75rem',     // 12px - Labels
    caption: '0.6875rem', // 11px - Captions
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.1,
    normal: 1.25,
    relaxed: 1.3,
    loose: 1.6,
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '-0.01em',
    relaxed: 'normal',
    wide: '0.05em',
  },
} as const

// ==================================================================
// SPACING SCALE (from design_rules.md - 4px base)
// ==================================================================

export const spacing = {
  // Base spacing scale
  '1': '0.25rem',  // 4px - Micro spacing
  '2': '0.5rem',   // 8px - Small gaps
  '3': '0.75rem',  // 12px - Standard gap
  '4': '1rem',     // 16px - Medium spacing
  '5': '1.25rem',  // 20px - Large internal spacing
  '6': '1.5rem',   // 24px - Section spacing
  '8': '2rem',     // 32px - Component spacing
  '10': '2.5rem',  // 40px - Large sections
  '12': '3rem',    // 48px - Page margins

  // Component spacing
  cardPadding: '1rem',          // 16px
  cardGapDesktop: '1.5rem',     // 24px
  cardGapMobile: '1rem',        // 16px
  rowHeightDesktop: '3rem',     // 48px
  rowHeightMobile: '3.5rem',    // 56px
  buttonHeightDesktop: '2.5rem', // 40px
  buttonHeightMobile: '2.75rem', // 44px
  sectionMarginDesktop: '1.5rem', // 24px
  sectionMarginMobile: '1rem',    // 16px
  gridGutterDesktop: '1.5rem',   // 24px
  gridGutterMobile: '1rem',      // 16px

  // Legacy spacing
  stockCard: '16rem',
  chartHeight: '20rem',
  sidebar: '18rem',
} as const

// ==================================================================
// BORDER RADIUS (from design_rules.md)
// ==================================================================

export const borderRadius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  xl2: '0.875rem', // 14px
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
  hairline: '0 0 0 1px #1f2937',
  soft: '0 8px 24px rgba(0,0,0,0.35)',
  stockCard: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  stockCardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  glowUp: '0 0 12px rgba(74, 222, 128, 0.4)',
  glowDown: '0 0 12px rgba(255, 107, 107, 0.4)',
  glowInsight: '0 0 12px rgba(245, 158, 11, 0.4)',
} as const

// ==================================================================
// TRANSITIONS (from design_rules.md)
// ==================================================================

export const transitions = {
  duration: {
    fast: 150,   // Standard transition
    normal: 200, // Transform transition
    slow: 300,
  },

  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard transition
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
// BREAKPOINTS (from design_rules.md)
// ==================================================================

export const breakpoints = {
  xs: '375px',   // Small phones
  sm: '640px',   // Landscape phones, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
} as const

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Determines if a price change is positive, negative, or neutral
 * and returns the appropriate color class
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-up-primary'
  if (change < 0) return 'text-down-primary'
  return 'text-neutral'
}

/**
 * Returns the appropriate background color class for price changes
 */
export function getPriceChangeBgColor(change: number): string {
  if (change > 0) return 'bg-up-soft'
  if (change < 0) return 'bg-down-soft'
  return 'bg-surface'
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
        bg: 'bg-up-soft',
        text: 'text-up-primary',
        border: 'border-up-primary/30',
      }
    case 'SELL':
      return {
        bg: 'bg-down-soft',
        text: 'text-down-primary',
        border: 'border-down-primary/30',
      }
    case 'WATCH':
      return {
        bg: 'bg-warning/20',
        text: 'text-warning',
        border: 'border-warning/30',
      }
    case 'AVOID':
      return {
        bg: 'bg-risk/20',
        text: 'text-risk',
        border: 'border-risk/30',
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
        bg: 'bg-up-soft',
        text: 'text-up-primary',
        border: 'border-up-primary/30',
      }
    case 'RISK_OFF':
      return {
        bg: 'bg-down-soft',
        text: 'text-down-primary',
        border: 'border-down-primary/30',
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
  if (value > thresholds.positive) return 'text-up-primary'
  if (value < thresholds.negative) return 'text-down-primary'
  return 'text-neutral'
}

/**
 * Create gradient string for charts
 */
export function createChartGradient(
  color: keyof typeof colors.accent | 'up' | 'down',
  direction: 'up' | 'down' = 'up'
): string {
  const colorMap: Record<string, string> = {
    insight: colors.accent.insight,
    warning: colors.accent.warning,
    info: colors.accent.blue,
    up: colors.up.primary,
    down: colors.down.primary,
  }

  const baseColor = colorMap[color] || colors.up.primary
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
    primary: 'bg-up-primary text-bg-primary hover:shadow-glow-up',
    secondary: 'bg-surface-2 text-text-primary border border-border-subtle hover:bg-surface-3',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
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
// RESPONSIVE SYSTEM (PHASE 1)
// ==================================================================

// Re-export responsive utilities
export * from './responsive'
export * from './grid-system'

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
