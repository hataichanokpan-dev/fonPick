/**
 * Module Components Exports
 *
 * Exports all 6 module components for Phase 2:
 * - VolatilityModule (Q1: Market Volatility)
 * - SectorRotationModule (Q2: Sector Leadership)
 * - SmartMoneyModule (Q3: Risk-On/Off)
 * - InsightsModule (Q4: Trading Focus)
 * - RankingsImpactModule (Q5: Rankings Impact)
 * - CorrelationModule (Q6: Rankings vs Sector)
 */

export { VolatilityModule } from './VolatilityModule'
export type { MarketBreadthData, VolatilityModuleProps } from './VolatilityModule'

export { SectorRotationModule } from './SectorRotationModule'
export type { SectorData, SectorRotationData, SectorRotationModuleProps } from './SectorRotationModule'

export { SmartMoneyModule } from './SmartMoneyModule'
export type { InvestorFlowData, SmartMoneyData, SmartMoneyModuleProps } from './SmartMoneyModule'

export { InsightsModule } from './InsightsModule'
export type { QuestionAnswer, InsightsData, InsightsModuleProps } from './InsightsModule'

export { RankingsImpactModule } from './RankingsImpactModule'
export type { SectorDistribution, RankingsImpactData, RankingsImpactModuleProps } from './RankingsImpactModule'

export { CorrelationModule } from './CorrelationModule'
export type { SectorCorrelation, CorrelationData, CorrelationModuleProps } from './CorrelationModule'

// Re-export shared types
export type { CoverageMetrics } from '@/types/correlation'
