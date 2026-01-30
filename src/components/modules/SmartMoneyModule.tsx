/**
 * SmartMoneyModule Component
 *
 * Displays smart money / institutional activity including:
 * - Foreign flow with trend indicator
 * - Institution flow with trend indicator
 * - Retail flow with trend indicator (context, 60% opacity)
 * - Prop flow with trend indicator (context, 60% opacity)
 * - Combined signal badge (Strong Buy/Sell)
 * - Visual score gauge (0-100)
 *
 * Answers Q3: "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"
 * Data source: /api/smart-money
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

"use client";

import { Card } from "@/components/shared";
import { Badge } from "@/components/shared/Badge";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  Users,
  Briefcase,
  Gauge,
} from "lucide-react";
import { formatTradingValue } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

// ==================================================================
// TYPES
// ==================================================================

export interface InvestorFlowData {
  /** Today's net flow (millions THB) */
  todayNet: number;
  /** Flow trend */
  trend:
    | "Accelerating Buy"
    | "Stable Buy"
    | "Decreasing Buy"
    | "Neutral"
    | "Decreasing Sell"
    | "Stable Sell"
    | "Accelerating Sell";
  /** 5-day cumulative flow */
  trend5Day: number;
  /** Signal strength */
  strength: "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";
}

export interface SmartMoneyData {
  /** Foreign investor data */
  foreign: InvestorFlowData;
  /** Institution data */
  institution: InvestorFlowData;
  /** Retail investor data (optional) */
  retail?: InvestorFlowData;
  /** Prop trading data (optional) */
  prop?: InvestorFlowData;
  /** Combined signal */
  combinedSignal: "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";
  /** Risk signal */
  riskSignal:
    | "Risk-On"
    | "Risk-On Mild"
    | "Neutral"
    | "Risk-Off Mild"
    | "Risk-Off";
  /** Smart money score (0-100) */
  score: number;
  /** Confidence (0-100) */
  confidence: number;
  /** Primary driver */
  primaryDriver?: "foreign" | "institution" | "both" | "none";
  /** Key observations */
  observations: string[];
  /** Timestamp */
  timestamp: number;
}

export interface SmartMoneyModuleProps {
  /** Pre-fetched data (optional) */
  data?: SmartMoneyData;
  /** Additional CSS classes */
  className?: string;
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function ScoreGauge({ score, size = 56 }: ScoreGaugeProps) {
  // Calculate gauge arc based on score (0-100)
  const percentage = Math.max(0, Math.min(100, score));

  // Determine color based on score
  const getGaugeColor = (): { bg: string; fill: string } => {
    if (score >= 60) return { bg: "rgba(46, 216, 167, 0.2)", fill: "#2ED8A7" };
    if (score >= 40) return { bg: "rgba(174, 183, 179, 0.2)", fill: "#AEB7B3" };
    return { bg: "rgba(244, 91, 105, 0.2)", fill: "#F45B69" };
  };

  const colors = getGaugeColor();
  const circumference = 2 * Math.PI * ((size - 8) / 2);
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={colors.bg}
          strokeWidth="5"
        />
        {/* Foreground arc */}
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
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color: colors.fill }}>
          {score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

interface InvestorRowProps {
  label: string;
  icon: React.ReactNode;
  data: InvestorFlowData;
  variant: "foreign" | "institution" | "retail" | "prop";
  opacity?: number;
}

function InvestorRow({
  label,
  icon,
  data,
  variant: _variant,
  opacity = 1,
}: InvestorRowProps) {
  const isPositive = data.todayNet > 0;
  const flowColor = isPositive
    ? "#2ED8A7"
    : data.todayNet < 0
      ? "#F45B69"
      : "#AEB7B3";
  const bgColor = isPositive
    ? `rgba(46, 216, 167, ${0.08 * opacity})`
    : data.todayNet < 0
      ? `rgba(244, 91, 105, ${0.08 * opacity})`
      : `rgba(174, 183, 179, ${0.08 * opacity})`;

  const getStrengthColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (data.strength) {
      case "Strong Buy":
      case "Buy":
        return "buy";
      case "Strong Sell":
      case "Sell":
        return "sell";
      default:
        return "neutral";
    }
  };

  const getTrendIcon = () => {
    if (data.trend.includes("Buy")) return <TrendingUp className="w-3 h-3" />;
    if (data.trend.includes("Sell"))
      return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded"
      style={{ backgroundColor: bgColor, opacity }}
    >
      {/* Icon */}
      <div className="flex-shrink-0" style={{ color: flowColor, opacity }}>
        {icon}
      </div>

      {/* Label */}
      <span className="text-xs font-medium text-text-muted w-16" style={{ opacity }}>
        {label}
      </span>

      {/* Flow Value */}
      <span
        className="flex-1 text-sm font-bold tabular-nums"
        style={{ color: flowColor, opacity }}
      >
        {isPositive && "+"}
        {formatTradingValue(Math.abs(data.todayNet))}
      </span>

      {/* Trend Icon */}
      <div style={{ color: flowColor, opacity }}>{getTrendIcon()}</div>

      {/* Signal Badge */}
      <Badge size="sm" color={getStrengthColor()}>
        {data.strength}
      </Badge>
    </div>
  );
}

// Separator between smart money and context investors
function InvestorSeparator() {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] uppercase tracking-wider text-text-muted">
        Context
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SmartMoneyModule({
  data: initialData,
  className,
}: SmartMoneyModuleProps) {
  // Fetch data from API
  const { data, isLoading, error } = useQuery<SmartMoneyData>({
    queryKey: ["smart-money"],
    queryFn: async () => {
      const res = await fetch("/api/smart-money");
      if (!res.ok) throw new Error("Failed to fetch smart money data");
      return res.json();
    },
    initialData: initialData,
    // RTDB updates once daily at 18:30 - no polling needed
    refetchInterval: false,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Smart Money</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-14 bg-surface-2 rounded" />
          <div className="h-14 bg-surface-2 rounded" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Smart Money</h3>
        </div>
        <p className="text-text-muted text-xs">
          Unable to load smart money data
        </p>
      </Card>
    );
  }

  // Get combined signal badge color
  const getSignalColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (data.combinedSignal) {
      case "Strong Buy":
      case "Buy":
        return "buy";
      case "Strong Sell":
      case "Sell":
        return "sell";
      default:
        return "neutral";
    }
  };

  // Get risk signal badge color
  const getRiskColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (data.riskSignal) {
      case "Risk-On":
      case "Risk-On Mild":
        return "buy";
      case "Risk-Off":
      case "Risk-Off Mild":
        return "sell";
      default:
        return "neutral";
    }
  };

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Smart Money</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" color={getSignalColor()}>
            {data.combinedSignal}
          </Badge>
          <Badge size="sm" color={getRiskColor()}>
            {data.riskSignal}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
        {/* Score Gauge - responsive size */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <ScoreGauge score={data.score} size={56} />
          <span className="text-[9px] uppercase tracking-wide text-text-muted">
            Score
          </span>
        </div>

        {/* Investor Flows */}
        <div className="flex-1 space-y-2">
          {/* Primary (Smart Money) - 100% opacity */}
          <InvestorRow
            label="Foreign"
            icon={<Globe className="w-4 h-4" />}
            data={data.foreign}
            variant="foreign"
            opacity={1}
          />
          <InvestorRow
            label="Institution"
            icon={<Building2 className="w-4 h-4" />}
            data={data.institution}
            variant="institution"
            opacity={1}
          />

          {/* Separator */}
          <InvestorSeparator />

          {/* Secondary (Context) - 60% opacity */}
          {data.retail && (
            <InvestorRow
              label="Retail"
              icon={<Users className="w-4 h-4" />}
              data={data.retail}
              variant="retail"
              opacity={0.6}
            />
          )}
          {data.prop && (
            <InvestorRow
              label="Prop"
              icon={<Briefcase className="w-4 h-4" />}
              data={data.prop}
              variant="prop"
              opacity={0.6}
            />
          )}
        </div>
      </div>

      {/* Primary Driver & Observations */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            Primary Driver
          </span>
          <span className="text-xs font-medium text-text-1 capitalize">
            {data.primaryDriver || "None"}
          </span>
        </div>

        {/* Confidence Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wide">
              Confidence
            </span>
            <span className="text-xs text-text-muted">{data.confidence}%</span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.confidence}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-info rounded-full"
            />
          </div>
        </div>

        {data.observations && data.observations.length > 0 && (
          <p className="mt-2 text-xs text-text-muted leading-relaxed">
            {data.observations[0]}
          </p>
        )}
      </div>
    </Card>
  );
}

export default SmartMoneyModule;
