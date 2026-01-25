/**
 * InsightsModule Component
 *
 * Displays AI-generated market insights including:
 * - 6 Q&A answers (expandable/collapsible)
 * - Confidence levels
 * - Action recommendations
 * - Supporting evidence bullets
 * - Verdict context (secondary display)
 * - Trading action plan
 * - Sector focus list
 *
 * Answers Q4: "What current trade and what sector need to focus?"
 * Data source: /api/insights
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: First 3 questions expanded by default, others collapsed
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { Lightbulb, AlertTriangle, Info, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '@/lib/design'

// ==================================================================
// TYPES
// ==================================================================

export interface QuestionAnswer {
  /** Question ID */
  id: string
  /** Question title */
  title: string
  /** Answer summary */
  summary: string
  /** Detailed explanation */
  explanation: string
  /** Supporting evidence */
  evidence: string[]
  /** Confidence (0-100) */
  confidence: number
  /** Actionable recommendation */
  recommendation?: string
}

export interface InsightsData {
  /** 6 question answers */
  answers: QuestionAnswer[]
  /** Overall market verdict */
  verdict: {
    verdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
    confidence: number
    rationale: string
  }
  /** Trading recommendation */
  trading: {
    action: 'Buy' | 'Sell' | 'Hold' | 'Wait'
    sectors: string[]
    rationale: string
  }
  /** Sector focus */
  sectorFocus: Array<{
    sector: string
    level: 'High' | 'Medium' | 'Low' | 'Avoid'
    reason: string
  }>
  /** Risk warnings */
  warnings: string[]
  /** Timestamp */
  timestamp: number
}

export interface InsightsModuleProps {
  /** Pre-fetched data (optional) */
  data?: InsightsData
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface QuestionCardProps {
  qa: QuestionAnswer
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function QuestionCard({ qa, index, isExpanded, onToggle }: QuestionCardProps) {
  const getConfidenceColor = (): string => {
    if (qa.confidence >= 70) return colors.up.primary
    if (qa.confidence >= 50) return colors.accent.insight
    return colors.down.primary
  }

  return (
    <div className="border-b border-[#1f2937] last:border-0">
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-start justify-between gap-3 text-left hover:bg-[#1f2937]/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <motion.span
            className="text-xs font-medium text-[#6b7280]"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.span>
          <span className="text-xs font-medium text-[#6b7280]">
            Q{index + 1}
          </span>
          <h4 className="text-sm font-semibold text-[#ffffff] truncate">
            {qa.title}
          </h4>
        </div>
        <span
          className="text-sm font-bold tabular-nums flex-shrink-0"
          style={{ color: getConfidenceColor() }}
        >
          {qa.confidence}%
        </span>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {/* Summary */}
              <p className="text-sm text-[#a0a0a0] leading-relaxed mb-2 break-words">
                {qa.summary}
              </p>

              {/* Explanation */}
              <p className="text-sm text-[#6b7280] leading-relaxed mb-2 break-words">
                {qa.explanation}
              </p>

              {/* Evidence */}
              {qa.evidence.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5" style={{ color: colors.accent.blue }} />
                    <span className="text-xs uppercase tracking-wide text-[#6b7280]">
                      Evidence
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {qa.evidence.map((item, i) => (
                      <li key={i} className="text-sm text-[#6b7280] flex items-start gap-2 break-words">
                        <span style={{ color: colors.accent.blue }} className="flex-shrink-0">•</span>
                        <span className="leading-relaxed break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {qa.recommendation && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" style={{ color: colors.accent.insight }} />
                    <span className="text-xs uppercase tracking-wide" style={{ color: colors.accent.insight }}>
                      Action
                    </span>
                  </div>
                  <p className="text-sm text-[#ffffff] leading-relaxed break-words">
                    {qa.recommendation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface VerdictContextProps {
  verdict: InsightsData['verdict']
  trading: InsightsData['trading']
}

function VerdictContext({ verdict, trading }: VerdictContextProps) {
  const getVerdictColor = (): 'buy' | 'sell' | 'neutral' | 'watch' | 'avoid' => {
    switch (verdict.verdict) {
      case 'Strong Buy':
      case 'Buy':
        return 'buy'
      case 'Strong Sell':
      case 'Sell':
        return 'sell'
      default:
        return 'neutral'
    }
  }

  const getActionColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (trading.action) {
      case 'Buy':
        return 'buy'
      case 'Sell':
        return 'sell'
      case 'Wait':
        return 'watch'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="p-3 rounded-lg bg-[#1f2937] border border-[#374151]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge size="sm" color={getVerdictColor()}>
            {verdict.verdict}
          </Badge>
          <span className="text-xs text-[#6b7280] tabular-nums">
            {verdict.confidence}% conf.
          </span>
        </div>
        <Badge size="sm" color={getActionColor()}>
          {trading.action}
        </Badge>
      </div>

      {/* Trading Action Plan */}
      <div className="mb-2">
        <p className="text-sm text-[#a0a0a0] leading-relaxed break-words">
          {verdict.rationale}
        </p>
      </div>

      {/* Sector Focus List */}
      {trading.sectors.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#6b7280] uppercase tracking-wide flex-shrink-0">
            Focus:
          </span>
          {trading.sectors.map((sector, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded bg-[#374151] text-[#a0a0a0] break-words max-w-full"
            >
              {sector}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function InsightsModule({ data: initialData, className }: InsightsModuleProps) {
  // Track which questions are expanded (first 3 by default)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set([0, 1, 2]))

  // Toggle question expansion
  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Expand/collapse all
  const expandAll = () => {
    setExpandedQuestions(new Set([0, 1, 2, 3, 4, 5]))
  }

  const collapseAll = () => {
    setExpandedQuestions(new Set<number>())
  }

  // Fetch data from API
  const { data, isLoading, error } = useQuery<InsightsData>({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await fetch('/api/insights')
      if (!res.ok) throw new Error('Failed to fetch insights data')
      return res.json()
    },
    initialData: initialData,
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: colors.accent.insight }} />
            <h3 className="text-sm font-semibold text-[#a0a0a0]">Investment Insights</h3>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-[#1f2937] rounded" />
          <div className="h-20 bg-[#1f2937] rounded" />
          <div className="h-20 bg-[#1f2937] rounded" />
          <div className="h-20 bg-[#1f2937] rounded" />
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: colors.accent.insight }} />
            <h3 className="text-sm font-semibold text-[#a0a0a0]">Investment Insights</h3>
          </div>
        </div>
        <p className="text-[#6b7280] text-sm">Unable to load insights data</p>
      </Card>
    )
  }

  const isAllExpanded = expandedQuestions.size === data.answers.length
  const isAllCollapsed = expandedQuestions.size === 0

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4" style={{ color: colors.accent.insight }} />
          <h3 className="text-sm font-semibold text-[#a0a0a0]">Investment Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b7280] uppercase tracking-wide">
            6 Questions
          </span>
          <button
            onClick={isAllExpanded ? collapseAll : expandAll}
            className="text-xs text-[#a0a0a0] hover:text-white transition-colors"
          >
            {isAllExpanded ? 'Collapse All' : isAllCollapsed ? 'Expand All' : `${expandedQuestions.size}/${data.answers.length}`}
          </button>
        </div>
      </div>

      {/* Verdict Context - Secondary Display (banner handles prominence) */}
      <VerdictContext verdict={data.verdict} trading={data.trading} />

      {/* Questions List - Expandable/Collapsible */}
      <div className="mt-3">
        {data.answers.map((qa, index) => (
          <QuestionCard
            key={qa.id + '_' + index}
            qa={qa}
            index={index}
            isExpanded={expandedQuestions.has(index)}
            onToggle={() => toggleQuestion(index)}
          />
        ))}
      </div>

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: colors.down.primary }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: colors.down.primary }}>
              Warnings
            </span>
          </div>
          <ul className="space-y-1">
            {data.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-[#6b7280] flex items-start gap-2">
                <span style={{ color: colors.down.primary }} className="flex-shrink-0">•</span>
                <span className="leading-relaxed">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export default InsightsModule
