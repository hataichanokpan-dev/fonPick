/**
 * Feature Flags Configuration
 *
 * Controls the visibility of features/modules that are under development
 * or waiting for backend data to be ready.
 *
 * To enable a disabled feature, change the flag to `true` or set the
 * corresponding environment variable.
 */

// ==================================================================
// TYPES
// ==================================================================

export interface FeatureFlags {
  /** Volume Analysis Module - disabled due to incorrect RTDB data (shows ฿8) */
  enableVolumeAnalysisModule: boolean

  /** Volatility Module (Market Volatility) - disabled due to missing breadth data (shows zeros) */
  enableVolatilityModule: boolean
}

// ==================================================================
// DEFAULT FLAGS (can be overridden by env vars)
// ==================================================================

const defaultFlags: FeatureFlags = {
  // Volume Analysis Module - HIDDEN until RTDB data is fixed
  enableVolumeAnalysisModule: false,

  // Volatility Module - HIDDEN until breadth data is available
  enableVolatilityModule: false,
}

// ==================================================================
// ENV VAR OVERRIDES
// ==================================================================

function getFlagFromEnv(key: string, defaultValue: boolean): boolean {
  const envValue = process.env[key]
  if (envValue === undefined) {
    return defaultValue
  }

  // Parse boolean from string
  return envValue === '1' || envValue.toLowerCase() === 'true'
}

// ==================================================================
// PUBLIC FLAGS EXPORT
// ==================================================================

export const featureFlags: FeatureFlags = {
  enableVolumeAnalysisModule: getFlagFromEnv(
    'NEXT_PUBLIC_ENABLE_VOLUME_ANALYSIS_MODULE',
    defaultFlags.enableVolumeAnalysisModule
  ),
  enableVolatilityModule: getFlagFromEnv(
    'NEXT_PUBLIC_ENABLE_VOLATILITY_MODULE',
    defaultFlags.enableVolatilityModule
  ),
}

// ==================================================================
// HELPER FUNCTIONS
// ==================================================================

/**
 * Check if a feature is enabled
 * @param flag - The feature flag to check
 * @returns true if the feature is enabled
 */
export function isFeatureEnabled<K extends keyof FeatureFlags>(flag: K): boolean {
  return featureFlags[flag]
}

/**
 * Get all feature flags (useful for debugging)
 * @returns All feature flags with their current values
 */
export function getAllFeatureFlags(): FeatureFlags {
  return { ...featureFlags }
}

// ==================================================================
// REACT HOOK (for client components)
// ==================================================================

/**
 * Note: Since we're using static flags at build time, we don't need a React hook.
 * However, if you want to make flags dynamic (changeable at runtime), you could:
 *
 * 1. Use a React Context provider
 * 2. Store flags in localStorage
 * 3. Fetch flags from a remote config service
 *
 * Example implementation for future reference:
 *
 * ```tsx
 * 'use client'
 *
 * import { createContext, useContext } from 'react'
 * import { featureFlags as staticFlags } from './feature-flags'
 *
 * const FeatureFlagsContext = createContext<FeatureFlags>(staticFlags)
 *
 * export function useFeatureFlags<K extends keyof FeatureFlags>(
 *   flag?: K
 * ): FeatureFlags | boolean {
 *   const context = useContext(FeatureFlagsContext)
 *   return flag ? context[flag] : context
 * }
 * ```
 */
