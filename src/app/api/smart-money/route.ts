/**
 * Smart Money API Route
 *
 * GET /api/smart-money
 * Returns smart money analysis tracking foreign and institutional investor flows.
 * Answers Question #3: "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchInvestorTypeByDate, fetchInvestorType } from '@/lib/rtdb/investor-type'
import { getDateDaysAgo } from '@/lib/rtdb/paths'
import { analyzeSmartMoney } from '@/services/smart-money/signal'
import type { SmartMoneyAnalysis } from '@/types/smart-money'
import type { RTDBInvestorType } from '@/types/rtdb'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/smart-money
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - includeHistorical: Include historical data for trend analysis (default: true)
 * - includePropTrading: Include prop trading analysis (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date')
    const includeHistorical = searchParams.get('includeHistorical') !== 'false'
    const includePropTrading = searchParams.get('includePropTrading') !== 'false'

    // Determine target date
    const targetDate = requestedDate || new Date().toISOString().split('T')[0]

    // Fetch current investor type data using the proper fetcher that converts to RTDBInvestorType
    let current = await fetchInvestorTypeByDate(targetDate)

    if (!current) {
      // Try fetching latest as fallback
      current = await fetchInvestorType()
    }

    if (!current) {
      return NextResponse.json(
        {
          error: 'Investor flow data not available',
          message: 'Unable to fetch investor type data for the requested date',
        },
        { status: 404 }
      )
    }

    // Fetch historical data for trend analysis
    let historicalData: RTDBInvestorType[] = []
    if (includeHistorical) {
      // Fetch up to 5 days of historical data
      const historicalPromises = Array.from({ length: 5 }, (_, i) => {
        const date = getDateDaysAgo(i + 1)
        return fetchInvestorTypeByDate(date)
      })

      const historicalResults = await Promise.all(historicalPromises)
      historicalData = historicalResults.filter(
        (data): data is RTDBInvestorType => data !== null
      )
    }

    // Perform smart money analysis
    const analysis: SmartMoneyAnalysis = analyzeSmartMoney({
      current,
      historical: historicalData.length > 0 ? historicalData : undefined,
      options: {
        includePropTrading,
      },
    })

    // Transform to module-friendly format with null safety
    const moduleData = {
      foreign: {
        todayNet: analysis.investors?.foreign?.todayNet || 0,
        trend: analysis.investors?.foreign?.trend || 'Neutral',
        trend5Day: analysis.investors?.foreign?.trend5Day || 0,
        avg5Day: analysis.investors?.foreign?.avg5Day || 0,
        vsAverage: analysis.investors?.foreign?.vsAverage || 0,
        strength: analysis.investors?.foreign?.strength || 'Neutral',
      },
      institution: {
        todayNet: analysis.investors?.institution?.todayNet || 0,
        trend: analysis.investors?.institution?.trend || 'Neutral',
        trend5Day: analysis.investors?.institution?.trend5Day || 0,
        avg5Day: analysis.investors?.institution?.avg5Day || 0,
        vsAverage: analysis.investors?.institution?.vsAverage || 0,
        strength: analysis.investors?.institution?.strength || 'Neutral',
      },
      retail: {
        todayNet: analysis.investors?.retail?.todayNet || 0,
        trend: analysis.investors?.retail?.trend || 'Neutral',
        trend5Day: analysis.investors?.retail?.trend5Day || 0,
        avg5Day: analysis.investors?.retail?.avg5Day || 0,
        vsAverage: analysis.investors?.retail?.vsAverage || 0,
        strength: analysis.investors?.retail?.strength || 'Neutral',
      },
      prop: {
        todayNet: analysis.investors?.prop?.todayNet || 0,
        trend: analysis.investors?.prop?.trend || 'Neutral',
        trend5Day: analysis.investors?.prop?.trend5Day || 0,
        avg5Day: analysis.investors?.prop?.avg5Day || 0,
        vsAverage: analysis.investors?.prop?.vsAverage || 0,
        strength: analysis.investors?.prop?.strength || 'Neutral',
      },
      combinedSignal: analysis.combinedSignal || 'Neutral',
      riskSignal: analysis.riskSignal || 'Neutral',
      score: analysis.score || 50,
      confidence: analysis.confidence || 50,
      primaryDriver: analysis.primaryDriver || 'none',
      observations: analysis.observations || [],
      timestamp: analysis.timestamp || Date.now(),
    }

    // Return response
    return NextResponse.json(moduleData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Error in smart-money API:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze smart money',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
