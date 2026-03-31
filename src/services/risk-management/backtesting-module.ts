/**
 * Backtesting Module
 *
 * Validates swing trading strategies against historical data.
 * Simulates trades and calculates performance metrics.
 */

import type {
  BacktestParams,
  BacktestResult,
  BacktestStatistics,
  TradeResult,
} from '@/types/risk-management'
import type { PriceHistoryPoint } from '@/types/stock-price-api'
import { fetchPriceHistory } from '@/lib/api/stock-api'
import { generateSwingVerdict } from '@/services/swing-trading'

// ============================================================================
// BACKTESTING ENGINE
// ============================================================================

/**
 * Run backtesting simulation
 *
 * @param params Backtesting parameters
 * @returns Backtesting result
 */
export async function runBacktest(params: BacktestParams): Promise<BacktestResult> {
  const result: BacktestResult = {
    params,
    status: 'pending',
    trades: [],
    statistics: null,
    finalValue: params.initialCapital,
    timestamp: Date.now(),
  }

  try {
    result.status = 'running'

    // Fetch historical data for all symbols
    const historicalData = new Map<string, PriceHistoryPoint[]>()

    await Promise.all(
      params.symbols.map(async (symbol) => {
        const response = await fetchPriceHistory(
          symbol,
          {
            period1: params.startDate,
            period2: params.endDate,
            interval: '1d',
          }
        )

        if (response.success && response.data) {
          historicalData.set(symbol, response.data)
        }
      })
    )

    // Verify we have data for all symbols
    if (historicalData.size !== params.symbols.length) {
      result.status = 'failed'
      result.error = 'Failed to fetch historical data for all symbols'
      return result
    }

    // Simulate trading
    result.trades = await simulateTrading(params, historicalData)

    // Calculate statistics
    result.statistics = calculateStatistics(result.trades, params.initialCapital)
    result.finalValue = calculateFinalValue(result.trades, params.initialCapital)

    result.status = 'completed'
    return result
  } catch (error) {
    result.status = 'failed'
    result.error = error instanceof Error ? error.message : 'Unknown error'
    return result
  }
}

// ============================================================================
// TRADING SIMULATION
// ============================================================================

/**
 * Simulate swing trading on historical data
 *
 * @param params Backtesting parameters
 * @param historicalData Historical price data
 * @returns Array of trade results
 */
async function simulateTrading(
  params: BacktestParams,
  historicalData: Map<string, PriceHistoryPoint[]>
): Promise<TradeResult[]> {
  const trades: TradeResult[] = []
  const capital = params.initialCapital
  const maxPositionValue = capital * (params.maxPositionSize / 100)

  // Process each symbol
  for (const symbol of params.symbols) {
    const priceHistory = historicalData.get(symbol)
    if (!priceHistory || priceHistory.length < params.horizon) {
      continue
    }

    // Slide through history to find entry points
    for (let i = params.horizon; i < priceHistory.length - params.horizon; i++) {
      const entryDate = priceHistory[i].date
      const entryPrice = priceHistory[i].close

      // Generate verdict for this point in time
      const verdict = await generateSwingVerdict({
        symbol,
        horizon: params.horizon,
        currentPrice: entryPrice,
        accountValue: capital,
      })

      // Only enter if verdict is positive
      if (!verdict || verdict.verdict === 'Avoid' || verdict.verdict === 'Wait') {
        continue
      }

      // Calculate position size
      const shares = Math.floor(maxPositionValue / entryPrice)
      if (shares === 0) {
        continue
      }

      // Simulate exit based on stop loss or take profit
      const exitResult = simulateExit(
        priceHistory.slice(i),
        entryPrice,
        shares,
        params.stopLoss,
        params.takeProfits
      )

      trades.push({
        symbol,
        entryDate,
        exitDate: exitResult.date,
        entryPrice,
        exitPrice: exitResult.price,
        shares,
        profitLoss: exitResult.profitLoss,
        profitLossPercent: exitResult.profitLossPercent,
        holdingDays: exitResult.holdingDays,
        maxDrawdown: exitResult.maxDrawdown,
        result: exitResult.result,
      })

      // Move forward after exit
      i += exitResult.holdingDays
    }
  }

  return trades
}

/**
 * Simulate exit based on stop loss and take profit
 *
 * @param futurePrices Future price data
 * @param entryPrice Entry price
 * @param shares Number of shares
 * @param stopLossPercent Stop loss percentage
 * @param takeProfits Take profit percentages
 * @returns Exit result
 */
function simulateExit(
  futurePrices: PriceHistoryPoint[],
  entryPrice: number,
  shares: number,
  stopLossPercent: number,
  takeProfits: number[]
): {
  date: string
  price: number
  profitLoss: number
  profitLossPercent: number
  holdingDays: number
  maxDrawdown: number
  result: 'win' | 'loss' | 'breakeven'
} {
  const stopLossPrice = entryPrice * (1 - stopLossPercent)
  const takeProfitPrices = takeProfits.map(tp => entryPrice * (1 + tp))

  let highestPrice = entryPrice
  let maxDrawdown = 0

  // Simulate day by day
  for (let i = 0; i < futurePrices.length; i++) {
    const price = futurePrices[i].close

    // Track drawdown
    if (price > highestPrice) {
      highestPrice = price
    }
    const drawdown = ((highestPrice - price) / highestPrice) * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }

    // Check stop loss
    if (price <= stopLossPrice) {
      const profitLoss = (price - entryPrice) * shares
      const profitLossPercent = ((price - entryPrice) / entryPrice) * 100

      return {
        date: futurePrices[i].date,
        price,
        profitLoss,
        profitLossPercent,
        holdingDays: i + 1,
        maxDrawdown,
        result: profitLossPercent < -0.5 ? 'loss' : 'breakeven',
      }
    }

    // Check take profits (from highest to lowest)
    for (let j = takeProfitPrices.length - 1; j >= 0; j--) {
      if (price >= takeProfitPrices[j]) {
        const profitLoss = (takeProfitPrices[j] - entryPrice) * shares
        const profitLossPercent = ((takeProfitPrices[j] - entryPrice) / entryPrice) * 100

        return {
          date: futurePrices[i].date,
          price: takeProfitPrices[j],
          profitLoss,
          profitLossPercent,
          holdingDays: i + 1,
          maxDrawdown,
          result: profitLossPercent > 0.5 ? 'win' : 'breakeven',
        }
      }
    }
  }

  // No stop loss or take profit hit, use last price
  const lastPrice = futurePrices[futurePrices.length - 1].close
  const profitLoss = (lastPrice - entryPrice) * shares
  const profitLossPercent = ((lastPrice - entryPrice) / entryPrice) * 100

  return {
    date: futurePrices[futurePrices.length - 1].date,
    price: lastPrice,
    profitLoss,
    profitLossPercent,
    holdingDays: futurePrices.length,
    maxDrawdown,
    result: profitLossPercent > 0.5 ? 'win' : profitLossPercent < -0.5 ? 'loss' : 'breakeven',
  }
}

// ============================================================================
// STATISTICS CALCULATION
// ============================================================================

/**
 * Calculate backtesting statistics
 *
 * @param trades Trade results
 * @param initialCapital Initial capital
 * @returns Performance statistics
 */
function calculateStatistics(trades: TradeResult[], initialCapital: number): BacktestStatistics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      avgHoldingDays: 0,
    }
  }

  const wins = trades.filter(t => t.result === 'win')
  const losses = trades.filter(t => t.result === 'loss')

  const winRate = (wins.length / trades.length) * 100
  const totalReturn = trades.reduce((sum, t) => sum + t.profitLoss, 0)
  const totalReturnPercent = (totalReturn / initialCapital) * 100

  const avgWin = wins.length > 0
    ? wins.reduce((sum, t) => sum + t.profitLossPercent, 0) / wins.length
    : 0

  const avgLoss = losses.length > 0
    ? losses.reduce((sum, t) => sum + t.profitLossPercent, 0) / losses.length
    : 0

  const totalWins = wins.reduce((sum, t) => sum + t.profitLoss, 0)
  const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

  const maxDrawdown = trades.length > 0
    ? Math.max(...trades.map(t => t.maxDrawdown))
    : 0

  const avgHoldingDays = trades.reduce((sum, t) => sum + t.holdingDays, 0) / trades.length

  // Simplified Sharpe ratio (assumes 2% risk-free rate)
  const annualReturn = totalReturnPercent
  const annualVolatility = calculateStandardDeviation(
    trades.map(t => t.profitLossPercent)
  )
  const sharpeRatio = annualVolatility > 0
    ? (annualReturn - 2) / annualVolatility
    : 0

  return {
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate,
    totalReturn,
    totalReturnPercent,
    avgWin,
    avgLoss,
    profitFactor: isFinite(profitFactor) ? profitFactor : 0,
    maxDrawdown,
    sharpeRatio,
    avgHoldingDays,
  }
}

/**
 * Calculate final portfolio value
 *
 * @param trades Trade results
 * @param initialCapital Initial capital
 * @returns Final portfolio value
 */
function calculateFinalValue(trades: TradeResult[], initialCapital: number): number {
  return initialCapital + trades.reduce((sum, t) => sum + t.profitLoss, 0)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate standard deviation
 *
 * @param values Array of values
 * @returns Standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length

  return Math.sqrt(variance)
}

/**
 * Generate backtesting summary report
 *
 * @param result Backtesting result
 * @returns Formatted summary string
 */
export function generateBacktestSummary(result: BacktestResult): string {
  if (result.status === 'pending') {
    return 'Backtesting is pending...'
  }
  if (result.status === 'running') {
    return 'Backtesting is running...'
  }
  if (result.status === 'failed') {
    return `Backtesting failed: ${result.error}`
  }

  if (!result.statistics) {
    return 'No statistics available'
  }

  const stats = result.statistics

  return `
Backtesting Results for ${result.params.strategy}
=====================================
Period: ${result.params.startDate} to ${result.params.endDate}
Initial Capital: ${result.params.initialCapital.toLocaleString()} THB
Final Value: ${result.finalValue.toLocaleString()} THB
Return: ${stats.totalReturnPercent.toFixed(2)}%

Performance Metrics:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate.toFixed(1)}%
- Avg Win: ${stats.avgWin.toFixed(2)}%
- Avg Loss: ${stats.avgLoss.toFixed(2)}%
- Profit Factor: ${stats.profitFactor.toFixed(2)}
- Max Drawdown: ${stats.maxDrawdown.toFixed(2)}%
- Sharpe Ratio: ${stats.sharpeRatio.toFixed(2)}
- Avg Holding: ${stats.avgHoldingDays.toFixed(0)} days
  `.trim()
}

/**
 * Quick backtest validation
 *
 * @param symbol Symbol to test
 * @param days Historical period
 * @returns Basic backtesting result or null
 */
export async function quickBacktest(
  symbol: string,
  days: number = 90
): Promise<{ winRate: number; avgReturn: number } | null> {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const params: BacktestParams = {
      strategy: 'Quick Swing',
      symbols: [symbol],
      startDate,
      endDate,
      initialCapital: 100000,
      horizon: 60,
      maxPositionSize: 10,
      stopLoss: 0.10,
      takeProfits: [0.15, 0.20, 0.25],
    }

    const result = await runBacktest(params)

    if (result.status !== 'completed' || !result.statistics) {
      return null
    }

    return {
      winRate: result.statistics.winRate,
      avgReturn: result.statistics.totalReturnPercent,
    }
  } catch {
    return null
  }
}
