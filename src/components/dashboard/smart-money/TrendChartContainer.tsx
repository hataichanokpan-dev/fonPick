/**
 * TrendChartContainer Component
 *
 * Container for trend visualization charts.
 * Displays stacked area chart for investor flows over time.
 *
 * Uses Recharts for visualization.
 */

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatTradingValue } from "@/lib/utils";
import type { TrendAnalysisResponse } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface TrendChartContainerProps {
  data: TrendAnalysisResponse["data"];
  period: number;
}

// ============================================================================
// CHART DATA TRANSFORM
// ============================================================================

/**
 * Transform trend data for Recharts
 */
function transformChartData(
  combined: Exclude<TrendAnalysisResponse["data"], undefined>["combined"]
) {
  return combined.map((point) => ({
    date: new Date(point.date).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
    }),
    timestamp: point.timestamp,
    foreign: Math.max(0, point.smartMoneyNet * 0.6), // Approximate split
    institution: Math.max(0, point.smartMoneyNet * 0.4),
    retail: point.retailNet,
    prop: point.propNet,
    smartMoneyNet: point.smartMoneyNet,
    totalNet: point.totalNet,
  }));
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !label) return null;

  return (
    <div className="bg-surface-2 border border-border-subtle rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium tabular-nums" style={{ color: entry.color }}>
            {entry.value > 0 ? "+" : ""}
            {formatTradingValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendChartContainer({ data, period: _period }: TrendChartContainerProps) {
  const chartData = transformChartData(data!.combined);

  // Colors matching the design system
  const colors = {
    foreign: "#2ED8A7",      // Green for foreign
    institution: "#60A5FA",  // Blue for institution
    retail: "#F59E0B",       // Orange for retail
    prop: "#A78BFA",         // Purple for prop
  };

  return (
    <div className="w-full">
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" strokeOpacity={0.3} />

            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(value) => {
                // Show fewer labels on small screens
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  const idx = chartData.findIndex((d) => d.date === value);
                  return idx % Math.ceil(chartData.length / 5) === 0 ? value : "";
                }
                return value;
              }}
            />

            <YAxis
              stroke="#6b7280"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(value) => `${value >= 0 ? "+" : ""}${value / 1000}K`}
            />

            <Tooltip content={<ChartTooltip />} />

            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
            />

            {/* Stacked areas for visual appeal */}
            <Area
              type="monotone"
              dataKey="foreign"
              stackId="1"
              stroke={colors.foreign}
              fill="rgba(46, 216, 167, 0.3)"
              name="Foreign"
            />
            <Area
              type="monotone"
              dataKey="institution"
              stackId="1"
              stroke={colors.institution}
              fill="rgba(96, 165, 250, 0.3)"
              name="Institution"
            />
            <Area
              type="monotone"
              dataKey="retail"
              stackId="1"
              stroke={colors.retail}
              fill="rgba(245, 158, 11, 0.2)"
              name="Retail"
            />
            <Area
              type="monotone"
              dataKey="prop"
              stackId="1"
              stroke={colors.prop}
              fill="rgba(167, 139, 250, 0.2)"
              name="Prop"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChartContainer;
