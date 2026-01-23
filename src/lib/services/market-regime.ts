/**
 * Market Regime Service
 * Detects market regime (Risk-On/Neutral/Risk-Off) from market data
 *
 * NOTE: This is a placeholder implementation.
 * The actual implementation will be created by the backend agent.
 */

import type { RegimeInput, RegimeResult } from '@/types'

/**
 * Detect market regime from input data
 */
export function detectRegime(_input: RegimeInput): RegimeResult {
  // TODO: Implement actual regime detection logic
  console.warn('detectRegime: Not yet implemented, returning mock data')

  return {
    regime: 'Neutral',
    confidence: 'Medium',
    reasons: [
      'Market analysis not yet available',
      'Awaiting data pipeline implementation',
    ],
    focus: 'Implementation pending',
    caution: 'Mock data only',
  }
}

/**
 * Calculate regime score from input
 */
export function calculateRegimeScore(_input: RegimeInput): {
  riskOnScore: number
  riskOffScore: number
} {
  // TODO: Implement actual scoring logic
  return {
    riskOnScore: 0,
    riskOffScore: 0,
  }
}
