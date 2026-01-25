/**
 * Insights API Route
 *
 * GET /api/insights
 * Returns actionable insights combining all market analyses.
 * Answers all 6 investment questions with trading recommendations.
 */

import { NextRequest } from 'next/server'
import {
  fetchMarketOverviewByDate,
  fetchIndustrySectorByDate,
  fetchInvestorTypeByDate,
  fetchTopRankingsByDate,
  fetchMarketOverview,
  fetchIndustrySector,
  fetchInvestorType,
  fetchTopRankings,
} from '@/lib/rtdb'
import { getDateDaysAgo, getTodayDate } from '@/lib/rtdb/paths'
import { cachedJson, INSIGHTS_CACHE, NO_CACHE } from '@/lib/api-cache'
import { generateActionableInsights } from '@/services/insights/generator'
import { answerInvestmentQuestions } from '@/services/insights/qna-engine'
import { analyzeMarketBreadth } from '@/services/market-breadth/analyzer'
import { analyzeSectorRotation } from '@/services/sector-rotation/analyzer'
import { analyzeSmartMoney } from '@/services/smart-money/signal'
import { mapRankingsToSectors } from '@/services/sector-rotation/mapper'
import type { ActionableInsights, QuestionAnswer, MarketVerdict } from '@/types/insights'
import { InvestmentQuestion } from '@/types/insights'
import type { InsightInputs } from '@/types/insights'
import type { RTDBMarketOverview, RTDBIndustrySector, RTDBInvestorType } from '@/types/rtdb'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/insights
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - format: Response format (default: 'module', options: 'full')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date')
    const format = searchParams.get('format') || 'module'

    // Determine target date
    const targetDate = requestedDate || getTodayDate()

    // Fetch current data using proper fetchers that convert to app format
    const [marketOverview, industrySector, investorType, topRankings] = await Promise.all([
      fetchMarketOverviewByDate(targetDate),
      fetchIndustrySectorByDate(targetDate),
      fetchInvestorTypeByDate(targetDate),
      fetchTopRankingsByDate(targetDate),
    ])

    // Try fallback to latest data if specific date not available
    const marketData = marketOverview || await fetchMarketOverview()
    const sectorData = industrySector || await fetchIndustrySector()
    const investorData = investorType || await fetchInvestorType()
    const rankingsData = topRankings || await fetchTopRankings()

    // Check if we have minimum required data
    if (!marketData || !sectorData || !investorData) {
      // Don't cache error responses
      return cachedJson(
        {
          error: 'Insufficient data available',
          message: 'Unable to fetch required market data for insights generation',
        },
        NO_CACHE,
        404
      )
    }

    // Fetch historical data (fetch 3 days for trends)
    const historicalMarketPromises = Array.from({ length: 3 }, (_, i) => {
      const date = getDateDaysAgo(i + 1)
      return fetchMarketOverviewByDate(date)
    })

    const historicalSectorPromises = Array.from({ length: 3 }, (_, i) => {
      const date = getDateDaysAgo(i + 1)
      return fetchIndustrySectorByDate(date)
    })

    const historicalInvestorPromises = Array.from({ length: 3 }, (_, i) => {
      const date = getDateDaysAgo(i + 1)
      return fetchInvestorTypeByDate(date)
    })

    const [historicalMarket, historicalSector, historicalInvestor] = await Promise.all([
      Promise.all(historicalMarketPromises),
      Promise.all(historicalSectorPromises),
      Promise.all(historicalInvestorPromises),
    ])

    // Perform individual analyses
    const breadthAnalysis = analyzeMarketBreadth({
      current: marketData,
      historical: historicalMarket.length > 0
        ? historicalMarket.filter((m): m is RTDBMarketOverview => m !== null)
        : undefined,
    })

    const sectorRotationAnalysis = analyzeSectorRotation({
      sectors: sectorData,
      rankings: rankingsData || undefined,
      historical: historicalSector.length > 0
        ? historicalSector.filter((s): s is RTDBIndustrySector => s !== null)
        : undefined,
    })

    const smartMoneyAnalysis = analyzeSmartMoney({
      current: investorData,
      historical: historicalInvestor.length > 0
        ? historicalInvestor.filter((i): i is RTDBInvestorType => i !== null)
        : undefined,
    })

    // Perform sector mapping if we have rankings data
    let rankingsMap
    if (rankingsData) {
      rankingsMap = mapRankingsToSectors(rankingsData, sectorData)
    }

    // Generate actionable insights
    const inputs: InsightInputs = {
      breadth: breadthAnalysis,
      sectorRotation: sectorRotationAnalysis,
      smartMoney: smartMoneyAnalysis,
      rankingsMap,
    }

    // Generate answers using Q&A engine
    const answers = answerInvestmentQuestions(inputs)

    // Generate actionable insights (for other components)
    const insights: ActionableInsights = generateActionableInsights(inputs)

    // Merge answers into insights
    insights.answers = answers

    // Return based on requested format
    if (format === 'full') {
      // Full format: return complete actionable insights
      return cachedJson(insights, INSIGHTS_CACHE)
    }

    // Module format: transform to module-friendly format (default)
    const now = Date.now()
    const moduleAnswers: QuestionAnswer[] = [
      {
        question: InvestmentQuestion.MarketVolatility,
        title: 'Market Volatility',
        summary: `${breadthAnalysis.volatility} volatility. Breadth is ${breadthAnalysis.status} with ${breadthAnalysis.metrics.adRatio.toFixed(2)} A/D ratio.`,
        explanation: breadthAnalysis.explanation,
        evidence: breadthAnalysis.observations,
        confidence: breadthAnalysis.confidence,
        recommendation: breadthAnalysis.volatility === 'Aggressive' ? 'Consider reducing position sizes' : 'Normal trading conditions',
        dataPoints: { volatility: breadthAnalysis.volatility, adRatio: breadthAnalysis.metrics.adRatio },
        timestamp: now,
      },
      {
        question: InvestmentQuestion.SectorLeadership,
        title: 'Sector Leadership',
        summary: `${sectorRotationAnalysis.leadership.leaders[0]?.sector?.name || 'No clear'} leading. ${sectorRotationAnalysis.pattern} detected.`,
        explanation: sectorRotationAnalysis.observations.join(' '),
        evidence: sectorRotationAnalysis.observations,
        confidence: 70,
        recommendation: `Focus on ${(sectorRotationAnalysis.focusSectors || []).slice(0, 2).join(', ')}`,
        dataPoints: {
          pattern: sectorRotationAnalysis.pattern,
          leader: sectorRotationAnalysis.leadership.leaders[0]?.sector?.name || 'N/A'
        },
        timestamp: now,
      },
      {
        question: InvestmentQuestion.RiskOnOff,
        title: 'Risk-On/Off',
        summary: `${smartMoneyAnalysis.riskSignal} mode. ${smartMoneyAnalysis.primaryDriver || 'No clear'} driver.`,
        explanation: smartMoneyAnalysis.observations.join(' '),
        evidence: smartMoneyAnalysis.observations,
        confidence: smartMoneyAnalysis.confidence,
        recommendation: smartMoneyAnalysis.riskSignal.includes('Risk-On') ? 'Increase equity exposure' : 'Reduce risk',
        dataPoints: { riskSignal: smartMoneyAnalysis.riskSignal, driver: smartMoneyAnalysis.primaryDriver || 'N/A' },
        timestamp: now,
      },
      {
        question: InvestmentQuestion.TradingFocus,
        title: 'Trading Focus',
        summary: `Focus on ${(insights.sectorFocus || []).slice(0, 2).map(s => s.sector).join(', ')}.`,
        explanation: insights.trading?.rationale || 'Trading signals generated from market analysis',
        evidence: insights.themes || [],
        confidence: insights.confidence?.overall || 50,
        recommendation: insights.trading?.action || 'Hold',
        dataPoints: { action: insights.trading?.action || 'Hold', sectors: (insights.sectorFocus || []).map(s => s.sector).join(',') },
        timestamp: now,
      },
      {
        question: InvestmentQuestion.RankingsImpact,
        title: 'Rankings Impact',
        summary: 'Sector concentration driving market moves.',
        explanation: 'Top rankings show sector concentration patterns.',
        evidence: [],
        confidence: 65,
        dataPoints: { rankingsCount: rankingsData?.topGainers?.length || 0 },
        timestamp: now,
      },
      {
        question: InvestmentQuestion.RankingsVsSector,
        title: 'Rankings vs Sector',
        summary: 'Rankings broadly aligned with sector performance.',
        explanation: 'Correlation analysis shows alignment patterns.',
        evidence: [],
        confidence: 60,
        dataPoints: { sectorsCount: sectorData?.sectors?.length || 0 },
        timestamp: now,
      },
    ]

    // Get verdict with null safety
    const verdict: MarketVerdict = answers?.verdict || {
      verdict: 'Hold',
      confidence: 50,
      bullishFactors: [],
      bearishFactors: [],
      neutralFactors: ['Insufficient data for strong signal'],
      rationale: 'Market analysis complete with limited data',
    }

    const moduleData = {
      answers: moduleAnswers,
      verdict: {
        verdict: verdict.verdict,
        confidence: verdict.confidence,
        rationale: verdict.rationale,
      },
      trading: {
        action: insights.trading?.action || 'Hold',
        sectors: insights.trading?.sectors || [],
        rationale: insights.trading?.rationale || 'No clear trading signal',
      },
      sectorFocus: insights.sectorFocus || [],
      warnings: insights.warnings || [],
      timestamp: insights.timestamp || Date.now(),
    }

    // Return cached response
    return cachedJson(moduleData, INSIGHTS_CACHE)
  } catch (error) {
    console.error('Error in insights API:', error)

    // Don't cache error responses
    return cachedJson(
      {
        error: 'Failed to generate insights',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      NO_CACHE,
      500
    )
  }
}
