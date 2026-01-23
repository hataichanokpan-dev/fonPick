/**
 * Investor Type Data Fetcher
 *
 * Fetches investor flow data by type (foreign, institution, retail, prop) from RTDB
 * under /settrade/investorType/byDate/{date}
 *
 * RTDB Structure:
 * /settrade/investorType/byDate/{YYYY-MM-DD}/
 *   ├── rows: { FOREIGN, LOCAL_INDIVIDUAL, LOCAL_INST, PROPRIETARY }
 *   │   └── { buyPct, buyValue, name, netValue, sellPct, sellValue }
 *   └── meta: { capturedAt, schemaVersion, source }
 */

import { fetchWithFallback } from './client'
import { RTDB_PATHS } from './paths'
import type {
  RTDBInvestorType,
  RTDBInvestorFlow,
  RTDBInvestorTypeEntry,
} from '@/types/rtdb'

/**
 * Parse capturedAt timestamp to unix timestamp
 */
function parseTimestamp(capturedAt: string): number {
  return new Date(capturedAt).getTime()
}

/**
 * Convert investor type row to flow format
 */
function toInvestorFlow(row: {
  buyValue: number
  sellValue: number
  netValue: number
}): RTDBInvestorFlow {
  return {
    buy: row.buyValue,
    sell: row.sellValue,
    net: row.netValue,
  }
}

/**
 * Convert RTDB entry to simplified app format
 */
function convertToInvestorType(entry: RTDBInvestorTypeEntry): RTDBInvestorType {
  const { rows } = entry

  return {
    foreign: toInvestorFlow(rows.FOREIGN),
    institution: toInvestorFlow(rows.LOCAL_INST),
    retail: toInvestorFlow(rows.LOCAL_INDIVIDUAL),
    prop: toInvestorFlow(rows.PROPRIETARY),
    timestamp: parseTimestamp(entry.meta.capturedAt),
  }
}

/**
 * Fetch investor type data for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @returns Investor type data or null if unavailable
 */
export async function fetchInvestorTypeByDate(
  date: string
): Promise<RTDBInvestorType | null> {
  const path = RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date)

  const entry = await fetchWithFallback<RTDBInvestorTypeEntry>(
    path,
    RTDB_PATHS.INVESTOR_TYPE_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return convertToInvestorType(entry)
}

/**
 * Fetch latest investor type data
 * @returns Investor type data or null if unavailable
 */
export async function fetchInvestorType(): Promise<RTDBInvestorType | null> {
  const entry = await fetchWithFallback<RTDBInvestorTypeEntry>(
    RTDB_PATHS.INVESTOR_TYPE_LATEST,
    RTDB_PATHS.INVESTOR_TYPE_PREVIOUS
  )

  if (!entry) {
    return null
  }

  return convertToInvestorType(entry)
}

/**
 * Get smart money flow (foreign + institution)
 * @param date Optional date string (defaults to today)
 * @returns Smart money net flow or null if unavailable
 */
export async function fetchSmartMoneyFlow(
  date?: string
): Promise<{
  net: number
  foreignNet: number
  institutionNet: number
} | null> {
  const investorType = date
    ? await fetchInvestorTypeByDate(date)
    : await fetchInvestorType()

  if (!investorType) {
    return null
  }

  return {
    net: investorType.foreign.net + investorType.institution.net,
    foreignNet: investorType.foreign.net,
    institutionNet: investorType.institution.net,
  }
}

/**
 * Check if smart money is buying
 * @returns true if net positive, false otherwise
 */
export async function isSmartMoneyBuying(): Promise<boolean | null> {
  const flow = await fetchSmartMoneyFlow()

  if (!flow) {
    return null
  }

  return flow.net > 0
}

/**
 * Get investor flow summary with names
 * @returns Summary of all investor flows or null if unavailable
 */
export async function fetchInvestorFlowSummary(): Promise<{
  foreign: { name: string; buy: number; sell: number; net: number }
  institution: { name: string; buy: number; sell: number; net: number }
  retail: { name: string; buy: number; sell: number; net: number }
  prop: { name: string; buy: number; sell: number; net: number }
  totalNet: number
} | null> {
  const entry = await fetchWithFallback<RTDBInvestorTypeEntry>(
    RTDB_PATHS.INVESTOR_TYPE_LATEST,
    RTDB_PATHS.INVESTOR_TYPE_PREVIOUS
  )

  if (!entry) {
    return null
  }

  const { rows } = entry

  return {
    foreign: {
      name: rows.FOREIGN.name,
      buy: rows.FOREIGN.buyValue,
      sell: rows.FOREIGN.sellValue,
      net: rows.FOREIGN.netValue,
    },
    institution: {
      name: rows.LOCAL_INST.name,
      buy: rows.LOCAL_INST.buyValue,
      sell: rows.LOCAL_INST.sellValue,
      net: rows.LOCAL_INST.netValue,
    },
    retail: {
      name: rows.LOCAL_INDIVIDUAL.name,
      buy: rows.LOCAL_INDIVIDUAL.buyValue,
      sell: rows.LOCAL_INDIVIDUAL.sellValue,
      net: rows.LOCAL_INDIVIDUAL.netValue,
    },
    prop: {
      name: rows.PROPRIETARY.name,
      buy: rows.PROPRIETARY.buyValue,
      sell: rows.PROPRIETARY.sellValue,
      net: rows.PROPRIETARY.netValue,
    },
    totalNet:
      rows.FOREIGN.netValue +
      rows.LOCAL_INST.netValue +
      rows.LOCAL_INDIVIDUAL.netValue +
      rows.PROPRIETARY.netValue,
  }
}

/**
 * Get flow trend for an investor type
 * @param investorType 'foreign' | 'institution' | 'retail' | 'prop'
 * @returns Trend: 'IN' for buying, 'OUT' for selling, 'NEUTRAL' for flat
 */
export async function getInvestorTrend(
  investorType: 'foreign' | 'institution' | 'retail' | 'prop'
): Promise<'IN' | 'OUT' | 'NEUTRAL' | null> {
  const investorData = await fetchInvestorType()

  if (!investorData) {
    return null
  }

  const flow =
    investorType === 'foreign'
      ? investorData.foreign
      : investorType === 'institution'
        ? investorData.institution
        : investorType === 'retail'
          ? investorData.retail
          : investorData.prop

  // Threshold for determining trend (0.5% of total value)
  const threshold = (flow.buy + flow.sell) * 0.005

  if (flow.net > threshold) {
    return 'IN'
  } else if (flow.net < -threshold) {
    return 'OUT'
  } else {
    return 'NEUTRAL'
  }
}
