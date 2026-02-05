/**
 * Dividend Timeline Chart Component
 *
 * กราฟแสดงประวัติการจ่ายปันผลและ forecast
 *
 * Features:
 * - Bar chart แสดง DPS ย้อนหลัง
 * - Dashed line แสดง forecast
 * - Custom tooltip
 * - Responsive design
 */

"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import type {
  DividendHistory,
  DividendForecasts,
  DividendChartDataPoint,
} from "@/types/dividend";

// ============================================================================
// TYPES
// ============================================================================

export interface DividendTimelineChartProps {
  /** ประวัติการจ่ายปันผล */
  history: DividendHistory;
  /** Forecast ปันผลในอนาคต */
  forecasts: DividendForecasts;
  /** ราคาหุ้นปัจจุบัน (สำหรับคำนวณ yield) */
  currentPrice: number;
  /** ความสูงกราฟ (pixels) */
  height?: number;
  /** CSS classes เพิ่มเติม */
  className?: string;
}

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const chartColors = {
  // Dividend Bars
  bar: "#4ade80", // green-400
  barGradientStart: "rgba(74, 222, 128, 0.8)",
  barGradientEnd: "rgba(74, 222, 128, 0.3)",

  // Forecast Line
  forecast: "#fbbf24", // amber-400
  forecastLine: "dashed",

  // Grid & Axis
  grid: "rgba(148, 163, 184, 0.1)", // Subtle grid
  axis: "#6b7280", // gray-500

  // Tooltip
  tooltipBg: "#1f2937", // gray-800
  tooltipBorder: "#374151", // gray-700
};

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface DividendTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color?: string;
    payload: DividendChartDataPoint;
  }>;
}

function DividendTooltip({ active, payload }: DividendTooltipProps) {
  const locale = useLocale() as "en" | "th";

  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div
      className="rounded-lg border shadow-xl max-w-[180px] sm:max-w-[200px] z-50"
      style={{
        backgroundColor: chartColors.tooltipBg,
        borderColor: chartColors.tooltipBorder,
      }}
    >
      <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
        {/* Year */}
        <div className="text-[10px] sm:text-xs text-text-2 border-b border-gray-700 pb-1.5 sm:pb-2 mb-1.5 sm:mb-2">
          {data.year}
        </div>

        {/* DPS */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs text-text-2 shrink-0">
            {locale === "th" ? "เงินปันผล" : "DPS"}:
          </span>
          <span className="text-xs sm:text-sm font-semibold tabular-nums text-text-primary">
            ฿{data.dps.toFixed(2)}
          </span>
        </div>

        {/* Yield */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs text-text-2 shrink-0">
            {locale === "th" ? "อัตราผลตอบ" : "Yield"}:
          </span>
          <span className="text-xs sm:text-sm font-semibold tabular-nums text-up-primary">
            {data.yield.toFixed(2)}%
          </span>
        </div>

        {/* Payout Ratio */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs text-text-2 shrink-0">
            Payout:
          </span>
          <span className="text-xs sm:text-sm font-semibold tabular-nums text-text-primary">
            {data.payoutRatio.toFixed(0)}%
          </span>
        </div>

        {/* Forecast Badge */}
        {data.isForecast && (
          <div className="pt-1.5 sm:pt-2 border-t border-gray-700">
            <span className="text-[10px] sm:text-xs font-medium text-amber-400">
              {locale === "th" ? "คาดการณ" : "Forecast"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DividendTimelineChart({
  history,
  forecasts,
  currentPrice,
  height = 220,
  className,
}: DividendTimelineChartProps) {
  const locale = useLocale() as "en" | "th";

  // Transform data for chart
  const chartData = useMemo(() => {
    // History data
    const historyData: DividendChartDataPoint[] = history.map((p) => ({
      ...p,
      timestamp: new Date(`${p.year}-12-31`).getTime(),
      isForecast: false,
    }));

    // Forecast data
    const forecastData: DividendChartDataPoint[] = forecasts.map((f) => ({
      year: f.year,
      dps: f.estimatedDps,
      yield: (f.estimatedDps / currentPrice) * 100,
      payoutRatio: 0, // Unknown for forecast
      exDate: `${f.year}-12-15`,
      timestamp: new Date(`${f.year}-12-31`).getTime(),
      isForecast: true,
    }));

    // Combine and sort
    return [...historyData, ...forecastData].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [history, forecasts, currentPrice]);

  // Calculate Y-axis domain
  const yDomain = useMemo(() => {
    const allValues = chartData.map((d) => d.dps);
    const maxY = Math.max(...allValues);
    const padding = maxY * 0.1;
    return [0, maxY + padding];
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div
          className="flex items-center justify-center rounded-lg bg-surface-2 border border-border"
          style={{ height: `${height}px`, minHeight: '180px' }}
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
      <div style={{ height: `${height}px`, minHeight: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              // Extra top margin for tooltip on mobile
              top: 10,
              right: 5,
              left: -20,
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
                return date.getFullYear().toString();
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
              tickFormatter={(value) => `฿${value.toFixed(1)}`}
              axisLine={false}
              tickLine={false}
              width={60}
            />

            {/* Tooltip */}
            <Tooltip
              content={<DividendTooltip />}
              cursor={{
                fill: "rgba(255, 255, 255, 0.05)",
              }}
              position={{ y: 0, x: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
              isAnimationActive={false}
              wrapperStyle={{ zIndex: 100 }}
            />

            {/* Dividend Bars (historical only) */}
            <Bar
              dataKey="dps"
              fill={chartColors.bar}
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={1000}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="dps"
              stroke={chartColors.forecast}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive
              animationDuration={1000}
              connectNulls={false}
            />

            {/* Forecast gradient */}
            <defs>
              <linearGradient id="dividendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartColors.barGradientStart}
                />
                <stop
                  offset="100%"
                  stopColor={chartColors.barGradientEnd}
                />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Responsive Legend */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:items-center sm:gap-4 text-xs text-text-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-400 rounded shrink-0" />
          <span>{locale === "th" ? "ประวัติ" : "History"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-amber-400 shrink-0" />
          <span>{locale === "th" ? "คาดการณ์" : "Forecast"}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default DividendTimelineChart;
