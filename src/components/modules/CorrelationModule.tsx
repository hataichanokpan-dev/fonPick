/**
 * CorrelationModule Component
 *
 * Displays stock correlation analysis including:
 * - Rankings by sector breakdown (vs expected count)
 * - Correlation matrix visual
 * - Sector outliers display (anomaly detection)
 *
 * Answers Q6: "What we see in top ranking compare with sector?"
 * Data source: /api/correlations
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 *
 * NOTE: Sector performance data is shown in Q2: SectorRotationModule.
 * This module focuses on CORRELATION ANALYSIS between rankings and sectors.
 */

'use client'

import { Card } from '@/components/shared'
import { Badge } from '@/components/shared/Badge'
import { GitCompare, TrendingUp, AlertTriangle, Check, ExternalLink, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import type { CoverageMetrics } from '@/types/correlation'

// ==================================================================
// TYPES
// ==================================================================

export interface SectorCorrelation {
  /** Sector code */
  sector: string
  /** Sector name */
  name: string
  /** Number of stocks in rankings */
  rankingsCount: number
  /** Expected count based on sector size */
  expectedCount: number
  /** Correlation strength */
  correlation: 'Strong Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Strong Negative'
  /** Correlation score (0-100) */
  correlationScore: number
  /** Is anomaly */
  isAnomaly: boolean
  /** Anomaly type */
  anomalyType?: 'Sector Up No Rankings' | 'Sector Down Many Rankings' | 'Concentrated Rankings' | 'Divergent Performance'
}

export interface CorrelationData {
  /** Overall correlation */
  overallCorrelation: 'Strong Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Strong Negative'
  /** Correlation score (0-100) */
  correlationScore: number
  /** Per-sector correlations */
  sectors: SectorCorrelation[]
  /** Detected anomalies */
  anomalies: Array<{
    sector: string
    name: string
    type: string
    explanation: string
  }>
  /** Sector count represented in rankings */
  sectorCount: number
  /** Aligned status */
  aligned: boolean
  /** Key insights */
  insights: string[]
  /** Coverage metrics (Phase 2) */
  coverage?: CoverageMetrics
  /** Timestamp */
  timestamp: number
}

export interface CorrelationModuleProps {
  /** Pre-fetched data (optional) */
  data?: CorrelationData
  /** Additional CSS classes */
  className?: string
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

// Error State Component
interface ErrorStateProps {
  onRetry: () => void
  isRetrying: boolean
}

function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertTriangle className="w-8 h-8 text-warning mb-3" />
      <h4 className="text-sm font-semibold text-text-1 mb-1">
        Data Unavailable
      </h4>
      <p className="text-xs text-text-muted mb-4 max-w-[200px]">
        Correlation data is currently unavailable. Please try again.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-1 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        {isRetrying ? 'Retrying...' : 'Retry'}
      </button>
    </div>
  )
}

interface CorrelationScoreProps {
  score: number
  size?: number
}

function CorrelationScore({ score, size = 56 }: CorrelationScoreProps) {
  const percentage = Math.max(0, Math.min(100, score))

  const getScoreColor = (): { bg: string; fill: string } => {
    if (score >= 70) return { bg: 'rgba(46, 216, 167, 0.2)', fill: '#2ED8A7' }
    if (score >= 40) return { bg: 'rgba(247, 201, 72, 0.2)', fill: '#F7C948' }
    return { bg: 'rgba(244, 91, 105, 0.2)', fill: '#F45B69' }
  }

  const colors = getScoreColor()
  const circumference = 2 * Math.PI * ((size - 8) / 2)
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.bg}
          strokeWidth="5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.fill}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold tabular-nums" style={{ color: colors.fill }}>
          {score}
        </span>
      </div>
    </div>
  )
}

interface SectorCorrelationRowProps {
  sector: SectorCorrelation
}

function SectorCorrelationRow({ sector }: SectorCorrelationRowProps) {
  const getCorrelationColor = (): string => {
    switch (sector.correlation) {
      case 'Strong Positive':
        return '#2ED8A7'
      case 'Positive':
        return '#6FE3C1'
      case 'Neutral':
        return '#AEB7B3'
      case 'Negative':
        return '#F7A1AA'
      case 'Strong Negative':
        return '#F45B69'
      default:
        return '#AEB7B3'
    }
  }

  const correlationColor = getCorrelationColor()

  // Background based on alignment (count vs expected)
  const alignmentRatio = sector.expectedCount > 0 ? sector.rankingsCount / sector.expectedCount : 0
  const bgColor = sector.isAnomaly
    ? 'rgba(247, 201, 72, 0.15)'
    : alignmentRatio > 1.2
      ? 'rgba(46, 216, 167, 0.08)' // Over-represented
      : alignmentRatio < 0.8
        ? 'rgba(244, 91, 105, 0.08)' // Under-represented
        : 'rgba(174, 183, 179, 0.05)' // Neutral

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 p-2 rounded border border-border"
      style={{ backgroundColor: bgColor }}
    >
      {/* Sector Name */}
      <span className="text-xs font-medium text-text w-24 truncate" title={sector.name}>
        {sector.name}
      </span>

      {/* Rankings Analysis */}
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[10px] text-text-muted">
          In Rankings:
        </span>
        <span className="text-sm font-bold tabular-nums text-text-1">
          {sector.rankingsCount}
        </span>
        <span className="text-[10px] text-text-muted">
          (exp: {sector.expectedCount})
        </span>
      </div>

      {/* Correlation Badge */}
      <div className="flex items-center gap-1">
        <span
          className="text-[10px] px-2 py-0.5 rounded font-medium"
          style={{
            backgroundColor: `${correlationColor}20`,
            color: correlationColor
          }}
        >
          {sector.correlation.split(' ')[0]}
        </span>
        {sector.isAnomaly && (
          <AlertTriangle className="w-3 h-3 text-warn" />
        )}
      </div>
    </motion.div>
  )
}

interface AnomalyAlertProps {
  anomalies: CorrelationData['anomalies']
}

function AnomalyAlert({ anomalies }: AnomalyAlertProps) {
  if (anomalies.length === 0) {
    return (
      <div className="p-2 rounded bg-up-bg/10 border border-up/20 flex items-center gap-2">
        <Check className="w-3 h-3 text-up" />
        <span className="text-xs text-text-2">
          No significant anomalies detected. Rankings align with sector representation.
        </span>
      </div>
    )
  }

  return (
    <div className="p-2 rounded bg-warn/10 border border-warn/20">
      <div className="flex items-center gap-1 mb-2">
        <AlertTriangle className="w-3 h-3 text-warn" />
        <span className="text-[10px] uppercase tracking-wide text-warn">
          {anomalies.length} Anomal{anomalies.length === 1 ? 'y' : 'ies'}
        </span>
      </div>
      <div className="space-y-1">
        {anomalies.slice(0, 3).map((anomaly, i) => (
          <div key={i} className="text-xs text-text-2">
            <span className="font-medium text-text-1">{anomaly.name}</span>: {anomaly.explanation}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function CorrelationModule({ data: initialData, className }: CorrelationModuleProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  // Fetch data from API
  const { data, isLoading, error, refetch } = useQuery<CorrelationData>({
    queryKey: ['correlation'],
    queryFn: async () => {
      const res = await fetch('/api/correlations?type=vs-sector')
      if (!res.ok) throw new Error('Failed to fetch correlation data')
      return res.json()
    },
    initialData: initialData,
    // RTDB updates once daily at 18:30 - no polling needed
    refetchInterval: false,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const handleRetry = async () => {
    setIsRetrying(true)
    await refetch()
    setIsRetrying(false)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Rankings vs Sector</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
        </div>
      </Card>
    )
  }

  // Show error state instead of hiding module completely
  if (error || !data) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Rankings vs Sector</h3>
        </div>
        <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />
      </Card>
    )
  }

  // Get overall correlation badge color
  const getCorrelationColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    switch (data.overallCorrelation) {
      case 'Strong Positive':
      case 'Positive':
        return 'buy'
      case 'Strong Negative':
      case 'Negative':
        return 'sell'
      default:
        return 'neutral'
    }
  }

  // Get coverage badge color (Phase 2)
  const getCoverageColor = (): 'buy' | 'sell' | 'neutral' | 'watch' => {
    if (!data.coverage) return 'neutral'
    if (data.coverage.coveragePercent >= 80) return 'buy'
    if (data.coverage.coveragePercent >= 60) return 'watch'
    return 'sell'
  }

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Rankings vs Sector</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Coverage Badge (Phase 2) */}
          {data.coverage && (
            <Badge size="sm" color={getCoverageColor()}>
              {data.coverage.coveragePercent}% mapped
            </Badge>
          )}
          <Badge size="sm" color={getCorrelationColor()}>
            {data.overallCorrelation}
          </Badge>
          <span className="text-[10px] text-text-muted">
            {data.sectorCount} sectors
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* Correlation Score */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <CorrelationScore score={data.correlationScore} size={64} />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Correlation
          </span>
        </div>

        {/* Aligned Status */}
        <div className="flex-1 p-3 rounded bg-surface-2">
          <div className="flex items-center gap-2">
            {data.aligned ? (
              <Check className="w-4 h-4 text-up" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warn" />
            )}
            <div>
              <span className="text-xs font-medium text-text">
                Rankings {data.aligned ? 'Aligned' : 'Misaligned'}
              </span>
              <p className="text-[10px] text-text-muted mt-0.5">
                {data.aligned
                  ? 'Top rankings confirm sector distribution'
                  : 'Divergence between rankings and sector representation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Alert */}
      <div className="mt-3">
        <AnomalyAlert anomalies={data.anomalies} />
      </div>

      {/* Sector Correlations */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Sector Correlations
            </span>
          </div>
          <Link
            href="#sector-rotation"
            className="flex items-center gap-1 text-[10px] text-info hover:text-info-soft transition-colors"
          >
            <span>View Sector Performance</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {data.sectors.slice(0, 5).map((sector) => (
            <SectorCorrelationRow key={sector.sector} sector={sector} />
          ))}
        </div>
      </div>

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 mb-1">
            <Check className="w-3 h-3 text-info" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              Key Insight
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {data.insights[0]}
          </p>
        </div>
      )}
    </Card>
  )
}

export default CorrelationModule
