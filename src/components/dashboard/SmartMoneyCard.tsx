/**
 * SmartMoneyCard Component
 *
 * Displays smart money / institutional activity including:
 * - Foreign flow with trend indicator
 * - Institution flow with trend indicator
 * - Retail flow (context, 60% opacity)
 * - Prop flow (context, 60% opacity)
 * - Combined signal badge (Strong Buy/Sell)
 * - Risk signal badge (Risk-On/Risk-Off)
 * - Visual score gauge (0-100)
 *
 * Answers Q3: "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"
 * Data source: /api/market-intelligence
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
import type { SmartMoneyAnalysis } from "@/types/smart-money";

// ==================================================================
// TYPES
// ==================================================================

// Use the actual SmartMoneyAnalysis type from the API
// which has investors nested structure

export interface SmartMoneyCardProps {
  /** Additional CSS classes */
  className?: string;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

const COLORS = {
  up: "#2ED8A7",
  down: "#F45B69",
  warn: "#F7C948",
  neutral: "#AEB7B3",
};

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
    if (score >= 60) return { bg: "rgba(46, 216, 167, 0.2)", fill: COLORS.up };
    if (score >= 40)
      return { bg: "rgba(174, 183, 179, 0.2)", fill: COLORS.neutral };
    return { bg: "rgba(244, 91, 105, 0.2)", fill: COLORS.down };
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
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

interface InvestorRowProps {
  label: string;
  icon: React.ReactNode;
  data: {
    todayNet?: number;
    trend?: string;
    strength?: string;
  };
  opacity?: number;
}

function InvestorRow({ label, icon, data, opacity = 1 }: InvestorRowProps) {
  // Handle missing data gracefully
  const todayNet = data.todayNet ?? 0;
  const strength = data.strength ?? "Neutral";

  const isPositive = todayNet > 0;
  const flowColor = isPositive
    ? COLORS.up
    : todayNet < 0
      ? COLORS.down
      : COLORS.neutral;
  const bgColor = isPositive
    ? `rgba(46, 216, 167, ${0.08 * opacity})`
    : todayNet < 0
      ? `rgba(244, 91, 105, ${0.08 * opacity})`
      : `rgba(174, 183, 179, ${0.08 * opacity})`;

  const getStrengthColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (strength) {
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
    if (data.trend?.includes("Buy")) return <TrendingUp className="w-3 h-3" />;
    if (data.trend?.includes("Sell"))
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
      <span
        className="text-xs font-medium text-text-muted w-16"
        style={{ opacity }}
      >
        {label}
      </span>

      {/* Flow Value */}
      <span
        className="flex-1 text-sm font-bold tabular-nums"
        style={{ color: flowColor, opacity }}
      >
        {isPositive && "+"}
        {formatTradingValue(Math.abs(todayNet))}
      </span>

      {/* Trend Icon */}
      <div style={{ color: flowColor, opacity }}>{getTrendIcon()}</div>

      {/* Signal Badge */}
      <Badge size="sm" color={getStrengthColor()}>
        {strength}
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

// Loading Skeleton
function SmartMoneySkeleton() {
  return (
    <Card padding="sm">
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

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SmartMoneyCard({ className }: SmartMoneyCardProps) {
  // Fetch data from market intelligence API
  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data?: { smartMoney: SmartMoneyAnalysis | null };
  }>({
    queryKey: ["market-intelligence", "smart-money"],
    queryFn: async () => {
      const res = await fetch("/api/market-intelligence?includeP0=true");
      if (!res.ok) throw new Error("Failed to fetch smart money data");
      return res.json();
    },
    refetchInterval: REFRESH_INTERVAL,
  });

  // Extract smart money data
  const smartMoneyData = data?.data?.smartMoney;

  if (isLoading) {
    return <SmartMoneySkeleton />;
  }

  if (error || !data?.success || !smartMoneyData) {
    return (
      <Card padding="sm" className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">Smart Money</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">
          Unable to load smart money data
        </p>
      </Card>
    );
  }

  // Get combined signal badge color
  const getSignalColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (smartMoneyData.combinedSignal) {
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
    switch (smartMoneyData.riskSignal) {
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
    <Card padding="sm" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Smart Money</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="sm" color={getSignalColor()}>
            {smartMoneyData.combinedSignal}
          </Badge>
          <Badge size="sm" color={getRiskColor()}>
            {smartMoneyData.riskSignal}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-center mb-2 mt-1">
        {/* Score Gauge */}
        <div className="item-center flex flex-col items-center text-center">
          <ScoreGauge score={smartMoneyData.score} size={56} />
          <span className="text-[9px] uppercase tracking-wide text-text-muted">
            Score
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-3">
       

        {/* Investor Flows - Access from investors property */}
        <div className="flex-1 space-y-2">
          {/* Primary (Smart Money) - 100% opacity */}
          <InvestorRow
            label="Foreign"
            icon={<Globe className="w-4 h-4" />}
            data={smartMoneyData.investors.foreign}
            opacity={1}
          />
          <InvestorRow
            label="Institution"
            icon={<Building2 className="w-4 h-4" />}
            data={smartMoneyData.investors.institution}
            opacity={1}
          />

          {/* Separator */}
          <InvestorSeparator />

          {/* Secondary (Context) - 60% opacity */}
          <InvestorRow
            label="Retail"
            icon={<Users className="w-4 h-4" />}
            data={smartMoneyData.investors.retail}
            opacity={0.6}
          />
          <InvestorRow
            label="Prop"
            icon={<Briefcase className="w-4 h-4" />}
            data={smartMoneyData.investors.prop}
            opacity={0.6}
          />
        </div>
      </div>

      {/* Primary Driver & Observations */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            Primary Driver
          </span>
          <span className="text-xs font-medium text-text capitalize">
            {smartMoneyData.primaryDriver || "None"}
          </span>
        </div>

        {/* Confidence Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted uppercase tracking-wide">
              Confidence
            </span>
            <span className="text-xs text-text-muted">
              {smartMoneyData.confidence}%
            </span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${smartMoneyData.confidence}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-info rounded-full"
            />
          </div>
        </div>

        {smartMoneyData.observations &&
          smartMoneyData.observations.length > 0 && (
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              {smartMoneyData.observations[0]}
            </p>
          )}
      </div>
    </Card>
  );
}

export default SmartMoneyCard;
