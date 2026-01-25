/**
 * Data Export Utilities
 *
 * Export insights and analysis data in various formats.
 * Supports JSON, CSV, and structured exports for debugging and analysis.
 *
 * Part of Phase 4: Data export utilities.
 */

import type { ActionableInsights, InvestmentAnswers } from '@/types/insights'
import type { MarketBreadthAnalysis } from '@/types/market-breadth'
import type { SectorRotationAnalysis } from '@/types/sector-rotation'
import type { SmartMoneyAnalysis } from '@/types/smart-money'
import type { RankingsSectorMap } from '@/types/sector-rotation'
import type { CompleteMarketAnalysis } from '@/services/integration/combined-analysis'

// ============================================================================
// EXPORT FORMAT TYPES
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'json' | 'csv' | 'markdown' | 'txt'

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format?: ExportFormat

  /** Include timestamp (default: true) */
  includeTimestamp?: boolean

  /** Include metadata (default: true) */
  includeMetadata?: boolean

  /** Indent JSON (default: 2) */
  jsonIndent?: number

  /** CSV delimiter (default: ',') */
  csvDelimiter?: string

  /** Custom filename (without extension) */
  filename?: string
}

/**
 * Export result
 */
export interface ExportResult {
  /** Exported data as string */
  data: string

  /** Suggested filename */
  filename: string

  /** File extension */
  extension: string

  /** MIME type */
  mimeType: string

  /** Export timestamp */
  exportedAt: number
}

// ============================================================================
// INSIGHTS EXPORT
// ============================================================================

/**
 * Export actionable insights
 *
 * @param insights Actionable insights to export
 * @param options Export options
 * @returns Export result
 *
 * @example
 * ```ts
 * const result = exportInsights(insights, { format: 'json' })
 * console.log(result.data)
 * // Download file with result.filename
 * ```
 */
export function exportInsights(
  insights: ActionableInsights,
  options: ExportOptions = {}
): ExportResult {
  const { format = 'json', includeTimestamp = true, includeMetadata = true } = options

  const timestamp = Date.now()
  const filename = options.filename || `insights-${new Date(timestamp).toISOString().split('T')[0]}`

  switch (format) {
    case 'json':
      return exportInsightsAsJSON(insights, filename, {
        includeTimestamp,
        includeMetadata,
        indent: options.jsonIndent,
      })

    case 'csv':
      return exportInsightsAsCSV(insights, filename, {
        includeTimestamp,
        delimiter: options.csvDelimiter,
      })

    case 'markdown':
      return exportInsightsAsMarkdown(insights, filename, {
        includeTimestamp,
        includeMetadata,
      })

    case 'txt':
      return exportInsightsAsText(insights, filename, {
        includeTimestamp,
      })

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Export insights as JSON
 */
function exportInsightsAsJSON(
  insights: ActionableInsights,
  filename: string,
  options: { includeTimestamp: boolean; includeMetadata: boolean; indent?: number }
): ExportResult {
  const { includeTimestamp, includeMetadata, indent = 2 } = options

  const data = {
    ...(includeTimestamp && { exportedAt: new Date().toISOString() }),
    ...(includeMetadata && {
      version: '1.0.0',
      source: 'fonPick Insights Engine',
    }),
    ...insights,
  }

  return {
    data: JSON.stringify(data, null, indent),
    filename,
    extension: 'json',
    mimeType: 'application/json',
    exportedAt: Date.now(),
  }
}

/**
 * Export insights as CSV (flattened key metrics)
 */
function exportInsightsAsCSV(
  insights: ActionableInsights,
  filename: string,
  options: { includeTimestamp: boolean; delimiter?: string }
): ExportResult {
  const { includeTimestamp, delimiter = ',' } = options

  const rows: string[] = []

  // Header
  const headers = [
    ...(includeTimestamp ? ['Exported At'] : []),
    'Verdict',
    'Confidence',
    'Trading Action',
    'Focus Sectors',
    'Avoid Sectors',
    'Risk Level',
    'Bullish Factors',
    'Bearish Factors',
    'Warnings',
  ]
  rows.push(headers.join(delimiter))

  // Data row
  const values = [
    ...(includeTimestamp ? [new Date().toISOString()] : []),
    insights.answers.verdict.verdict,
    insights.answers.verdict.confidence.toString(),
    insights.trading.action,
    insights.sectorFocus.filter(s => s.level === 'High').map(s => s.sector).join('; '),
    insights.sectorFocus.filter(s => s.level === 'Avoid').map(s => s.sector).join('; '),
    insights.warnings.length > 0 ? 'High' : 'Medium',
    insights.answers.verdict.bullishFactors.join('; '),
    insights.answers.verdict.bearishFactors.join('; '),
    insights.warnings.join('; '),
  ]
  rows.push(values.map(v => `"${v}"`).join(delimiter))

  return {
    data: rows.join('\n'),
    filename,
    extension: 'csv',
    mimeType: 'text/csv',
    exportedAt: Date.now(),
  }
}

/**
 * Export insights as Markdown
 */
function exportInsightsAsMarkdown(
  insights: ActionableInsights,
  filename: string,
  options: { includeTimestamp: boolean; includeMetadata: boolean }
): ExportResult {
  const { includeTimestamp, includeMetadata } = options

  const lines: string[] = []

  // Title and metadata
  lines.push('# fonPick Market Insights')
  lines.push('')

  if (includeMetadata) {
    lines.push('**Source:** fonPick Insights Engine v1.0.0')
    lines.push('')
  }

  if (includeTimestamp) {
    lines.push(`**Generated:** ${new Date().toISOString()}`)
    lines.push('')
  }

  // Executive Summary
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(`**Verdict:** ${insights.answers.verdict.verdict}`)
  lines.push(`**Confidence:** ${insights.answers.verdict.confidence}%`)
  lines.push(`**Trading Action:** ${insights.trading.action}`)
  lines.push('')

  // Trading Recommendation
  lines.push('## Trading Recommendation')
  lines.push('')
  lines.push(`**Action:** ${insights.trading.action}`)
  lines.push(`**Sectors:** ${insights.trading.sectors.join(', ')}`)
  lines.push(`**Position Size:** ${insights.trading.positionSize}`)
  lines.push(`**Timeframe:** ${insights.trading.timeframe}`)
  lines.push('')
  lines.push('**Rationale:**')
  lines.push(insights.trading.rationale)
  lines.push('')

  // Sector Focus
  lines.push('## Sector Focus')
  lines.push('')
  insights.sectorFocus.forEach(sector => {
    lines.push(`### ${sector.sector}`)
    lines.push(`- **Level:** ${sector.level}`)
    lines.push(`- **Action:** ${sector.action}`)
    lines.push(`- **Reason:** ${sector.reason}`)
    lines.push('')
  })

  // Investment Questions Answers
  lines.push('## Investment Questions')
  lines.push('')

  const answers = insights.answers
  const questions: Array<{ key: keyof InvestmentAnswers; label: string }> = [
    { key: 'q1_volatility', label: 'Q1: Market Volatility' },
    { key: 'q2_sectorLeadership', label: 'Q2: Sector Leadership' },
    { key: 'q3_riskOnOff', label: 'Q3: Risk-On/Off' },
    { key: 'q4_tradingFocus', label: 'Q4: Trading Focus' },
    { key: 'q5_rankingsImpact', label: 'Q5: Rankings Impact' },
    { key: 'q6_rankingsVsSector', label: 'Q6: Rankings vs Sector' },
  ]

  questions.forEach(({ key, label }) => {
    const answer = answers[key] as any
    if (!answer) return

    lines.push(`### ${label}`)
    lines.push('')
    lines.push(`**Summary:** ${answer.summary}`)
    lines.push('')
    lines.push('**Explanation:**')
    lines.push(answer.explanation)
    lines.push('')

    if (answer.evidence && answer.evidence.length > 0) {
      lines.push('**Evidence:**')
      answer.evidence.forEach((e: string) => lines.push(`- ${e}`))
      lines.push('')
    }

    if (answer.recommendation) {
      lines.push(`**Recommendation:** ${answer.recommendation}`)
      lines.push('')
    }

    lines.push(`**Confidence:** ${answer.confidence}%`)
    lines.push('')
  })

  // Verdict Breakdown
  lines.push('## Market Verdict Breakdown')
  lines.push('')
  lines.push(`**Verdict:** ${insights.answers.verdict.verdict}`)
  lines.push(`**Confidence:** ${insights.answers.verdict.confidence}%`)
  lines.push('')
  lines.push('**Bullish Factors:**')
  insights.answers.verdict.bullishFactors.forEach(f => lines.push(`- ${f}`))
  lines.push('')
  lines.push('**Bearish Factors:**')
  insights.answers.verdict.bearishFactors.forEach(f => lines.push(`- ${f}`))
  lines.push('')
  lines.push('**Neutral Factors:**')
  insights.answers.verdict.neutralFactors.forEach(f => lines.push(`- ${f}`))
  lines.push('')
  lines.push('**Rationale:**')
  lines.push(insights.answers.verdict.rationale)
  lines.push('')

  // Themes
  if (insights.themes.length > 0) {
    lines.push('## Key Themes')
    lines.push('')
    insights.themes.forEach(theme => lines.push(`- ${theme}`))
    lines.push('')
  }

  // Warnings
  if (insights.warnings.length > 0) {
    lines.push('## Risk Warnings')
    lines.push('')
    insights.warnings.forEach(warning => lines.push(`- ${warning}`))
    lines.push('')
  }

  // Confidence Breakdown
  lines.push('## Confidence Breakdown')
  lines.push('')
  lines.push(`**Overall:** ${insights.confidence.overall}%`)
  lines.push('')
  Object.entries(insights.confidence.breakdown).forEach(([source, confidence]) => {
    lines.push(`- ${source}: ${confidence}%`)
  })
  lines.push('')

  return {
    data: lines.join('\n'),
    filename,
    extension: 'md',
    mimeType: 'text/markdown',
    exportedAt: Date.now(),
  }
}

/**
 * Export insights as plain text
 */
function exportInsightsAsText(
  insights: ActionableInsights,
  filename: string,
  options: { includeTimestamp: boolean }
): ExportResult {
  const { includeTimestamp } = options

  const lines: string[] = []

  lines.push('=== FONPICK MARKET INSIGHTS ===')
  lines.push('')

  if (includeTimestamp) {
    lines.push(`Generated: ${new Date().toISOString()}`)
    lines.push('')
  }

  // Quick Summary
  lines.push('QUICK SUMMARY')
  lines.push('-'.repeat(40))
  lines.push(`Verdict: ${insights.answers.verdict.verdict}`)
  lines.push(`Confidence: ${insights.answers.verdict.confidence}%`)
  lines.push(`Action: ${insights.trading.action}`)
  lines.push(`Focus: ${insights.trading.sectors.join(', ')}`)
  lines.push('')

  // Verdict
  lines.push('MARKET VERDICT')
  lines.push('-'.repeat(40))
  lines.push(insights.answers.verdict.rationale)
  lines.push('')

  // Trading Recommendation
  lines.push('TRADING RECOMMENDATION')
  lines.push('-'.repeat(40))
  lines.push(`Action: ${insights.trading.action}`)
  lines.push(`Sectors: ${insights.trading.sectors.join(', ')}`)
  lines.push(`Position: ${insights.trading.positionSize}`)
  lines.push(`Timeframe: ${insights.trading.timeframe}`)
  lines.push('')

  // Sector Focus
  lines.push('SECTOR FOCUS')
  lines.push('-'.repeat(40))
  insights.sectorFocus.forEach(sector => {
    lines.push(`${sector.sector}: ${sector.level} (${sector.action})`)
  })
  lines.push('')

  // Key Questions
  lines.push('KEY INVESTMENT QUESTIONS')
  lines.push('-'.repeat(40))

  const answers = insights.answers
  const questions: Array<{ key: keyof InvestmentAnswers; label: string }> = [
    { key: 'q1_volatility', label: 'Q1: Market Volatility' },
    { key: 'q2_sectorLeadership', label: 'Q2: Sector Leadership' },
    { key: 'q3_riskOnOff', label: 'Q3: Risk-On/Off' },
    { key: 'q4_tradingFocus', label: 'Q4: Trading Focus' },
    { key: 'q5_rankingsImpact', label: 'Q5: Rankings Impact' },
    { key: 'q6_rankingsVsSector', label: 'Q6: Rankings vs Sector' },
  ]

  questions.forEach(({ key, label }) => {
    const answer = answers[key] as any
    if (!answer) return

    lines.push(`${label}`)
    lines.push(answer.summary)
    lines.push('')
  })

  // Warnings
  if (insights.warnings.length > 0) {
    lines.push('WARNINGS')
    lines.push('-'.repeat(40))
    insights.warnings.forEach(w => lines.push(`! ${w}`))
    lines.push('')
  }

  return {
    data: lines.join('\n'),
    filename,
    extension: 'txt',
    mimeType: 'text/plain',
    exportedAt: Date.now(),
  }
}

// ============================================================================
// COMPLETE ANALYSIS EXPORT
// ============================================================================

/**
 * Export complete market analysis
 *
 * @param analysis Complete market analysis
 * @param options Export options
 * @returns Export result
 */
export function exportCompleteAnalysis(
  analysis: CompleteMarketAnalysis,
  options: ExportOptions = {}
): ExportResult {
  const { format = 'json', includeTimestamp = true } = options

  const timestamp = Date.now()
  const filename =
    options.filename ||
    `analysis-${analysis.meta.date || new Date(timestamp).toISOString().split('T')[0]}`

  switch (format) {
    case 'json':
      return exportCompleteAnalysisAsJSON(analysis, filename, {
        includeTimestamp,
        indent: options.jsonIndent,
      })

    case 'markdown':
      return exportCompleteAnalysisAsMarkdown(analysis, filename, {
        includeTimestamp,
      })

    default:
      // For CSV and txt, export just the insights
      return exportInsights(analysis.insights, options)
  }
}

/**
 * Export complete analysis as JSON
 */
function exportCompleteAnalysisAsJSON(
  analysis: CompleteMarketAnalysis,
  filename: string,
  options: { includeTimestamp: boolean; indent?: number }
): ExportResult {
  const { includeTimestamp, indent = 2 } = options

  const data = {
    ...(includeTimestamp && { exportedAt: new Date().toISOString() }),
    meta: analysis.meta,
    breadth: analysis.breadth,
    sectorRotation: analysis.sectorRotation,
    smartMoney: analysis.smartMoney,
    correlation: analysis.correlation,
    rankingsImpact: analysis.rankingsImpact,
    insights: analysis.insights,
  }

  return {
    data: JSON.stringify(data, null, indent),
    filename,
    extension: 'json',
    mimeType: 'application/json',
    exportedAt: Date.now(),
  }
}

/**
 * Export complete analysis as Markdown
 */
function exportCompleteAnalysisAsMarkdown(
  analysis: CompleteMarketAnalysis,
  filename: string,
  options: { includeTimestamp: boolean }
): ExportResult {
  const { includeTimestamp } = options

  const lines: string[] = []

  // Title
  lines.push('# Complete Market Analysis')
  lines.push('')

  if (includeTimestamp) {
    lines.push(`**Generated:** ${new Date().toISOString()}`)
    lines.push('')
  }

  // Metadata
  lines.push('## Analysis Metadata')
  lines.push('')
  lines.push(`**Date:** ${analysis.meta.date}`)
  lines.push(`**Analysis Time:** ${new Date(analysis.meta.timestamp).toISOString()}`)
  lines.push(`**Duration:** ${analysis.meta.duration || 'N/A'}ms`)
  lines.push('')

  lines.push('**Data Availability:**')
  lines.push(`- Market Overview: ${analysis.meta.dataAvailability.marketOverview ? 'Yes' : 'No'}`)
  lines.push(`- Industry Sector: ${analysis.meta.dataAvailability.industrySector ? 'Yes' : 'No'}`)
  lines.push(`- Investor Type: ${analysis.meta.dataAvailability.investorType ? 'Yes' : 'No'}`)
  lines.push(`- Top Rankings: ${analysis.meta.dataAvailability.topRankings ? 'Yes' : 'No'}`)
  lines.push('')

  // Market Breadth
  lines.push('## Market Breadth Analysis')
  lines.push('')
  lines.push(`**Status:** ${analysis.breadth.status}`)
  lines.push(`**Volatility:** ${analysis.breadth.volatility}`)
  lines.push(`**Confidence:** ${analysis.breadth.confidence}%`)
  lines.push('')
  if (analysis.breadth.observations.length > 0) {
    lines.push('**Observations:**')
    analysis.breadth.observations.forEach(o => lines.push(`- ${o}`))
    lines.push('')
  }

  // Sector Rotation
  lines.push('## Sector Rotation Analysis')
  lines.push('')
  lines.push(`**Pattern:** ${analysis.sectorRotation.pattern}`)
  lines.push(`**Regime:** ${analysis.sectorRotation.regimeContext.regime}`)
  lines.push('')
  lines.push('**Focus Sectors:**')
  analysis.sectorRotation.focusSectors.forEach(s => lines.push(`- ${s}`))
  lines.push('')
  lines.push('**Avoid Sectors:**')
  analysis.sectorRotation.avoidSectors.forEach(s => lines.push(`- ${s}`))
  lines.push('')

  // Smart Money
  lines.push('## Smart Money Analysis')
  lines.push('')
  lines.push(`**Signal:** ${analysis.smartMoney.combinedSignal}`)
  lines.push(`**Risk Mode:** ${analysis.smartMoney.riskSignal}`)
  lines.push(`**Score:** ${analysis.smartMoney.score}/100`)
  lines.push('')
  if (analysis.smartMoney.observations.length > 0) {
    lines.push('**Observations:**')
    analysis.smartMoney.observations.forEach(o => lines.push(`- ${o}`))
    lines.push('')
  }

  // Correlation Analysis (if available)
  if (analysis.correlation) {
    lines.push('## Rankings-Sector Correlation')
    lines.push('')
    lines.push(`**Correlation:** ${analysis.correlation.overallCorrelation}`)
    lines.push(`**Correlation Score:** ${analysis.correlation.correlationScore}`)
    lines.push(`**Anomalies:** ${analysis.correlation.anomalies.length}`)
    lines.push('')
  }

  // Insights (reuse the insights markdown export)
  const insightsMarkdown = exportInsightsAsMarkdown(analysis.insights, '', {
    includeTimestamp: false,
    includeMetadata: false,
  })

  lines.push(insightsMarkdown.data)

  return {
    data: lines.join('\n'),
    filename,
    extension: 'md',
    mimeType: 'text/markdown',
    exportedAt: Date.now(),
  }
}

// ============================================================================
// DEBUGGING EXPORT
// ============================================================================

/**
 * Export for debugging - includes all raw data
 *
 * @param data Analysis data
 * @param filename Custom filename
 * @returns Export result
 */
export function exportForDebugging(
  data: {
    breadth?: MarketBreadthAnalysis
    sectorRotation?: SectorRotationAnalysis
    smartMoney?: SmartMoneyAnalysis
    rankingsMap?: RankingsSectorMap
    inputs?: any
  },
  filename?: string
): ExportResult {
  const debugFilename = filename || `debug-${Date.now()}`

  const debugData = {
    timestamp: new Date().toISOString(),
    environment:
      typeof window !== 'undefined'
        ? 'browser'
        : typeof process !== 'undefined'
        ? 'node'
        : 'unknown',
    data: {
      breadth: data.breadth,
      sectorRotation: data.sectorRotation,
      smartMoney: data.smartMoney,
      rankingsMap: data.rankingsMap,
      rawInputs: data.inputs,
    },
  }

  return {
    data: JSON.stringify(debugData, null, 2),
    filename: debugFilename,
    extension: 'json',
    mimeType: 'application/json',
    exportedAt: Date.now(),
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Download export result as file (browser only)
 *
 * @param result Export result
 * @throws Error if not in browser environment
 */
export function downloadExport(result: ExportResult): void {
  if (typeof window === 'undefined') {
    throw new Error('downloadExport is only available in browser environment')
  }

  const blob = new Blob([result.data], { type: result.mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${result.filename}.${result.extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Trigger file download with insights
 *
 * @param insights Actionable insights
 * @param format Export format
 * @param filename Custom filename (optional)
 */
export function downloadInsights(
  insights: ActionableInsights,
  format: ExportFormat = 'json',
  filename?: string
): void {
  const result = exportInsights(insights, { format, filename })
  downloadExport(result)
}

/**
 * Create shareable link for insights (returns data URL)
 *
 * @param insights Actionable insights
 * @param format Export format
 * @returns Data URL
 */
export function createShareableLink(
  insights: ActionableInsights,
  format: ExportFormat = 'json'
): string {
  const result = exportInsights(insights, { format })
  const base64Data = btoa(result.data)
  return `data:${result.mimeType};base64,${base64Data}`
}
