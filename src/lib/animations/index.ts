/**
 * Animation Utilities
 * Reusable Framer Motion variants and animation configurations
 * fonPick - Thai Stock Market Application
 *
 * This module provides:
 * - Pre-built animation variants for common UI patterns
 * - Stagger children configurations
 * - Page transition variants
 * - Accessibility-aware animations (respects prefers-reduced-motion)
 */

// ==================================================================
// MOTION CONFIG
// ==================================================================

export const motionConfig = {
  // Respect user's motion preferences
  reducedMotion: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
}

// Base transition config that respects reduced motion
export const createTransition = (
  duration: number = 0.3,
  ease: string = 'easeOut'
) => ({
  duration: motionConfig.reducedMotion ? 0.01 : duration,
  ease,
})

// ==================================================================
// FADE ANIMATIONS
// ==================================================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: createTransition(0.2),
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: createTransition(0.3),
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: createTransition(0.3),
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: createTransition(0.3),
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: createTransition(0.3),
}

// ==================================================================
// SCALE ANIMATIONS
// ==================================================================

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: createTransition(0.2),
}

export const scaleInUp = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -20 },
  transition: createTransition(0.3),
}

// ==================================================================
// SLIDE ANIMATIONS
// ==================================================================

export const slideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: createTransition(0.3),
}

export const slideDown = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
  transition: createTransition(0.3),
}

export const slideLeft = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: createTransition(0.3),
}

export const slideRight = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
  transition: createTransition(0.3),
}

// ==================================================================
// CONTAINER VARIANTS (Stagger Children)
// ==================================================================

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const containerVariantsFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export const itemVariantsScale = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
}

export const itemVariantsLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

// ==================================================================
// LIST/GRID ANIMATIONS
// ==================================================================

export const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: 'beforeChildren' as const,
    },
  },
}

export const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
  transition: createTransition(0.2),
}

// ==================================================================
// CARD ANIMATIONS
// ==================================================================

export const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: createTransition(0.25),
}

export const cardHoverVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: createTransition(0.2),
  },
  tap: {
    scale: 0.98,
    transition: createTransition(0.1),
  },
}

// ==================================================================
// MODAL/DIALOG ANIMATIONS
// ==================================================================

export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
  transition: createTransition(0.2),
}

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
  transition: createTransition(0.25),
}

// ==================================================================
// PAGE TRANSITION ANIMATIONS
// ==================================================================

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: createTransition(0.3),
}

export const pageTransitionFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: createTransition(0.2),
}

// ==================================================================
// LOADING/SPINNER ANIMATIONS
// ==================================================================

export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
}

export const pulseVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
}

export const shimmerVariants = {
  animate: {
    x: ['0%', '100%'],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
}

// ==================================================================
// PRICE CHANGE ANIMATIONS
// ==================================================================

export const priceUpVariants = {
  initial: { backgroundColor: 'transparent' },
  animate: {
    backgroundColor: ['transparent', 'rgba(46, 216, 167, 0.2)', 'transparent'],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
    },
  },
}

export const priceDownVariants = {
  initial: { backgroundColor: 'transparent' },
  animate: {
    backgroundColor: ['transparent', 'rgba(244, 91, 105, 0.2)', 'transparent'],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
    },
  },
}

// ==================================================================
// TAB ANIMATIONS
// ==================================================================

export const tabVariants = {
  inactive: {
    opacity: 0.6,
    scale: 1,
  },
  active: {
    opacity: 1,
    scale: 1.05,
    transition: createTransition(0.2),
  },
}

export const tabIndicatorVariants = {
  initial: { x: 0, width: 0 },
  animate: (width: number, x: number) => ({
    x,
    width,
    transition: createTransition(0.3),
  }),
}

// ==================================================================
// ACCORDION/COLLAPSE ANIMATIONS
// ==================================================================

export const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden' as const,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
}

export const chevronVariants = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
  transition: createTransition(0.3),
}

// ==================================================================
// TOOLTIP/POPOVER ANIMATIONS
// ==================================================================

export const tooltipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 5 },
  show: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 5 },
  transition: createTransition(0.15),
}

// ==================================================================
// PROGRESS BAR ANIMATIONS
// ==================================================================

export const progressVariants = {
  initial: { width: 0 },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
}

// ==================================================================
// STOMP/HEARTBEAT ANIMATION
// ==================================================================

export const stompVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
}

export const heartbeatVariants = {
  animate: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
}

// ==================================================================
// NOTIFICATION/TOAST ANIMATIONS
// ==================================================================

export const toastVariants = {
  hidden: { opacity: 0, x: '100%', y: 0 },
  show: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: '100%', y: 0, transition: { duration: 0.2 } },
}

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Get animation props that respect reduced motion preference
 */
export function getMotionProps<T extends Record<string, any>>(
  variants: T
): T & {
  initial?: keyof T
  animate?: keyof T
  exit?: keyof T
} {
  if (motionConfig.reducedMotion) {
    // Return instant transitions for reduced motion
    return {
      ...variants,
      transition: { duration: 0.01 },
    } as T & { transition: { duration: number } }
  }

  return variants
}

/**
 * Create stagger variants for a list with customizable delay
 */
export function createStaggerVariants(
  staggerDelay: number = 0.05,
  delayChildren: number = 0
) {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  }
}

/**
 * Create spring animation config
 */
export function createSpring(
  stiffness: number = 300,
  damping: number = 30
) {
  return {
    type: 'spring' as const,
    stiffness,
    damping,
  }
}

// ==================================================================
// EXPORT ALL AS A SINGLE OBJECT
// ==================================================================

export const animations = {
  // Fade
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,

  // Scale
  scaleIn,
  scaleInUp,

  // Slide
  slideUp,
  slideDown,
  slideLeft,
  slideRight,

  // Container
  containerVariants,
  containerVariantsFast,
  itemVariants,
  itemVariantsScale,
  itemVariantsLeft,

  // List
  listVariants,
  listItemVariants,

  // Card
  cardVariants,
  cardHoverVariants,

  // Modal
  modalOverlayVariants,
  modalContentVariants,

  // Page
  pageTransition,
  pageTransitionFade,

  // Loading
  spinnerVariants,
  pulseVariants,
  shimmerVariants,

  // Price
  priceUpVariants,
  priceDownVariants,

  // Tab
  tabVariants,
  tabIndicatorVariants,

  // Accordion
  accordionVariants,
  chevronVariants,

  // Tooltip
  tooltipVariants,

  // Progress
  progressVariants,

  // Effects
  stompVariants,
  heartbeatVariants,

  // Toast
  toastVariants,
} as const
