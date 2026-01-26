/**
 * FlowMiniBars Component
 *
 * Displays 5-day flow history as mini bar charts for foreign and institution.
 * Shows the trend of smart money flow over time with color-coded bars.
 *
 * Features:
 * - Side-by-side foreign and institution flow bars
 * - 5-day history display
 * - Color-coded by positive/negative flow
 * - Animated bar heights
 * - Tooltips with exact values
 *
 * Thai SET Context:
 * - Foreign flow is PRIMARY (shown first/left)
 * - Institution flow is SECONDARY (shown second/right)
 */

"use client";

import { motion } from "framer-motion";
import { Globe, Building2 } from "lucide-react";
import { useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FlowDataPoint {
  date: Date;
  value: number; // Flow in millions
}

export interface FlowMiniBarsProps {
  /** Foreign flow data (5 days) */
  foreignFlow?: FlowDataPoint[];
  /** Institution flow data (5 days) */
  institutionFlow?: FlowDataPoint[];
  /** Height of each bar */
  barHeight?: number;
  /** Width of the entire component */
  width?: number;
  /** Bar width */
  barWidth?: number;
  /** Gap between bars */
  gap?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_HISTORY: FlowDataPoint[] = [
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 500 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 800 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: -200 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 1200 },
  { date: new Date(), value: 1200 },
];

const COLORS = {
  positive: "#2ED8A7",
  negative: "#F45B69",
  neutral: "#AEB7B3",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatFlowValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}B`;
  }
  return `${value.toFixed(0)}M`;
}

function getBarColor(value: number): string {
  if (value > 0) return COLORS.positive;
  if (value < 0) return COLORS.negative;
  return COLORS.neutral;
}

function getMaxAbsValue(data: FlowDataPoint[]): number {
  if (data.length === 0) return 1000;
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)));
  return maxAbs > 0 ? maxAbs : 1000;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FlowBarProps {
  value: number;
  maxValue: number;
  height: number;
  width: number;
  x: number;
  color: string;
  index: number;
}

function FlowBar({ value, maxValue, height, width, x, color, index }: FlowBarProps) {
  const absValue = Math.abs(value);
  const barHeight = (absValue / maxValue) * height;

  // Center the bar vertically (positive goes up from center, negative goes down)
  const centerY = height / 2;
  const y = value >= 0 ? centerY - barHeight : centerY;

  return (
    <motion.rect
      initial={{ height: 0, y: centerY }}
      animate={{ height: barHeight, y }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      x={x}
      y={y}
      width={width}
      height={barHeight}
      fill={color}
      rx="2"
      className="hover:opacity-80 transition-opacity cursor-crosshair"
    >
      <title>{`${value >= 0 ? "+" : ""}${formatFlowValue(value)}`}</title>
    </motion.rect>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FlowMiniBars({
  foreignFlow = DEFAULT_HISTORY,
  institutionFlow,
  barHeight = 40,
  width = 140,
  barWidth = 12,
  gap = 4,
}: FlowMiniBarsProps) {
  // Generate default institution flow if not provided
  const displayInstitutionFlow = useMemo(() => {
    if (institutionFlow) return institutionFlow;
    // Generate placeholder data that's different from foreign
    return DEFAULT_HISTORY.map((d, i) => ({
      date: d.date,
      value: d.value * 0.6 + (i % 2 === 0 ? 100 : -100),
    }));
  }, [institutionFlow]);

  // Calculate max values for each flow type
  const maxForeignValue = useMemo(
    () => getMaxAbsValue(foreignFlow || []),
    [foreignFlow]
  );
  const maxInstitutionValue = useMemo(
    () => getMaxAbsValue(displayInstitutionFlow),
    [displayInstitutionFlow]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Foreign Flow (PRIMARY for Thai SET) */}
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Globe className="w-3 h-3" style={{ color: COLORS.positive }} />
        </div>

        {/* Bars */}
        <svg width={width} height={barHeight} className="flex-shrink-0">
          {/* Zero line */}
          <line
            x1={0}
            y1={barHeight / 2}
            x2={width}
            y2={barHeight / 2}
            stroke="rgba(174, 183, 179, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Flow bars */}
          {(foreignFlow || DEFAULT_HISTORY).slice(-5).map((point, index) => {
            const x = index * (barWidth + gap);
            return (
              <FlowBar
                key={`foreign-${index}`}
                value={point.value}
                maxValue={maxForeignValue}
                height={barHeight}
                width={barWidth}
                x={x}
                color={getBarColor(point.value)}
                index={index}
              />
            );
          })}
        </svg>

        {/* Latest value */}
        <div className="flex-shrink-0 text-right">
          <span
            className="text-xs font-bold tabular-nums"
            style={{
              color: getBarColor(
                (foreignFlow || DEFAULT_HISTORY)[
                  (foreignFlow || DEFAULT_HISTORY).length - 1
                ].value
              ),
            }}
          >
            {(foreignFlow || DEFAULT_HISTORY)[
              (foreignFlow || DEFAULT_HISTORY).length - 1
            ].value >= 0 && "+"}
            {formatFlowValue(
              (foreignFlow || DEFAULT_HISTORY)[
                (foreignFlow || DEFAULT_HISTORY).length - 1
              ].value
            )}
          </span>
        </div>
      </div>

      {/* Institution Flow (SECONDARY) */}
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Building2 className="w-3 h-3" style={{ color: COLORS.neutral }} />
        </div>

        {/* Bars */}
        <svg width={width} height={barHeight} className="flex-shrink-0">
          {/* Zero line */}
          <line
            x1={0}
            y1={barHeight / 2}
            x2={width}
            y2={barHeight / 2}
            stroke="rgba(174, 183, 179, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Flow bars */}
          {displayInstitutionFlow.slice(-5).map((point, index) => {
            const x = index * (barWidth + gap);
            return (
              <FlowBar
                key={`institution-${index}`}
                value={point.value}
                maxValue={maxInstitutionValue}
                height={barHeight}
                width={barWidth}
                x={x}
                color={getBarColor(point.value)}
                index={index}
              />
            );
          })}
        </svg>

        {/* Latest value */}
        <div className="flex-shrink-0 text-right">
          <span
            className="text-xs font-bold tabular-nums"
            style={{
              color: getBarColor(
                displayInstitutionFlow[displayInstitutionFlow.length - 1].value
              ),
            }}
          >
            {displayInstitutionFlow[displayInstitutionFlow.length - 1].value >=
              0 && "+"}
            {formatFlowValue(
              displayInstitutionFlow[displayInstitutionFlow.length - 1].value
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FlowMiniBars;
