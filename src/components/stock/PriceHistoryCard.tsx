/**
 * Professional Price History Chart Component
 *
 * กราฟราคาย้อนหลังแบบมืออาชีพสำหรับนักลงทุน
 *
 * Features:
 * - เส้นราคาพร้อม gradient fill
 * - Moving Averages (MA20, MA50, MA200)
 * - Support/Resistance levels อัตโนมาติ
 * - Entry Point, Stop Loss, Take Profit markers
 * - Volume bars (สีเขียว/แดง)
 * - Interactive tooltip พร้อม OHLCV + MA
 * - Indicator toggle controls
 * - Responsive design
 * - Bilingual support
 */

"use client";

import { useMemo, useState, useCallback } from "react";
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
  Bar,
} from "recharts";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import {
  calculateSMA,
  calculateSupportResistance,
} from "@/lib/technical-indicators";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface PriceHistoryCardProps {
  /** สัญลักษณ์หุ้น */
  symbol: string;
  /** จำนวนปีย้อนหลัง (default: 3) */
  years?: number;
  /** ช่วงเวลาข้อมูล (default: '1d') */
  interval?: "1d" | "1wk" | "1mo";
  /** ความสูงกราฟ (pixels) - responsive */
  height?: number;
  /** CSS classes เพิ่มเติม */
  className?: string;
  /** จุดเข้าซื้อ (optional) */
  entryPoint?: number;
  /** ระดับตัดขาดรูป (optional) */
  stopLoss?: number;
  /** ระดับทำกำไร (optional) */
  takeProfit?: number[];
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    technicalChart: "Technical Chart",
    threeYearHistory: "3-Year Price History",
    loading: "Loading chart...",
    error: "Failed to load chart",
    retry: "Retry",
    noData: "No data available",
    open: "Open",
    high: "High",
    low: "Low",
    close: "Close",
    volume: "Volume",
    change: "Change",
    ma20: "MA20",
    ma50: "MA50",
    ma200: "MA200",
    entry: "Entry",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    tp1: "TP1",
    tp2: "TP2",
    tp3: "TP3",
    support: "Support",
    resistance: "Resistance",
    indicators: "Indicators",
    ma: "MA",
    hide: "Hide",
    show: "Show",
    rrRatio: "R:R",
  },
  th: {
    technicalChart: "กราฟเทคนิค",
    threeYearHistory: "ราคาย้อนหลัง 3 ปี",
    loading: "กำลังโหลดกราฟ...",
    error: "โหลดกราฟไม่สำเร็จ",
    retry: "ลองใหม่",
    noData: "ไม่มีข้อมูล",
    open: "เปิด",
    high: "สูงสุด",
    low: "ต่ำสุด",
    close: "ปิด",
    volume: "ปริมาณ",
    change: "เปลี่ยนแปลง",
    ma20: "MA20",
    ma50: "MA50",
    ma200: "MA200",
    entry: "เข้าซื้อ",
    stopLoss: "ตัดขาดรูป",
    takeProfit: "ทำกำไร",
    tp1: "TP1",
    tp2: "TP2",
    tp3: "TP3",
    support: "แนวรับ",
    resistance: "แนวต้าน",
    indicators: "ตัวชี้วัด",
    ma: "MA",
    hide: "ซ่อน",
    show: "แสดง",
    rrRatio: "R:R",
  },
} as const;

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const chartColors = {
  // Price Line Colors
  priceUp: "#4ade80", // green-400 - Rising price
  priceDown: "#ff6b6b", // red-400 - Falling price
  priceNeutral: "#9ca3af", // gray-400 - Neutral

  // Trading Levels
  stopLoss: "#ff6b6b", // red-400 - SL line
  takeProfit: "#4ade80", // green-400 - TP line
  entryPoint: "#f59e0b", // amber-500 - Entry marker
  tp1: "#4ade80", // green-400 - TP1
  tp2: "#22c55e", // green-500 - TP2
  tp3: "#16a34a", // green-600 - TP3

  // Support/Resistance
  support: "#3b82f6", // blue-500 - Support level
  resistance: "#ef4444", // red-500 - Resistance level

  // Moving Averages
  ma20: "#60a5fa", // blue-400 - Fast MA
  ma50: "#a78bfa", // purple-400 - Medium MA
  ma200: "#f97316", // orange-500 - Slow MA

  // Volume
  volumeUp: "rgba(74, 222, 128, 0.5)", // green
  volumeDown: "rgba(255, 107, 107, 0.5)", // red

  // Grid & Axis
  grid: "#1f2937", // gray-800
  axis: "#6b7280", // gray-500
  crosshair: "#9ca3af", // gray-400

  // Tooltip
  tooltipBg: "#1f2937", // gray-800
  tooltipBorder: "#374151", // gray-700

  // Gradient
  gradientUp: {
    start: "rgba(74, 222, 128, 0.3)",
    end: "rgba(74, 222, 128, 0)",
  },
  gradientDown: {
    start: "rgba(255, 107, 107, 0.3)",
    end: "rgba(255, 107, 107, 0)",
  },
  gradientNeutral: {
    start: "rgba(156, 163, 175, 0.3)",
    end: "rgba(156, 163, 175, 0)",
  },
};

// ============================================================================
// RESPONSIVE HEIGHT
// ============================================================================

function getResponsiveHeight(baseHeight: number): number {
  if (typeof window === "undefined") return baseHeight;

  const width = window.innerWidth;
  if (width < 768) {
    return Math.max(baseHeight * 0.6, 240); // Mobile
  } else if (width < 1024) {
    return baseHeight * 0.8; // Tablet
  } else {
    return baseHeight; // Desktop
  }
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color?: string;
  }>;
  label?: string;
}

function PriceHistoryTooltip({ active, payload, label }: CustomTooltipProps) {
  const locale = useLocale() as "en" | "th";
  const t = translations[locale];

  if (!active || !payload?.length) return null;

  // Find main price data
  const priceData = payload.find((p) => p.dataKey === "close");
  const openData = payload.find((p) => p.dataKey === "open");
  const highData = payload.find((p) => p.dataKey === "high");
  const lowData = payload.find((p) => p.dataKey === "low");
  const volumeData = payload.find((p) => p.dataKey === "volume");
  const ma20Data = payload.find((p) => p.dataKey === "ma20");
  const ma50Data = payload.find((p) => p.dataKey === "ma50");
  const ma200Data = payload.find((p) => p.dataKey === "ma200");

  if (!priceData) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy", {
      locale: locale === "th" ? th : undefined,
    });
  };

  const formatNumber = (num: number) => num.toFixed(2);
  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(2)}K`;
    return vol.toFixed(2);
  };

  // Calculate change
  const close = priceData.value;
  const open = openData?.value ?? close;
  const change = close - open;
  const changePercent = (change / open) * 100;

  const isUp = change >= 0;

  return (
    <div
      className="rounded-lg border shadow-xl min-w-[220px]"
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

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-2">{t.close}:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold text-text-primary">
              {formatNumber(close)}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isUp ? "text-up-primary" : "text-down-primary",
              )}
            >
              {isUp ? "+" : ""}
              {formatNumber(change)} ({isUp ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* OHLC */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <span className="text-text-2">{t.open}:</span>
          <span className="text-right font-mono tabular-nums">
            {formatNumber(open)}
          </span>

          <span className="text-text-2">{t.high}:</span>
          <span className="text-right font-mono tabular-nums text-up-primary">
            {formatNumber(highData?.value ?? 0)}
          </span>

          <span className="text-text-2">{t.low}:</span>
          <span className="text-right font-mono tabular-nums text-down-primary">
            {formatNumber(lowData?.value ?? 0)}
          </span>

          <span className="text-text-2">{t.volume}:</span>
          <span className="text-right font-mono tabular-nums">
            {volumeData ? formatVolume(volumeData.value) : "-"}
          </span>
        </div>

        {/* Moving Averages */}
        {(ma20Data || ma50Data || ma200Data) && (
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-text-2 mb-1">{t.indicators}</div>
            <div className="space-y-1 text-xs">
              {ma20Data && (
                <div className="flex justify-between">
                  <span style={{ color: chartColors.ma20 }}>{t.ma20}:</span>
                  <span className="font-mono tabular-nums">
                    {formatNumber(ma20Data.value)}
                  </span>
                </div>
              )}
              {ma50Data && (
                <div className="flex justify-between">
                  <span style={{ color: chartColors.ma50 }}>{t.ma50}:</span>
                  <span className="font-mono tabular-nums">
                    {formatNumber(ma50Data.value)}
                  </span>
                </div>
              )}
              {ma200Data && (
                <div className="flex justify-between">
                  <span style={{ color: chartColors.ma200 }}>{t.ma200}:</span>
                  <span className="font-mono tabular-nums">
                    {formatNumber(ma200Data.value)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INDICATOR TOGGLE BUTTON
// ============================================================================

interface IndicatorToggleProps {
  label: string;
  color: string;
  isActive: boolean;
  onToggle: () => void;
}

function IndicatorToggle({
  label,
  color,
  isActive,
  onToggle,
}: IndicatorToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all",
        "hover:bg-surface-2",
        isActive ? "text-text-primary" : "text-text-3",
      )}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isActive ? color : chartColors.priceNeutral,
          opacity: isActive ? 1 : 0.4,
        }}
      />
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PriceHistoryCard({
  symbol,
  years = 3,
  interval = "1d",
  height = 400,
  className,
  entryPoint: userEntryPoint,
  stopLoss: userStopLoss,
  takeProfit: userTakeProfit,
}: PriceHistoryCardProps) {
  const locale = useLocale() as "en" | "th";
  const t = translations[locale];

  // Display configuration
  const [config, setConfig] = useState({
    showMA20: true,
    showMA50: true,
    showMA200: false,
    showSupportResistance: true,
    showVolume: true,
  });

  const toggleMA20 = useCallback(
    () => setConfig((prev) => ({ ...prev, showMA20: !prev.showMA20 })),
    [],
  );
  const toggleMA50 = useCallback(
    () => setConfig((prev) => ({ ...prev, showMA50: !prev.showMA50 })),
    [],
  );
  const toggleMA200 = useCallback(
    () => setConfig((prev) => ({ ...prev, showMA200: !prev.showMA200 })),
    [],
  );
  const toggleSR = useCallback(
    () =>
      setConfig((prev) => ({
        ...prev,
        showSupportResistance: !prev.showSupportResistance,
      })),
    [],
  );
  const toggleVolume = useCallback(
    () => setConfig((prev) => ({ ...prev, showVolume: !prev.showVolume })),
    [],
  );

  // Fetch price history
  const { data, isLoading, isError, error, refetch } = usePriceHistory({
    symbol,
    years,
    interval,
  });

  // Calculate technical indicators
  const {
    chartData,
    volumeMax,
    yDomain,
    lineColor,
    supportLevels,
    resistanceLevels,
  } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [],
        volumeMax: 1,
        yDomain: ["auto", "auto"],
        lineColor: chartColors.priceNeutral,
        gradientColors: chartColors.gradientNeutral,
        ma20Data: [],
        ma50Data: [],
        ma200Data: [],
        supportLevels: [],
        resistanceLevels: [],
      };
    }

    // Calculate moving averages
    const ma20 = calculateSMA(data, 20);
    const ma50 = calculateSMA(data, 50);
    const ma200 = calculateSMA(data, 200);

    // Calculate support/resistance
    const { support, resistance } = calculateSupportResistance(data);

    // Calculate volume max
    const volumeMax = Math.max(...data.map((d) => d.volume));

    // Determine line color based on price trend
    const firstPrice = data[0]?.close ?? 0;
    const lastPrice = data[data.length - 1]?.close ?? 0;
    const lineColor =
      lastPrice > firstPrice
        ? chartColors.priceUp
        : lastPrice < firstPrice
          ? chartColors.priceDown
          : chartColors.priceNeutral;

    const gradientColors =
      lastPrice > firstPrice
        ? chartColors.gradientUp
        : lastPrice < firstPrice
          ? chartColors.gradientDown
          : chartColors.gradientNeutral;

    // Calculate Y-axis domain
    let minY = Math.min(...data.map((d) => d.low));
    let maxY = Math.max(...data.map((d) => d.high));

    // Include user-defined trading levels
    if (userStopLoss) minY = Math.min(minY, userStopLoss);
    if (userTakeProfit && userTakeProfit.length > 0)
      maxY = Math.max(maxY, ...userTakeProfit);
    if (userEntryPoint) {
      minY = Math.min(minY, userEntryPoint);
      maxY = Math.max(maxY, userEntryPoint);
    }

    // Include support/resistance
    if (support.length > 0)
      minY = Math.min(minY, ...support.map((s) => s.price));
    if (resistance.length > 0)
      maxY = Math.max(maxY, ...resistance.map((r) => r.price));

    // Add padding
    const padding = (maxY - minY) * 0.05;
    const yDomain = [minY - padding, maxY + padding];

    // Merge all data into single array for chart
    const chartData = data.map((point) => {
      const ma20Point = ma20.find((m) => m.date === point.date);
      const ma50Point = ma50.find((m) => m.date === point.date);
      const ma200Point = ma200.find((m) => m.date === point.date);

      return {
        date: point.date,
        timestamp: new Date(point.date).getTime(),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        ma20: ma20Point?.value,
        ma50: ma50Point?.value,
        ma200: ma200Point?.value,
      };
    });

    return {
      chartData,
      volumeMax,
      yDomain,
      lineColor,
      gradientColors,
      ma20Data: ma20,
      ma50Data: ma50,
      ma200Data: ma200,
      supportLevels: support,
      resistanceLevels: resistance,
    };
  }, [data, userEntryPoint, userStopLoss, userTakeProfit, config]);

  // Responsive height
  const responsiveHeight = useMemo(() => getResponsiveHeight(height), [height]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Technical Chart
          </h3>
        </div>
        <div
          className="animate-pulse rounded-lg bg-surface-2"
          style={{ height: `${responsiveHeight}px` }}
        />
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (isError || !data) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Technical Chart
          </h3>
        </div>
        <div
          className="flex flex-col items-center justify-center rounded-lg bg-surface-2 border border-border"
          style={{ height: `${responsiveHeight}px` }}
        >
          <p className="text-text-2 mb-3">{error?.message || t.error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-accent-teal text-white text-sm font-medium hover:bg-accent-teal/80 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // NO DATA STATE
  // ============================================================================
  if (chartData.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Technical Chart
          </h3>
        </div>
        <div
          className="flex items-center justify-center rounded-lg bg-surface-2 border border-border"
          style={{ height: `${responsiveHeight}px` }}
        >
          <p className="text-text-2">{t.noData}</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // CHART RENDER
  // ============================================================================
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Technical Chart
        </h3>

        {/* Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <IndicatorToggle
            label={t.ma20}
            color={chartColors.ma20}
            isActive={config.showMA20}
            onToggle={toggleMA20}
          />
          <IndicatorToggle
            label={t.ma50}
            color={chartColors.ma50}
            isActive={config.showMA50}
            onToggle={toggleMA50}
          />
          <IndicatorToggle
            label={t.ma200}
            color={chartColors.ma200}
            isActive={config.showMA200}
            onToggle={toggleMA200}
          />
          <IndicatorToggle
            label="S/R"
            color={chartColors.support}
            isActive={config.showSupportResistance}
            onToggle={toggleSR}
          />
          <IndicatorToggle
            label={t.volume}
            color={chartColors.priceUp}
            isActive={config.showVolume}
            onToggle={toggleVolume}
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${responsiveHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: -15,
              bottom: config.showVolume ? 20 : 5,
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
              yAxisId="price"
              tick={{
                fill: chartColors.axis,
                fontSize: 11,
              }}
              tickFormatter={(value) => value.toFixed(2)}
              axisLine={false}
              tickLine={false}
              width={60}
            />

            {/* Y Axis for Volume */}
            {config.showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                domain={[0, volumeMax * 1.2]}
                tick={false}
                axisLine={false}
                tickLine={false}
                width={0}
              />
            )}

            {/* Tooltip */}
            <Tooltip
              content={<PriceHistoryTooltip />}
              cursor={{
                stroke: chartColors.crosshair,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              position={{ y: 0 }}
              allowEscapeViewBox={{ x: true, y: true }}
            />

            {/* Volume Bars */}
            {config.showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill={
                  lineColor === chartColors.priceUp
                    ? chartColors.volumeUp
                    : lineColor === chartColors.priceDown
                      ? chartColors.volumeDown
                      : chartColors.volumeUp
                }
                opacity={0.5}
                barSize={4}
              />
            )}

            {/* Price Area */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              fill={`url(#priceGradient-${symbol})`}
              stroke={lineColor}
              strokeWidth={2}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />

            {/* Moving Averages */}
            {config.showMA20 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma20"
                stroke={chartColors.ma20}
                strokeWidth={0.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}

            {config.showMA50 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma50"
                stroke={chartColors.ma50}
                strokeWidth={0.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}

            {config.showMA200 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma200"
                stroke={chartColors.ma200}
                strokeWidth={0.5}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            )}

            {/* Support Levels */}
            {config.showSupportResistance &&
              supportLevels.slice(0, 2).map((level, index) => (
                <ReferenceLine
                  key={`support-${index}`}
                  yAxisId="price"
                  y={level.price}
                  stroke={chartColors.support}
                  strokeWidth={0.5}
                  strokeDasharray="3 3"
                  label={{
                    value: `${t.support} ${level.price.toFixed(2)}`,
                    position: "insideTopLeft",
                    fill: chartColors.support,
                    fontSize: 8,
                  }}
                />
              ))}

            {/* Resistance Levels */}
            {config.showSupportResistance &&
              resistanceLevels.slice(0, 2).map((level, index) => (
                <ReferenceLine
                  key={`resistance-${index}`}
                  yAxisId="price"
                  y={level.price}
                  stroke={chartColors.resistance}
                  strokeWidth={0.5}
                  strokeDasharray="3 3"
                  label={{
                    value: `${t.resistance} ${level.price.toFixed(2)}`,
                    position: "insideBottomLeft",
                    fill: chartColors.resistance,
                    fontSize: 8,
                  }}
                />
              ))}

            {/* Entry Point */}
            {userEntryPoint && (
              <ReferenceLine
                yAxisId="price"
                y={userEntryPoint}
                stroke={chartColors.entryPoint}
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: `${t.entry} ${userEntryPoint.toFixed(2)}`,
                  position: "insideRight",
                  fill: chartColors.entryPoint,
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              />
            )}

            {/* Stop Loss */}
            {userStopLoss && (
              <ReferenceLine
                yAxisId="price"
                y={userStopLoss}
                stroke={chartColors.stopLoss}
                strokeWidth={2}
                label={{
                  value: `${t.stopLoss} ${userStopLoss.toFixed(2)}`,
                  position: "insideBottomRight",
                  fill: chartColors.stopLoss,
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              />
            )}

            {/* Take Profit Levels */}
            {userTakeProfit &&
              userTakeProfit.map((tp, index) => {
                const labels = [t.tp1, t.tp2, t.tp3];
                const colors = [
                  chartColors.tp1,
                  chartColors.tp2,
                  chartColors.tp3,
                ];
                return (
                  <ReferenceLine
                    key={`tp-${index}`}
                    yAxisId="price"
                    y={tp}
                    stroke={colors[index] || chartColors.takeProfit}
                    strokeWidth={2}
                    label={{
                      value: `${labels[index]} ${tp.toFixed(2)}`,
                      position: "insideTopRight",
                      fill: colors[index] || chartColors.takeProfit,
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  />
                );
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5" style={{ backgroundColor: lineColor }} />
          <span>{t.close}</span>
        </div>
        {config.showMA20 && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5"
              style={{ backgroundColor: chartColors.ma20 }}
            />
            <span>{t.ma20}</span>
          </div>
        )}
        {config.showMA50 && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5"
              style={{ backgroundColor: chartColors.ma50 }}
            />
            <span>{t.ma50}</span>
          </div>
        )}
        {config.showMA200 && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5"
              style={{ backgroundColor: chartColors.ma200 }}
            />
            <span>{t.ma200}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 border-t border-dashed"
            style={{ borderColor: chartColors.support }}
          />
          <span>{t.support}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 border-t border-dashed"
            style={{ borderColor: chartColors.resistance }}
          />
          <span>{t.resistance}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Default export
 */
export default PriceHistoryCard;
