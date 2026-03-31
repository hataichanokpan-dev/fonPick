/**
 * Catalyst-Aware Entry Calculator
 *
 * รวม catalyst events เข้ากับ entry zone calculation
 * เพื่อให้ได้ entry timing ที่แม่นยำยิ่งขึ้น
 */

import type {
  CatalystAwareEntryInput,
  CatalystAwareEntryOutput,
  UpcomingCatalyst,
  CatalystAdjustment
} from '@/types/swing-trading'
import type { ParsedCatalystData } from '@/types/catalyst'
import { calculateEntryZone } from './entry-calculator'

// ============================================================================
// CATALYST DATE PARSING
// ============================================================================

/**
 * Thai month abbreviations mapping
 * แม็ปชื่อเดือนย่อภาษาไทย
 */
const THAI_MONTHS: Record<string, number> = {
  'ม.ค.': 0, 'มกรา': 0, 'มกราคม': 0,
  'ก.พ.': 1, 'กุมภา': 1, 'กุมภาพันธ์': 1,
  'มี.ค.': 2, 'มีนา': 2, 'มีนาคม': 2,
  'เม.ย.': 3, 'เมษา': 3, 'เมษายน': 3,
  'พ.ค.': 4, 'พฤษภา': 4, 'พฤษภาคม': 4,
  'มิ.ย.': 5, 'มิถุนา': 5, 'มิถุนายน': 5,
  'ก.ค.': 6, 'กรกฎา': 6, 'กรกฎาคม': 6,
  'ส.ค.': 7, 'สิงหา': 7, 'สิงหาคม': 7,
  'ก.ย.': 8, 'กันยา': 8, 'กันยายน': 8,
  'ต.ค.': 9, 'ตุลา': 9, 'ตุลาคม': 9,
  'พ.ย.': 10, 'พฤศจิกายน': 10,
  'ธ.ค.': 11, 'ธันวา': 11, 'ธันวาคม': 11
}

/**
 * Parse date from catalyst description
 * รองรับหลาย format:
 * - "15 Feb", "15 ก.พ."
 * - "February 15", "15 กุมภาพันธ์"
 * - "(15 Feb)", "(15 ก.พ.)"
 * - "15 Feb 2025" (with year)
 * - Thai format with dots: "15 ก.พ."
 *
 * @param catalyst - Catalyst description
 * @param currentYear - Current year (default: current year)
 * @returns Date object or null if not found
 */
export function parseCatalystDate(
  catalyst: string,
  currentYear: number = new Date().getFullYear()
): Date | null {
  // Pattern with year: "DD Mon YYYY" or "(DD Mon YYYY)"
  const yearPattern = /(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/
  const yearMatch = catalyst.match(yearPattern)
  if (yearMatch) {
    const day = parseInt(yearMatch[1], 10)
    const monthStr = yearMatch[2]
    const year = parseInt(yearMatch[3], 10)

    const englishMonths: Record<string, number> = {
      'Jan': 0, 'January': 0,
      'Feb': 1, 'February': 1,
      'Mar': 2, 'March': 2,
      'Apr': 3, 'April': 3,
      'May': 4,
      'Jun': 5, 'June': 5,
      'Jul': 6, 'July': 6,
      'Aug': 7, 'August': 7,
      'Sep': 8, 'September': 8,
      'Oct': 9, 'October': 9,
      'Nov': 10, 'November': 10,
      'Dec': 11, 'December': 11
    }
    const month = englishMonths[monthStr]

    if (month !== undefined && !isNaN(day) && day >= 1 && day <= 31 && !isNaN(year)) {
      return new Date(year, month, day)
    }
  }

  // Try Thai format with dots: "DD ก.พ."
  const thaiPattern = /(\d{1,2})\s+([ก-๙\.]+)/
  const thaiMatch = catalyst.match(thaiPattern)
  if (thaiMatch) {
    const day = parseInt(thaiMatch[1], 10)
    const monthStr = thaiMatch[2]

    // Normalize Thai month (remove dots, get first 4 chars)
    const normalizedMonth = monthStr.replace(/\./g, '').substring(0, 4)
    const month = THAI_MONTHS[normalizedMonth] || THAI_MONTHS[monthStr]

    if (month !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
      const date = new Date(currentYear, month, day)
      // If date is in the past, try next year
      const now = new Date()
      if (date < now && (date.getMonth() < now.getMonth() || date.getDate() < now.getDate())) {
        date.setFullYear(currentYear + 1)
      }
      return date
    }
  }

  // Pattern 1: "DD Mon" format (e.g., "15 Feb")
  const dddMonPattern = /(\d{1,2})\s+([a-zA-Z]+)/
  const match1 = catalyst.match(dddMonPattern)
  if (match1) {
    const day = parseInt(match1[1], 10)
    const monthStr = match1[2]

    // Try English months
    const englishMonths: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    }
    const month = englishMonths[monthStr]

    if (month !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
      const date = new Date(currentYear, month, day)
      // If date is in the past, try next year
      const now = new Date()
      if (date < now && (date.getMonth() < now.getMonth() || date.getDate() < now.getDate())) {
        date.setFullYear(currentYear + 1)
      }
      return date
    }
  }

  // Pattern 2: "(DD Mon)" format
  const parenPattern = /\((\d{1,2})\s+([a-zA-Z]+|[\u0E00-\u0E7F]+)\)/
  const match2 = catalyst.match(parenPattern)
  if (match2) {
    const day = parseInt(match2[1], 10)
    const monthStr = match2[2]

    let month: number | undefined

    const englishMonths: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    }
    month = englishMonths[monthStr]

    if (month === undefined) {
      month = THAI_MONTHS[monthStr]
    }

    if (month !== undefined && !isNaN(day) && day >= 1 && day <= 31) {
      const date = new Date(currentYear, month, day)
      return date
    }
  }

  return null
}

/**
 * Parse catalysts into upcoming events
 * แยก catalyst descriptions และคำนวณ days until
 *
 * @param catalysts - Array of catalyst descriptions
 * @param currentDate - Reference date (default: now)
 * @returns Array of upcoming catalysts
 */
export function parseUpcomingCatalysts(
  catalysts: string[],
  currentDate: Date = new Date()
): UpcomingCatalyst[] {
  const currentYear = currentDate.getFullYear()
  const upcoming: UpcomingCatalyst[] = []

  for (const catalyst of catalysts) {
    const estimatedDate = parseCatalystDate(catalyst, currentYear)

    if (estimatedDate) {
      const daysUntil = Math.floor((estimatedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      // รวมทั้ง catalyst ที่ผ่านไปแล้ว แต่ mark ด้วยค่า negative
      upcoming.push({
        description: catalyst,
        daysUntil,
        estimatedDate
      })
    } else {
      // ไม่พบ date - เก็บไว้เฉยๆ แต่ไม่มี daysUntil
      upcoming.push({
        description: catalyst,
        daysUntil: Infinity
      })
    }
  }

  // Sort by daysUntil (catalysts ที่ใกล้ที่สุดมาก่อน)
  return upcoming.sort((a, b) => {
    // Handle Infinity (no date found)
    if (a.daysUntil === Infinity && b.daysUntil === Infinity) return 0
    if (a.daysUntil === Infinity) return 1
    if (b.daysUntil === Infinity) return -1
    return a.daysUntil - b.daysUntil
  })
}

// ============================================================================
// CATALYST-ADJUSTED ENTRY CALCULATION
// ============================================================================

/**
 * Calculate catalyst adjustment for entry
 * คำนวณการปรับ entry ตาม catalyst timeline
 *
 * @param catalystData - Parsed catalyst data
 * @param currentDate - Reference date
 * @returns Catalyst adjustment
 */
export function calculateCatalystAdjustment(
  catalystData: ParsedCatalystData,
  currentDate: Date = new Date()
): CatalystAdjustment {
  const upcomingCatalysts = parseUpcomingCatalysts(catalystData.catalysts, currentDate)

  // Filter only future catalysts
  const futureCatalysts = upcomingCatalysts.filter(c => c.daysUntil >= 0 && c.daysUntil !== Infinity)
  const allCatalystsPassed = futureCatalysts.length === 0

  const daysUntilNearest = futureCatalysts.length > 0
    ? futureCatalysts[0].daysUntil
    : null

  const catalystScore = catalystData.aiScore

  // Determine recommendation
  let recommendation = ''
  let shouldAccelerate = false

  if (allCatalystsPassed) {
    recommendation = 'All catalysts passed - wait for new catalysts or consider other opportunities'
    shouldAccelerate = false
  } else if (daysUntilNearest !== null) {
    if (daysUntilNearest <= 3) {
      recommendation = 'Catalyst imminent - enter now to capture pre-catalyst momentum'
      shouldAccelerate = true
    } else if (daysUntilNearest <= 7) {
      recommendation = 'Catalyst approaching - good entry window'
      shouldAccelerate = catalystScore >= 7.0
    } else if (daysUntilNearest <= 14) {
      recommendation = 'Catalyst in 1-2 weeks - patient entry acceptable'
      shouldAccelerate = false
    } else {
      recommendation = 'Catalyst far away - no rush to enter'
      shouldAccelerate = false
    }
  } else {
    recommendation = 'No clear catalyst dates - use technical analysis'
    shouldAccelerate = false
  }

  return {
    upcomingCatalysts: futureCatalysts,
    daysUntilNearest,
    allCatalystsPassed,
    catalystScore,
    recommendation,
    shouldAccelerate
  }
}

/**
 * Calculate entry zone with catalyst awareness
 * คำนวณ entry zone โดยคำนึงถึง catalyst events
 *
 * @param input - Catalyst-aware entry input
 * @returns Entry zone with catalyst adjustments
 */
export function calculateEntryZoneWithCatalyst(
  input: CatalystAwareEntryInput
): CatalystAwareEntryOutput {
  const { catalystData, currentDate = new Date(), ...baseInput } = input

  // Calculate base entry zone (without catalyst)
  const baseOutput = calculateEntryZone(baseInput)

  // ถ้าไม่มี catalyst data ให้คืนค่า base output
  if (!catalystData) {
    return baseOutput
  }

  // Calculate catalyst adjustment
  const catalystAdjustment = calculateCatalystAdjustment(catalystData, currentDate)

  // Adjust confidence based on catalyst
  let confidence = baseOutput.confidence
  let rationale = baseOutput.rationale

  // ปรับ confidence ตาม catalyst score
  if (catalystData.aiScore >= 8.0) {
    confidence += 10
    rationale += ' | Strong catalyst support'
  } else if (catalystData.aiScore >= 6.0) {
    confidence += 5
    rationale += ' | Moderate catalyst support'
  } else if (catalystData.aiScore < 4.0) {
    confidence -= 10
    rationale += ' | Weak catalyst support'
  }

  // ปรับ confidence ตาม catalyst proximity
  if (!catalystAdjustment.allCatalystsPassed && catalystAdjustment.daysUntilNearest !== null) {
    if (catalystAdjustment.daysUntilNearest <= 7) {
      confidence += 5
      rationale += ' | Catalyst near-term'
    } else if (catalystAdjustment.daysUntilNearest > 30) {
      confidence -= 5
      rationale += ' | Catalyst distant'
    }
  }

  // Clamp confidence
  confidence = Math.min(100, Math.max(0, confidence))

  // Calculate catalyst-based urgency
  const catalystUrgency = getCatalystBasedUrgency(
    catalystAdjustment.upcomingCatalysts,
    50 // Base urgency
  )

  // Get catalyst-based timing
  const catalystTiming = getCatalystBasedTiming(catalystUrgency)

  return {
    ...baseOutput,
    confidence: Number(confidence.toFixed(0)),
    rationale,
    catalystAdjustment,
    catalystUrgency,
    catalystTiming
  }
}

// ============================================================================
// CATALYST-BASED URGENCY & TIMING
// ============================================================================

/**
 * Calculate entry urgency based on catalyst timeline
 * คำนวณ urgency score ตาม catalyst timeline
 *
 * @param upcomingCatalysts - Array of upcoming catalysts
 * @param baseUrgency - Base urgency score (0-100)
 * @returns Urgency score (0-100)
 */
export function getCatalystBasedUrgency(
  upcomingCatalysts: UpcomingCatalyst[],
  baseUrgency: number = 50
): number {
  if (upcomingCatalysts.length === 0) {
    return baseUrgency
  }

  // Sort catalysts by daysUntil (nearest first)
  const sortedCatalysts = [...upcomingCatalysts].sort((a, b) => {
    // Handle Infinity (no date found)
    if (a.daysUntil === Infinity && b.daysUntil === Infinity) return 0
    if (a.daysUntil === Infinity) return 1
    if (b.daysUntil === Infinity) return -1
    return a.daysUntil - b.daysUntil
  })

  // Get nearest catalyst (first one after sorting)
  const nearest = sortedCatalysts.find(c => c.daysUntil >= 0 && c.daysUntil !== Infinity)

  if (!nearest) {
    return baseUrgency
  }

  const daysUntil = nearest.daysUntil

  // Urgency curve:
  // 0-3 days: +40 urgency (catalyst imminent)
  // 4-7 days: +20 urgency (catalyst near)
  // 8-14 days: +10 urgency (catalyst approaching)
  // 15-30 days: 0 urgency (neutral)
  // 30+ days: -15 urgency (no rush)
  let urgencyAdjustment = 0

  if (daysUntil <= 3) {
    urgencyAdjustment = 40
  } else if (daysUntil <= 7) {
    urgencyAdjustment = 20
  } else if (daysUntil <= 14) {
    urgencyAdjustment = 10
  } else if (daysUntil > 30) {
    urgencyAdjustment = -15
  }

  return Math.min(100, Math.max(0, baseUrgency + urgencyAdjustment))
}

/**
 * Get entry timing recommendation based on urgency
 * แนะนำ entry timing ตาม urgency score
 *
 * @param urgency - Urgency score (0-100)
 * @returns Timing recommendation
 */
export function getCatalystBasedTiming(urgency: number): string {
  if (urgency >= 80) {
    return 'Enter immediately - catalyst imminent'
  } else if (urgency >= 60) {
    return 'Enter within 3-5 trading days'
  } else if (urgency >= 40) {
    return 'Wait for pullback - monitor catalyst'
  } else {
    return 'Wait - catalyst too far or low conviction'
  }
}

/**
 * Determine if entry should be accelerated
 * ตัดสินใจว่าควรเร่ง entry หรือไม่
 *
 * @param params - Acceleration parameters
 * @returns Whether to accelerate entry
 */
export function shouldAccelerateEntry(params: {
  daysUntilNearestCatalyst: number | null
  trendPhase: 'early' | 'mature' | 'exhausted'
  catalystScore: number
}): boolean {
  const { daysUntilNearestCatalyst, trendPhase, catalystScore } = params

  // Must have catalyst
  if (daysUntilNearestCatalyst === null || daysUntilNearestCatalyst < 0) {
    return false
  }

  // Catalyst must be near (within 7 days)
  if (daysUntilNearestCatalyst > 7) {
    return false
  }

  // Trend must not be exhausted
  if (trendPhase === 'exhausted') {
    return false
  }

  // Catalyst score must be decent (>= 6.0)
  if (catalystScore < 6.0) {
    return false
  }

  // Early trend + near catalyst + good score = ACCELERATE
  return trendPhase === 'early' || daysUntilNearestCatalyst <= 3
}
