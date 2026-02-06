/**
 * PatternBadges Component
 *
 * Displays detected pattern badges from trend analysis.
 * Shows accumulation, distribution, divergence, FOMO, panic patterns.
 */

"use client";

import { memo, useMemo } from "react";
import { Badge } from "@/components/shared/Badge";
import { useTranslations } from "next-intl";
import type { DetectedPattern } from "@/types/smart-money";

// ============================================================================
// TYPES
// ============================================================================

export interface PatternBadgesProps {
  patterns: DetectedPattern[];
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

// ============================================================================
// FALLBACK TRANSLATIONS (in case next-intl fails)
// ============================================================================

const FALLBACK_TRANSLATIONS = {
  types: {
    Accumulation: "การสะสม",
    Distribution: "การแตกตัว",
    Divergence: "การแตกต่าง",
    Reversal: "การกลับตัว",
    FOMO: "FOMO",
    Panic: "ความตื่นกลัว",
  },
  descriptions: {
    accumulation: "กระแสเงินซื้อสุทธิต่อเนื่อง",
    distribution: "กระแสเงินขายสุทธิต่อเนื่อง",
    divergence: "นักลงทุนต่างชาติและสถาบันเคลื่อนไหรในทิศทางตรงข้าม",
    reversal: "การเปลี่ยนแนวโน้มจากขาลงเป็นขาขึ้นหรือในทางกลับกัน",
    fomo: "นักลงทุนรายย่อยซื้อหนักเกินควร",
    panic: "การขายแรงเนื่องจากความกลัว",
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PatternBadges = memo(function PatternBadges({
  patterns,
}: PatternBadgesProps) {
  const t = useTranslations("dashboard.smartMoney.trend");

  // Memoize translations to avoid recalculating on each render
  const patternTypeTranslations = useMemo(() => {
    const types = {
      Accumulation: t("patterns.Accumulation") as string,
      Distribution: t("patterns.Distribution") as string,
      Divergence: t("patterns.Divergence") as string,
      Reversal: t("patterns.Reversal") as string,
      FOMO: t("patterns.FOMO") as string,
      Panic: t("patterns.Panic") as string,
    };
    // Add fallback if translation returns the key itself
    Object.entries(types).forEach(([key, value]) => {
      if (value.includes("dashboard.smartMoney.trend.patterns.")) {
        types[key as DetectedPattern["type"]] =
          FALLBACK_TRANSLATIONS.types[key as DetectedPattern["type"]];
      }
    });
    return types;
  }, [t]);

  const patternDescriptionTranslations = useMemo(() => {
    const descriptions = {
      Accumulation: t("patterns.descriptions.accumulation") as string,
      Distribution: t("patterns.descriptions.distribution") as string,
      Divergence: t("patterns.descriptions.divergence") as string,
      Reversal: t("patterns.descriptions.reversal") as string,
      FOMO: t("patterns.descriptions.fomo") as string,
      Panic: t("patterns.descriptions.panic") as string,
    };
    // Add fallback if translation returns the key itself
    Object.entries(descriptions).forEach(([key, value]) => {
      if (value.includes("dashboard.smartMoney.trend.patterns.descriptions.")) {
        const typeKey = (key.charAt(0).toLowerCase() + key.slice(1)) as
          | "accumulation"
          | "distribution"
          | "divergence"
          | "reversal"
          | "fomo"
          | "panic";
        descriptions[key as DetectedPattern["type"]] =
          FALLBACK_TRANSLATIONS.descriptions[typeKey];
      }
    });
    return descriptions;
  }, [t]);

  if (patterns.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-text-secondary">
        รูปแบบที่ตรวจพบ
      </h4>
      <div className="flex flex-wrap gap-2 w-full">
        {patterns.map((pattern, index) => {
          const config = PATTERN_CONFIG[pattern.type];

          return (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2  w-full md:w-auto
              bg-surface-2 rounded-lg border border-border-subtle"
            >
              <span className="text-base">{config.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-text-primary">
                  {patternTypeTranslations[pattern.type]}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {patternDescriptionTranslations[pattern.type]}
                </span>
              </div>
              <Badge size="sm" color={config.color} className="ml-auto">
                {pattern.strength}%
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PatternBadges;
