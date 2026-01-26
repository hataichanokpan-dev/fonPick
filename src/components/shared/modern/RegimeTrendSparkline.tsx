/**
 * RegimeTrendSparkline Component
 *
 * Displays a 7-day regime history as a mini sparkline chart.
 * Shows the trend of Risk-On/Neutral/Risk-Off states over time.
 *
 * Features:
 * - Mini sparkline with colored segments
 * - Current regime indicator
 * - Trend annotation (e.g., "Improved from Neutral")
 * - Accessible tooltips with regime history
 *
 * Phase 2: Can be enhanced with actual historical regime data
 * from /api/market-intelligence with historical lookback
 */

"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type RegimeType = "Risk-On" | "Neutral" | "Risk-Off";

export interface RegimeDataPoint {
  date: Date;
  regime: RegimeType;
}

export interface RegimeTrendSparklineProps {
  /** Current regime */
  currentRegime: RegimeType;
  /** Optional: Historical regime data (7 days) */
  history?: RegimeDataPoint[];
  /** Height of the sparkline */
  height?: number;
  /** Width of the sparkline */
  width?: number;
  /** Whether to show trend annotation */
  showAnnotation?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REGIME_CONFIG = {
  "Risk-On": {
    color: "#2ED8A7",
    value: 2,
    icon: <TrendingUp className="w-3 h-3" />,
    label: "Risk-On",
  },
  Neutral: {
    color: "#AEB7B3",
    value: 1,
    icon: <Minus className="w-3 h-3" />,
    label: "Neutral",
  },
  "Risk-Off": {
    color: "#F45B69",
    value: 0,
    icon: <TrendingDown className="w-3 h-3" />,
    label: "Risk-Off",
  },
} as const;

const DEFAULT_HISTORY: RegimeDataPoint[] = [
  // Default placeholder data - shows recent upward trend
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), regime: "Risk-Off" },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), regime: "Risk-Off" },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), regime: "Neutral" },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), regime: "Neutral" },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), regime: "Neutral" },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), regime: "Risk-On" },
  { date: new Date(), regime: "Risk-On" },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRegimeTrend(history: RegimeDataPoint[]): {
  direction: "up" | "down" | "flat";
  previous: RegimeType;
} {
  if (history.length < 2) {
    return { direction: "flat", previous: history[0]?.regime || "Neutral" };
  }

  const first = history[0].regime;
  const last = history[history.length - 1].regime;
  const firstValue = REGIME_CONFIG[first].value;
  const lastValue = REGIME_CONFIG[last].value;

  if (lastValue > firstValue) return { direction: "up", previous: first };
  if (lastValue < firstValue) return { direction: "down", previous: first };
  return { direction: "flat", previous: first };
}

function getTrendAnnotation(
  _current: RegimeType,
  trend: { direction: "up" | "down" | "flat"; previous: RegimeType }
): string | null {
  if (trend.direction === "up") {
    return `Improved from ${trend.previous}`;
  }
  if (trend.direction === "down") {
    return `Weakened from ${trend.previous}`;
  }
  return null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SparklineSegmentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  regime: RegimeType;
  index: number;
}

function SparklineSegment({
  x,
  y,
  width,
  height,
  color,
  regime,
  index,
}: SparklineSegmentProps) {
  return (
    <motion.rect
      initial={{ y: y + height, height: 0 }}
      animate={{ y, height }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      rx="2"
      className="hover:opacity-80 transition-opacity cursor-crosshair"
    >
      <title>{`${regime} (${index + 1}/7)`}</title>
    </motion.rect>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RegimeTrendSparkline({
  currentRegime,
  history = DEFAULT_HISTORY,
  height = 24,
  width = 120,
  showAnnotation = true,
}: RegimeTrendSparklineProps) {
  // Use provided history or append current regime to default history
  const displayHistory = useMemo(() => {
    if (history.length > 0) {
      // Ensure last point is current regime
      const last = history[history.length - 1];
      if (last.regime !== currentRegime) {
        return [...history.slice(0, -1), { ...last, regime: currentRegime }];
      }
      return history;
    }
    return [{ date: new Date(), regime: currentRegime }];
  }, [history, currentRegime]);

  const trend = useMemo(() => getRegimeTrend(displayHistory), [displayHistory]);
  const annotation = useMemo(
    () => showAnnotation && getTrendAnnotation(currentRegime, trend),
    [currentRegime, trend, showAnnotation]
  );

  const segmentWidth = width / Math.max(displayHistory.length, 7);

  return (
    <div className="flex items-center gap-2">
      {/* Sparkline */}
      <svg width={width} height={height} className="flex-shrink-0">
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="rgba(174, 183, 179, 0.1)"
          rx="3"
        />

        {/* Regime bars */}
        {displayHistory.slice(-7).map((point, index) => {
          const config = REGIME_CONFIG[point.regime];
          const barHeight = (config.value / 2) * (height - 4); // 2 is for padding
          const x = index * segmentWidth;
          const y = height - barHeight - 2;

          return (
            <SparklineSegment
              key={index}
              x={x + 1} // +1 for padding
              y={y}
              width={segmentWidth - 2} // -2 for padding
              height={barHeight}
              color={config.color}
              regime={point.regime}
              index={index}
            />
          );
        })}
      </svg>

      {/* Current regime icon */}
      <div
        className="flex items-center justify-center w-5 h-5 rounded-full"
        style={{
          backgroundColor: REGIME_CONFIG[currentRegime].color,
          opacity: 0.2,
        }}
      >
        <div style={{ color: REGIME_CONFIG[currentRegime].color }}>
          {REGIME_CONFIG[currentRegime].icon}
        </div>
      </div>

      {/* Trend annotation */}
      {annotation && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-[9px] text-text-muted tabular-nowrap"
        >
          ↑ {annotation}
        </motion.span>
      )}
    </div>
  );
}

export default RegimeTrendSparkline;
