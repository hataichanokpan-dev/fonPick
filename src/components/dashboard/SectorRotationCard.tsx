/**
 * SectorRotationCard Component
 *
 * Dashboard card wrapper for SectorRotationModule.
 * Provides a consistent interface with other dashboard cards.
 *
 * This component wraps the existing SectorRotationModule to maintain
 * consistency with the dashboard card pattern while reusing the
 * well-tested SectorRotationModule implementation.
 *
 * Data source: /api/sector-rotation
 */

'use client'

import { SectorRotationModule } from '@/components/modules/SectorRotationModule'
import type { SectorRotationModuleProps } from '@/components/modules/SectorRotationModule'

// Re-export the types from SectorRotationModule for convenience
export type {
  SectorData,
  SectorRotationData,
} from '@/components/modules/SectorRotationModule'

/**
 * Props for SectorRotationCard
 * Extends SectorRotationModuleProps for consistency
 */
export interface SectorRotationCardProps extends Omit<SectorRotationModuleProps, 'className'> {
  /** Additional CSS classes */
  className?: string
}

/**
 * SectorRotationCard component
 *
 * A thin wrapper around SectorRotationModule that provides
 * consistent API with other dashboard cards.
 *
 * @example
 * ```tsx
 * <SectorRotationCard />
 * ```
 *
 * @example
 * ```tsx
 * <SectorRotationCard
 *   data={prefetchedData}
 *   className="custom-class"
 * />
 * ```
 */
export function SectorRotationCard({ className, ...props }: SectorRotationCardProps) {
  return <SectorRotationModule {...props} className={className} />
}

export default SectorRotationCard
