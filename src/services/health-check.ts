/**
 * Health Check Service
 *
 * Monitors service health, data availability, and system status.
 * Provides health status for monitoring and alerting.
 *
 * Part of Phase 4: Service health monitoring.
 */

import { rtdbGet } from '@/lib/rtdb/client'
import { RTDB_PATHS, getTodayDate } from '@/lib/rtdb/paths'
import type { RTDBMarketOverview, RTDBIndustrySector, RTDBInvestorType, RTDBTopRankings } from '@/types/rtdb'

// ============================================================================
// HEALTH STATUS TYPES
// ============================================================================

/**
 * Individual data source health status
 */
export interface DataSourceHealth {
  /** Source name */
  name: string

  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

  /** Last successful data timestamp */
  lastDataTimestamp?: number

  /** Data age in milliseconds */
  dataAge?: number

  /** Whether data is fresh (within acceptable age) */
  isFresh: boolean

  /** Error message if unhealthy */
  error?: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Service health status
 */
export interface ServiceHealth {
  /** Service name */
  name: string

  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy'

  /** Response time in milliseconds */
  responseTime?: number

  /** Error message if unhealthy */
  error?: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Complete system health check result
 */
export interface HealthCheckResult {
  /** Overall system health */
  status: 'healthy' | 'degraded' | 'unhealthy'

  /** Timestamp of health check */
  timestamp: number

  /** Data source health */
  dataSources: {
    marketOverview: DataSourceHealth
    industrySector: DataSourceHealth
    investorType: DataSourceHealth
    topRankings: DataSourceHealth
  }

  /** Service health */
  services: {
    breadthAnalysis: ServiceHealth
    sectorRotation: ServiceHealth
    smartMoney: ServiceHealth
    insights: ServiceHealth
  }

  /** System metrics */
  metrics: {
    /** Total data sources available */
    totalDataSources: number

    /** Healthy data sources */
    healthyDataSources: number

    /** Health percentage */
    healthPercentage: number

    /** Average data age in milliseconds */
    averageDataAge: number
  }

  /** Warnings and recommendations */
  warnings: string[]

  /** Recommendations for fixing issues */
  recommendations: string[]
}

/**
 * Health check options
 */
export interface HealthCheckOptions {
  /** Maximum acceptable data age in milliseconds (default: 4 hours) */
  maxDataAge?: number

  /** Service timeout in milliseconds (default: 5000) */
  timeout?: number

  /** Include service response times (default: true) */
  includeResponseTimes?: boolean

  /** Specific date to check (default: today) */
  date?: string
}

// ============================================================================
// DATA FRESHNESS CONSTANTS
// ============================================================================

/**
 * Default maximum acceptable data age
 */
const DEFAULT_MAX_DATA_AGE = 4 * 60 * 60 * 1000 // 4 hours

/**
 * Data age thresholds
 */
const DATA_AGE_THRESHOLDS = {
  FRESH: 1 * 60 * 60 * 1000, // 1 hour - considered fresh
  STALE: 4 * 60 * 60 * 1000, // 4 hours - considered stale
  CRITICAL: 8 * 60 * 60 * 1000, // 8 hours - critical
}

// ============================================================================
// MAIN HEALTH CHECK FUNCTION
// ============================================================================

/**
 * Perform complete health check
 *
 * Checks all data sources and services to determine system health.
 * Returns detailed health status for monitoring and alerting.
 *
 * @param options Health check options
 * @returns Complete health check result
 *
 * @example
 * ```ts
 * const health = await performHealthCheck()
 *
 * if (health.status !== 'healthy') {
 *   console.warn('System health issues:', health.warnings)
 * }
 * ```
 */
export async function performHealthCheck(
  options: HealthCheckOptions = {}
): Promise<HealthCheckResult> {
  const {
    maxDataAge = DEFAULT_MAX_DATA_AGE,
    timeout = 5000,
    includeResponseTimes = true,
    date = getTodayDate(),
  } = options

  const timestamp = Date.now()
  const warnings: string[] = []
  const recommendations: string[] = []

  // Check data sources in parallel with timeout
  const dataSourcesPromise = checkDataSources(date, maxDataAge, includeResponseTimes)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Health check timeout')), timeout)
  )

  const dataSources = await Promise.race([dataSourcesPromise, timeoutPromise]) as Awaited<
    ReturnType<typeof checkDataSources>
  >

  // Check services
  const services = await checkServices(includeResponseTimes)

  // Calculate metrics
  const dataSourceValues = Object.values(dataSources)
  const healthyDataSources = dataSourceValues.filter(ds => ds.status === 'healthy').length
  const totalDataSources = dataSourceValues.length

  const dataAges = dataSourceValues
    .filter(ds => ds.dataAge !== undefined)
    .map(ds => ds.dataAge!)
  const averageDataAge =
    dataAges.length > 0 ? dataAges.reduce((sum, age) => sum + age, 0) / dataAges.length : 0

  const healthPercentage = (healthyDataSources / totalDataSources) * 100

  // Generate warnings and recommendations
  dataSourceValues.forEach(ds => {
    if (ds.status === 'unhealthy') {
      warnings.push(`${ds.name} is unhealthy: ${ds.error || 'Unknown error'}`)
      recommendations.push(`Check ${ds.name} data feed and update processes`)
    } else if (ds.status === 'degraded') {
      warnings.push(`${ds.name} is degraded: data age ${ds.dataAge ? formatDataAge(ds.dataAge) : 'unknown'}`)
      recommendations.push(`Verify ${ds.name} data freshness`)
    } else if (!ds.isFresh && ds.dataAge) {
      warnings.push(`${ds.name} data is stale: ${formatDataAge(ds.dataAge)} old`)
    }
  })

  if (averageDataAge > DATA_AGE_THRESHOLDS.STALE) {
    recommendations.push('Data refresh rate may be too slow - check data pipelines')
  }

  if (healthPercentage < 50) {
    recommendations.push('Critical: Multiple data sources are down - investigate immediately')
  } else if (healthPercentage < 80) {
    recommendations.push('Some data sources are unavailable - monitor closely')
  }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthPercentage >= 80 && averageDataAge <= maxDataAge) {
    status = 'healthy'
  } else if (healthPercentage >= 50 && averageDataAge <= maxDataAge * 1.5) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    timestamp,
    dataSources,
    services,
    metrics: {
      totalDataSources,
      healthyDataSources,
      healthPercentage,
      averageDataAge,
    },
    warnings,
    recommendations,
  }
}

// ============================================================================
// DATA SOURCE CHECKS
// ============================================================================

/**
 * Check all data sources
 */
async function checkDataSources(
  date: string,
  maxDataAge: number,
  includeResponseTimes: boolean
): Promise<{
  marketOverview: DataSourceHealth
  industrySector: DataSourceHealth
  investorType: DataSourceHealth
  topRankings: DataSourceHealth
}> {
  const now = Date.now()

  // Fetch all data sources in parallel
  const promises = [
    checkDataSource<RTDBMarketOverview>('Market Overview', RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date), maxDataAge, now),
    checkDataSource<RTDBIndustrySector>('Industry Sector', RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date), maxDataAge, now),
    checkDataSource<RTDBInvestorType>('Investor Type', RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date), maxDataAge, now),
    checkDataSource<RTDBTopRankings>('Top Rankings', RTDB_PATHS.RANKINGS_BY_DATE(date), maxDataAge, now, true),
  ] as const

  if (includeResponseTimes) {
    const [marketOverview, industrySector, investorType, topRankings] = await Promise.all([
      withResponseTime(promises[0]),
      withResponseTime(promises[1]),
      withResponseTime(promises[2]),
      withResponseTime(promises[3]),
    ])
    return { marketOverview, industrySector, investorType, topRankings }
  }

  const [marketOverview, industrySector, investorType, topRankings] = await Promise.all(promises)
  return { marketOverview, industrySector, investorType, topRankings }
}

/**
 * Check individual data source
 */
async function checkDataSource<T>(
  name: string,
  path: string,
  maxDataAge: number,
  now: number,
  optional = false
): Promise<DataSourceHealth> {
  try {
    const data = await rtdbGet<T>(path)

    if (!data) {
      return {
        name,
        status: optional ? 'degraded' : 'unhealthy',
        isFresh: false,
        error: optional ? 'Optional data not available' : 'Data not available',
      }
    }

    // Extract timestamp from data
    const timestamp = (data as { timestamp?: number }).timestamp
    if (!timestamp) {
      return {
        name,
        status: 'degraded',
        isFresh: false,
        error: 'No timestamp in data',
      }
    }

    const dataAge = now - timestamp
    const isFresh = dataAge <= maxDataAge

    let status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
    if (dataAge <= DATA_AGE_THRESHOLDS.FRESH) {
      status = 'healthy'
    } else if (dataAge <= DATA_AGE_THRESHOLDS.STALE) {
      status = 'degraded'
    } else if (dataAge <= DATA_AGE_THRESHOLDS.CRITICAL) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return {
      name,
      status,
      lastDataTimestamp: timestamp,
      dataAge,
      isFresh,
      metadata: {
        path,
        lastUpdate: new Date(timestamp).toISOString(),
      },
    }
  } catch (error) {
    return {
      name,
      status: optional ? 'degraded' : 'unhealthy',
      isFresh: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Add response time to data source health
 */
async function withResponseTime<T>(dataSourcePromise: Promise<T>): Promise<T> {
  const start = performance.now()
  const result = await dataSourcePromise
  const responseTime = Math.round(performance.now() - start)

  return {
    ...result,
    metadata: {
      ...((await dataSourcePromise) as any).metadata,
      responseTime,
    },
  } as T
}

// ============================================================================
// SERVICE CHECKS
// ============================================================================

/**
 * Check all analysis services
 */
async function checkServices(includeResponseTimes: boolean): Promise<{
  breadthAnalysis: ServiceHealth
  sectorRotation: ServiceHealth
  smartMoney: ServiceHealth
  insights: ServiceHealth
}> {
  // Services are checked by testing with mock data
  // This ensures the service logic is working correctly

  const services = await Promise.all([
    checkService('Market Breadth Analysis', async () => {
      const { analyzeMarketBreadth } = await import('@/services/market-breadth/analyzer')
      const mockData = createMockMarketOverview()
      return analyzeMarketBreadth({ current: mockData })
    }),
    checkService('Sector Rotation Analysis', async () => {
      const { analyzeSectorRotation } = await import('@/services/sector-rotation/analyzer')
      const mockData = createMockIndustrySector()
      return analyzeSectorRotation({ sectors: mockData })
    }),
    checkService('Smart Money Analysis', async () => {
      const { analyzeSmartMoney } = await import('@/services/smart-money/signal')
      const mockData = createMockInvestorType()
      return analyzeSmartMoney({ current: mockData })
    }),
    checkService('Insights Generation', async () => {
      const { generateActionableInsights } = await import('@/services/insights/generator')
      return generateActionableInsights({})
    }),
  ])

  return {
    breadthAnalysis: includeResponseTimes ? services[0] : await stripResponseTime(services[0]),
    sectorRotation: includeResponseTimes ? services[1] : await stripResponseTime(services[1]),
    smartMoney: includeResponseTimes ? services[2] : await stripResponseTime(services[2]),
    insights: includeResponseTimes ? services[3] : await stripResponseTime(services[3]),
  }
}

/**
 * Check individual service
 */
async function checkService(
  name: string,
  testFn: () => Promise<unknown>
): Promise<ServiceHealth> {
  const start = performance.now()

  try {
    const result = await testFn()
    const responseTime = Math.round(performance.now() - start)

    if (!result) {
      return {
        name,
        status: 'unhealthy',
        responseTime,
        error: 'Service returned null/undefined',
      }
    }

    return {
      name,
      status: 'healthy',
      responseTime,
      metadata: {
        testPassed: true,
      },
    }
  } catch (error) {
    const responseTime = Math.round(performance.now() - start)

    return {
      name,
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Remove response time from service health
 */
async function stripResponseTime(service: ServiceHealth): Promise<ServiceHealth> {
  const { responseTime, ...rest } = service
  return rest
}

// ============================================================================
// MOCK DATA CREATORS
// ============================================================================

/**
 * Create mock market overview for testing
 */
function createMockMarketOverview(): RTDBMarketOverview {
  return {
    set: {
      index: 1350,
      change: 10,
      changePercent: 0.75,
    },
    totalMarketCap: 15000000,
    totalValue: 60000,
    totalVolume: 50000,
    advanceCount: 400,
    declineCount: 300,
    unchangedCount: 100,
    newHighCount: 50,
    newLowCount: 20,
    timestamp: Date.now(),
  }
}

/**
 * Create mock industry sector for testing
 */
function createMockIndustrySector(): RTDBIndustrySector {
  return {
    sectors: [
      { id: 'FIN', name: 'Financial', index: 350, change: 5, changePercent: 1.5, volume: 15000, marketCap: 150000 },
      { id: 'ENERGY', name: 'Energy', index: 280, change: -2, changePercent: -0.7, volume: 12000, marketCap: 120000 },
    ],
    timestamp: Date.now(),
  }
}

/**
 * Create mock investor type for testing
 */
function createMockInvestorType(): RTDBInvestorType {
  return {
    foreign: { buy: 5000, sell: 3000, net: 2000 },
    institution: { buy: 4000, sell: 3500, net: 500 },
    retail: { buy: 2000, sell: 2500, net: -500 },
    prop: { buy: 1000, sell: 1000, net: 0 },
    timestamp: Date.now(),
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format data age for display
 */
function formatDataAge(ageMs: number): string {
  const minutes = Math.floor(ageMs / 60000)
  const hours = Math.floor(ageMs / 3600000)
  const days = Math.floor(ageMs / 86400000)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Get health status color code (for monitoring systems)
 */
export function getHealthStatusCode(status: 'healthy' | 'degraded' | 'unhealthy'): number {
  switch (status) {
    case 'healthy':
      return 0
    case 'degraded':
      return 1
    case 'unhealthy':
      return 2
  }
}

/**
 * Check if health result is healthy
 */
export function isHealthy(health: HealthCheckResult): boolean {
  return health.status === 'healthy'
}

/**
 * Check if health result requires attention
 */
export function requiresAttention(health: HealthCheckResult): boolean {
  return health.status !== 'healthy'
}

/**
 * Get health summary for quick display
 */
export function getHealthSummary(health: HealthCheckResult): string {
  const healthyCount = health.metrics.healthyDataSources
  const totalCount = health.metrics.totalDataSources

  return `${health.status.toUpperCase()}: ${healthyCount}/${totalCount} data sources healthy, avg age: ${formatDataAge(health.metrics.averageDataAge)}`
}

// ============================================================================
// QUICK HEALTH CHECKS
// ============================================================================

/**
 * Quick health check - only checks data availability
 */
export async function quickHealthCheck(date?: string): Promise<{
  allDataAvailable: boolean
  missingSources: string[]
  timestamp: number
}> {
  const targetDate = date || getTodayDate()

  const [marketOverview, industrySector, investorType] = await Promise.all([
    rtdbGet(RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(targetDate)),
    rtdbGet(RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(targetDate)),
    rtdbGet(RTDB_PATHS.INVESTOR_TYPE_BY_DATE(targetDate)),
  ])

  const missingSources: string[] = []
  if (!marketOverview) missingSources.push('Market Overview')
  if (!industrySector) missingSources.push('Industry Sector')
  if (!investorType) missingSources.push('Investor Type')

  return {
    allDataAvailable: missingSources.length === 0,
    missingSources,
    timestamp: Date.now(),
  }
}

/**
 * Check data freshness only
 */
export async function checkDataFreshness(maxAge: number = DEFAULT_MAX_DATA_AGE): Promise<{
  allFresh: boolean
  staleSources: Array<{ name: string; age: number }>
  timestamp: number
}> {
  const now = Date.now()
  const date = getTodayDate()

  const [marketOverview, industrySector, investorType] = await Promise.all([
    rtdbGet<RTDBMarketOverview>(RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(date)),
    rtdbGet<RTDBIndustrySector>(RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(date)),
    rtdbGet<RTDBInvestorType>(RTDB_PATHS.INVESTOR_TYPE_BY_DATE(date)),
  ])

  const staleSources: Array<{ name: string; age: number }> = []

  if (marketOverview?.timestamp) {
    const age = now - marketOverview.timestamp
    if (age > maxAge) staleSources.push({ name: 'Market Overview', age })
  }

  if (industrySector?.timestamp) {
    const age = now - industrySector.timestamp
    if (age > maxAge) staleSources.push({ name: 'Industry Sector', age })
  }

  if (investorType?.timestamp) {
    const age = now - investorType.timestamp
    if (age > maxAge) staleSources.push({ name: 'Investor Type', age })
  }

  return {
    allFresh: staleSources.length === 0,
    staleSources,
    timestamp: now,
  }
}
