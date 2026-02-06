/**
 * TrendMetricsGrid Component
 *
 * Displays summary metrics cards for trend analysis:
 * - Total Smart Money Flow
 * - Signal Badge
 * - Confidence Score
 * - Dominant Trend
 */

"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { formatTradingValue } from "@/lib/utils";
import type { TrendAnalysisResponse } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface TrendMetricsGridProps {
  data: TrendAnalysisResponse["data"];
}

// ============================================================================
// METRIC CARD
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

function MetricCard({ label, value, change, icon, trend, color }: MetricCardProps) {
  const getTrendColor = () => {
    if (color) return color;
    if (trend === "up") return "text-[#2ED8A7]";
    if (trend === "down") return "text-[#F45B69]";
    return "text-text-secondary";
  };

  const getBgColor = () => {
    if (trend === "up") return "bg-[#2ED8A7]/10";
    if (trend === "down") return "bg-[#F45B69]/10";
    return "bg-surface-2";
  };

  const getIcon = () => {
    if (icon) return icon;
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className={`${getBgColor()} rounded-xl p-4 border border-border-subtle`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted uppercase tracking-wide">
          {label}
        </span>
        <div className={getTrendColor()}>{getIcon()}</div>
      </div>
      <div className={`text-lg font-bold tabular-nums ${getTrendColor()}`}>
        {value}
      </div>
      {change && (
        <div className="text-xs text-text-muted mt-1">{change}</div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendMetricsGrid({ data }: TrendMetricsGridProps) {
  const { summary } = data!;

  // Calculate metrics
  const totalSmartMoneyFlow = summary.totalSmartMoneyFlow;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Smart Money Flow */}
      <MetricCard
        label="Smart Money Flow"
        value={`${totalSmartMoneyFlow > 0 ? "+" : ""}${formatTradingValue(totalSmartMoneyFlow)}`}
        change={`${data!.period.days} วัน`}
        trend={totalSmartMoneyFlow > 0 ? "up" : totalSmartMoneyFlow < 0 ? "down" : "neutral"}
      />

      {/* Signal */}
      <MetricCard
        label="Signal"
        value={summary.signal}
        trend={summary.signal === "Strong Buy" || summary.signal === "Buy" ? "up" :
              summary.signal === "Strong Sell" || summary.signal === "Sell" ? "down" : "neutral"}
        color={summary.signal === "Strong Buy" || summary.signal === "Buy" ? "#2ED8A7" :
              summary.signal === "Strong Sell" || summary.signal === "Sell" ? "#F45B69" : undefined}
      />

      {/* Risk Signal */}
      <MetricCard
        label="Risk Signal"
        value={summary.riskSignal}
        trend={summary.riskSignal === "Risk-On" || summary.riskSignal === "Risk-On Mild" ? "up" :
              summary.riskSignal === "Risk-Off" || summary.riskSignal === "Risk-Off Mild" ? "down" : "neutral"}
        icon={<Activity className="w-4 h-4" />}
      />

      {/* Dominant Trend */}
      <MetricCard
        label="Dominant Trend"
        value={summary.dominantTrend === "up" ? "ขาขึ้น" :
              summary.dominantTrend === "down" ? "ขาลง" : "ออกทางเดียว"}
        trend={summary.dominantTrend === "sideways" ? "neutral" : summary.dominantTrend}
      />
    </div>
  );
}

export default TrendMetricsGrid;
