/**
 * Historical Data Queries
 *
 * Functions for fetching historical data from RTDB.
 * Supports 60-day lookback and batch queries for multiple data points.
 *
 * Part of Phase 2: Cross-Analysis - Historical Data Queries
 */

import { rtdbGet } from './client'
import { RTDB_PATHS, getDateDaysAgo, getTodayDate } from './paths'
import type { RTDBMarketOverview, RTDBIndustrySector, RTDBInvestorType, RTDBTopRankings, RTDBSetIndex } from '@/types/rtdb'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Historical data point with date
 */
export interface HistoricalDataPoint<T> {
  date: string
  data: T
}

/**
 * Batch query result
 */
export interface BatchQueryResult<T> {
  data: HistoricalDataPoint<T>[]
  missingDates: string[]
  requestedCount: number
  retrievedCount: number
}

/**
 * Date range options
 */
export interface DateRangeOptions {
  /** Start date (YYYY-MM-DD) */
  startDate?: string

  /** End date (YYYY-MM-DD) */
  endDate?: string

  /** Number of days back from today or endDate */
  days?: number

  /** Exclude weekends (default: true) */
  excludeWeekends?: boolean

  /** Only include specific weekdays (0-6, 0=Sunday) */
  includeOnlyWeekdays?: number[]
}

// ============================================================================
// HELPER FUNCTIONS (must be defined first)
// ============================================================================

/**
 * Calculate date range from options
 * @param options Date range options
 * @returns Array of dates (YYYY-MM-DD format)
 */
function calculateDateRange(options: DateRangeOptions): string[] {
  const {
    startDate,
    endDate,
    days = 5,
    excludeWeekends = true,
    includeOnlyWeekdays,
  } = options

  const dates: string[] = []
  const ONE_DAY = 24 * 60 * 60 * 1000

  // Determine end date
  const end = endDate || getTodayDate()

  // Determine start date
  let start: string
  if (startDate) {
    start = startDate
  } else {
    // Use timestamp arithmetic instead of Date mutation
    const endDateObj = new Date(end)
    const daysBefore = (days - 1) * ONE_DAY
    const startDateObj = new Date(endDateObj.getTime() - daysBefore)
    start = startDateObj.toISOString().split('T')[0]
  }

  // Generate date range
  const startDateObj = new Date(start)
  const endDateObj = new Date(end)
  const dayCount = Math.round((endDateObj.getTime() - startDateObj.getTime()) / ONE_DAY)

  for (let i = 0; i <= dayCount; i++) {
    const currentDate = new Date(startDateObj.getTime() + i * ONE_DAY)
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()

    // Skip weekends if configured
    if (excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue
    }

    // Include only specific weekdays if configured
    if (includeOnlyWeekdays && !includeOnlyWeekdays.includes(dayOfWeek)) {
      continue
    }

    dates.push(dateStr)
  }

  return dates
}

/**
 * Fetch batch data for multiple dates
 * @param pathKey RTDB path key
 * @param dates Array of dates
 * @returns Batch query result
 */
async function fetchBatchData<T>(
  pathKey: keyof typeof RTDB_PATHS,
  dates: string[]
): Promise<BatchQueryResult<T>> {
  const pathFn = RTDB_PATHS[pathKey] as (date: string) => string

  // Fetch all dates in parallel
  const promises = dates.map(async (date) => {
    const data = await rtdbGet<T>(pathFn(date))
    return { date, data }
  })

  const results = await Promise.all(promises)

  // Separate successful and failed fetches
  const data: HistoricalDataPoint<T>[] = []
  const missingDates: string[] = []

  results.forEach(({ date, data: result }) => {
    if (result) {
      data.push({ date, data: result })
    } else {
      missingDates.push(date)
    }
  })

  return {
    data,
    missingDates,
    requestedCount: dates.length,
    retrievedCount: data.length,
  }
}

// ============================================================================
// SINGLE DATA TYPE HISTORICAL QUERIES
// ============================================================================

/**
 * Get historical market overview data
 * @param options Date range options
 * @returns Array of historical market overview data points
 */
export async function getHistoricalMarketOverview(
  options: DateRangeOptions = {}
): Promise<BatchQueryResult<RTDBMarketOverview>> {
  const dateRange = calculateDateRange(options)
  return fetchBatchData<RTDBMarketOverview>(
    'MARKET_OVERVIEW_BY_DATE',
    dateRange
  )
}

/**
 * Get historical industry sector data
 * @param options Date range options
 * @returns Array of historical sector data points
 */
export async function getHistoricalIndustrySector(
  options: DateRangeOptions = {}
): Promise<BatchQueryResult<RTDBIndustrySector>> {
  const dateRange = calculateDateRange(options)
  return fetchBatchData<RTDBIndustrySector>(
    'INDUSTRY_SECTOR_BY_DATE',
    dateRange
  )
}

/**
 * Get historical investor type data
 * @param options Date range options
 * @returns Array of historical investor type data points
 */
export async function getHistoricalInvestorType(
  options: DateRangeOptions = {}
): Promise<BatchQueryResult<RTDBInvestorType>> {
  const dateRange = calculateDateRange(options)
  return fetchBatchData<RTDBInvestorType>(
    'INVESTOR_TYPE_BY_DATE',
    dateRange
  )
}

/**
 * Get historical top rankings data
 * @param options Date range options
 * @returns Array of historical rankings data points
 */
export async function getHistoricalTopRankings(
  options: DateRangeOptions = {}
): Promise<BatchQueryResult<RTDBTopRankings>> {
  const dateRange = calculateDateRange(options)
  return fetchBatchData<RTDBTopRankings>(
    'RANKINGS_BY_DATE',
    dateRange
  )
}

/**
 * Get historical SET index data
 * @param options Date range options
 * @returns Array of historical SET index data points
 */
export async function getHistoricalSetIndex(
  options: DateRangeOptions = {}
): Promise<BatchQueryResult<RTDBSetIndex>> {
  const dateRange = calculateDateRange(options)
  return fetchBatchData<RTDBSetIndex>(
    'SET_INDEX_BY_DATE',
    dateRange
  )
}

// ============================================================================
// BATCH QUERIES (MULTIPLE DATA TYPES)
// ============================================================================

/**
 * Get all historical data for a specific date range
 * Fetches all data types in parallel
 *
 * @param options Date range options
 * @returns Object with all historical data types
 */
export async function getCompleteHistoricalData(
  options: DateRangeOptions = {}
): Promise<{
  marketOverview: BatchQueryResult<RTDBMarketOverview>
  industrySector: BatchQueryResult<RTDBIndustrySector>
  investorType: BatchQueryResult<RTDBInvestorType>
  topRankings: BatchQueryResult<RTDBTopRankings>
  setIndex: BatchQueryResult<RTDBSetIndex>
}> {
  const dateRange = calculateDateRange(options)

  const [
    marketOverview,
    industrySector,
    investorType,
    topRankings,
    setIndex,
  ] = await Promise.all([
    fetchBatchData<RTDBMarketOverview>('MARKET_OVERVIEW_BY_DATE', dateRange),
    fetchBatchData<RTDBIndustrySector>('INDUSTRY_SECTOR_BY_DATE', dateRange),
    fetchBatchData<RTDBInvestorType>('INVESTOR_TYPE_BY_DATE', dateRange),
    fetchBatchData<RTDBTopRankings>('RANKINGS_BY_DATE', dateRange),
    fetchBatchData<RTDBSetIndex>('SET_INDEX_BY_DATE', dateRange),
  ])

  return {
    marketOverview,
    industrySector,
    investorType,
    topRankings,
    setIndex,
  }
}

/**
 * Get N-day lookback data for trend analysis
 * Optimized for fetching the last N days of data
 *
 * @param days Number of days to look back (default: 5)
 * @param excludeWeekends Exclude weekends from results (default: true)
 * @returns Array of dates with data availability
 */
export async function getLookbackData(
  days: number = 5,
  excludeWeekends: boolean = true
): Promise<{
  dates: string[]
  hasMarketOverview: boolean[]
  hasIndustrySector: boolean[]
  hasInvestorType: boolean[]
  hasTopRankings: boolean[]
}> {
  const dateRange = calculateDateRange({ days, excludeWeekends })

  // Fetch all data types for each date
  const results = await Promise.all(
    dateRange.map(async (date) => {
      const [
        marketOverview,
        industrySector,
        investorType,
        topRankings,
      ] = await Promise.all([
        rtdbGet<RTDBMarketOverview>(RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)),
        rtdbGet<RTDBIndustrySector>(RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date)),
        rtdbGet<RTDBInvestorType>(RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date)),
        rtdbGet<RTDBTopRankings>(RTDB_PATHS.RANKINGS_BY_DATE(date)),
      ])

      return {
        date,
        hasMarketOverview: !!marketOverview,
        hasIndustrySector: !!industrySector,
        hasInvestorType: !!investorType,
        hasTopRankings: !!topRankings,
      }
    })
  )

  return {
    dates: results.map(r => r.date),
    hasMarketOverview: results.map(r => r.hasMarketOverview),
    hasIndustrySector: results.map(r => r.hasIndustrySector),
    hasInvestorType: results.map(r => r.hasInvestorType),
    hasTopRankings: results.map(r => r.hasTopRankings),
  }
}

// ============================================================================
// 60-DAY LOOKBACK FUNCTIONS
// ============================================================================

// Data type fetchers map
const DATA_TYPE_FETCHERS = {
  MARKET_OVERVIEW: getHistoricalMarketOverview,
  INDUSTRY_SECTOR: getHistoricalIndustrySector,
  INVESTOR_TYPE: getHistoricalInvestorType,
  TOP_RANKINGS: getHistoricalTopRankings,
  SET_INDEX: getHistoricalSetIndex,
} as const

/**
 * Get historical data by type (helper)
 */
async function getHistoricalDataByType(
  dataType: keyof typeof DATA_TYPE_FETCHERS,
  options: DateRangeOptions
) {
  const fetcher = DATA_TYPE_FETCHERS[dataType]
  return fetcher(options)
}

/**
 * Get 60-day historical data for trend analysis
 * This is the maximum lookback period for most analysis functions
 *
 * @param dataType Type of data to fetch
 * @returns Array of data points for the last 60 trading days
 */
export async function get60DayLookback<T>(
  dataType: keyof typeof DATA_TYPE_FETCHERS
): Promise<BatchQueryResult<T>> {
  return getHistoricalDataByType(dataType, {
    days: 60,
    excludeWeekends: true,
  }) as Promise<BatchQueryResult<T>>
}

/**
 * Get 30-day historical data for medium-term trends
 *
 * @param dataType Type of data to fetch
 * @returns Array of data points for the last 30 trading days
 */
export async function get30DayLookback<T>(
  dataType: keyof typeof DATA_TYPE_FETCHERS
): Promise<BatchQueryResult<T>> {
  return getHistoricalDataByType(dataType, {
    days: 30,
    excludeWeekends: true,
  }) as Promise<BatchQueryResult<T>>
}

/**
 * Get 7-day historical data for short-term trends
 *
 * @param dataType Type of data to fetch
 * @returns Array of data points for the last 7 trading days
 */
export async function get7DayLookback<T>(
  dataType: keyof typeof DATA_TYPE_FETCHERS
): Promise<BatchQueryResult<T>> {
  return getHistoricalDataByType(dataType, {
    days: 7,
    excludeWeekends: true,
  }) as Promise<BatchQueryResult<T>>
}

// ============================================================================
// DATA AVAILABILITY CHECKS
// ============================================================================

/**
 * Check if data is available for a specific date
 * @param date Date to check (YYYY-MM-DD)
 * @returns Data availability status
 */
export async function checkDataAvailability(date: string): Promise<{
  marketOverview: boolean
  industrySector: boolean
  investorType: boolean
  topRankings: boolean
  setIndex: boolean
  anyData: boolean
  allData: boolean
}> {
  const [
    marketOverview,
    industrySector,
    investorType,
    topRankings,
    setIndex,
  ] = await Promise.all([
    rtdbGet<RTDBMarketOverview>(RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)).then(d => !!d),
    rtdbGet<RTDBIndustrySector>(RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date)).then(d => !!d),
    rtdbGet<RTDBInvestorType>(RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date)).then(d => !!d),
    rtdbGet<RTDBTopRankings>(RTDB_PATHS.RANKINGS_BY_DATE(date)).then(d => !!d),
    rtdbGet<RTDBSetIndex>(RTDB_PATHS.SET_INDEX_BY_DATE(date)).then(d => !!d),
  ])

  const dataTypes = [marketOverview, industrySector, investorType, topRankings, setIndex]
  const anyData = dataTypes.some(Boolean)
  const allData = dataTypes.every(Boolean)

  return {
    marketOverview,
    industrySector,
    investorType,
    topRankings,
    setIndex,
    anyData,
    allData,
  }
}

/**
 * Find the latest available date with data
 * @param maxDaysBack Maximum days to look back (default: 7)
 * @returns Latest available date or null if no data found
 */
export async function findLatestAvailableDate(maxDaysBack: number = 7): Promise<string | null> {
  for (let i = 0; i < maxDaysBack; i++) {
    const date = getDateDaysAgo(i)
    const availability = await checkDataAvailability(date)

    if (availability.anyData) {
      return date
    }
  }

  return null
}

/**
 * Get data coverage report for a date range
 * @param options Date range options
 * @returns Coverage report showing data availability for each date
 */
export async function getDataCoverageReport(
  options: DateRangeOptions = {}
): Promise<Array<{
  date: string
  isWeekend: boolean
  availability: Awaited<ReturnType<typeof checkDataAvailability>>
}>> {
  const dates = calculateDateRange({
    ...options,
    excludeWeekends: false, // Include all dates in report
  })

  const reports = await Promise.all(
    dates.map(async (date) => {
      const dateObj = new Date(date)
      const dayOfWeek = dateObj.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      const availability = await checkDataAvailability(date)

      return {
        date,
        isWeekend,
        availability,
      }
    })
  )

  return reports
}

// ============================================================================
// VOLUME-SPECIFIC FUNCTIONS (Phase 1.1: Volume Analysis Fix)
// ============================================================================

/**
 * Fetch 5-day average SET Index volume from historical data
 * Used for dynamic volume health baseline calculation
 *
 * @param days Number of days to look back (default: 5)
 * @returns Array of volume values in thousands, or empty array if no data
 */
export async function fetch5DaySetIndexVolume(
  days: number = 5
): Promise<number[]> {
  try {
    // Get last 5 trading days (excluding weekends)
    const dateRange = calculateDateRange({
      days,
      excludeWeekends: true,
    })

    // Fetch market overview data for each date
    const results = await Promise.all(
      dateRange.map(async (date) => {
        const marketOverview = await rtdbGet<RTDBMarketOverview>(
          RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)
        )
        return marketOverview?.totalVolume || 0
      })
    )

    // Filter out zero values (missing data)
    const validVolumes = results.filter(v => v > 0)

    return validVolumes
  } catch (error) {
    console.error('Error fetching 5-day SET Index volume:', error)
    return []
  }
}

/**
 * Calculate 5-day average volume from historical data
 * Returns volume in millions (converts from thousands)
 *
 * @param days Number of days to look back (default: 5)
 * @returns Average volume in millions, or null if no data available
 */
export async function calculate5DayAverageVolume(
  days: number = 5
): Promise<number | null> {
  const historicalVolumes = await fetch5DaySetIndexVolume(days)

  if (historicalVolumes.length === 0) {
    return null
  }

  // Convert from thousands to millions, then average
  const sum = historicalVolumes.reduce((acc, vol) => acc + vol, 0)
  return sum / historicalVolumes.length / 1000 // Convert to millions
}
