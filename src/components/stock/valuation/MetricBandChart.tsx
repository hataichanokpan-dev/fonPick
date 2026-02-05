/**
 * Metric Band Chart Component
 *
 * กราฟแสดงมูลค่าการประเมินย้อนหลังพร้อม statistical bands
 *
 * Features:
 * - เส้น metric ตามช่วงเวลา
 * - Area bands แสดง -2SD, -1SD, Mean, +1SD, +2SD
 * - Mean line (dashed)
 * - Custom tooltip
 * - Responsive design
 */

"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type {
  ValuationSeries,
  ValuationBand,
  MetricType,
} from "@/types/valuation";
import { METRIC_CONFIGS } from "@/types/valuation";

// ============================================================================
// TYPES
// ============================================================================

export interface MetricBandChartProps {
  /** Time series data */
  series: ValuationSeries;
  /** Statistical bands */
  band: ValuationBand;
  /** Metric type */
  metric: MetricType;
  /** ความสูงกราฟ (pixels) */
  height?: number;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const chartColors = {
  // Valuation Zones
  undervalued: {
    band: "rgba(74, 222, 128, 0.08)", // Soft green
    line: "#4ade80", // green-400
  },
  fair: {
    band: "rgba(148, 163, 184, 0.05)", // Soft gray
    line: "#9ca3af", // gray-400
  },
  overvalued: {
    band: "rgba(255, 107, 107, 0.08)", // Soft red
    line: "#ff6b6b", // red-400
  },

  // Metric Lines
  current: "#fbbf24", // amber-400 (gold) - Current value line
  mean: "#60a5fa", // blue-400 - Mean line

  // Grid & Axis
  grid: "rgba(148, 163, 184, 0.1)", // Subtle grid
  axis: "#6b7280", // gray-500
  crosshair: "#9ca3af", // gray-400

  // Tooltip
  tooltipBg: "#1f2937", // gray-800
  tooltipBorder: "#374151", // gray-700
};

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface ValuationTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color?: string;
  }>;
  label?: string;
  band: ValuationBand;
  metric: MetricType;
}

function ValuationTooltip({
  active,
  payload,
  label,
  band,
  metric,
}: ValuationTooltipProps) {
  const locale = useLocale() as "en" | "th";
  const config = METRIC_CONFIGS[metric];

  if (!active || !payload?.length) return null;

  const valueData = payload.find((p) => p.dataKey === "value");
  if (!valueData) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy", {
      locale: locale === "th" ? th : undefined,
    });
  };

  const formatValue = (val: number) => config.format(val);

  // Calculate interpretation
  const value = valueData.value;
  let interpretation = "";
  let interpretationColor = "";

  if (value <= band.minus2SD) {
    interpretation = locale === "th" ? "ถูกมาก" : "Deep Undervalued";
    interpretationColor = chartColors.undervalued.line;
  } else if (value <= band.minus1SD) {
    interpretation = locale === "th" ? "ถูก" : "Undervalued";
    interpretationColor = chartColors.undervalued.line;
  } else if (value <= band.plus1SD) {
    interpretation = locale === "th" ? "ปกติ" : "Fair Value";
    interpretationColor = chartColors.fair.line;
  } else if (value <= band.plus2SD) {
    interpretation = locale === "th" ? "แพง" : "Overvalued";
    interpretationColor = chartColors.overvalued.line;
  } else {
    interpretation = locale === "th" ? "แพงมาก" : "Sell Zone";
    interpretationColor = chartColors.overvalued.line;
  }

  return (
    <div
      className="rounded-lg border shadow-xl min-w-[200px]"
      style={{
        backgroundColor: chartColors.tooltipBg,
        borderColor: chartColors.tooltipBorder,
      }}
    >
      <div className="p-3 space-y-2">
        {/* Date */}
        <div className="text-xs text-text-2 border-b border-gray-700 pb-2 mb-2">
          {formatDate(label || "")}
        </div>

        {/* Value */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-2">
            {config.thai} ({config.english}):
          </span>
          <span className="text-sm font-mono font-semibold text-text-primary">
            {formatValue(value)}
            {config.unit}
          </span>
        </div>

        {/* Bands */}
        <div className="space-y-1 pt-2 border-t border-gray-700">
          <div className="flex justify-between text-xs">
            <span className="text-text-2" style={{ color: chartColors.mean }}>
              {locale === "th" ? "ค่าเฉลี่ย" : "Mean"}:
            </span>
            <span className="font-mono tabular-nums">
              {formatValue(band.mean)}
              {config.unit}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-2">
              -1SD ({locale === "th" ? "ต่ำ" : "Low"}):
            </span>
            <span className="font-mono tabular-nums text-text-3">
              {formatValue(band.minus1SD)}
              {config.unit}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-2">
              +1SD ({locale === "th" ? "สูง" : "High"}):
            </span>
            <span className="font-mono tabular-nums text-text-3">
              {formatValue(band.plus1SD)}
              {config.unit}
            </span>
          </div>
        </div>

        {/* Interpretation */}
        <div className="pt-2 border-t border-gray-700">
          <div
            className="text-xs font-medium text-center"
            style={{ color: interpretationColor }}
          >
            {interpretation}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MetricBandChart({
  series,
  band,
  metric,
  height = 280,
  className,
}: MetricBandChartProps) {
  const locale = useLocale() as "en" | "th";
  const config = METRIC_CONFIGS[metric];

  // Transform data for chart
  const chartData = useMemo(() => {
    return series.map((point) => ({
      timestamp: new Date(point.date).getTime(),
      date: point.date,
      value: point.value,
      mean: band.mean,
      minus2SD: band.minus2SD,
      minus1SD: band.minus1SD,
      plus1SD: band.plus1SD,
      plus2SD: band.plus2SD,
    }));
  }, [series, band]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap((d) => [
      d.value,
      d.minus2SD,
      d.plus2SD,
    ]);
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const padding = (maxY - minY) * 0.1;
    return [Math.max(0, minY - padding), maxY + padding];
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div
          className="flex items-center justify-center rounded-lg bg-surface-2 border border-border"
          style={{ height: `${height}px` }}
        >
          <p className="text-text-2">
            {locale === "th" ? "ไม่มีข้อมูล" : "No data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: -15,
              bottom: 5,
            }}
          >
            {/* Grid */}
            <CartesianGrid
              stroke={chartColors.grid}
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tick={{
                fill: chartColors.axis,
                fontSize: 11,
              }}
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                const month = date.getMonth();
                if (month % 3 === 0) {
                  return format(date, "MMM ''yy", {
                    locale: locale === "th" ? th : undefined,
                  });
                }
                return "";
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis
              domain={yDomain}
              tick={{
                fill: chartColors.axis,
                fontSize: 11,
              }}
              tickFormatter={(value) => config.format(value)}
              axisLine={false}
              tickLine={false}
              width={60}
            />

            {/* Tooltip */}
            <Tooltip
              content={<ValuationTooltip band={band} metric={metric} />}
              cursor={{
                stroke: chartColors.crosshair,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              position={{ y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />

            {/* +2SD Band (outer) */}
            <Area
              dataKey="plus2SD"
              fill={chartColors.overvalued.band}
              stroke="none"
              isAnimationActive={false}
            />

            {/* +1SD Band */}
            <Area
              dataKey="plus1SD"
              fill={chartColors.fair.band}
              stroke="none"
              isAnimationActive={false}
            />

            {/* -1SD Band */}
            <Area
              dataKey="minus1SD"
              fill={chartColors.fair.band}
              stroke="none"
              isAnimationActive={false}
            />

            {/* -2SD Band (inner/outer) */}
            <Area
              dataKey="minus2SD"
              fill={chartColors.undervalued.band}
              stroke="none"
              isAnimationActive={false}
            />

            {/* Mean Line (dashed) */}
            <ReferenceLine
              y={band.mean}
              stroke={chartColors.mean}
              strokeWidth={1}
              strokeDasharray="4 4"
              label={{
                value:
                  locale === "th"
                    ? `Mean: ${config.format(band.mean)}`
                    : `Mean: ${config.format(band.mean)}`,
                position: "insideTopRight",
                fill: chartColors.mean,
                fontSize: 10,
              }}
              ifOverflow="extendDomain"
            />

            {/* Current Value Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* Current Value Marker (last point) */}
            {chartData.length > 0 && (
              <ReferenceLine
                x={chartData[chartData.length - 1].timestamp}
                stroke={chartColors.current}
                strokeWidth={2}
                label={{
                  value: config.format(band.currentValue) + config.unit,
                  position: "insideTopLeft",
                  fill: chartColors.current,
                  fontSize: 11,
                  fontWeight: "bold",
                }}
                ifOverflow="visible"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5"
            style={{ backgroundColor: config.color }}
          />
          <span>
            {config.thai} ({config.english})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 border-t border-dashed"
            style={{ borderColor: chartColors.mean }}
          />
          <span>{locale === "th" ? "ค่าเฉลี่ย" : "Mean"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: chartColors.undervalued.band }}
          />
          <span>
            {locale === "th" ? "โซนถูก" : "Undervalued"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: chartColors.overvalued.band }}
          />
          <span>
            {locale === "th" ? "โซนแพง" : "Overvalued"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default MetricBandChart;
