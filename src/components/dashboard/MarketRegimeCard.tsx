/**
 * MarketRegimeCard Component
 *
 * Displays market regime detection including:
 * - Current regime (Risk-On/Neutral/Risk-Off)
 * - Confidence level indicator
 * - Focus/Caution guidance
 * - Reasons for regime classification
 * - Phase 2: Prominent variant with larger display
 *
 * Answers Q1: "Is this market Risk-On or Risk-Off?"
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
  Minus,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

// ==================================================================
// TYPES
// ==================================================================

export interface MarketRegimeData {
  regime: "Risk-On" | "Neutral" | "Risk-Off";
  confidence: "High" | "Medium" | "Low";
  reasons: string[];
  focus: string;
  caution: string;
}

export interface MarketRegimeCardProps {
  /** Additional CSS classes */
  className?: string;
  /** Phase 2: Display variant - default or prominent (larger, more attention-grabbing) */
  variant?: "default" | "prominent";
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

interface RegimeIndicatorProps {
  regime: "Risk-On" | "Neutral" | "Risk-Off";
  confidence: "High" | "Medium" | "Low";
  /** Phase 2: Display variant */
  variant?: "default" | "prominent";
}

function RegimeIndicator({
  regime,
  confidence,
  variant = "default",
}: RegimeIndicatorProps) {
  const isProminent = variant === "prominent";

  const getRegimeConfig = () => {
    switch (regime) {
      case "Risk-On":
        return {
          color: COLORS.up,
          bgColor: "rgba(46, 216, 167, 0.15)",
          bgGradient:
            "linear-gradient(135deg, rgba(46, 216, 167, 0.2) 0%, rgba(46, 216, 167, 0.05) 100%)",
          icon: <TrendingUp className="w-5 h-5" />,
          label: "Risk-On",
          description: "Bullish environment",
        };
      case "Risk-Off":
        return {
          color: COLORS.down,
          bgColor: "rgba(244, 91, 105, 0.15)",
          bgGradient:
            "linear-gradient(135deg, rgba(244, 91, 105, 0.2) 0%, rgba(244, 91, 105, 0.05) 100%)",
          icon: <TrendingDown className="w-5 h-5" />,
          label: "Risk-Off",
          description: "Bearish environment",
        };
      default:
        return {
          color: COLORS.neutral,
          bgColor: "rgba(174, 183, 179, 0.15)",
          bgGradient:
            "linear-gradient(135deg, rgba(174, 183, 179, 0.2) 0%, rgba(174, 183, 179, 0.05) 100%)",
          icon: <Minus className="w-5 h-5" />,
          label: "Neutral",
          description: "Mixed signals",
        };
    }
  };

  const getConfidenceConfig = () => {
    switch (confidence) {
      case "High":
        return { width: "100%", color: COLORS.up };
      case "Medium":
        return { width: "66%", color: COLORS.warn };
      default:
        return { width: "33%", color: COLORS.down };
    }
  };

  const regimeConfig = getRegimeConfig();
  const confidenceConfig = getConfidenceConfig();

  // Phase 2: Icon size based on variant
  const iconSize = isProminent ? "w-12 h-12" : "w-14 h-14";
  const iconInnerSize = isProminent ? "w-6 h-6" : "w-7 h-7";
  const labelSize = isProminent ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-4">
      {/* Icon with background */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${iconSize} rounded-full flex items-center justify-center`}
        style={{
          backgroundColor: regimeConfig.bgColor,
          // Phase 2: Add animated gradient for prominent variant
          ...(isProminent && regime !== "Neutral"
            ? {
                background: regimeConfig.bgGradient,
              }
            : {}),
        }}
      >
        <div
          style={{
            color: regimeConfig.color,
          }}
          className={iconInnerSize}
        >
          {regimeConfig.icon}
        </div>
      </motion.div>

      {/* Regime Label */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-bold ${labelSize}`}
            style={{ color: regimeConfig.color }}
          >
            {regimeConfig.label}
          </span>
          <Badge
            size={isProminent ? "md" : "sm"}
            color={
              confidence === "High"
                ? "buy"
                : confidence === "Medium"
                  ? "watch"
                  : "sell"
            }
          >
            {confidence}
          </Badge>
        </div>
        <span
          className={`text-text-muted ${isProminent ? "text-sm" : "text-xs"}`}
        >
          {regimeConfig.description}
          {/* Confidence Bar */}
          <div className="flex flex-col  gap-1">
            <span className="text-[9px] uppercase tracking-wide text-text-muted">
              Confidence
            </span>
            <div
              className={`h-1.5 bg-surface-2 rounded-full overflow-hidden ${isProminent ? "w-20" : "w-16"}`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: confidenceConfig.width }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: confidenceConfig.color }}
              />
            </div>
          </div>
        </span>
      </div>
    </div>
  );
}

interface ReasonItemProps {
  reason: string;
  index: number;
}

function ReasonItem({ reason, index }: ReasonItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-2 text-xs text-text-muted"
    >
      <div
        className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
        style={{ backgroundColor: COLORS.neutral }}
      />
      <span className="leading-relaxed">{reason}</span>
    </motion.div>
  );
}

// Loading Skeleton
interface MarketRegimeSkeletonProps {
  /** Display variant for skeleton */
  variant?: "default" | "prominent";
}

function MarketRegimeSkeleton({
  variant = "default",
}: MarketRegimeSkeletonProps) {
  const isProminent = variant === "prominent";
  const iconSize = isProminent ? "w-20 h-20" : "w-14 h-14";

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">Market Regime</h3>
      </div>
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-4">
          <div className={`${iconSize} rounded-full bg-surface-2`} />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-surface-2 rounded w-24" />
            <div className="h-3 bg-surface-2 rounded w-32" />
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-2">
          <div className="h-3 bg-surface-2 rounded" />
          <div className="h-3 bg-surface-2 rounded w-4/5" />
        </div>
      </div>
    </Card>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function MarketRegimeCard({
  className,
  variant = "default",
}: MarketRegimeCardProps) {
  // Fetch data from market intelligence API
  const { data, isLoading, error } = useQuery<{
    success: boolean;
    data?: { regime: MarketRegimeData | null };
  }>({
    queryKey: ["market-intelligence", "regime"],
    queryFn: async () => {
      const res = await fetch("/api/market-intelligence?includeP0=true");
      if (!res.ok) throw new Error("Failed to fetch market regime data");
      return res.json();
    },
    refetchInterval: REFRESH_INTERVAL,
  });

  // Extract regime data
  const regimeData = data?.data?.regime;

  if (isLoading) {
    return <MarketRegimeSkeleton variant={variant} />;
  }

  if (error || !data?.success || !regimeData) {
    return (
      <Card
        padding="sm"
        className={className}
        // Phase 2: Support lg:col-span-2 for prominent variant
        {...(variant === "prominent" && { "data-lg-col-span": "2" })}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">Market Regime</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-2">
          <AlertTriangle className="w-4 h-4 text-warn flex-shrink-0" />
          <span className="text-xs text-text-muted">
            Unable to load regime data
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="sm"
      className={className}
      // Phase 2: Support lg:col-span-2 for prominent variant
      {...(variant === "prominent" && { "data-lg-col-span": "2" })}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">Market Regime</h3>
        </div>
      </div>

      {/* Regime Indicator */}
      <div className="mb-4">
        <RegimeIndicator
          regime={regimeData.regime}
          confidence={regimeData.confidence}
          variant={variant}
        />
      </div>

      {/* Focus Section */}
      <div className="mb-3 p-3 rounded-lg bg-surface-2 border-l-2 border-up">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3 h-3" style={{ color: COLORS.up }} />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Focus
          </span>
        </div>
        <p className="text-sm text-text leading-snug">{regimeData.focus}</p>
      </div>

      {/* Caution Section */}
      <div className="mb-4 p-3 rounded-lg bg-surface-2 border-l-2 border-down">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-3 h-3" style={{ color: COLORS.down }} />
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            Caution
          </span>
        </div>
        <p className="text-sm text-text leading-snug">{regimeData.caution}</p>
      </div>

      {/* Reasons */}
      {regimeData.reasons && regimeData.reasons.length > 0 && (
        <div className="pt-3 border-t border-border">
          <span className="text-[10px] uppercase tracking-wide text-text-muted block mb-2">
            Key Indicators
          </span>
          <div className="space-y-1.5">
            {regimeData.reasons.slice(0, 3).map((reason, index) => (
              <ReasonItem key={index} reason={reason} index={index} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default MarketRegimeCard;
