/**
 * VolumeAnalysisModule Component
 *
 * Displays volume analysis including:
 * - Volume health gauge (0-100) - visual gauge showing health score
 * - VWAD conviction badge (Bullish/Bearish/Neutral) with color coding
 * - Concentration index with level badge (Healthy/Normal/Risky)
 * - Top 5 volume leaders table showing symbol, volume, relative volume, price change
 * - Trend indicator for 5-day volume trend
 *
 * Volume is the "fuel" that drives price movements - this module shows
 * the conviction behind price action.
 *
 * Data source: /api/volume
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 16px padding, large prominent numbers, tabular-nums for all numbers
 */

"use client";

import { Card } from "@/components/shared";
import { Badge } from "@/components/shared/Badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Flame,
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatTradingValue, formatPercentage, formatDecimal } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";

// ==================================================================
// TYPES
// ==================================================================

export interface VolumeHealthData {
  currentVolume: number;
  averageVolume: number;
  healthScore: number;
  healthStatus: "Anemic" | "Normal" | "Strong" | "Explosive";
  trend: "Up" | "Down" | "Neutral";
}

export interface VWADData {
  vwad: number;
  conviction: "Bullish" | "Bearish" | "Neutral";
  upVolume: number;
  downVolume: number;
  totalVolume: number;
}

export interface ConcentrationData {
  top5Volume: number;
  totalVolume: number;
  concentration: number;
  concentrationLevel: "Healthy" | "Normal" | "Risky";
}

export interface VolumeLeader {
  symbol: string;
  volume: number;
  relativeVolume: number;
  priceChange: number;
}

export interface VolumeAnalysisData {
  health: VolumeHealthData;
  vwad: VWADData;
  concentration: ConcentrationData;
  volumeLeaders: VolumeLeader[];
  timestamp: number;
}

export interface VolumeAnalysisModuleProps {
  /** Pre-fetched data (optional) */
  data?: VolumeAnalysisData;
  /** Additional CSS classes */
  className?: string;
}

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

// Error State Component
interface ErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
}

function ErrorState({ onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertTriangle className="w-8 h-8 text-warning mb-3" />
      <h4 className="text-sm font-semibold text-text-1 mb-1">
        Data Unavailable
      </h4>
      <p className="text-xs text-text-muted mb-4 max-w-[200px]">
        Volume analysis data is currently unavailable. Please try again.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-1 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "Retrying..." : "Retry"}
      </button>
    </div>
  );
}

interface HealthGaugeProps {
  score: number;
  status: VolumeHealthData["healthStatus"];
  trend: VolumeHealthData["trend"];
  currentVolume: number;
}

function HealthGauge({
  score,
  status,
  trend,
  currentVolume,
}: HealthGaugeProps) {
  // Determine color based on health score
  const getHealthColor = (): { bg: string; fill: string } => {
    if (score >= 70) return { bg: "rgba(74, 222, 128, 0.2)", fill: "#4ade80" };
    if (score >= 40) return { bg: "rgba(249, 115, 22, 0.2)", fill: "#f97316" };
    return { bg: "rgba(255, 107, 107, 0.2)", fill: "#ff6b6b" };
  };

  const colors = getHealthColor();
  const size = 64;
  const circumference = 2 * Math.PI * ((size - 8) / 2);
  const percentage = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (percentage / 100) * circumference;

  // Get trend icon
  const getTrendIcon = () => {
    if (trend === "Up") return <TrendingUp className="w-3 h-3" />;
    if (trend === "Down") return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Gauge */}
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
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: colors.fill }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Status & Trend */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span
            className="text-sm font-semibold"
            style={{ color: colors.fill }}
          >
            {status}
          </span>
          {getTrendIcon()}
        </div>
        <span className="text-xs text-text-2 tabular-nums">
          {formatTradingValue(currentVolume)}
        </span>
      </div>
    </div>
  );
}

interface VolumeLeaderRowProps {
  rank: number;
  leader: VolumeLeader;
}

function VolumeLeaderRow({ rank, leader }: VolumeLeaderRowProps) {
  const isPositive = leader.priceChange >= 0;
  const changeColor = isPositive ? "#4ade80" : "#ff6b6b";
  const bgColor = isPositive
    ? "rgba(74, 222, 128, 0.08)"
    : "rgba(255, 107, 107, 0.08)";

  // Determine if relative volume is unusual (2x+)
  const isUnusual = leader.relativeVolume >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className="flex items-center gap-2 p-2 rounded"
      style={{ backgroundColor: bgColor }}
    >
      {/* Rank */}
      <span className="text-xs font-semibold w-4 text-text-2 tabular-nums">
        {rank}
      </span>

      {/* Symbol */}
      <span className="text-sm font-medium text-text flex-1 min-w-0">
        {leader.symbol}
      </span>

      {/* Volume */}
      <span className="text-sm font-semibold tabular-nums text-text-1">
        {formatTradingValue(leader.volume)}
      </span>

      {/* Relative Volume with fire indicator */}
      <div className="flex items-center gap-1">
        {isUnusual && <Flame className="w-3 h-3 text-warning" />}
        <span className="text-xs font-medium tabular-nums text-text-2">
          {formatDecimal(leader.relativeVolume, 1)}x
        </span>
      </div>

      {/* Price Change */}
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: changeColor }}
      >
        {formatPercentage(leader.priceChange, 1)}
      </span>
    </motion.div>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function VolumeAnalysisModule({
  data: initialData,
  className,
}: VolumeAnalysisModuleProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  // Fetch data from API
  const { data, isLoading, error, refetch } = useQuery<VolumeAnalysisData>({
    queryKey: ["volume"],
    queryFn: async () => {
      const res = await fetch("/api/volume");
      if (!res.ok) throw new Error("Failed to fetch volume data");
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

  const handleRetry = async () => {
    setIsRetrying(true);
    await refetch();
    setIsRetrying(false);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Volume Analysis</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-14 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
        </div>
      </Card>
    );
  }

  // Show error state instead of hiding module completely
  if (error || !data) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-2">Volume Analysis</h3>
        </div>
        <ErrorState onRetry={handleRetry} isRetrying={isRetrying} />
      </Card>
    );
  }

  // Get VWAD conviction badge color
  const getConvictionColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (data.vwad.conviction) {
      case "Bullish":
        return "buy";
      case "Bearish":
        return "sell";
      default:
        return "neutral";
    }
  };

  // Get concentration level badge color
  const getConcentrationColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (data.concentration.concentrationLevel) {
      case "Healthy":
        return "buy";
      case "Normal":
        return "neutral";
      case "Risky":
        return "watch";
      default:
        return "neutral";
    }
  };

  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Volume Analysis</h3>
        </div>
        <Badge size="sm" color={getConvictionColor()}>
          {data.vwad.conviction}
        </Badge>
      </div>

      {/* Volume Health Gauge */}
      <div className="mb-4 p-3 rounded-lg bg-surface-2 border border-border">
        <div className="flex items-center justify-between">
          <HealthGauge
            score={data.health.healthScore}
            status={data.health.healthStatus}
            trend={data.health.trend}
            currentVolume={data.health.currentVolume}
          />
        </div>

        {/* Health bar visualization */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              vs 5-Day Avg
            </span>
            <span className="text-xs text-text-muted tabular-nums">
              {formatTradingValue(data.health.averageVolume)}
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, data.health.healthScore)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                backgroundColor:
                  data.health.healthScore >= 70
                    ? "#4ade80"
                    : data.health.healthScore >= 40
                      ? "#f97316"
                      : "#ff6b6b",
              }}
            />
          </div>
        </div>
      </div>

      {/* VWAD & Concentration */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* VWAD */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="flex items-center gap-1 mb-2">
            <Activity className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              VWAD
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-text-1">
              {data.vwad.vwad > 0 ? "+" : ""}
              {formatDecimal(data.vwad.vwad, 1)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-text-muted">Up/Down Vol</span>
            <span className="text-xs text-text-muted tabular-nums">
              {formatTradingValue(data.vwad.upVolume)} /{" "}
              {formatTradingValue(data.vwad.downVolume)}
            </span>
          </div>
        </div>

        {/* Concentration */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-text-muted" />
              <span className="text-[10px] uppercase tracking-wide text-text-muted">
                Concentration
              </span>
            </div>
            <Badge size="sm" color={getConcentrationColor()}>
              {data.concentration.concentrationLevel}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tabular-nums text-text-1">
              {formatDecimal(data.concentration.concentration, 1)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, data.concentration.concentration)}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                backgroundColor:
                  data.concentration.concentration >= 40
                    ? "#ff6b6b"
                    : data.concentration.concentration >= 25
                      ? "#f97316"
                      : "#4ade80",
              }}
            />
          </div>
        </div>
      </div>

      {/* Top 5 Volume Leaders */}
      <div>
        <div className="flex items-center gap-1 mb-2">
          <Flame className="w-3 h-3 text-warning" />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Top Volume Leaders
          </span>
        </div>
        <div className="space-y-1">
          {data.volumeLeaders.slice(0, 5).map((leader, index) => (
            <VolumeLeaderRow
              key={leader.symbol}
              rank={index + 1}
              leader={leader}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default VolumeAnalysisModule;
