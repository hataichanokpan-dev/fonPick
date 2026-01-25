/**
 * ThreeSignalPanel Component
 * Displays a quick glance at the 3 key market signals
 * Based on: docs/design_rules.md
 *
 * Desktop layout (3-column equal width):
 * ┌────────────────────┬────────────────────┬────────────────────┐
 * │  📊 MARKET         │  🏢 SECTOR         │  💰 SMART          │
 * │  BULLISH           │  FINANCIAL         │  RISK-ON          │
 * │  1.33 A/D Ratio    │  +2.5%             │  Foreign +50M     │
 * │  Moderate Vol.     │  Defensive Rot.    │  Strong Buy       │
 * └────────────────────┴────────────────────┴────────────────────┘
 */

'use client'

import { BarChart3, Building2, Wallet } from 'lucide-react'
import { cn, formatDecimal } from '@/lib/utils'

// ==================================================================
// INTERFACES
// ==================================================================

export interface MarketHealthData {
  status: 'Bullish' | 'Bearish' | 'Neutral'
  adRatio: number
  volatility: 'Low' | 'Moderate' | 'High'
}

export interface SectorLeadershipData {
  leader: string
  leaderChange: number
  pattern: string
}

export interface SmartMoneyData {
  signal: 'Risk-On' | 'Risk-Off' | 'Neutral'
  foreignFlow: number
  combinedSignal: string
}

export interface ThreeSignalPanelProps {
  marketHealth: MarketHealthData
  sectorLeadership: SectorLeadershipData
  smartMoney: SmartMoneyData
  className?: string
}

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Get color classes for market status
 */
function getStatusColor(
  status: 'Bullish' | 'Bearish' | 'Neutral' | 'Risk-On' | 'Risk-Off'
): { text: string; bg: string } {
  if (status === 'Bullish' || status === 'Risk-On') {
    return { text: 'text-up-primary', bg: 'bg-up-soft' }
  }
  if (status === 'Bearish' || status === 'Risk-Off') {
    return { text: 'text-down-primary', bg: 'bg-down-soft' }
  }
  return { text: 'text-neutral', bg: 'bg-surface-2' }
}

/**
 * Get color classes for numeric values (positive/negative/neutral)
 */
function getValueColor(value: number): string {
  if (value > 0) return 'text-up-primary'
  if (value < 0) return 'text-down-primary'
  return 'text-neutral'
}

/**
 * Format foreign flow as Thai Baht with sign
 */
function formatForeignFlow(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${formatDecimal(Math.abs(value), 0)}M`
}

// ==================================================================
// SIGNAL CARD COMPONENT
// ==================================================================

interface SignalCardProps {
  icon: React.ReactNode
  title: string
  status: string
  statusColor: { text: string; bg: string }
  primaryValue: string
  primaryLabel: string
  secondaryValue?: string
  secondaryLabel?: string
}

function SignalCard({
  icon,
  title,
  status,
  statusColor,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
}: SignalCardProps) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-4 flex flex-col gap-3">
      {/* Header: Icon + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-tertiary">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{title}</span>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded text-xs font-semibold tabular-nums',
            statusColor.text,
            statusColor.bg
          )}
        >
          {status}
        </span>
      </div>

      {/* Primary Value */}
      <div className="flex flex-col">
        <span className="text-base font-semibold tabular-nums text-text-primary">
          {primaryValue}
        </span>
        <span className="text-xs text-text-tertiary">{primaryLabel}</span>
      </div>

      {/* Secondary Value (Optional) */}
      {secondaryValue && secondaryLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium tabular-nums text-text-secondary">
            {secondaryValue}
          </span>
          <span className="text-xs text-text-tertiary">{secondaryLabel}</span>
        </div>
      )}
    </div>
  )
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function ThreeSignalPanel({
  marketHealth,
  sectorLeadership,
  smartMoney,
  className,
}: ThreeSignalPanelProps) {
  // Market Health colors
  const marketHealthColor = getStatusColor(marketHealth.status)

  // Sector Leadership colors (based on leader change)
  const sectorChangeColor = getValueColor(sectorLeadership.leaderChange)

  // Smart Money colors
  const smartMoneyColor = getStatusColor(smartMoney.signal)

  // Format values (all with 2 decimal places for consistency)
  const adRatioDisplay = formatDecimal(marketHealth.adRatio, 2)
  const sectorChangeDisplay = `${sectorLeadership.leaderChange >= 0 ? '+' : ''}${formatDecimal(sectorLeadership.leaderChange, 2)}%`
  const foreignFlowDisplay = formatForeignFlow(smartMoney.foreignFlow)

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6', className)}>
      {/* MARKET HEALTH CARD */}
      <SignalCard
        icon={<BarChart3 className="w-4 h-4" />}
        title="MARKET"
        status={marketHealth.status.toUpperCase()}
        statusColor={marketHealthColor}
        primaryValue={adRatioDisplay}
        primaryLabel="A/D Ratio"
        secondaryValue={marketHealth.volatility}
        secondaryLabel="Volatility"
      />

      {/* SECTOR LEADERSHIP CARD */}
      <SignalCard
        icon={<Building2 className="w-4 h-4" />}
        title="SECTOR"
        status={sectorLeadership.leader.toUpperCase()}
        statusColor={{ text: sectorChangeColor, bg: sectorChangeColor === 'text-up-primary' ? 'bg-up-soft' : sectorChangeColor === 'text-down-primary' ? 'bg-down-soft' : 'bg-surface-2' }}
        primaryValue={sectorChangeDisplay}
        primaryLabel="Leader Change"
        secondaryValue={sectorLeadership.pattern}
        secondaryLabel="Pattern"
      />

      {/* SMART MONEY CARD */}
      <SignalCard
        icon={<Wallet className="w-4 h-4" />}
        title="SMART"
        status={smartMoney.signal.toUpperCase().replace('-', ' ')}
        statusColor={smartMoneyColor}
        primaryValue={foreignFlowDisplay}
        primaryLabel="Foreign Flow"
        secondaryValue={smartMoney.combinedSignal}
        secondaryLabel="Signal"
      />
    </div>
  )
}

export default ThreeSignalPanel
