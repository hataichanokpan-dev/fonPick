/**
 * InvestorBreakdownCard Component
 *
 * Displays individual investor breakdown with mini sparkline chart.
 * Shows Foreign, Institution, Retail, Prop with their trends.
 */

"use client";

import { memo } from "react";
import { Globe, Building2, Users, Briefcase } from "lucide-react";
import { formatTradingValue } from "@/lib/utils";
import type { InvestorTrendData } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface InvestorBreakdownCardProps {
  investor: InvestorTrendData;
  isPrimary?: boolean;
}

// ============================================================================
// SPARKLINE COMPONENT
// ============================================================================

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

const Sparkline = memo(function Sparkline({ data, color, height = 32 }: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Create SVG path
  const width = 200;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const normalized = (value - min) / range;
    const y = height - normalized * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InvestorBreakdownCard = memo(function InvestorBreakdownCard({
  investor,
  isPrimary = false,
}: InvestorBreakdownCardProps) {
  const { name, aggregated, daily } = investor;

  // Get icon
  const getIcon = () => {
    switch (investor.investor) {
      case "foreign":
        return <Globe className="w-4 h-4" />;
      case "institution":
        return <Building2 className="w-4 h-4" />;
      case "retail":
        return <Users className="w-4 h-4" />;
      case "prop":
        return <Briefcase className="w-4 h-4" />;
    }
  };

  // Get color based on investor type
  const getColor = () => {
    switch (investor.investor) {
      case "foreign":
        return "#2ED8A7";
      case "institution":
        return "#60A5FA";
      case "retail":
        return "#F59E0B";
      case "prop":
        return "#A78BFA";
    }
  };

  // Get trend color
  const getTrendColor = () => {
    if (aggregated.totalNet > 0) return "#2ED8A7";
    if (aggregated.totalNet < 0) return "#F45B69";
    return "#94A3B8";
  };

  const color = getColor();
  const trendColor = getTrendColor();

  return (
    <div
      className={`p-4 rounded-xl border ${
        isPrimary ? "border-[#2ED8A7]/30 bg-[#2ED8A7]/5" : "border-border-subtle bg-surface-2"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ color }}>{getIcon()}</div>
          <span className="text-sm font-semibold text-text-primary">{name}</span>
        </div>
        {isPrimary && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2ED8A7]/20 text-[#2ED8A7] font-medium">
            Primary
          </span>
        )}
      </div>

      {/* Net Value */}
      <div className="mb-3">
        <div className="text-[10px] text-text-muted uppercase tracking-wide mb-1">
          Net Flow ({aggregated.trend === "up" ? "ขาขึ้น" : aggregated.trend === "down" ? "ขาลง" : "ออกทางเดียว"})
        </div>
        <div className="text-xl font-bold tabular-nums" style={{ color: trendColor }}>
          {aggregated.totalNet > 0 ? "+" : ""}
          {formatTradingValue(aggregated.totalNet)}
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="mb-3">
        <Sparkline
          data={daily.map((d) => d.net)}
          color={trendColor}
          height={32}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-text-muted">Buy</div>
          <div className="font-medium tabular-nums text-[#2ED8A7]">
            {formatTradingValue(aggregated.totalBuy)}
          </div>
        </div>
        <div>
          <div className="text-text-muted">Sell</div>
          <div className="font-medium tabular-nums text-[#F45B69]">
            {formatTradingValue(aggregated.totalSell)}
          </div>
        </div>
        <div>
          <div className="text-text-muted">Avg/D</div>
          <div className={`font-medium tabular-nums ${
            aggregated.avgDaily > 0 ? "text-[#2ED8A7]" : aggregated.avgDaily < 0 ? "text-[#F45B69]" : "text-text-muted"
          }`}>
            {aggregated.avgDaily > 0 ? "+" : ""}
            {formatTradingValue(aggregated.avgDaily)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvestorBreakdownCard;
