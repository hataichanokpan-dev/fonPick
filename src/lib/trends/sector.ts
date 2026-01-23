/**
 * Sector Trend Calculations
 *
 * Calculates 5-day, 20-day, and YTD trends from existing RTDB historical data
 */

import { rtdbGet } from '@/lib/rtdb/client'
import { RTDB_PATHS } from '@/lib/rtdb/paths'
import type { RTDBIndustrySectorEntry } from '@/types/rtdb'
import type { SectorTrend, TrendValue } from './types'

/**
 * Get trading dates within a range (excluding weekends)
 */
function getTradingDays(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      // Not Sunday (0) or Saturday (6)
      dates.push(current.toISOString().split('T')[0])
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * Fetch sector data for multiple dates in parallel
 */
async function fetchSectorDataForDates(
  dates: string[]
): Promise<Map<string, RTDBIndustrySectorEntry>> {
  const results = await Promise.allSettled(
    dates.map(async (date) => {
      const data = await rtdbGet<RTDBIndustrySectorEntry>(
        RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date)
      )
      return { date, data }
    })
  )

  const map = new Map<string, RTDBIndustrySectorEntry>()

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.data) {
      map.set(result.value.date, result.value.data)
    }
  }

  return map
}

/**
 * Calculate trend value for a sector over a period
 */
function calculateTrend(
  sectorId: string,
  dataMap: Map<string, RTDBIndustrySectorEntry>,
  dates: string[]
): TrendValue | null {
  // Get first and last data points
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  const firstEntry = dataMap.get(firstDate)
  const lastEntry = dataMap.get(lastDate)

  if (!firstEntry || !lastEntry) {
    return null
  }

  const firstRow = firstEntry.rows[sectorId]
  const lastRow = lastEntry.rows[sectorId]

  if (!firstRow || !lastRow) {
    return null
  }

  const change = lastRow.last - firstRow.last
  const changePercent = (change / firstRow.last) * 100

  return {
    value: lastRow.last,
    change,
    changePercent,
    period: dates.length <= 7 ? '5D' : dates.length <= 25 ? '20D' : 'YTD',
  }
}

/**
 * Calculate 5-day trend for all sectors
 */
export async function calculateSector5DayTrend(): Promise<SectorTrend[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7) // 7 days to account for weekends

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchSectorDataForDates(dates)

  // Get all unique sector IDs from the latest data
  const latestEntry = dataMap.get(dates[dates.length - 1])
  if (!latestEntry) {
    return []
  }

  const sectorIds = Object.keys(latestEntry.rows)

  return sectorIds.map((sectorId) => {
    const row = latestEntry!.rows[sectorId]
    const fiveDay = calculateTrend(sectorId, dataMap, dates)

    return {
      sectorId,
      sectorName: row.name,
      fiveDay,
      twentyDay: null,
      ytd: null,
    }
  })
}

/**
 * Calculate 20-day trend for all sectors
 */
export async function calculateSector20DayTrend(): Promise<SectorTrend[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30) // 30 days to account for weekends

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchSectorDataForDates(dates)

  const latestEntry = dataMap.get(dates[dates.length - 1])
  if (!latestEntry) {
    return []
  }

  const sectorIds = Object.keys(latestEntry.rows)

  return sectorIds.map((sectorId) => {
    const row = latestEntry!.rows[sectorId]
    const twentyDay = calculateTrend(sectorId, dataMap, dates)

    return {
      sectorId,
      sectorName: row.name,
      fiveDay: null,
      twentyDay,
      ytd: null,
    }
  })
}

/**
 * Calculate YTD trend for all sectors
 */
export async function calculateSectorYTDTrend(): Promise<SectorTrend[]> {
  const endDate = new Date()
  const startDate = new Date(endDate.getFullYear(), 0, 1) // Jan 1 of current year

  const dates = getTradingDays(startDate, endDate)
  const dataMap = await fetchSectorDataForDates(dates)

  const latestEntry = dataMap.get(dates[dates.length - 1])
  if (!latestEntry) {
    return []
  }

  const sectorIds = Object.keys(latestEntry.rows)

  return sectorIds.map((sectorId) => {
    const row = latestEntry!.rows[sectorId]
    const ytd = calculateTrend(sectorId, dataMap, dates)

    return {
      sectorId,
      sectorName: row.name,
      fiveDay: null,
      twentyDay: null,
      ytd,
    }
  })
}

/**
 * Calculate all trends (5D, 20D, YTD) for all sectors
 */
export async function calculateAllSectorTrends(): Promise<SectorTrend[]> {
  const [fiveDay, twentyDay, ytd] = await Promise.all([
    calculateSector5DayTrend(),
    calculateSector20DayTrend(),
    calculateSectorYTDTrend(),
  ])

  // Merge results by sector ID
  const mergedMap = new Map<string, SectorTrend>()

  for (const trend of [...fiveDay, ...twentyDay, ...ytd]) {
    const existing = mergedMap.get(trend.sectorId)
    if (existing) {
      if (trend.fiveDay) existing.fiveDay = trend.fiveDay
      if (trend.twentyDay) existing.twentyDay = trend.twentyDay
      if (trend.ytd) existing.ytd = trend.ytd
    } else {
      mergedMap.set(trend.sectorId, { ...trend })
    }
  }

  return Array.from(mergedMap.values())
}
