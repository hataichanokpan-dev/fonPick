/**
 * SectorStrengthCard Component
 *
 * Displays sector rotation analysis including:
 * - Top 5 leaders (green)
 * - Bottom 5 laggards (red)
 * - Buy/Avoid/Watch signals
 * - Rotation pattern badge
 * - Market concentration indicator
 *
 * Answers Q2: "What sector is heavy market up or down because xxx sector?"
 * Data source: /api/market-intelligence
 *
 * Theme: Green-tinted dark with teal up / soft red down
 * Design: Compact 12px padding, large prominent numbers
 */

"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card } from "@/components/shared";
import { Badge } from "@/components/shared/Badge";
import { TrendingUp, TrendingDown, Layers } from "lucide-react";
import { formatPercentage } from "@/lib/utils";
import type { SectorPerformance } from "@/types/sector-rotation";
import { useSectorRotation } from "@/hooks/useMarketIntelligence";

// ==================================================================
// TYPES
// ==================================================================

export interface SectorStrengthCardProps {
  /** Additional CSS classes */
  className?: string;
  /** Number of sectors to show */
  topCount?: number;
  /** Include laggards */
  showLaggards?: boolean;
}

// ==================================================================
// CONSTANTS
// ==================================================================

const COLORS = {
  up: "#2ED8A7",
  down: "#F45B69",
  warn: "#F7C948",
  neutral: "#AEB7B3",
};

const DEFAULT_TOP_COUNT = 5;

// ==================================================================
// HELPER COMPONENTS
// ==================================================================

interface SectorRowProps {
  sector: SectorPerformance;
  showRank?: boolean;
  variant: "leader" | "laggard";
  /** Current locale */
  locale: "en" | "th";
  /** Translation function for signals */
  translateSignal: (signal: string) => string;
}

function SectorRow({
  sector,
  showRank = true,
  variant,
  locale,
  translateSignal,
}: SectorRowProps) {
  const isLeader = variant === "leader";
  const valueColor = isLeader ? COLORS.up : COLORS.down;
  const bgColor = isLeader
    ? "rgba(46, 216, 167, 0.08)"
    : "rgba(244, 91, 105, 0.08)";

  const getSignalColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (sector.signal) {
      case "Entry":
      case "Accumulate":
        return "buy";
      case "Exit":
      case "Distribute":
        return "sell";
      default:
        return "neutral";
    }
  };

  // English mode: show ID (e.g., "MEDIA")
  // Thai mode: show name (e.g., "สื่อและสิ่งพิมพ์")
  const sectorName = locale === "en" ? sector.sector.id : sector.sector.name;

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded animate-fade-in-up ${isLeader ? "slide-in-left" : "slide-in-right"}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Rank */}
      {showRank && (
        <span className="text-xs font-semibold w-4 text-text-muted">
          {sector.rank ?? "-"}
        </span>
      )}

      {/* Sector Name */}
      <span className="text-sm font-medium text-text flex-1 min-w-0">
        {locale === "en" ? sector.sector.id : sectorName}
      </span>

      {/* Change Percent (vsMarket) */}
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: valueColor }}
      >
        {formatPercentage(sector.vsMarket)}
      </span>

      {/* Signal Badge */}
      <Badge size="sm" color={getSignalColor()}>
        {translateSignal(sector.signal)}
      </Badge>
    </div>
  );
}

// Loading Skeleton
function SectorStrengthSkeleton() {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-2">Sector Strength</h3>
      </div>
      <div className="animate-pulse space-y-2">
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
        <div className="h-12 bg-surface-2 rounded" />
      </div>
    </Card>
  );
}

// ==================================================================
// MAIN COMPONENT
// ==================================================================

export function SectorStrengthCard({
  className,
  topCount = DEFAULT_TOP_COUNT,
  showLaggards = true,
}: SectorStrengthCardProps) {
  const t = useTranslations("dashboard.sectors");
  const locale = useLocale() as "en" | "th";

  // Use consolidated market intelligence hook
  const { data: sectorData, isLoading, error } = useSectorRotation();

  // Create Thai to English mapping (inverse of sectorNames)
  // This handles the case where API returns Thai names
  const thaiToEnglishMap: Record<string, string> = {
    การเงิน: "Financial",
    พลังงาน: "Energy",
    ธุรกิจเกษตร: "Agribusiness",
    อาหาร: "Food",
    การแพทย์: "Healthcare",
    เทคโนโลยี: "Technology",
    อสังหาริมทรัพย์: "Property",
    ธนาคาร: "Bank",
    ก่อสร้าง: "Construction",
    อุตสาหกรรม: "Industrial",
    เหมืองแร่: "Mining",
    การขนส่ง: "Transport",
    โทรคมนาคม: "Telecom",
  };

  // Translation function for sector names (used by focusSectors/avoidSectors)
  // These come from API as strings like "Financial" or "การเงิน"
  const translateSectorName = (name: string): string => {
    // English mode: convert Thai names to English
    if (locale === "en") {
      // If it's already a Thai name, convert to English
      if (thaiToEnglishMap[name]) {
        return thaiToEnglishMap[name];
      }
      return name;
    }

    // Thai mode: translate English names to Thai
    const sectorNameMap: Record<string, string> = {
      Financial: t("sectorNames.financial"),
      Energy: t("sectorNames.energy"),
      Agribusiness: t("sectorNames.agribusiness"),
      Food: t("sectorNames.food"),
      Healthcare: t("sectorNames.healthcare"),
      Technology: t("sectorNames.technology"),
      Property: t("sectorNames.property"),
      Bank: t("sectorNames.bank"),
      Banks: t("sectorNames.bank"),
      Construction: t("sectorNames.construction"),
      Industrial: t("sectorNames.industrial"),
      Mining: t("sectorNames.mining"),
      Transport: t("sectorNames.transport"),
      Transportation: t("sectorNames.transport"),
      Telecom: t("sectorNames.telecom"),
      Telecommunications: t("sectorNames.telecom"),
    };

    // Direct match
    if (sectorNameMap[name]) {
      return sectorNameMap[name];
    }

    // Case-insensitive match
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(sectorNameMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }

    // Return original name (might already be Thai)
    return name;
  };

  // Translation function for signals
  const translateSignal = (signal: string): string => {
    const signalMap: Record<string, string> = {
      Entry: t("signals.entry"),
      Accumulate: t("signals.accumulate"),
      Hold: t("signals.hold"),
      Distribute: t("signals.distribute"),
      Exit: t("signals.exit"),
    };
    return signalMap[signal] || signal;
  };

  // Translation function for patterns
  const translatePattern = (pattern: string): string => {
    const patternMap: Record<string, string> = {
      "Risk-On Rotation": t("patterns.riskOnRotation"),
      "Risk-Off Rotation": t("patterns.riskOffRotation"),
      "Broad-Based Advance": t("patterns.broadBasedAdvance"),
      "Broad-Based Decline": t("patterns.broadBasedDecline"),
      "Mixed/No Clear Pattern": t("patterns.mixedNoClearPattern"),
      "Sector-Specific": t("patterns.sectorSpecific"),
    };
    return patternMap[pattern] || pattern;
  };

  // Translation function for observations
  const translateObservation = (observation: string): string => {
    let translated = observation;

    // High concentration: Rankings dominated by {sectors}
    const highConcentrationMatch = translated.match(
      /High concentration: Rankings dominated by (.+)/,
    );
    if (highConcentrationMatch) {
      const [, sectors] = highConcentrationMatch;
      // Translate sector names
      const translatedSectors = sectors
        .split(", ")
        .map((s) => translateSectorName(s))
        .join(", ");
      return t("observations.highConcentration", {
        sectors: translatedSectors,
      });
    }

    // Low concentration: Rankings spread across many sectors
    if (
      translated.includes(
        "Low concentration: Rankings spread across many sectors",
      )
    ) {
      return t("observations.lowConcentration");
    }

    // {n} sector anomalies detected
    const anomaliesMatch = translated.match(/(\d+) sector anomalies detected/);
    if (anomaliesMatch) {
      const [, count] = anomaliesMatch;
      return t("observations.sectorAnomalies", { count });
    }

    // Rankings dominated by: {sectors}
    const dominatedMatch = translated.match(/Rankings dominated by: (.+)/);
    if (dominatedMatch) {
      const [, sectors] = dominatedMatch;
      const translatedSectors = sectors
        .split(", ")
        .map((s) => translateSectorName(s))
        .join(", ");
      return t("observations.rankingsDominatedBy", {
        sectors: translatedSectors,
      });
    }

    // Rotation pattern: {pattern}
    const rotationMatch = translated.match(/Rotation pattern: (.+)/);
    if (rotationMatch) {
      const [, pattern] = rotationMatch;
      return t("observations.rotationPattern", {
        pattern: translatePattern(pattern),
      });
    }

    // Leading sectors: {sectors}
    const leadingMatch = translated.match(/Leading sectors: (.+)/);
    if (leadingMatch) {
      const [, sectors] = leadingMatch;
      const translatedSectors = sectors
        .split(", ")
        .map((s) => translateSectorName(s))
        .join(", ");
      return t("observations.leadingSectors", { sectors: translatedSectors });
    }

    // Lagging sectors: {sectors}
    const laggingMatch = translated.match(/Lagging sectors: (.+)/);
    if (laggingMatch) {
      const [, sectors] = laggingMatch;
      const translatedSectors = sectors
        .split(", ")
        .map((s) => translateSectorName(s))
        .join(", ");
      return t("observations.laggingSectors", { sectors: translatedSectors });
    }

    // Regime: {regime} (confirmed/not confirmed)
    const regimeMatch = translated.match(
      /Regime: (\w+(?:-\w+)?) \((confirmed|not confirmed)\)/,
    );
    if (regimeMatch) {
      const [, regime, confirmed] = regimeMatch;
      const key =
        confirmed === "confirmed"
          ? "observations.regimeConfirmed"
          : "observations.regimeNotConfirmed";
      return t(key, { regime });
    }

    return translated;
  };

  if (isLoading) {
    return <SectorStrengthSkeleton />;
  }

  if (error || !sectorData) {
    return (
      <Card padding="sm" className={className}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
          </div>
        </div>
        <p className="text-text-muted text-xs">{t("unableToLoad")}</p>
      </Card>
    );
  }

  // Get pattern badge color
  const getPatternColor = (): "buy" | "sell" | "neutral" | "watch" => {
    switch (sectorData.pattern) {
      case "Risk-On Rotation":
      case "Broad-Based Advance":
        return "buy";
      case "Risk-Off Rotation":
      case "Broad-Based Decline":
        return "sell";
      default:
        return "neutral";
    }
  };

  // Determine concentration bar color
  const getConcentrationColor = () => {
    if (sectorData.leadership.concentration > 60) return COLORS.down;
    if (sectorData.leadership.concentration > 30) return COLORS.warn;
    return COLORS.up;
  };

  // Get leaders and laggards from the leadership object
  const leaders = sectorData.leadership?.leaders || [];
  const laggards = sectorData.leadership?.laggards || [];
  const concentration = sectorData.leadership?.concentration || 0;

  return (
    <Card padding="sm" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-2">{t("title")}</h3>
        </div>
        <Badge size="sm" color={getPatternColor()}>
          {translatePattern(sectorData.pattern)}
        </Badge>
      </div>

      {/* Leaders Section */}
      {leaders.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3 text-up" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {t("topLeaders", { count: topCount })}
            </span>
          </div>
          <div className="space-y-1">
            {leaders.slice(0, topCount).map((sector) => (
              <SectorRow
                key={sector.sector.id}
                sector={sector}
                variant="leader"
                locale={locale}
                translateSignal={translateSignal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Laggards Section */}
      {showLaggards && laggards.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-2">
            <TrendingDown className="w-3 h-3 text-down" />
            <span className="text-[10px] uppercase tracking-wide text-text-muted">
              {t("bottomLaggards", { count: topCount })}
            </span>
          </div>
          <div className="space-y-1">
            {laggards.slice(0, topCount).map((sector) => (
              <SectorRow
                key={sector.sector.id}
                sector={sector}
                variant="laggard"
                locale={locale}
                translateSignal={translateSignal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Concentration Bar */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            {t("concentration")}
          </span>
          <span className="text-xs font-medium text-text">
            {formatPercentage(concentration)}
          </span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-width-grow"
            style={
              {
                width: `${Math.min(100, concentration)}%`,
                "--bar-width": `${Math.min(100, concentration)}%`,
                backgroundColor: getConcentrationColor(),
              } as React.CSSProperties
            }
          />
        </div>

        {/* Actionable Sectors */}
        {(sectorData.focusSectors.length > 0 ||
          sectorData.avoidSectors.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sectorData.focusSectors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-wide text-text-muted">
                  {t("buy")}
                </span>
                {sectorData.focusSectors.slice(0, 3).map((s) => (
                  <Badge key={s} size="sm" color="buy">
                    {translateSectorName(s)}
                  </Badge>
                ))}
              </div>
            )}
            {sectorData.avoidSectors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-wide text-text-muted">
                  {t("avoid")}
                </span>
                {sectorData.avoidSectors.slice(0, 3).map((s) => (
                  <Badge key={s} size="sm" color="sell">
                    {translateSectorName(s)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Observation */}
        {sectorData.observations && sectorData.observations.length > 0 && (
          <p className="mt-3 text-xs text-text-muted leading-relaxed">
            {translateObservation(sectorData.observations[0])}
          </p>
        )}
      </div>
    </Card>
  );
}

export default SectorStrengthCard;
