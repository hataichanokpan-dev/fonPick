/**
 * Sector Rotation Confirmation Service
 *
 * Confirms sector rotation signals for swing trading entries
 * Works with sector-rotation analysis to validate sector leadership
 */

import type { SectorRotationAnalysis, RotationSignal } from '@/types/sector-rotation'

// ============================================================================
// SECTOR ROTATION CONFIRMATION
// ============================================================================

/**
 * Confirm sector rotation signal for specific sector
 *
 * @param params - Confirmation parameters
 * @returns Confirmation result with confidence
 */
export function confirmSectorRotation(params: {
  symbol: string
  sectorId: string
  sectorAnalysis: SectorRotationAnalysis | null
}): {
  isConfirmed: boolean
  confidence: number
  rationale: string
} {
  const { sectorId, sectorAnalysis } = params

  // No analysis available
  if (!sectorAnalysis) {
    return {
      isConfirmed: false,
      confidence: 0,
      rationale: 'No sector rotation analysis available',
    }
  }

  // Find sector performance in entry signals
  const sectorEntrySignal = sectorAnalysis.entrySignals.find((s) => s.sector.id === sectorId)

  // Check if sector is in exit signals (negative confirmation)
  const sectorExitSignal = sectorAnalysis.exitSignals.find((s) => s.sector.id === sectorId)

  // Sector in exit list = Avoid entry
  if (sectorExitSignal) {
    return {
      isConfirmed: false,
      confidence: sectorExitSignal.confidence,
      rationale: `Sector in exit zone - ${sectorExitSignal.signal} signal with ${sectorExitSignal.confidence}% confidence`,
    }
  }

  // Sector in entry list = Confirm entry
  if (sectorEntrySignal) {
    return {
      isConfirmed: true,
      confidence: sectorEntrySignal.confidence,
      rationale: `Sector in leadership - ${sectorEntrySignal.signal} signal with ${sectorEntrySignal.confidence}% confidence`,
    }
  }

  // Check if sector is in leadership group
  const isLeader = isSectorInLeadership(sectorId, sectorAnalysis)

  if (isLeader) {
    return {
      isConfirmed: true,
      confidence: 60,
      rationale: 'Sector part of market-leading group',
    }
  }

  // Check if sector is in laggards group
  const isLaggard = isSectorInLaggards(sectorId, sectorAnalysis)

  if (isLaggard) {
    return {
      isConfirmed: false,
      confidence: 50,
      rationale: 'Sector underperforming market',
    }
  }

  // No clear signal
  return {
    isConfirmed: false,
    confidence: 0,
    rationale: 'No clear sector rotation signal detected',
  }
}

/**
 * Check if stock's sector is in leadership
 *
 * @param sectorId - Sector identifier
 * @param sectorAnalysis - Sector rotation analysis
 * @returns Whether sector is in leadership
 */
export function isSectorInLeadership(
  sectorId: string,
  sectorAnalysis: SectorRotationAnalysis
): boolean {
  const { leadership } = sectorAnalysis

  // Check if sector is in leaders
  const isInLeaders = leadership.leaders.some((leader) => leader.sector.id === sectorId)

  return isInLeaders
}

/**
 * Check if stock's sector is in laggards
 *
 * @param sectorId - Sector identifier
 * @param sectorAnalysis - Sector rotation analysis
 * @returns Whether sector is in laggards
 */
export function isSectorInLaggards(
  sectorId: string,
  sectorAnalysis: SectorRotationAnalysis
): boolean {
  const { leadership } = sectorAnalysis

  // Check if sector is in laggards
  const isInLaggards = leadership.laggards.some((laggard) => laggard.sector.id === sectorId)

  return isInLaggards
}

/**
 * Get sector rotation weight for confirmation
 *
 * @param sectorAnalysis - Sector rotation analysis
 * @returns Weight based on rotation strength (0-1)
 */
export function getSectorRotationWeight(sectorAnalysis: SectorRotationAnalysis | null): number {
  // No analysis = no weight
  if (!sectorAnalysis) {
    return 0
  }

  const { entrySignals, exitSignals, pattern } = sectorAnalysis

  // Strong patterns get higher weight
  if (pattern === 'Risk-On Rotation' || pattern === 'Risk-Off Rotation') {
    // Entry signals: weight 0.30
    // Exit signals: weight 0.35
    if (entrySignals.length > 0) {
      return 0.3
    }

    if (exitSignals.length > 0) {
      return 0.35
    }
  }

  // Sector-specific pattern: moderate weight
  if (pattern === 'Sector-Specific') {
    return 0.2
  }

  // Broad-based patterns: lower weight for individual sector confirmation
  if (pattern === 'Broad-Based Advance' || pattern === 'Broad-Based Decline') {
    return 0.15
  }

  // Mixed pattern: low weight
  return 0.1
}

/**
 * Get sector rotation signal type for weight calculation
 *
 * @param signal - Rotation signal
 * @returns Weight for this signal type
 */
export function getSignalWeight(signal: RotationSignal): number {
  const signalWeights: Record<RotationSignal, number> = {
    Entry: 0.30,
    Accumulate: 0.20,
    Hold: 0.1,
    Distribute: 0.20,
    Exit: 0.35,
  }

  return signalWeights[signal]
}

/**
 * Calculate sector rotation confidence from analysis
 *
 * @param sectorAnalysis - Sector rotation analysis
 * @returns Overall confidence score (0-100)
 */
export function calculateSectorConfidence(sectorAnalysis: SectorRotationAnalysis | null): number {
  if (!sectorAnalysis) {
    return 0
  }

  const { entrySignals, exitSignals, leadership, pattern } = sectorAnalysis

  // Strong patterns get higher base confidence
  let baseConfidence = 50

  if (pattern === 'Risk-On Rotation' || pattern === 'Risk-Off Rotation') {
    baseConfidence = 70
  } else if (pattern === 'Sector-Specific') {
    baseConfidence = 60
  }

  // Adjust based on signal count
  const totalSignals = entrySignals.length + exitSignals.length

  if (totalSignals > 0) {
    // Average confidence from all signals
    const signalConfidences = [
      ...entrySignals.map((s) => s.confidence),
      ...exitSignals.map((s) => s.confidence),
    ]

    const avgSignalConfidence =
      signalConfidences.reduce((sum, conf) => sum + conf, 0) / signalConfidences.length

    // Blend base confidence with signal confidence
    return Math.round((baseConfidence * 0.4 + avgSignalConfidence * 0.6))
  }

  // Adjust based on concentration
  if (leadership.concentration > 70) {
    return baseConfidence + 10
  }

  return baseConfidence
}
