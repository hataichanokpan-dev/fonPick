/**
 * Responsive Layout System
 * fonPick - Thai Stock Market Application
 *
 * Breakpoint utilities and layout constants matching concept images:
 * - Mobile: 375px-428px (single column)
 * - Tablet: 768px-1023px (transitional)
 * - Desktop: 1024px+ (two-column grid)
 *
 * Based on: docs/design_rules.md
 */

// ==================================================================
// BREAKPOINTS
// ==================================================================

/**
 * Breakpoint values matching the design system
 * Aligned with Tailwind default breakpoints and concept images
 */
export const breakpoints = {
  mobile: '375px',
  mobileMax: '428px',
  tablet: '768px',
  desktop: '1024px',
  desktopWide: '1280px',
} as const

/**
 * Breakpoint type for type-safe media queries
 */
export type BreakpointKey = keyof typeof breakpoints

// ==================================================================
// LAYOUT CONFIGURATIONS
// ==================================================================

/**
 * Layout configurations for different screen sizes
 * Matches the concept image layouts:
 * - simple_mobile.png: single column, 16px gaps
 * - simple_web.png: two columns, 24px gaps
 */
export const layouts = {
  mobile: {
    columns: 1,
    gap: '16px', // 1rem
    padding: '16px',
    maxWidth: '428px',
  },
  tablet: {
    columns: 1,
    gap: '20px', // 1.25rem
    padding: '20px',
    maxWidth: '768px',
  },
  desktop: {
    columns: 2,
    gap: '24px', // 1.5rem
    padding: '24px',
    maxWidth: '1280px',
  },
  desktopWide: {
    columns: 2,
    gap: '24px', // 1.5rem
    padding: '32px',
    maxWidth: '1536px',
  },
} as const

/**
 * Layout type for type-safe layout access
 */
export type LayoutKey = keyof typeof layouts

// ==================================================================
// TOUCH TARGETS
// ==================================================================

/**
 * Touch target sizes for mobile (WCAG 2.1 compliance)
 * Minimum 44x44px for all interactive elements
 */
export const touchTargets = {
  min: '44px',     // WCAG 2.1 minimum
  comfortable: '48px', // Comfortable touch size
} as const

// ==================================================================
// CONTAINER CONFIGURATIONS
// ==================================================================

/**
 * Container max-widths for responsive layouts
 */
export const containers = {
  mobile: '100%',
  tablet: '768px',
  desktop: '1024px',
  desktopWide: '1280px',
  desktopXL: '1536px',
} as const

// ==================================================================
// GRID SPACING
// ==================================================================

/**
 * Grid gap sizes for different breakpoints
 */
export const gridGaps = {
  mobile: '16px',   // 1rem
  tablet: '20px',   // 1.25rem
  desktop: '24px',  // 1.5rem
} as const

// ==================================================================
// SAFE AREA INSETS (Mobile)
// ==================================================================

/**
 * Safe area insets for mobile devices with notches
 * iOS Safari env() values for safe area
 */
export const safeArea = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)',
} as const

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Get layout configuration for a breakpoint
 */
export function getLayout(breakpoint: LayoutKey): typeof layouts[LayoutKey] {
  return layouts[breakpoint]
}

/**
 * Get media query string for a breakpoint
 * Returns min-width query for responsive design
 */
export function getMediaQuery(breakpoint: BreakpointKey): string {
  const value = breakpoints[breakpoint]
  return `@media (min-width: ${value})`
}

/**
 * Check if current viewport matches breakpoint
 * @param breakpoint - Breakpoint to check against
 * @returns true if viewport is at or above the breakpoint
 */
export function isBreakpoint(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return false

  const value = parseInt(breakpoints[breakpoint], 10)
  return window.innerWidth >= value
}

/**
 * Get current breakpoint based on viewport width
 * @returns Current breakpoint key
 */
export function getCurrentBreakpoint(): BreakpointKey {
  if (typeof window === 'undefined') return 'mobile'

  const width = window.innerWidth

  if (width >= 1280) return 'desktopWide'
  if (width >= 1024) return 'desktop'
  if (width >= 768) return 'tablet'
  return 'mobile'
}

/**
 * Get responsive value based on current breakpoint
 * @param values - Object with breakpoint keys
 * @param defaultBreakpoint - Default breakpoint to use
 * @returns Value for current breakpoint or default
 */
export function getResponsiveValue<T>(
  values: Partial<Record<BreakpointKey, T>>,
  defaultBreakpoint: BreakpointKey = 'mobile'
): T | undefined {
  const current = getCurrentBreakpoint()

  // Return exact match if available
  if (values[current] !== undefined) {
    return values[current]
  }

  // Fall back to smaller breakpoints
  const breakpointOrder: BreakpointKey[] = ['desktopWide', 'desktop', 'tablet', 'mobile']
  const currentIndex = breakpointOrder.indexOf(current)

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }

  return values[defaultBreakpoint]
}

// ==================================================================
// CSS VARIABLES
// ==================================================================

/**
 * CSS custom properties for responsive values
 * Can be used in styled components or CSS-in-JS
 */
export const cssVars = {
  '--breakpoint-mobile': breakpoints.mobile,
  '--breakpoint-tablet': breakpoints.tablet,
  '--breakpoint-desktop': breakpoints.desktop,
  '--breakpoint-desktop-wide': breakpoints.desktopWide,
  '--touch-target-min': touchTargets.min,
  '--touch-target-comfortable': touchTargets.comfortable,
  '--grid-gap-mobile': gridGaps.mobile,
  '--grid-gap-tablet': gridGaps.tablet,
  '--grid-gap-desktop': gridGaps.desktop,
} as const

// ==================================================================
// TAILWIND CLASS HELPERS
// ==================================================================

/**
 * Tailwind responsive class prefixes
 */
export const responsiveClasses = {
  // Mobile-first (no prefix)
  mobile: '',
  // Tablet (md breakpoint)
  tablet: 'md:',
  // Desktop (lg breakpoint)
  desktop: 'lg:',
  // Desktop wide (xl breakpoint)
  desktopWide: 'xl:',
} as const

/**
 * Get responsive class names for a property
 * @param property - CSS property (e.g., 'grid-cols')
 * @param values - Object with breakpoint keys
 * @returns Space-separated Tailwind classes
 */
export function getResponsiveClasses(
  property: string,
  values: Partial<Record<BreakpointKey, string>>
): string {
  const classes: string[] = []

  // Order matters in Tailwind - base value first
  if (values.mobile) classes.push(`${property}-${values.mobile}`)
  if (values.tablet) classes.push(`md:${property}-${values.tablet}`)
  if (values.desktop) classes.push(`lg:${property}-${values.desktop}`)
  if (values.desktopWide) classes.push(`xl:${property}-${values.desktopWide}`)

  return classes.join(' ')
}
