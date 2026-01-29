/**
 * Date Utilities (Thai Timezone UTC+7)
 *
 * Provides consistent date handling for Thai timezone (UTC+7)
 * to prevent hydration errors and ensure correct date display
 * when deployed on Vercel (which uses UTC).
 *
 * Key Features:
 * - All dates are calculated in Thai timezone (UTC+7)
 * - Consistent results across server and client
 * - Prevents hydration mismatches
 * - Handles daylight saving time boundaries (though Thailand doesn't use DST)
 */

/**
 * Get date string in Thai timezone (UTC+7) in YYYY-MM-DD format
 *
 * Uses Intl.DateTimeFormat with Asia/Bangkok timezone to ensure
 * correct date conversion regardless of server timezone.
 *
 * @param date - Optional Date object (defaults to current time)
 * @returns Date string in YYYY-MM-DD format in Thai timezone
 *
 * @example
 * getThaiDate(new Date('2026-01-29T00:00:00.000Z')) // '2026-01-29'
 * getThaiDate(new Date('2026-01-28T22:00:00.000Z')) // '2026-01-29' (next day in Thai time)
 */
export function getThaiDate(date?: Date | null): string {
  try {
    // Handle null/undefined - use current time
    let baseDate: Date
    if (date == null) {
      baseDate = new Date()
    } else if (!(date instanceof Date) || isNaN(date.getTime())) {
      // Fallback to current time if date is invalid or not a Date object
      baseDate = new Date()
    } else {
      baseDate = date
    }

    // Use Intl.DateTimeFormat with Thai timezone for accurate conversion
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    // en-CA locale gives YYYY-MM-DD format
    return formatter.format(baseDate)
  } catch (error) {
    // Fallback: use toLocaleString and parse
    console.error('Error in getThaiDate:', error)
    const fallback = new Date()
    const year = fallback.toLocaleString('en-US', { timeZone: 'Asia/Bangkok', year: 'numeric' })
    const month = fallback.toLocaleString('en-US', { timeZone: 'Asia/Bangkok', month: '2-digit' })
    const day = fallback.toLocaleString('en-US', { timeZone: 'Asia/Bangkok', day: '2-digit' })
    return `${year}-${month}-${day}`
  }
}

/**
 * Get date string for N days ago in Thai timezone
 *
 * @param days - Number of days to go back (can be negative for future dates)
 * @param date - Optional Date object to calculate from (defaults to current time)
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * getThaiDateDaysAgo(1) // '2026-01-28' (if today is 2026-01-29)
 * getThaiDateDaysAgo(7) // '2026-01-22'
 */
export function getThaiDateDaysAgo(days: number, date?: Date | null): string {
  try {
    // Handle null/undefined - use current time
    let baseDate: Date
    if (date == null) {
      baseDate = new Date()
    } else if (!(date instanceof Date) || isNaN(date.getTime())) {
      // Fallback to current time if date is invalid
      baseDate = new Date()
    } else {
      baseDate = date
    }

    // Add/subtract days (in milliseconds) - work with the date directly
    const daysInMs = days * 24 * 60 * 60 * 1000
    const adjustedDate = new Date(baseDate.getTime() - daysInMs)

    // Use Intl.DateTimeFormat with Thai timezone for accurate conversion
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    // en-CA locale gives YYYY-MM-DD format
    return formatter.format(adjustedDate)
  } catch (error) {
    console.error('Error in getThaiDateDaysAgo:', error)
    return getThaiDate()
  }
}

/**
 * Format date in Thai locale
 *
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date string in Thai locale
 *
 * @example
 * formatThaiDate('2026-01-29') // '29 ม.ค. 2026' (or similar Thai format)
 */
export function formatThaiDate(date: Date | string | number): string {
  try {
    let dateObj: Date

    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    // Use Thai locale for formatting
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Bangkok',
    })
  } catch (error) {
    console.error('Error in formatThaiDate:', error)
    return 'Invalid date'
  }
}

/**
 * Format date and time in Thai timezone
 *
 * @param date - Date object, date string, or timestamp
 * @returns Formatted date-time string in Thai timezone
 *
 * @example
 * formatThaiDateTime(new Date('2026-01-29T12:00:00.000Z')) // '29/01/2026 19:00:00'
 */
export function formatThaiDateTime(date: Date | string | number): string {
  try {
    let dateObj: Date

    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    } else {
      dateObj = date
    }

    // Use Thai locale and timezone for formatting
    return dateObj.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Bangkok',
    })
  } catch (error) {
    console.error('Error in formatThaiDateTime:', error)
    return 'Invalid date'
  }
}

/**
 * Parse date string to Date object in Thai timezone
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing midnight in Thai timezone, or null if invalid
 *
 * @example
 * parseThaiDate('2026-01-29') // Date object for 2026-01-29T00:00:00 in Thai time
 */
export function parseThaiDate(dateString: string): Date | null {
  try {
    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return null
    }

    const [year, month, day] = dateString.split('-').map(Number)

    // Validate values
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null
    }

    // Create date object (using UTC to avoid local timezone conversion)
    // Then subtract 7 hours to convert Thai midnight to UTC
    const THAI_OFFSET_HOURS = 7
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    const thaiTime = new Date(utcDate.getTime() - THAI_OFFSET_HOURS * 60 * 60 * 1000)

    // Check if date is valid
    if (isNaN(thaiTime.getTime())) {
      return null
    }

    return thaiTime
  } catch (error) {
    console.error('Error in parseThaiDate:', error)
    return null
  }
}

/**
 * Get today's date string in Thai timezone
 * Convenience wrapper for getThaiDate()
 *
 * @returns Today's date in YYYY-MM-DD format (Thai timezone)
 */
export function getTodayThaiDateString(): string {
  return getThaiDate()
}

/**
 * Get yesterday's date string in Thai timezone
 * Convenience wrapper for getThaiDateDaysAgo(1)
 *
 * @returns Yesterday's date in YYYY-MM-DD format (Thai timezone)
 */
export function getYesterdayThaiDateString(): string {
  return getThaiDateDaysAgo(1)
}

/**
 * Check if current environment is using Thai timezone
 *
 * @returns true if system timezone is Asia/Bangkok or UTC+7
 */
export function isInThaiTimezone(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return tz === 'Asia/Bangkok'
  } catch (error) {
    return false
  }
}

/**
 * Get current time in Thai timezone as Date object
 *
 * @returns Date object representing current time in Thai timezone
 */
export function getNowInThaiTime(): Date {
  // Just return current date - the formatting functions handle Thai timezone
  return new Date()
}

/**
 * Check if a date is today in Thai timezone
 *
 * @param date - Date to check
 * @returns true if the date is today in Thai timezone
 */
export function isTodayInThaiTime(date: Date): boolean {
  const today = getThaiDate()
  const dateStr = getThaiDate(date)
  return today === dateStr
}

/**
 * Get the start of day in Thai timezone (midnight)
 *
 * @param date - Optional date to get start of day for (defaults to today)
 * @returns Date object representing midnight in Thai timezone (in UTC)
 */
export function getStartOfDayInThaiTime(date: Date = new Date()): Date {
  const thaiDate = getThaiDate(date)
  const [year, month, day] = thaiDate.split('-').map(Number)
  // Create date in UTC, then subtract 7 hours to get Thai midnight
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 7 * 60 * 60 * 1000)
}

/**
 * Get the end of day in Thai timezone (23:59:59.999)
 *
 * @param date - Optional date to get end of day for (defaults to today)
 * @returns Date object representing end of day in Thai timezone (in UTC)
 */
export function getEndOfDayInThaiTime(date: Date = new Date()): Date {
  const startOfDay = getStartOfDayInThaiTime(date)
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
}
