/**
 * PatternCard Component
 *
 * Displays a single detected pattern with actionable insights.
 * Shows pattern type, strength, duration, magnitude, and guidance.
 *
 * P0: Actionable pattern display for investors
 */

"use client";

import { memo } from "react";
import { Badge } from "@/components/shared/Badge";
import { useTranslations } from "next-intl";
import type { DetectedPattern } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface PatternCardProps {
  pattern: DetectedPattern;
}

// ============================================================================
// PATTERN CONFIG
// ============================================================================

const PATTERN_CONFIG: Record<
  DetectedPattern["type"],
  { color: "buy" | "sell" | "neutral" | "watch"; icon: string }
> = {
  Accumulation: { color: "buy", icon: "📈" },
  Distribution: { color: "sell", icon: "📉" },
  Divergence: { color: "watch", icon: "⚠️" },
  Reversal: { color: "watch", icon: "🔄" },
  FOMO: { color: "sell", icon: "😱" },
  Panic: { color: "sell", icon: "😨" },
};

const ACTION_CONFIG: Record<
  NonNullable<DetectedPattern["action"]>,
  { color: string; label: string; labelTh: string }
> = {
  buy: { color: "text-[#2ED8A7]", label: "Buy", labelTh: "ซื้อ" },
  sell: { color: "text-[#F45B69]", label: "Sell", labelTh: "ขาย" },
  hold: { color: "text-text-muted", label: "Hold", labelTh: "ถือ" },
  accumulate: { color: "text-[#2ED8A7]", label: "Accumulate", labelTh: "สะสม" },
  reduce: { color: "text-[#F45B69]", label: "Reduce", labelTh: "ลด" },
  wait: { color: "text-[#F59E0B]", label: "Wait", labelTh: "รอ" },
};

const RISK_CONFIG: Record<
  NonNullable<DetectedPattern["riskLevel"]>,
  { color: string; bg: string }
> = {
  low: { color: "text-[#2ED8A7]", bg: "bg-[#2ED8A7]/10" },
  medium: { color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  high: { color: "text-[#F45B69]", bg: "bg-[#F45B69]/10" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PatternCard = memo(function PatternCard({
  pattern,
}: PatternCardProps) {
  const t = useTranslations("dashboard.smartMoney.trend.patterns");
  const config = PATTERN_CONFIG[pattern.type];

  // Get action label
  const actionLabel = pattern.action
    ? ACTION_CONFIG[pattern.action].labelTh
    : undefined;

  // Format flow magnitude
  const formatFlow = (value?: number) => {
    if (value === undefined) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value)}M`;
  };

  // Calculate consecutive days from description if not provided
  const consecutiveDays = pattern.consecutiveDays
    ?? (() => {
      const match = pattern.description.match(/(\d+)\s*(?:consecutive|days)/i);
      return match ? parseInt(match[1]) : undefined;
    })();

  // Extract total flow from description if not provided
  const totalFlow = pattern.totalFlow
    ?? (() => {
      const match = pattern.description.match(/([+-]?\d+(?:\.\d+)?)\s*M/i);
      return match ? parseFloat(match[1]) : undefined;
    })();

  // Default insight based on pattern type if not provided
  const defaultInsights: Record<DetectedPattern["type"], string> = {
    Accumulation: "Smart money quietly buying. Consider accumulating on pullbacks.",
    Distribution: "Smart money exiting. Reduce exposure, avoid new entries.",
    Divergence: "Smart money and retail moving in opposite directions.",
    Reversal: "Trend changing direction. Wait for confirmation.",
    FOMO: "Retail buying heavily. Be cautious - smart money may sell into this.",
    Panic: "Heavy retail selling. Wait for stabilization before acting.",
  };

  const insight = pattern.insight ?? defaultInsights[pattern.type];

  // Default risk level based on pattern type
  const defaultRiskLevel: Record<DetectedPattern["type"], "low" | "medium" | "high"> = {
    Accumulation: "low",
    Distribution: "medium",
    Divergence: "medium",
    Reversal: "medium",
    FOMO: "high",
    Panic: "high",
  };

  const displayRiskLevel = pattern.riskLevel ?? defaultRiskLevel[pattern.type];
  const displayRiskConfig = RISK_CONFIG[displayRiskLevel];

  return (
    <div className="w-full md:w-auto p-4 bg-surface-2 rounded-lg border border-border-subtle">
      {/* Header: Type + Action */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <span className="text-sm font-semibold text-text-primary">
            {t(pattern.type)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {actionLabel && (
            <span className={`text-xs font-bold uppercase ${ACTION_CONFIG[pattern.action!].color}`}>
              {actionLabel}
            </span>
          )}
          <Badge size="sm" color={config.color}>
            {pattern.strength ? pattern.strength.toFixed(2) : "-"}%
          </Badge>
        </div>
      </div>

      {/* Description / Insight */}
      {insight && (
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          {insight}
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Duration */}
        <div className="flex flex-col">
          <span className="text-text-muted">ระยะเวลา</span>
          <span className="font-medium text-text-primary">
            {consecutiveDays !== undefined
              ? `${consecutiveDays} วันติดต่อกัน`
              : "-"}
          </span>
        </div>

        {/* Flow Magnitude */}
        <div className="flex flex-col">
          <span className="text-text-muted">ปริมาณเงิน</span>
          <span
            className={`font-medium ${
              (totalFlow ?? 0) > 0 ? "text-[#2ED8A7]" : "text-[#F45B69]"
            }`}
          >
            {formatFlow(totalFlow)}
          </span>
        </div>

        {/* Risk Level */}
        <div className="flex flex-col">
          <span className="text-text-muted">ความเสี่ยง</span>
          <span className={`font-medium ${displayRiskConfig.color}`}>
            {displayRiskLevel === "low" && "ต่ำ"}
            {displayRiskLevel === "medium" && "ปานกลาง"}
            {displayRiskLevel === "high" && "สูง"}
          </span>
        </div>

        {/* Participants */}
        <div className="flex flex-col">
          <span className="text-text-muted">ผู้ขับเคลื่อน</span>
          <span className="font-medium text-text-primary">
            {pattern.type === "Accumulation" && "นักลงทุนต่างชาติ"}
            {pattern.type === "Distribution" && "นักลงทุนต่างชาติ"}
            {pattern.type === "Divergence" && "Smart Money"}
            {pattern.type === "FOMO" && "รายย่อย"}
            {pattern.type === "Panic" && "รายย่อย"}
            {pattern.type === "Reversal" && "กำลังเปลี่ยนแนวโน้ม"}
          </span>
        </div>
      </div>
    </div>
  );
});

export default PatternCard;
