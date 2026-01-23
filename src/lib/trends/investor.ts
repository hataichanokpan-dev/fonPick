/**
 * Investor Flow Trend Calculations
 *
 * Calculates 5-day, 20-day, and YTD cumulative flows from existing RTDB data
 */

import { rtdbGet } from '@/lib/rtdb/client'
import { RTDB_PATHS } from '@/lib/rtdb/paths'
import type { RTDBInvestorTypeEntry } from '@/types/rtdb'
import type { InvestorTrend } from './types'

/**
 * Get trading days within a range
 */
function getTradingDays(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      dates.push(current.toISOString().split('T')[0])
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Fetch investor data for multiple dates
 */
async function fetchInvestorDataForDates(
  dates: string[]
): Promise<Map<string, RTDBInvestorTypeEntry>> {
  const results = await Promise.allSettled(
    dates.map(async (date) => {
      const data = await rtdbGet<RTDBInvestorTypeEntry>(
        RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date)
      )
      return { date, data }
    })
  )

  const map = new Map<string, RTDBInvestorTypeEntry>()

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.data) {
      map.set(result.value.date, result.value.data)
    }
  }

  return map
}

/**
 * Calculate cumulative net flow for an investor type over a period
 */
function calculateCumulativeNetFlow(
  investorType: 'FOREIGN' | 'LOCAL_INST' | 'LOCAL_INDIVIDUAL' | 'PROPRIETARY',
  dataMap: Map<string, RTDBInvestorTypeEntry>
): number {
  let sum = 0

  for (const entry of dataMap.values()) {
    sum += entry.rows[investorType].netValue
  }

  return sum
}

/**
 * Calculate 5-day investor flow trends
 */
export async function calculateInvestor5DayTrend(): Promise<InvestorTrend[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchInvestorDataForDates(dates)

  return [
    {
      type: 'foreign',
      fiveDayNet: calculateCumulativeNetFlow('FOREIGN', dataMap),
      twentyDayNet: 0,
      ytdNet: 0,
    },
    {
      type: 'institution',
      fiveDayNet: calculateCumulativeNetFlow('LOCAL_INST', dataMap),
      twentyDayNet: 0,
      ytdNet: 0,
    },
    {
      type: 'retail',
      fiveDayNet: calculateCumulativeNetFlow('LOCAL_INDIVIDUAL', dataMap),
      twentyDayNet: 0,
      ytdNet: 0,
    },
    {
      type: 'prop',
      fiveDayNet: calculateCumulativeNetFlow('PROPRIETARY', dataMap),
      twentyDayNet: 0,
      ytdNet: 0,
    },
  ]
}

/**
 * Calculate 20-day investor flow trends
 */
export async function calculateInvestor20DayTrend(): Promise<InvestorTrend[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchInvestorDataForDates(dates)

  return [
    {
      type: 'foreign',
      fiveDayNet: 0,
      twentyDayNet: calculateCumulativeNetFlow('FOREIGN', dataMap),
      ytdNet: 0,
    },
    {
      type: 'institution',
      fiveDayNet: 0,
      twentyDayNet: calculateCumulativeNetFlow('LOCAL_INST', dataMap),
      ytdNet: 0,
    },
    {
      type: 'retail',
      fiveDayNet: 0,
      twentyDayNet: calculateCumulativeNetFlow('LOCAL_INDIVIDUAL', dataMap),
      ytdNet: 0,
    },
    {
      type: 'prop',
      fiveDayNet: 0,
      twentyDayNet: calculateCumulativeNetFlow('PROPRIETARY', dataMap),
      ytdNet: 0,
    },
  ]
}

/**
 * Calculate YTD investor flow trends
 */
export async function calculateInvestorYTDTrend(): Promise<InvestorTrend[]> {
  const endDate = new Date()
  const startDate = new Date(endDate.getFullYear(), 0, 1)

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchInvestorDataForDates(dates)

  return [
    {
      type: 'foreign',
      fiveDayNet: 0,
      twentyDayNet: 0,
      ytdNet: calculateCumulativeNetFlow('FOREIGN', dataMap),
    },
    {
      type: 'institution',
      fiveDayNet: 0,
      twentyDayNet: 0,
      ytdNet: calculateCumulativeNetFlow('LOCAL_INST', dataMap),
    },
    {
      type: 'retail',
      fiveDayNet: 0,
      twentyDayNet: 0,
      ytdNet: calculateCumulativeNetFlow('LOCAL_INDIVIDUAL', dataMap),
    },
    {
      type: 'prop',
      fiveDayNet: 0,
      twentyDayNet: 0,
      ytdNet: calculateCumulativeNetFlow('PROPRIETARY', dataMap),
    },
  ]
}

/**
 * Calculate all investor flow trends
 */
export async function calculateAllInvestorTrends(): Promise<InvestorTrend[]> {
  const [fiveDay, twentyDay, ytd] = await Promise.all([
    calculateInvestor5DayTrend(),
    calculateInvestor20DayTrend(),
    calculateInvestorYTDTrend(),
  ])

  // Merge by type
  const mergedMap = new Map<string, InvestorTrend>()

  for (const trend of [...fiveDay, ...twentyDay, ...ytd]) {
    const existing = mergedMap.get(trend.type)
    if (existing) {
      if (trend.fiveDayNet !== 0) existing.fiveDayNet = trend.fiveDayNet
      if (trend.twentyDayNet !== 0) existing.twentyDayNet = trend.twentyDayNet
      if (trend.ytdNet !== 0) existing.ytdNet = trend.ytdNet
    } else {
      mergedMap.set(trend.type, { ...trend })
    }
  }

  return Array.from(mergedMap.values())
}
