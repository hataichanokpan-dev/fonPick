/**
 * FundamentalAnalysis Component
 *
 * Displays fundamental financial metrics with detailed breakdowns
 *
 * Sections:
 * - Financial Health (สุขภาพการเงิน):
 *   Revenue, Net Profit, Total Assets, Total Equity
 *   EPS, ROE, ROA, Debt-to-Equity, Current Ratio, Quick Ratio
 *
 * - Valuation Metrics (มูลค่าการประเมิน):
 *   P/E ratio, P/BV ratio, EV/EBITDA, Price-to-Sales
 *   PEG Ratio, Dividend Yield, Payout Ratio
 *
 * Features:
 * - Grid layout for metrics
 * - Color coding for good/bad values
 * - Comparison with sector averages
 * - Collapsible sections
 * - Thai labels with English subtitles
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockStatisticsData } from '@/types/stock-api'

export interface FundamentalAnalysisProps {
  /** Stock statistics data */
  data: StockStatisticsData
  /** Sector averages for comparison (optional) */
  sectorAverages?: {
    pe?: number
    pbv?: number
  }
  /** Additional CSS classes */
  className?: string
}

/**
 * Format large numbers with suffixes (K, M, B, T)
 */
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)}T`
  }
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

/**
 * Format percentage value
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Get color class based on financial health metric value
 */
function getMetricColor(type: string, value: number): string {
  switch (type) {
    case 'roe':
      if (value >= 15) return 'text-green-500'
      if (value >= 10) return 'text-lime-500'
      if (value >= 5) return 'text-yellow-500'
      return 'text-red-500'
    case 'roa':
      if (value >= 5) return 'text-green-500'
      if (value >= 3) return 'text-lime-500'
      if (value >= 1) return 'text-yellow-500'
      return 'text-red-500'
    case 'debtToEquity':
      if (value <= 1) return 'text-green-500'
      if (value <= 1.5) return 'text-lime-500'
      if (value <= 2) return 'text-yellow-500'
      return 'text-red-500'
    case 'currentRatio':
      if (value >= 1.5) return 'text-green-500'
      if (value >= 1.2) return 'text-lime-500'
      if (value >= 1) return 'text-yellow-500'
      return 'text-red-500'
    case 'pe':
      // Lower PE is generally better
      if (value <= 10) return 'text-green-500'
      if (value <= 15) return 'text-lime-500'
      if (value <= 20) return 'text-yellow-500'
      return 'text-red-500'
    case 'pbv':
      if (value <= 1) return 'text-green-500'
      if (value <= 1.5) return 'text-lime-500'
      if (value <= 2) return 'text-yellow-500'
      return 'text-red-500'
    case 'dividendYield':
      if (value >= 4) return 'text-green-500'
      if (value >= 3) return 'text-lime-500'
      if (value >= 2) return 'text-yellow-500'
      return 'text-red-500'
    default:
      return 'text-text-primary'
  }
}

/**
 * FundamentalAnalysis Component
 *
 * @example
 * ```tsx
 * <FundamentalAnalysis data={stockStatisticsData} />
 *
 * <FundamentalAnalysis
 *   data={stockStatisticsData}
 *   sectorAverages={{ pe: 15.0, pbv: 1.5 }}
 * />
 * ```
 */
export function FundamentalAnalysis({
  data,
  sectorAverages,
  className,
}: FundamentalAnalysisProps) {
  const [financialCollapsed, setFinancialCollapsed] = useState(false)
  const [valuationCollapsed, setValuationCollapsed] = useState(false)

  const { financial, valuation } = data

  // ==================================================================
  // RENDER
  // ==================================================================

  return (
    <div data-testid="fundamental-analysis" className={cn('space-y-4', className)}>
      {/* Financial Health Section */}
      <motion.div
        className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <button
          data-testid="financial-health-header"
          type="button"
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setFinancialCollapsed(!financialCollapsed)}
          aria-expanded={!financialCollapsed}
          aria-label="Toggle Financial Health section"
        >
          <div>
            <h3
              data-testid="financial-health-thai-label"
              className="text-lg font-semibold text-text-primary"
            >
              สุขภาพการเงิน
            </h3>
            <p
              data-testid="financial-health-english-label"
              className="text-sm text-text-2"
            >
              Financial Health
            </p>
          </div>

          <motion.div
            animate={{ rotate: financialCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-2"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {!financialCollapsed && (
            <motion.div
              data-testid="financial-health-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Revenue */}
                  <MetricCard
                    label="Revenue"
                    thaiLabel="รายได้รวม"
                    value={financial.revenue}
                    format={formatLargeNumber}
                    testId="financial-revenue"
                  />

                  {/* Net Profit */}
                  <MetricCard
                    label="Net Profit"
                    thaiLabel="กำไรสุทธิ"
                    value={financial.netProfit}
                    format={formatLargeNumber}
                    testId="financial-net-profit"
                    color={financial.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}
                  />

                  {/* Total Assets */}
                  <MetricCard
                    label="Total Assets"
                    thaiLabel="สินทรัพย์รวม"
                    value={financial.totalAssets}
                    format={formatLargeNumber}
                    testId="financial-total-assets"
                  />

                  {/* Total Equity */}
                  <MetricCard
                    label="Total Equity"
                    thaiLabel="ส่วนของผู้ถือหุ้น"
                    value={financial.totalEquity}
                    format={formatLargeNumber}
                    testId="financial-total-equity"
                  />

                  {/* EPS */}
                  <MetricCard
                    label="EPS"
                    thaiLabel="กำไรต่อหุ้น"
                    value={financial.eps}
                    format={(v) => (v > 0 ? v.toFixed(2) : 'N/A')}
                    testId="financial-eps"
                  />

                  {/* ROE */}
                  <MetricCard
                    label="ROE"
                    thaiLabel="อัตราผลตอบแทนต่อผู้ถือหุ้น"
                    value={financial.roe}
                    format={formatPercentage}
                    testId="financial-roe"
                    color={getMetricColor('roe', financial.roe)}
                  />

                  {/* ROA */}
                  <MetricCard
                    label="ROA"
                    thaiLabel="อัตราผลตอบแทนต่อสินทรัพย์"
                    value={financial.roa}
                    format={formatPercentage}
                    testId="financial-roa"
                    color={getMetricColor('roa', financial.roa)}
                  />

                  {/* Debt-to-Equity */}
                  <MetricCard
                    label="D/E Ratio"
                    thaiLabel="อัตราหนี้สินต่อทุน"
                    value={financial.debtToEquity}
                    format={(v) => v.toFixed(2)}
                    testId="financial-debt-to-equity"
                    color={getMetricColor('debtToEquity', financial.debtToEquity)}
                  />

                  {/* Current Ratio */}
                  <MetricCard
                    label="Current Ratio"
                    thaiLabel="อัตราส่วนทรัพย์สินหมุนเวียน"
                    value={financial.currentRatio}
                    format={(v) => v.toFixed(2)}
                    testId="financial-current-ratio"
                    color={getMetricColor('currentRatio', financial.currentRatio)}
                  />

                  {/* Quick Ratio */}
                  <MetricCard
                    label="Quick Ratio"
                    thaiLabel="อัตราส่วนสินทรัพย์สภาพคล่องด่วน"
                    value={financial.quickRatio}
                    format={(v) => v.toFixed(2)}
                    testId="financial-quick-ratio"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Valuation Metrics Section */}
      <motion.div
        data-testid="valuation-metrics-section"
        className="w-full rounded-lg bg-surface border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Header */}
        <button
          data-testid="valuation-metrics-header"
          type="button"
          className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setValuationCollapsed(!valuationCollapsed)}
          aria-expanded={!valuationCollapsed}
          aria-label="Toggle Valuation Metrics section"
        >
          <div>
            <h3
              data-testid="valuation-metrics-thai-label"
              className="text-lg font-semibold text-text-primary"
            >
              มูลค่าการประเมิน
            </h3>
            <p
              data-testid="valuation-metrics-english-label"
              className="text-sm text-text-2"
            >
              Valuation Metrics
            </p>
          </div>

          <motion.div
            animate={{ rotate: valuationCollapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-2"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {!valuationCollapsed && (
            <motion.div
              data-testid="valuation-metrics-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border/50"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* P/E Ratio */}
                  <MetricCard
                    label="P/E Ratio"
                    thaiLabel="อัตราส่วนราคาต่อกำไร"
                    value={valuation.pe}
                    format={(v) => v.toFixed(2)}
                    testId="valuation-pe"
                    color={getMetricColor('pe', valuation.pe)}
                    comparison={
                      sectorAverages?.pe
                        ? { value: sectorAverages.pe, label: 'Sector Avg' }
                        : undefined
                    }
                  />

                  {/* P/BV Ratio */}
                  <MetricCard
                    label="P/BV Ratio"
                    thaiLabel="อัตราส่วนราคาต่อมูลค่าตามบัญชี"
                    value={valuation.pbv}
                    format={(v) => v.toFixed(2)}
                    testId="valuation-pbv"
                    color={getMetricColor('pbv', valuation.pbv)}
                    comparison={
                      sectorAverages?.pbv
                        ? { value: sectorAverages.pbv, label: 'Sector Avg' }
                        : undefined
                    }
                  />

                  {/* EV/EBITDA */}
                  <MetricCard
                    label="EV/EBITDA"
                    thaiLabel="มูลค่าวิสาหกิจต่อกำไรก่อนดอกเบี้ยและภาษี"
                    value={valuation.evEbitda}
                    format={(v) => v.toFixed(2)}
                    testId="valuation-ev-ebitda"
                  />

                  {/* Price-to-Sales */}
                  <MetricCard
                    label="P/S Ratio"
                    thaiLabel="อัตราส่วนราคาต่อยอดขาย"
                    value={valuation.priceToSales}
                    format={(v) => v.toFixed(2)}
                    testId="valuation-price-to-sales"
                  />

                  {/* PEG Ratio */}
                  <MetricCard
                    label="PEG Ratio"
                    thaiLabel="อัตราส่วน P/E ต่ออัตราการเติบโต"
                    value={valuation.pegRatio}
                    format={(v) => v.toFixed(2)}
                    testId="valuation-peg-ratio"
                  />

                  {/* Dividend Yield */}
                  <MetricCard
                    label="Dividend Yield"
                    thaiLabel="อัตราผลตอบแทนเงินปันผล"
                    value={valuation.dividendYield}
                    format={formatPercentage}
                    testId="valuation-dividend-yield"
                    color={getMetricColor('dividendYield', valuation.dividendYield)}
                  />

                  {/* Payout Ratio */}
                  <MetricCard
                    label="Payout Ratio"
                    thaiLabel="อัตราส่วนจ่ายปันผล"
                    value={valuation.payoutRatio}
                    format={formatPercentage}
                    testId="valuation-payout-ratio"
                  />

                  {/* EV */}
                  <MetricCard
                    label="Enterprise Value"
                    thaiLabel="มูลค่าวิสาหกิจ"
                    value={valuation.ev}
                    format={formatLargeNumber}
                    testId="valuation-ev"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  thaiLabel: string
  value: number
  format: (value: number) => string
  testId: string
  color?: string
  comparison?: {
    value: number
    label: string
  }
}

function MetricCard({
  label,
  thaiLabel,
  value,
  format,
  testId,
  color = 'text-text-primary',
  comparison,
}: MetricCardProps) {
  const formattedValue = format(value)

  return (
    <div
      className="p-3 rounded-lg bg-surface-2 border border-border/30 hover:border-border/60 transition-colors"
    >
      <div className="text-xs text-text-2 mb-1">{thaiLabel}</div>
      <div className="flex items-baseline justify-between gap-2">
        <div
          data-testid={testId}
          className={cn('text-lg font-semibold font-mono tabular-nums', color)}
        >
          {formattedValue}
        </div>
        {comparison && (
          <div
            data-testid={`${testId}-sector-comparison`}
            className="text-xs text-text-3 flex items-center gap-1"
          >
            <span className="text-text-2">{comparison.label}:</span>
            <span className="font-mono">{comparison.value.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="text-xs text-text-2 mt-1">{label}</div>
    </div>
  )
}

/**
 * Default export for convenience
 */
export default FundamentalAnalysis
