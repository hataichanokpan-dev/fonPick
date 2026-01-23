/**
 * Trends Module
 * Main exports for trend calculations
 */

export {
  calculateSector5DayTrend,
  calculateSector20DayTrend,
  calculateSectorYTDTrend,
  calculateAllSectorTrends,
} from './sector'

export {
  calculateInvestor5DayTrend,
  calculateInvestor20DayTrend,
  calculateInvestorYTDTrend,
  calculateAllInvestorTrends,
} from './investor'

export type {
  TrendValue,
  SectorTrend,
  InvestorTrend,
  MarketTrend,
  TrendDirection,
} from './types'

export {
  getTrendDirection,
  getTrendColor,
  getTrendArrow,
} from './types'
