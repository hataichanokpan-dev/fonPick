/**
 * Swing Verdict Card Component
 *
 * แสดงสรุปผลการวิเคราะห์ Swing Trading:
 * - Verdict type (Strong Buy/Buy/Wait/Avoid) พร้อมสี
 * - Confidence level (High/Medium/Low) พร้อม dots indicator
 * - Primary Metric selector (R:R / Win Rate / Trend Quality)
 * - Primary Metric แสดงแบบ Large display
 * - Trend quality และ sustainability scores
 * - Key factors list
 * - Time estimate (min/max days)
 *
 * ใช้ CSS animations แทน Framer Motion (ประหยัด memory)
 */

'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card'
import { DataBadge } from '@/components/shared/DataBadge'
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertCircle, Target, TrendingUp as TrendIcon, Award } from 'lucide-react'
import { cn, safeToFixed } from '@/lib/utils'
import type { SwingVerdict } from '@/types/swing-trading'

interface SwingVerdictCardProps {
  verdict: SwingVerdict
  locale: 'en' | 'th'
}

// ============================================================================
// TYPES
// ============================================================================

type PrimaryMetric = 'risk-reward' | 'win-rate' | 'trend-quality'

// ============================================================================
// LABELS
// ============================================================================

const LABELS = {
  en: {
    title: 'Swing Trading Verdict',
    horizon: 'Horizon',
    confidence: 'Confidence',
    trendQuality: 'Trend Quality',
    sustainability: 'Sustainability',
    keyFactors: 'Key Factors',
    timeEstimate: 'Time Estimate',
    days: 'days',
    strongBuy: 'Strong Buy',
    buy: 'Buy',
    wait: 'Wait',
    avoid: 'Avoid',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    // Primary Metrics
    riskReward: 'Risk:Reward',
    winRate: 'Win Rate',
    trendQuality: 'Trend Quality',
    // Metric values
    riskRewardValue: 'R:R',
    winRateValue: 'Win Rate',
    trendQualityValue: 'Quality',
  },
  th: {
    title: 'ผลการวิเคราะห์ Swing Trading',
    horizon: 'ระยะเวลา',
    confidence: 'ความมั่นใจ',
    trendQuality: 'คุณภาพเทรนด์',
    sustainability: 'ความยั่งยืน',
    keyFactors: 'ปัจจัยสำคัญ',
    timeEstimate: 'ประมาณการเวลา',
    days: 'วัน',
    strongBuy: 'ซื้อมาก',
    buy: 'ซื้อ',
    wait: 'รอ',
    avoid: 'หลีกเลี่ยง',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    excellent: 'ดีเยี่ยม',
    good: 'ดี',
    fair: 'ปานกลาง',
    poor: 'แย่',
    // Primary Metrics
    riskReward: 'อัตราส่วนความเสี่ยง/ผลตอบแทน',
    winRate: 'อัตราชนะ',
    trendQuality: 'คุณภาพเทรนด์',
    // Metric values
    riskRewardValue: 'R:R',
    winRateValue: 'Win Rate',
    trendQualityValue: 'Quality',
  },
} as const

// ============================================================================
// VERDICT CONFIG
// ============================================================================

const VERDICT_CONFIG = {
  'Strong Buy': {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
    icon: TrendingUp,
    label: 'strongBuy' as const,
  },
  'Buy': {
    bg: 'bg-green-600/10',
    border: 'border-green-600/30',
    text: 'text-green-600',
    icon: TrendingUp,
    label: 'buy' as const,
  },
  'Wait': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    icon: Minus,
    label: 'wait' as const,
  },
  'Avoid': {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-500',
    icon: TrendingDown,
    label: 'avoid' as const,
  },
} as const

const CONFIDENCE_CONFIG = {
  High: { color: 'text-emerald-500', dots: 3 },
  Medium: { color: 'text-amber-500', dots: 2 },
  Low: { color: 'text-rose-500', dots: 1 },
} as const

const QUALITY_CONFIG = {
  excellent: { color: 'text-emerald-500', bar: 'w-full' },
  good: { color: 'text-green-600', bar: 'w-3/4' },
  fair: { color: 'text-amber-500', bar: 'w-1/2' },
  poor: { color: 'text-rose-500', bar: 'w-1/4' },
} as const

// ============================================================================
// PRIMARY METRIC CONFIG
// ============================================================================

interface MetricConfig {
  icon: typeof Target | typeof TrendIcon | typeof Award
  label: string
  getValue: (verdict: SwingVerdict) => { value: string; subtext?: string; color: string }
}

const METRIC_CONFIG: Record<PrimaryMetric, MetricConfig> = {
  'risk-reward': {
    icon: Target,
    label: 'riskReward',
    getValue: (verdict: SwingVerdict) => {
      // แปลง R:R ratio string (เช่น "1:2.5") เป็นตัวเลข
      const rrMatch = verdict.exit.riskRewardRatio.match(/1:([\d.]+)/)
      const rrValue = rrMatch ? parseFloat(rrMatch[1]) : 0

      return {
        value: verdict.exit.riskRewardRatio,
        subtext: rrValue >= 2 ? 'Excellent' : rrValue >= 1.5 ? 'Good' : 'Fair',
        color: rrValue >= 2 ? 'text-emerald-500' : rrValue >= 1.5 ? 'text-green-600' : 'text-amber-500',
      }
    },
  },
  'win-rate': {
    icon: Award,
    label: 'winRate',
    getValue: (verdict: SwingVerdict) => {
      // คำนวณ win rate โดยประมาณจาก confidence และ trend quality
      const baseWinRate = verdict.confidence === 'High' ? 65 : verdict.confidence === 'Medium' ? 55 : 45
      const qualityBonus = verdict.analysis.trendQuality === 'excellent' ? 10 : verdict.analysis.trendQuality === 'good' ? 5 : 0
      const winRate = Math.min(baseWinRate + qualityBonus, 85)

      return {
        value: `${winRate}%`,
        subtext: winRate >= 70 ? 'High' : winRate >= 60 ? 'Medium' : 'Low',
        color: winRate >= 70 ? 'text-emerald-500' : winRate >= 60 ? 'text-amber-500' : 'text-rose-500',
      }
    },
  },
  'trend-quality': {
    icon: TrendIcon,
    label: 'trendQuality',
    getValue: (verdict: SwingVerdict) => {
      const quality = verdict.analysis.trendQuality
      return {
        value: `${verdict.analysis.trendSustainability}/100`,
        subtext: quality.charAt(0).toUpperCase() + quality.slice(1),
        color: QUALITY_CONFIG[quality].color,
      }
    },
  },
}

// ============================================================================
// METRIC SELECTOR BUTTON
// ============================================================================

interface MetricSelectorProps {
  current: PrimaryMetric
  onSelect: (metric: PrimaryMetric) => void
  locale: 'en' | 'th'
}

function MetricSelector({ current, onSelect, locale }: MetricSelectorProps) {
  const t = LABELS[locale]

  const metrics: Array<{ key: PrimaryMetric; icon: typeof Target | typeof TrendIcon | typeof Award }> = [
    { key: 'risk-reward', icon: Target },
    { key: 'win-rate', icon: Award },
    { key: 'trend-quality', icon: TrendIcon },
  ]

  return (
    <div className="flex items-center gap-2">
      {metrics.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            current === key
              ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
              : 'bg-surface-2 text-text-3 border border-border hover:bg-surface-3'
          )}
          aria-label={t[METRIC_CONFIG[key].label]}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SwingVerdictCard({ verdict, locale }: SwingVerdictCardProps) {
  const t = LABELS[locale]
  const verdictConfig = VERDICT_CONFIG[verdict.verdict]
  const confidenceConfig = CONFIDENCE_CONFIG[verdict.confidence]
  const qualityConfig = QUALITY_CONFIG[verdict.analysis.trendQuality]
  const VerdictIcon = verdictConfig.icon

  // State สำหรับ primary metric selector
  const [primaryMetric, setPrimaryMetric] = useState<PrimaryMetric>('risk-reward')
  const metricConfig = METRIC_CONFIG[primaryMetric]
  const MetricIcon = metricConfig.icon
  const metricValue = metricConfig.getValue(verdict)

  return (
    <Card variant="default" padding="md" className="animate-slide-up">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {t.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-text-secondary">
                {t.horizon}: {verdict.horizon} {t.days}
              </span>
              <span className="text-text-3">•</span>
              <DataBadge timestamp={verdict.timestamp} />
            </div>
          </div>

          {/* Verdict Badge */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border',
            verdictConfig.bg,
            verdictConfig.border
          )}>
            <VerdictIcon className={cn('w-5 h-5', verdictConfig.text)} />
            <span className={cn('font-bold', verdictConfig.text)}>
              {t[verdictConfig.label]}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Metric Display - Large */}
        <div className={cn(
          'flex items-center justify-between p-4 rounded-lg border transition-all duration-300',
          verdictConfig.bg,
          verdictConfig.border
        )}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', verdictConfig.bg.replace('/10', '/20'))}>
              <MetricIcon className={cn('w-6 h-6', verdictConfig.text)} />
            </div>
            <div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                {t[metricConfig.label]}
              </div>
              <div className={cn('text-2xl font-bold tabular-nums', metricValue.color)}>
                {metricValue.value}
              </div>
            </div>
          </div>

          {/* Subtext */}
          {metricValue.subtext && (
            <div className={cn('text-sm font-medium', metricValue.color)}>
              {metricValue.subtext}
            </div>
          )}

          {/* Metric Selector */}
          <MetricSelector
            current={primaryMetric}
            onSelect={setPrimaryMetric}
            locale={locale}
          />
        </div>

        {/* Confidence & Quality Scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Confidence */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">{t.confidence}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors duration-300',
                      i < confidenceConfig.dots
                        ? confidenceConfig.color
                        : 'bg-border'
                    )}
                  />
                ))}
              </div>
            </div>
            <span className={cn('text-lg font-bold', confidenceConfig.color)}>
              {t[verdict.confidence.toLowerCase() as 'high' | 'medium' | 'low']}
            </span>
          </div>

          {/* Trend Quality */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">{t.trendQuality}</span>
              <CheckCircle2 className={cn('w-4 h-4', qualityConfig.color)} />
            </div>
            <span className={cn('text-lg font-bold', qualityConfig.color)}>
              {t[verdict.analysis.trendQuality]}
            </span>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', qualityConfig.color.replace('text-', 'bg-'))}
                style={{ width: `${verdict.analysis.trendSustainability}%` }}
              />
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">{t.sustainability}</span>
              <AlertCircle className="w-4 h-4 text-accent-blue" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-accent-blue tabular-nums">
                {safeToFixed(verdict.analysis.trendSustainability, 0)}
              </span>
              <span className="text-xs text-text-secondary">/100</span>
            </div>
          </div>
        </div>

        {/* Key Factors */}
        {verdict.analysis.keyFactors.length > 0 && (
          <div className="p-3 rounded-lg bg-surface-2 border border-border">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              {t.keyFactors}
            </h4>
            <ul className="space-y-1.5">
              {verdict.analysis.keyFactors.map((factor, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-text-primary"
                >
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                    verdict.verdict === 'Avoid' ? 'bg-rose-500' : 'bg-emerald-500'
                  )} />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Time Estimate */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border">
          <Clock className="w-5 h-5 text-accent-purple flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">{t.timeEstimate}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-text-primary tabular-nums">
                {verdict.timeEstimate.minDays} - {verdict.timeEstimate.maxDays}
              </span>
              <span className="text-sm text-text-secondary">{t.days}</span>
            </div>
            <p className="text-xs text-text-3 mt-1 line-clamp-1">
              {verdict.timeEstimate.rationale}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
