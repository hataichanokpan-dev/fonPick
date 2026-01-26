/**
 * MarketStatusBanner Component - Redesigned
 *
 * Sticky top banner showing live market regime, SET index, and market status.
 * Provides real-time market overview at a glance with mobile-first design.
 *
 * Design Goals:
 * - Mobile-first responsive design (40px on mobile, 48px on desktop)
 * - Professional visual hierarchy with clear information display
 * - Regime badge prominently displayed
 * - Better spacing and typography
 * - Touch-friendly sizing
 *
 * Features:
 * - Regime-based color coding (Risk-On = teal, Risk-Off = red, Neutral = gray)
 * - Confidence level badge (High/Medium/Low)
 * - Animated entrance with framer-motion
 * - Market status indicator (open/closed with pulse animation)
 * - Data age display (e.g., "2m ago")
 * - Sticky positioning with backdrop blur
 * - Responsive height (h-10 on mobile, h-12 on desktop)
 * - Animated price display with flash effect
 */

"use client";

import { motion } from "framer-motion";
import { Activity, Globe } from "lucide-react";
import { useMemo } from "react";
import { AnimatedPrice } from "@/components/shared/modern/AnimatedPrice";

// ==================================================================
// TYPES
// ==================================================================

export interface MarketStatusBannerProps {
  /** SET index value */
  setIndex: number;
  /** SET index change */
  setChange: number;
  /** SET index percentage change */
  setChangePercent: number;
  /** Whether market is currently open */
  isMarketOpen?: boolean;
  /** Last update timestamp */
  lastUpdate?: number;
  /** Market regime (for regime pill) */
  regime?: "Risk-On" | "Neutral" | "Risk-Off";
  /** Foreign net flow in millions (for Thai SET priority signal) */
  foreignFlow?: number;
  /** Concentration % of top 5 stocks (Thai SET context) */
  concentration?: number;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  Neutral: {
    bg: "rgba(174, 183, 179, 0.08)",
    border: "rgba(174, 183, 179, 0.3)",
    text: "#AEB7B3",
  },
} as const;

const REGIME_COLORS = {
  "Risk-On": {
    bg: "rgba(46, 216, 167, 0.15)",
    border: "rgba(46, 216, 167, 0.4)",
    text: "#2ED8A7",
  },
  Neutral: {
    bg: "rgba(174, 183, 179, 0.12)",
    border: "rgba(174, 183, 179, 0.3)",
    text: "#AEB7B3",
  },
  "Risk-Off": {
    bg: "rgba(244, 91, 105, 0.15)",
    border: "rgba(244, 91, 105, 0.4)",
    text: "#F45B69",
  },
} as const;

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

/**
 * Format trading value (in millions) to Thai market format
 */
function formatForeignFlow(flowInMillions: number): string {
  if (flowInMillions === 0) return "0";
  const absValue = Math.abs(flowInMillions);
  if (absValue >= 1000) {
    return `${(flowInMillions / 1000).toFixed(1)}B`;
  }
  return `${flowInMillions.toFixed(0)}M`;
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return "N/A";

  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h`;
  }

  // Days
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return `${days}d`;
}

// ==================================================================
// SUB-COMPONENTS
// ==================================================================

interface RegimePillProps {
  regime?: "Risk-On" | "Neutral" | "Risk-Off";
}

function RegimePill({ regime }: RegimePillProps) {
  if (!regime) return null;

  const colors = REGIME_COLORS[regime];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-2 py-0.5 rounded-md border text-xs font-semibold"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {regime}
    </motion.div>
  );
}

interface ForeignFlowDisplayProps {
  flow?: number;
}

function ForeignFlowDisplay({ flow }: ForeignFlowDisplayProps) {
  if (flow === undefined) return null;

  const isPositive = flow > 0;
  const flowColor = isPositive
    ? "#2ED8A7"
    : flow < 0
      ? "#F45B69"
      : "#AEB7B3";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border"
      style={{
        backgroundColor: isPositive
          ? "rgba(46, 216, 167, 0.1)"
          : flow < 0
            ? "rgba(244, 91, 105, 0.1)"
            : "rgba(174, 183, 179, 0.08)",
        borderColor: isPositive
          ? "rgba(46, 216, 167, 0.3)"
          : flow < 0
            ? "rgba(244, 91, 105, 0.3)"
            : "rgba(174, 183, 179, 0.25)",
      }}
    >
      <Globe className="w-3 h-3" style={{ color: flowColor }} />
      <span
        className="text-xs font-bold tabular-nums"
        style={{ color: flowColor }}
      >
        {isPositive && "+"}
        {formatForeignFlow(flow)}
      </span>
    </motion.div>
  );
}

interface MarketStatusIndicatorProps {
  isOpen: boolean;
}

function MarketStatusIndicator({ isOpen }: MarketStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isOpen ? "#2ED8A7" : "#AEB7B3",
        }}
        animate={isOpen ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={isOpen ? { duration: 2, repeat: Infinity } : {}}
      />
    </div>
  );
}

interface SetIndexDisplayProps {
  value: number;
  change: number;
  changePercent: number;
}

function SetIndexDisplay({
  value,
  change,
  changePercent,
}: SetIndexDisplayProps) {
  return (
    <div className="flex items-baseline gap-2">
      {/* Main SET Index Label */}
      <span className="text-md font-bold text-text sm:text-base">
        SET :
      </span>

      {/* Main SET Index Value with AnimatedPrice */}
      <AnimatedPrice
        value={value}
        previousValue={value - change}
        prefix=""
        suffix=""
        size="md"
        showChange={false}
        showIcon={false}
        decimals={2}
        className="text-md font-bold text-text sm:text-base"
      />

      {/* Change percent with AnimatedPrice */}
      <AnimatedPrice
        value={changePercent}
        previousValue={0}
        prefix="("
        suffix=")"
        size="sm"
        showChange={true}
        showIcon={true}
        decimals={2}
      />
    </div>
  );
}

interface DataFreshnessDisplayProps {
  timestamp?: number;
}

function DataFreshnessDisplay({ timestamp }: DataFreshnessDisplayProps) {
  if (!timestamp) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Activity className="w-3 h-3 text-text-3" />
      <span className="text-[10px] text-text-3 xs:text-xs tabular-nums">
        {formatTimestamp(timestamp)}
      </span>
    </div>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function MarketStatusBanner({
  setIndex,
  setChange,
  setChangePercent,
  isMarketOpen = true,
  lastUpdate,
  regime,
  foreignFlow,
  concentration,
}: MarketStatusBannerProps) {
  const colors = useMemo(() => COLORS["Neutral"], []);

  return (
    <motion.div
      role="banner"
      aria-label={`SET Index: ${setIndex.toFixed(2)}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky py-2 top-0 z-50 w-full backdrop-blur-md border-b h-14 sm:h-16 rounded-md mb-4"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="h-full px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
          {/* Left: SET Index Display */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SetIndexDisplay
              value={setIndex}
              change={setChange}
              changePercent={setChangePercent}
            />
          </div>

          {/* Center: Regime Pill + Foreign Flow (Thai SET Priority) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0">
            <RegimePill regime={regime} />
            <ForeignFlowDisplay flow={foreignFlow} />
            {concentration !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-muted tabular-nums">
                <span>Top 5: {concentration.toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Right: Market Status & Data Freshness */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <MarketStatusIndicator isOpen={isMarketOpen} />
            <DataFreshnessDisplay timestamp={lastUpdate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MarketStatusBanner;
