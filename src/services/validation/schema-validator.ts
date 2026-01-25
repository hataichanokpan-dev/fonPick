/**
 * Schema Validator
 *
 * Validates RTDB data before processing using Zod schemas.
 * Provides comprehensive validation for all data types from Firebase.
 */

import { z } from 'zod'

// ============================================================================
// ZOD SCHEMAS FOR RTDB DATA VALIDATION
// ============================================================================

/**
 * Schema for RTDBInvestorFlow
 * Validates individual investor flow data
 */
export const rtdbInvestorFlowSchema = z.object({
  buy: z.number().finite().min(0),
  sell: z.number().finite().min(0),
  net: z.number().finite(),
})

/**
 * Schema for RTDBInvestorType
 * Validates complete investor type data
 */
export const rtdbInvestorTypeSchema = z.object({
  foreign: rtdbInvestorFlowSchema,
  institution: rtdbInvestorFlowSchema,
  retail: rtdbInvestorFlowSchema,
  prop: rtdbInvestorFlowSchema,
  timestamp: z.number().int().positive(),
})

/**
 * Schema for RTDBSector
 * Validates individual sector data
 */
export const rtdbSectorSchema = z.object({
  id: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  index: z.number().finite().positive(),
  change: z.number().finite(),
  changePercent: z.number().finite(),
  marketCap: z.number().finite().nonnegative(),
  volume: z.number().finite().nonnegative(),
})

/**
 * Schema for RTDBIndustrySector
 * Validates industry sector collection
 */
export const rtdbIndustrySectorSchema = z.object({
  sectors: z.array(rtdbSectorSchema).min(1),
  timestamp: z.number().int().positive(),
})

/**
 * Schema for RTDBTopStock
 * Validates individual top stock entry
 */
export const rtdbTopStockSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().max(100).optional(),
  price: z.number().finite().positive().optional(),
  change: z.number().finite().optional(),
  changePct: z.number().finite().optional(),
  volume: z.number().finite().nonnegative().optional(),
  value: z.number().finite().nonnegative().optional(),
})

/**
 * Schema for RTDBTopRankings
 * Validates complete top rankings data
 */
export const rtdbTopRankingsSchema = z.object({
  topGainers: z.array(rtdbTopStockSchema).max(20),
  topLosers: z.array(rtdbTopStockSchema).max(20),
  topVolume: z.array(rtdbTopStockSchema).max(20),
  topValue: z.array(rtdbTopStockSchema).max(20),
  timestamp: z.number().int().positive(),
})

/**
 * Schema for RTDBMarketOverview
 * Validates market overview data
 */
export const rtdbMarketOverviewSchema = z.object({
  set: z.object({
    index: z.number().finite().positive(),
    change: z.number().finite(),
    changePercent: z.number().finite(),
  }),
  totalMarketCap: z.number().finite().nonnegative(),
  totalValue: z.number().finite().nonnegative(),
  totalVolume: z.number().finite().nonnegative(),
  advanceCount: z.number().int().nonnegative(),
  declineCount: z.number().int().nonnegative(),
  unchangedCount: z.number().int().nonnegative(),
  newHighCount: z.number().int().nonnegative(),
  newLowCount: z.number().int().nonnegative(),
  timestamp: z.number().int().positive(),
})

/**
 * Schema for RTDBSetIndex
 * Validates SET index history data
 */
export const rtdbSetIndexSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  index: z.number().finite().positive(),
  change: z.number().finite(),
  changePercent: z.number().finite(),
  high: z.number().finite().positive(),
  low: z.number().finite().positive().optional(),
  volume: z.number().finite().nonnegative().optional(),
  timestamp: z.number().int().positive(),
})

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  errors: string[]
  warnings: string[]
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate RTDB investor type data
 * @param data Raw data from RTDB
 * @returns Validation result
 */
export function validateInvestorType(data: unknown): ValidationResult<z.infer<typeof rtdbInvestorTypeSchema>> {
  const result = safeParse(data, rtdbInvestorTypeSchema, 'Investor Type')
  if (result.valid && result.data) {
    result.warnings.push(...checkInvestorTypeWarnings(result.data))
  }
  return result
}

/**
 * Validate RTDB industry sector data
 * @param data Raw data from RTDB
 * @returns Validation result
 */
export function validateIndustrySector(data: unknown): ValidationResult<z.infer<typeof rtdbIndustrySectorSchema>> {
  const result = safeParse(data, rtdbIndustrySectorSchema, 'Industry Sector')
  if (result.valid && result.data) {
    result.warnings.push(...checkSectorWarnings(result.data))
  }
  return result
}

/**
 * Validate RTDB top rankings data
 * @param data Raw data from RTDB
 * @returns Validation result
 */
export function validateTopRankings(data: unknown): ValidationResult<z.infer<typeof rtdbTopRankingsSchema>> {
  const result = safeParse(data, rtdbTopRankingsSchema, 'Top Rankings')
  if (result.valid && result.data) {
    result.warnings.push(...checkRankingsWarnings(result.data))
  }
  return result
}

/**
 * Validate RTDB market overview data
 * @param data Raw data from RTDB
 * @returns Validation result
 */
export function validateMarketOverview(data: unknown): ValidationResult<z.infer<typeof rtdbMarketOverviewSchema>> {
  return safeParse(data, rtdbMarketOverviewSchema, 'Market Overview')
}

/**
 * Validate RTDB SET index data
 * @param data Raw data from RTDB
 * @returns Validation result
 */
export function validateSetIndex(data: unknown): ValidationResult<z.infer<typeof rtdbSetIndexSchema>> {
  return safeParse(data, rtdbSetIndexSchema, 'SET Index')
}

/**
 * Validate multiple data types at once
 * @param inputs Object containing multiple data types
 * @returns Object with validation results for each type
 */
export function validateAllInputs(inputs: {
  investorType?: unknown
  industrySector?: unknown
  topRankings?: unknown
  marketOverview?: unknown
  setIndex?: unknown
}): {
  investorType?: ValidationResult<z.infer<typeof rtdbInvestorTypeSchema>>
  industrySector?: ValidationResult<z.infer<typeof rtdbIndustrySectorSchema>>
  topRankings?: ValidationResult<z.infer<typeof rtdbTopRankingsSchema>>
  marketOverview?: ValidationResult<z.infer<typeof rtdbMarketOverviewSchema>>
  setIndex?: ValidationResult<z.infer<typeof rtdbSetIndexSchema>>
  overallValid: boolean
} {
  const results: {
    investorType?: ValidationResult<z.infer<typeof rtdbInvestorTypeSchema>>
    industrySector?: ValidationResult<z.infer<typeof rtdbIndustrySectorSchema>>
    topRankings?: ValidationResult<z.infer<typeof rtdbTopRankingsSchema>>
    marketOverview?: ValidationResult<z.infer<typeof rtdbMarketOverviewSchema>>
    setIndex?: ValidationResult<z.infer<typeof rtdbSetIndexSchema>>
    overallValid: boolean
  } = {
    overallValid: true,
  }

  if (inputs.investorType !== undefined) {
    results.investorType = validateInvestorType(inputs.investorType)
    if (!results.investorType.valid) results.overallValid = false
  }

  if (inputs.industrySector !== undefined) {
    results.industrySector = validateIndustrySector(inputs.industrySector)
    if (!results.industrySector.valid) results.overallValid = false
  }

  if (inputs.topRankings !== undefined) {
    results.topRankings = validateTopRankings(inputs.topRankings)
    if (!results.topRankings.valid) results.overallValid = false
  }

  if (inputs.marketOverview !== undefined) {
    results.marketOverview = validateMarketOverview(inputs.marketOverview)
    if (!results.marketOverview.valid) results.overallValid = false
  }

  if (inputs.setIndex !== undefined) {
    results.setIndex = validateSetIndex(inputs.setIndex)
    if (!results.setIndex.valid) results.overallValid = false
  }

  return results
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safe parse with error handling
 */
function safeParse<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  typeName: string
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (result.success) {
    return {
      valid: true,
      data: result.data,
      errors: [],
      warnings: [],
    }
  }

  const errors = result.error.errors.map(err =>
    `${typeName}: ${err.path.join('.')} - ${err.message}`
  )

  return {
    valid: false,
    errors,
    warnings: [],
  }
}

/**
 * Check for warnings in investor type data
 */
function checkInvestorTypeWarnings(data: z.infer<typeof rtdbInvestorTypeSchema>): string[] {
  const warnings: string[] = []

  // Check for stale data (> 24 hours old)
  const age = Date.now() - data.timestamp
  if (age > 24 * 60 * 60 * 1000) {
    warnings.push('Investor type data is stale (> 24 hours old)')
  }

  // Check for unusual net values (> 5 billion THB)
  if (Math.abs(data.foreign.net) > 5000) {
    warnings.push('Foreign net flow unusually high (> 5 billion THB)')
  }

  // Check for zero total activity
  if (data.foreign.buy === 0 && data.foreign.sell === 0) {
    warnings.push('Foreign investor has zero activity')
  }

  return warnings
}

/**
 * Check for warnings in sector data
 */
function checkSectorWarnings(data: z.infer<typeof rtdbIndustrySectorSchema>): string[] {
  const warnings: string[] = []

  // Check for stale data
  const age = Date.now() - data.timestamp
  if (age > 24 * 60 * 60 * 1000) {
    warnings.push('Sector data is stale (> 24 hours old)')
  }

  // Check for insufficient sectors (< 5)
  if (data.sectors.length < 5) {
    warnings.push('Low sector count (< 5 sectors)')
  }

  // Check for sectors with zero volume
  const zeroVolumeSectors = data.sectors.filter(s => s.volume === 0).length
  if (zeroVolumeSectors > data.sectors.length * 0.3) {
    warnings.push('High proportion of sectors with zero volume (> 30%)')
  }

  // Check for extreme sector moves (> 10%)
  const extremeMoves = data.sectors.filter(s => Math.abs(s.changePercent) > 10).length
  if (extremeMoves > 0) {
    warnings.push(`${extremeMoves} sector(s) with extreme moves (> 10%)`)
  }

  return warnings
}

/**
 * Check for warnings in rankings data
 */
function checkRankingsWarnings(data: z.infer<typeof rtdbTopRankingsSchema>): string[] {
  const warnings: string[] = []

  // Check for stale data
  const age = Date.now() - data.timestamp
  if (age > 24 * 60 * 60 * 1000) {
    warnings.push('Rankings data is stale (> 24 hours old)')
  }

  // Check for empty rankings
  if (data.topGainers.length === 0 && data.topLosers.length === 0) {
    warnings.push('No top gainers or losers available')
  }

  // Check for unusual stock counts (< 5)
  if (data.topGainers.length < 5) {
    warnings.push('Low top gainers count (< 5)')
  }
  if (data.topLosers.length < 5) {
    warnings.push('Low top losers count (< 5)')
  }

  // Check for extreme changes (> 20%)
  const extremeGainers = data.topGainers.filter(s => s.changePct && s.changePct > 20).length
  if (extremeGainers > 0) {
    warnings.push(`${extremeGainers} stock(s) with extreme gains (> 20%)`)
  }

  const extremeLosers = data.topLosers.filter(s => s.changePct && s.changePct < -20).length
  if (extremeLosers > 0) {
    warnings.push(`${extremeLosers} stock(s) with extreme losses (> 20%)`)
  }

  return warnings
}

// ============================================================================
// EXPORTS
// ============================================================================
