/**
 * Risk Management Types
 *
 * Types for portfolio risk management, correlation analysis,
 * exposure calculation, and backtesting features
 */

import type { SwingHorizon } from './swing-trading'

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Risk level classification
 */
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

/**
 * Risk tolerance level
 */
export type RiskTolerance = 'Conservative' | 'Moderate' | 'Aggressive'

/**
 * Correlation strength
 */
export type CorrelationStrength = 'Strong Negative' | 'Weak Negative' | 'None' | 'Weak Positive' | 'Strong Positive'

/**
 * Backtesting status
 */
export type BacktestStatus = 'pending' | 'running' | 'completed' | 'failed'

// ============================================================================
// PORTFOLIO RISK ANALYSIS
// ============================================================================

/**
 * Position risk data
 */
export interface PositionRisk {
  /** Stock symbol */
  symbol: string
  /** Position value (THB) */
  positionValue: number
  /** Weight in portfolio (%) */
  weight: number
  /** Stop loss price */
  stopLoss: number
  /** Maximum risk amount */
  maxRisk: number
  /** Risk contribution to portfolio */
  riskContribution: number
}

/**
 * Portfolio risk assessment
 */
export interface PortfolioRiskAssessment {
  /** Total portfolio value */
  totalValue: number
  /** Number of positions */
  positionCount: number
  /** Individual position risks */
  positions: PositionRisk[]
  /** Total portfolio risk at stop loss */
  totalRiskAtStopLoss: number
  /** Portfolio risk percentage */
  portfolioRiskPercent: number
  /** Risk level */
  riskLevel: RiskLevel
  /** Concentration risk (top 3 holdings %) */
  concentration: number
  /** Recommendations */
  recommendations: string[]
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Correlation matrix entry
 */
export interface CorrelationEntry {
  /** First symbol */
  symbol1: string
  /** Second symbol */
  symbol2: string
  /** Correlation coefficient (-1 to 1) */
  coefficient: number
  /** Strength classification */
  strength: CorrelationStrength
  /** Sample size */
  sampleSize: number
  /** Significance (p-value approx) */
  significance: number
}

/**
 * Correlation analysis result
 */
export interface CorrelationAnalysis {
  /** Symbols analyzed */
  symbols: string[]
  /** Correlation matrix (triangle format) */
  correlations: CorrelationEntry[]
  /** Highly correlated pairs (>0.7) */
  highlyCorrelated: Array<{
    symbol1: string
    symbol2: string
    coefficient: number
    risk: string
  }>
  /** Diversification score (0-100) */
  diversificationScore: number
  /** Recommendations */
  recommendations: string[]
  /** Analysis period (days) */
  periodDays: number
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// EXPOSURE CALCULATION
// ============================================================================

/**
 * Sector exposure
 */
export interface SectorExposure {
  /** Sector name */
  sector: string
  /** Total exposure (THB) */
  exposure: number
  /** Percentage of portfolio */
  percent: number
  /** Risk level */
  riskLevel: RiskLevel
}

/**
 * Market exposure summary
 */
export interface MarketExposure {
  /** Long exposure (THB) */
  longExposure: number
  /** Short exposure (THB) */
  shortExposure: number
  /** Net exposure (THB) */
  netExposure: number
  /** Gross exposure (THB) */
  grossExposure: number
  /** Net exposure percentage */
  netExposurePercent: number
}

/**
 * Overall exposure analysis
 */
export interface ExposureAnalysis {
  /** Total portfolio value */
  portfolioValue: number
  /** Market exposure */
  market: MarketExposure
  /** Sector breakdown */
  sectors: SectorExposure[]
  /** Concentration risk (top sector %) */
  sectorConcentration: number
  /** Overall exposure level */
  exposureLevel: RiskLevel
  /** Recommendations */
  recommendations: string[]
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// BACKTESTING
// ============================================================================

/**
 * Backtesting parameters
 */
export interface BacktestParams {
  /** Strategy name */
  strategy: string
  /** Symbols to test */
  symbols: string[]
  /** Start date (YYYY-MM-DD) */
  startDate: string
  /** End date (YYYY-MM-DD) */
  endDate: string
  /** Initial capital */
  initialCapital: number
  /** Swing horizon */
  horizon: SwingHorizon
  /** Maximum position size (%) */
  maxPositionSize: number
  /** Stop loss % */
  stopLoss: number
  /** Take profit targets */
  takeProfits: number[]
}

/**
 * Individual trade result
 */
export interface TradeResult {
  /** Symbol */
  symbol: string
  /** Entry date */
  entryDate: string
  /** Exit date */
  exitDate: string
  /** Entry price */
  entryPrice: number
  /** Exit price */
  exitPrice: number
  /** Position size */
  shares: number
  /** Profit/Loss (THB) */
  profitLoss: number
  /** Profit/Loss percentage */
  profitLossPercent: number
  /** Holding period (days) */
  holdingDays: number
  /** Max drawdown during trade */
  maxDrawdown: number
  /** Win/Loss */
  result: 'win' | 'loss' | 'breakeven'
}

/**
 * Backtesting statistics
 */
export interface BacktestStatistics {
  /** Total number of trades */
  totalTrades: number
  /** Winning trades */
  winCount: number
  /** Losing trades */
  lossCount: number
  /** Win rate (%) */
  winRate: number
  /** Total return (THB) */
  totalReturn: number
  /** Total return (%) */
  totalReturnPercent: number
  /** Average win (%) */
  avgWin: number
  /** Average loss (%) */
  avgLoss: number
  /** Profit factor (wins/losses ratio) */
  profitFactor: number
  /** Maximum drawdown (%) */
  maxDrawdown: number
  /** Sharpe ratio */
  sharpeRatio: number
  /** Average holding period (days) */
  avgHoldingDays: number
}

/**
 * Complete backtesting result
 */
export interface BacktestResult {
  /** Test parameters */
  params: BacktestParams
  /** Execution status */
  status: BacktestStatus
  /** Trade results */
  trades: TradeResult[]
  /** Performance statistics */
  statistics: BacktestStatistics | null
  /** Final portfolio value */
  finalValue: number
  /** Error message (if failed) */
  error?: string
  /** Timestamp */
  timestamp: number
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Portfolio risk request
 */
export interface PortfolioRiskRequest {
  /** Current positions */
  positions: Array<{
    symbol: string
    shares: number
    entryPrice: number
    currentPrice: number
    stopLoss?: number
  }>
  /** Total account value */
  accountValue: number
  /** Risk tolerance */
  tolerance?: RiskTolerance
}

/**
 * Portfolio risk response
 */
export interface PortfolioRiskResponse {
  /** Success status */
  success: boolean
  /** Risk assessment data */
  data?: PortfolioRiskAssessment
  /** Error message */
  error?: string
}

/**
 * Correlation analysis request
 */
export interface CorrelationRequest {
  /** Symbols to analyze */
  symbols: string[]
  /** Historical period (days) */
  period?: number
}

/**
 * Correlation analysis response
 */
export interface CorrelationResponse {
  /** Success status */
  success: boolean
  /** Analysis data */
  data?: CorrelationAnalysis
  /** Error message */
  error?: string
}

/**
 * Exposure analysis request
 */
export interface ExposureRequest {
  /** Current positions with sectors */
  positions: Array<{
    symbol: string
    shares: number
    currentPrice: number
    sector: string
  }>
  /** Total account value */
  accountValue: number
}

/**
 * Exposure analysis response
 */
export interface ExposureResponse {
  /** Success status */
  success: boolean
  /** Analysis data */
  data?: ExposureAnalysis
  /** Error message */
  error?: string
}

/**
 * Backtesting request
 */
export interface BacktestRequest {
  /** Test parameters */
  params: BacktestParams
}

/**
 * Backtesting response
 */
export interface BacktestResponse {
  /** Success status */
  success: boolean
  /** Test result */
  data?: BacktestResult
  /** Error message */
  error?: string
}
