/**
 * TrendDataTable Component
 *
 * Scrollable data table showing daily breakdown of investor flows.
 */

"use client";

import { formatTradingValue } from "@/lib/utils";
import type { CombinedTrendPoint } from "@/types/smart-money";

export interface TrendDataTableProps {
  combined: CombinedTrendPoint[];
  maxRows?: number;
}

function TableRow({ date, foreign, institution, retail, prop, total, signal }: {
  date: string;
  foreign: number;
  institution: number;
  retail: number;
  prop: number;
  total: number;
  signal: string;
}) {
  const formatValue = (value: number) => {
    const color = value > 0 ? "text-[#2ED8A7]" : value < 0 ? "text-[#F45B69]" : "text-text-muted";
    return (
      <span className={`font-medium tabular-nums text-xs ${color}`}>
        {value > 0 ? "+" : ""}
        {formatTradingValue(value)}
      </span>
    );
  };

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2">
      <td className="px-3 py-2 text-xs text-text-secondary whitespace-nowrap">
        {new Date(date).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
      </td>
      <td className="px-3 py-2 text-right">{formatValue(foreign)}</td>
      <td className="px-3 py-2 text-right">{formatValue(institution)}</td>
      <td className="px-3 py-2 text-right">{formatValue(retail)}</td>
      <td className="px-3 py-2 text-right">{formatValue(prop)}</td>
      <td className="px-3 py-2 text-right font-semibold">{formatValue(total)}</td>
      <td className="px-3 py-2 text-center">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
          signal.includes("Buy") ? "bg-[#2ED8A7]/20 text-[#2ED8A7]" :
          signal.includes("Sell") ? "bg-[#F45B69]/20 text-[#F45B69]" :
          "bg-surface-3 text-text-muted"
        }`}>
          {signal}
        </span>
      </td>
    </tr>
  );
}

export function TrendDataTable({ combined, maxRows = 15 }: TrendDataTableProps) {
  const displayData = [...combined].reverse().slice(0, maxRows);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2 border-b border-border-subtle">
            <th className="px-3 py-2 text-left text-text-muted">วันที่</th>
            <th className="px-3 py-2 text-right text-text-muted">Foreign</th>
            <th className="px-3 py-2 text-right text-text-muted">Inst</th>
            <th className="px-3 py-2 text-right text-text-muted">Retail</th>
            <th className="px-3 py-2 text-right text-text-muted">Prop</th>
            <th className="px-3 py-2 text-right text-text-muted">Total</th>
            <th className="px-3 py-2 text-center text-text-muted">Signal</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((point, index) => (
            <TableRow
              key={index}
              date={point.date}
              foreign={point.smartMoneyNet * 0.6}
              institution={point.smartMoneyNet * 0.4}
              retail={point.retailNet}
              prop={point.propNet}
              total={point.totalNet}
              signal={point.signal}
            />
          ))}
        </tbody>
      </table>
      {combined.length > maxRows && (
        <div className="text-center py-2 text-xs text-text-muted">
          แสดง {maxRows} วันล่าสุด จาก {combined.length} วัน
        </div>
      )}
    </div>
  );
}

export default TrendDataTable;
