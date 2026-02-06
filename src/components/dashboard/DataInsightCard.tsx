/**
 * DataInsightCard Component
 *
 * Displays synthesized market insights for resolving conflicting signals.
 * Combines regime, smart money, and sector rotation data into a single verdict.
 *
 * Features:
 * - Conditional rendering (auto-shows on conflict or high conviction)
 * - Verdict badge with color coding
 * - Explanation and primary driver display
 * - Confidence dots (5-dot system) with percentage
 * - Expandable conflict details
 * - Dismissible with session storage persistence
 * - Fade-in animations
 */

'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Shuffle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { DataInsight, Verdict, PrimaryDriver, ConvictionLevel } from '@/types/data-insight'

// ============================================================================
// TYPES
// ============================================================================

export interface DataInsightCardProps {
  /** Additional CSS classes */
  className?: string
  /** Force show on load (default: auto-detect based on conflicts) */
  showOnLoad?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SESSION_STORAGE_KEY = 'data-insight-dismissed'

const VERDICT_COLORS: Record<Verdict, { bg: string; text: string; border: string }> = {
  PROCEED: {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#10B981',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  CAUTION: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#EF4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  WAIT: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  NEUTRAL: {
    bg: 'rgba(107, 114, 128, 0.15)',
    text: '#6B7280',
    border: 'rgba(107, 114, 128, 0.3)',
  },
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ConfidenceDotsProps {
  confidence: number
  className?: string
}

function ConfidenceDots({ confidence, className }: ConfidenceDotsProps) {
  // Calculate number of filled dots (0-5)
  const filledDots = Math.round((confidence / 100) * 5)

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full animate-scale-in"
            style={{
              backgroundColor: index < filledDots ? '#60A5FA' : 'rgba(107, 114, 128, 0.3)',
              animationDelay: `${index * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface ConflictDetailProps {
  label: string
  value: string
  confidence: number
}

function ConflictDetail({ label, value, confidence }: ConflictDetailProps) {
  const getValueColor = () => {
    const lowerValue = value.toLowerCase()
    if (lowerValue.includes('risk-on') || lowerValue.includes('buy') || lowerValue.includes('strong')) {
      return '#10B981'
    }
    if (lowerValue.includes('risk-off') || lowerValue.includes('sell') || lowerValue.includes('weak')) {
      return '#EF4444'
    }
    return '#6B7280'
  }

  const getValueIcon = () => {
    const lowerValue = value.toLowerCase()
    if (lowerValue.includes('risk-on') || lowerValue.includes('buy')) {
      return <TrendingUp className="w-3 h-3" />
    }
    if (lowerValue.includes('risk-off') || lowerValue.includes('sell')) {
      return <TrendingDown className="w-3 h-3" />
    }
    return <Minus className="w-3 h-3" />
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-surface/50 rounded-md">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: getValueColor() }}>
          {value}
        </span>
        {getValueIcon()}
        <span className="text-[10px] text-text-muted tabular-nums">{confidence}%</span>
      </div>
    </div>
  )
}

interface VerdictBadgeProps {
  verdict: Verdict
  /** Translation function */
  t: (key: string) => string
}

function VerdictBadge({ verdict, t }: VerdictBadgeProps) {
  const colors = VERDICT_COLORS[verdict]

  const getVerdictLabel = (): string => {
    switch (verdict) {
      case 'PROCEED':
        return t('verdict.proceed')
      case 'CAUTION':
        return t('verdict.caution')
      case 'WAIT':
        return t('verdict.wait')
      case 'NEUTRAL':
        return t('verdict.neutral')
      default:
        return verdict
    }
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {verdict === 'PROCEED' && <TrendingUp className="w-3.5 h-3.5" />}
      {verdict === 'CAUTION' && <AlertTriangle className="w-3.5 h-3.5" />}
      {verdict === 'WAIT' && <Minus className="w-3.5 h-3.5" />}
      {verdict === 'NEUTRAL' && <Info className="w-3.5 h-3.5" />}
      <span>{getVerdictLabel()}</span>
    </div>
  )
}

// Loading Skeleton
function DataInsightSkeleton() {
  return (
    <Card padding="md" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surface-2 animate-pulse" />
          <div className="h-4 w-24 bg-surface-2 rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-surface-2 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-surface-2 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-surface-2 rounded animate-pulse" />
      </div>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DataInsightCard({ className, showOnLoad }: DataInsightCardProps) {
  const t = useTranslations('dashboard.dataInsight')
  const tRegime = useTranslations('dashboard.regime')
  const tSmartMoney = useTranslations('dashboard.smartMoney')

  // State management
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [shouldShow, setShouldShow] = useState(showOnLoad ?? false)

  // Check session storage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Fetch data from /api/data-insight
  const { data, isLoading, error } = useQuery<{
    success: boolean
    data?: { dataInsight: DataInsight | null }
  }>({
    queryKey: ['data-insight'],
    queryFn: async () => {
      const res = await fetch('/api/data-insight')
      if (!res.ok) {
        throw new Error('Failed to fetch data insight')
      }
      return res.json()
    },
    // RTDB updates once daily at 18:30 - no polling needed
    refetchInterval: false,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (memory optimization)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const insight = data?.data?.dataInsight as DataInsight | undefined

  // Auto-show on conflict detection or high/medium conviction
  useEffect(() => {
    if (showOnLoad === undefined && insight) {
      const hasConflict = !!insight.keyConflictAlert
      const hasStrongSignal = insight.conviction === 'High' || insight.conviction === 'Medium'
      setShouldShow(hasConflict || hasStrongSignal)
    }
  }, [insight, showOnLoad])

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
  }

  // Don't render if dismissed
  if (isDismissed) {
    return null
  }

  // Show skeleton while loading
  if (isLoading) {
    return <DataInsightSkeleton />
  }

  // Don't render if no data, shouldn't show, or has error
  if (!insight || !shouldShow || error) {
    return null
  }

  // Get primary driver label
  const getPrimaryDriverLabel = (driver: PrimaryDriver): string => {
    switch (driver) {
      case 'Foreign Flow':
        return t('primaryDriver.foreignFlow')
      case 'Smart Money':
        return t('primaryDriver.smartMoney')
      case 'Market Regime':
        return t('primaryDriver.marketRegime')
      case 'Sector Strength':
        return t('primaryDriver.sectorStrength')
      case 'None':
        return t('primaryDriver.none')
      default:
        return driver
    }
  }

  // Translate conviction level
  const translateConviction = (conviction: ConvictionLevel): string => {
    switch (conviction) {
      case 'High':
        return t('conviction.high')
      case 'Medium':
        return t('conviction.medium')
      case 'Low':
        return t('conviction.low')
      default:
        return conviction
    }
  }

  // Translate combined signal from smart money (used by multiple functions)
  const translateStrength = (strength: string): string => {
    const strengthMap: Record<string, string> = {
      'Strong Buy': tSmartMoney('strongBuy'),
      'Buy': tSmartMoney('buy'),
      'Strong Sell': tSmartMoney('strongSell'),
      'Sell': tSmartMoney('sell'),
      'Neutral': tSmartMoney('neutral'),
    }
    return strengthMap[strength] || strength
  }

  // Translate conflict descriptions from conflict-detector
  const translateConflictDescription = (description: string): string => {
    let translated = description

    // Foreign-Domestic Divergence: "Foreign investors are Strong Buy while retail is Strong Sell"
    const foreignDomesticMatch = translated.match(/Foreign investors are (\w+(?: \w+)?) while (\w+) is (\w+(?: \w+)?)/)
    if (foreignDomesticMatch) {
      const [, foreignStrength, domesticType, domesticStrength] = foreignDomesticMatch
      const translatedForeignStrength = translateStrength(foreignStrength)
      const translatedDomesticStrength = translateStrength(domesticStrength)
      const translatedDomesticType = domesticType === 'retail'
        ? tSmartMoney('retail')
        : tSmartMoney('prop')
      return t('messages.foreignDomesticDivergence', {
        foreignStrength: translatedForeignStrength,
        domesticType: translatedDomesticType,
        domesticStrength: translatedDomesticStrength
      })
    }

    // Regime-Smart Money Mismatch: "Market regime is Risk-On but smart money score is low (45.00/100)"
    const regimeSmartMoneyMatch = translated.match(/Market regime is (\w+(?:-\w+)?) but smart money score is low \(([\d.]+)\/100\)/)
    if (regimeSmartMoneyMatch) {
      const [, regime, score] = regimeSmartMoneyMatch
      const translatedRegime = regime === 'Risk-On'
        ? tRegime('riskOn')
        : regime === 'Risk-Off'
          ? tRegime('riskOff')
          : tRegime('neutral')
      return t('messages.regimeSmartMoneyMismatch', { regime: translatedRegime, score })
    }

    // Regime-Sector Mismatch: "Regime is Risk-On but defensive sectors are leading"
    if (translated.includes('Regime is Risk-On but defensive sectors are leading')) {
      return t('messages.regimeSectorMismatch')
    }

    // Smart Money Contradiction: "Foreign is Strong Buy but Institution is Sell"
    const smartMoneyContradictionMatch = translated.match(/Foreign is (\w+(?: \w+)?) but Institution is (\w+(?: \w+)?)/)
    if (smartMoneyContradictionMatch) {
      const [, foreignStrength, institutionStrength] = smartMoneyContradictionMatch
      const translatedForeignStrength = translateStrength(foreignStrength)
      const translatedInstitutionStrength = translateStrength(institutionStrength)
      return t('messages.smartMoneyContradiction', {
        foreignStrength: translatedForeignStrength,
        institutionStrength: translatedInstitutionStrength
      })
    }

    return translated
  }

  // Translate explanation (composed of multiple parts)
  const translateExplanation = (explanation: string): string => {
    let translated = explanation

    // Translate primary driver template
    translated = translated.replace(
      /(\w+(?: \w+)*) is the primary driver\./,
      (_match, driver) => {
        const translatedDriver = getPrimaryDriverLabel(driver as PrimaryDriver)
        return t('messages.primaryDriverTemplate', { driver: translatedDriver })
      }
    )

    // Translate regime context
    translated = translated.replace(
      /Market regime is (Risk-On|Neutral|Risk-Off) with (\d+)% confidence\./,
      (_match, regime, confidence) => {
        const translatedRegime = regime === 'Risk-On'
          ? tRegime('riskOn')
          : regime === 'Risk-Off'
            ? tRegime('riskOff')
            : tRegime('neutral')
        return t('messages.regimeContextTemplate', { regime: translatedRegime, confidence })
      }
    )

    // Translate smart money context
    translated = translated.replace(
      /Smart money score is ([\d.]+)\/100 with signal: ([\w\s]+)\./,
      (_match, score, signal) => {
        const translatedSignal = translateStrength(signal)
        return t('messages.smartMoneyContextTemplate', { score, signal: translatedSignal })
      }
    )

    // Translate sector pattern
    translated = translated.replace(
      /Sector pattern shows ([\w\s\/]+)\./,
      (_match, pattern) => t('messages.sectorPatternTemplate', { pattern })
    )

    // Translate key conflict
    translated = translated.replace(
      /Key conflict: (.+)/,
      (_match, conflict) => t('messages.keyConflictTemplate', { conflict })
    )

    return translated
  }

  // Translate actionable takeaway (with dynamic values)
  const translateActionableTakeaway = (takeaway: string): string => {
    // Actionable takeaway exact match messages
    const actionMessageMap: Record<string, string> = {
      'Proceed with trades. Driven by {primaryDriver}. Maintain standard position sizing.': t('messages.proceedStandard'),
      'Exercise caution with new positions. Consider reducing position sizes by 25-50%.': t('messages.exerciseCaution'),
      'Wait for clearer signals. Current market conditions are too ambiguous for high-conviction trades.': t('messages.waitClearerSignals'),
      'Market signals are mixed. Hold existing positions and wait for directional clarity.': t('messages.mixedSignals'),
    }

    // Check for exact matches first
    if (actionMessageMap[takeaway]) {
      return actionMessageMap[takeaway]
    }

    // Try pattern matching
    // "Consider OVERWEIGHT positions in ENERGY, TECHNOLOGY. Driven by Foreign Flow."
    const proceedWithPositionsMatch = takeaway.match(/Consider (\w+) positions in ([^.]+)\. Driven by (.+)\./)
    if (proceedWithPositionsMatch) {
      const [, focus, sectors, driver] = proceedWithPositionsMatch
      const translatedDriver = getPrimaryDriverLabel(driver as PrimaryDriver)
      return t('messages.proceedWithPositions', { focus, sectors, driver: translatedDriver })
    }

    // "Reduce exposure to BANKS, ENERGY. Use tighter stops."
    const reduceExposureMatch = takeaway.match(/Reduce exposure to ([^.]+)\. Use tighter stops\./)
    if (reduceExposureMatch) {
      const [, sectors] = reduceExposureMatch
      return t('messages.reduceExposure', { sectors })
    }

    return takeaway
  }

  return (
    <div className={`animate-fade-in-up ${className || ''}`}>
      <div
        className="w-full relative rounded-lg border border-border bg-surface p-4 md:p-6"
        style={{
          borderLeft: `4px solid ${VERDICT_COLORS[insight.verdict].text}`,
        }}
      >
        {/* Header - Title and Dismiss */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-info" />
            <h3 className="text-sm font-bold text-text-primary">{t('title')}</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Priority Badge (show for conflicts) */}
            {insight.keyConflictAlert && (
              <Badge size="sm" color="warning">
                {t('priority')}
              </Badge>
            )}
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-surface-2 hover:scale-110 active:scale-95 transition-all duration-150"
              aria-label="Dismiss insight"
            >
              <X className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Conflict Alert (if present) */}
        {insight.keyConflictAlert && (
          <div className="mb-3 p-2.5 rounded-md flex items-start gap-2 animate-fade-in-up"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              {translateConflictDescription(insight.keyConflictAlert)}
            </p>
          </div>
        )}

        {/* Verdict Badge (Primary) */}
        <div className="flex items-center justify-center my-3">
          <VerdictBadge verdict={insight.verdict} t={t} />
        </div>

        {/* Explanation (Secondary) */}
        <p className="text-sm text-text-primary text-center leading-relaxed mb-3">
          {translateExplanation(insight.explanation)}
        </p>

        {/* Primary Driver (Tertiary) */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs text-text-muted">{t('driver')}</span>
          <span className="text-xs font-semibold text-text-secondary">
            {getPrimaryDriverLabel(insight.primaryDriver)}
          </span>
        </div>

        {/* Confidence (Quaternary) */}
        <div className="flex items-center justify-center gap-3 mb-3 pb-3 border-b border-border-subtle">
          <ConfidenceDots confidence={insight.confidence} />
          <span className="text-xs text-text-muted tabular-nums">
            {translateConviction(insight.conviction)} ({insight.confidence}%)
          </span>
        </div>

        {/* Expandable Details */}
        <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
          <div className="pt-2 space-y-1.5">
            {insight.conflictingSignals.regime && (
              <ConflictDetail
                label={t('conflictLabels.regime')}
                value={insight.conflictingSignals.regime.value}
                confidence={insight.conflictingSignals.regime.confidence}
              />
            )}
            {insight.conflictingSignals.smartMoney && (
              <ConflictDetail
                label={t('conflictLabels.smartMoney')}
                value={insight.conflictingSignals.smartMoney.value}
                confidence={insight.conflictingSignals.smartMoney.confidence}
              />
            )}
            {insight.conflictingSignals.foreign && (
              <ConflictDetail
                label={t('conflictLabels.foreignFlow')}
                value={insight.conflictingSignals.foreign.value}
                confidence={insight.conflictingSignals.foreign.confidence}
              />
            )}
            {insight.conflictingSignals.sector && (
              <ConflictDetail
                label={t('conflictLabels.sectors')}
                value={insight.conflictingSignals.sector.value}
                confidence={insight.conflictingSignals.sector.confidence}
              />
            )}
          </div>

          {/* Actionable Takeaway */}
          {insight.actionableTakeaway && (
            <div className="mt-3 p-2.5 rounded-md bg-info/10 border border-info/20">
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-info">{t('takeaway')}</span>{' '}
                {translateActionableTakeaway(insight.actionableTakeaway)}
              </p>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1.5 mt-2 py-1.5 text-xs text-text-muted hover:text-text-secondary hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <span>{isExpanded ? t('hideDetails') : t('showDetails')}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

export default DataInsightCard
