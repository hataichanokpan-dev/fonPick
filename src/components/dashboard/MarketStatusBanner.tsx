/**
 * MarketStatusBanner Component
 *
 * Sticky top banner showing live SET index and market status.
 * Simple, clean design matching the concept images.
 *
 * Features:
 * - SET index display with change percentage
 * - Market status indicator (open/closed with pulse animation)
 * - Data age display (e.g., "2m ago")
 * - Sticky positioning with backdrop blur
 * - Animated price display with flash effect
 */

"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
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
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  Neutral: {
    bg: "rgba(17, 24, 39, 0.85)",
    border: "rgba(148, 163, 184, 0.2)",
    text: "#94A3B8",
  },
} as const;

// ==================================================================
// UTILITY FUNCTIONS
// ==================================================================

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
    <div className="flex items-baseline gap-2 sm:gap-3">
      {/* Main SET Index Label */}
      <span className="text-sm font-semibold text-text-secondary xs:text-base">
        SET
      </span>

      {/* Main SET Index Value with AnimatedPrice */}
      <AnimatedPrice
        value={value}
        previousValue={value - change}
        prefix=""
        suffix=""
        size="lg"
        showChange={false}
        showIcon={false}
        decimals={2}
        className="text-lg font-bold tabular-nums sm:text-xl"
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
      <Activity className="w-3.5 h-3.5 text-text-muted" />
      <span className="text-[10px] text-text-muted xs:text-xs tabular-nums font-medium">
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
}: MarketStatusBannerProps) {
  const colors = useMemo(() => COLORS["Neutral"], []);

  return (
    <motion.div
      role="banner"
      aria-label={`SET Index: ${setIndex.toFixed(2)}`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full backdrop-blur-lg border-b h-14 sm:h-16 rounded-lg mb-3 shadow-sm"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="h-full px-4 py-2 sm:px-5 sm:py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4 h-full">
          {/* Left: SET Index Display */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SetIndexDisplay
              value={setIndex}
              change={setChange}
              changePercent={setChangePercent}
            />
          </div>

          {/* Right: Market Status & Data Freshness */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <MarketStatusIndicator isOpen={isMarketOpen} />
            <DataFreshnessDisplay timestamp={lastUpdate} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MarketStatusBanner;
