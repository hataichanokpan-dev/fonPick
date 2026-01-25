/**
 * Export API Route
 *
 * GET /api/export
 * Exports insights and analysis data in various formats.
 *
 * Part of Phase 4: Data export utilities.
 */

import { NextRequest, NextResponse } from 'next/server'
import { rtdbGet, fetchWithFallback } from '@/lib/rtdb/client'
import { RTDB_PATHS, getTodayDate } from '@/lib/rtdb/paths'
import { exportInsights, exportCompleteAnalysis, type ExportFormat } from '@/services/export'
import { generateActionableInsights } from '@/services/insights/generator'
import { analyzeMarketBreadth } from '@/services/market-breadth/analyzer'
import { analyzeSectorRotation } from '@/services/sector-rotation/analyzer'
import { mapRankingsToSectors } from '@/services/sector-rotation/mapper'
import { analyzeSmartMoney } from '@/services/smart-money/signal'
import { getCompleteMarketAnalysis } from '@/services/integration/combined-analysis'
import type { InsightInputs } from '@/types/insights'
import type { RTDBMarketOverview, RTDBIndustrySector, RTDBInvestorType, RTDBTopRankings } from '@/types/rtdb'

// Enable static generation for better performance
export const dynamic = 'force-dynamic'

/**
 * GET /api/export
 * Query parameters:
 * - date: Optional date in YYYY-MM-DD format (defaults to today)
 * - format: Export format (default: 'json', options: 'csv', 'markdown', 'txt')
 * - type: Export type (default: 'insights', options: 'full')
 * - download: Set to 'true' to trigger file download
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedDate = searchParams.get('date')
    const format = (searchParams.get('format') || 'json') as ExportFormat
    const type = searchParams.get('type') || 'insights'
    const shouldDownload = searchParams.get('download') === 'true'

    // Validate format
    const validFormats: ExportFormat[] = ['json', 'csv', 'markdown', 'txt']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format', validFormats },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Validate type
    if (type !== 'insights' && type !== 'full') {
      return NextResponse.json(
        { error: 'Invalid type', validTypes: ['insights', 'full'] },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Get target date
    const targetDate = requestedDate || getTodayDate()

    // Fetch data and generate analysis
    let analysis
    let filename: string

    if (type === 'full') {
      // Use combined analysis service
      analysis = await getCompleteMarketAnalysis({
        date: targetDate,
        historicalDays: 5,
        includeRankings: true,
      })
      filename = `analysis-${targetDate}`
    } else {
      // Generate insights only
      const [marketOverview, industrySector, investorType, topRankings] = await Promise.all([
        fetchWithFallback<RTDBMarketOverview>(
          RTDB_PATHS.MARKET_OVERVIEW_BY_DATE(targetDate),
          RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS
        ),
        fetchWithFallback<RTDBIndustrySector>(
          RTDB_PATHS.INDUSTRY_SECTOR_BY_DATE(targetDate),
          RTDB_PATHS.INDUSTRY_SECTOR_PREVIOUS
        ),
        fetchWithFallback<RTDBInvestorType>(
          RTDB_PATHS.INVESTOR_TYPE_BY_DATE(targetDate),
          RTDB_PATHS.INVESTOR_TYPE_PREVIOUS
        ),
        rtdbGet<RTDBTopRankings>(RTDB_PATHS.RANKINGS_BY_DATE(targetDate)),
      ])

      if (!marketOverview || !industrySector || !investorType) {
        return NextResponse.json(
          {
            error: 'Insufficient data available',
            message: 'Unable to fetch required market data for export',
          },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        )
      }

      // Perform analyses
      const breadth = analyzeMarketBreadth({
        current: marketOverview,
      })

      const sectorRotation = analyzeSectorRotation({
        sectors: industrySector,
        rankings: topRankings || undefined,
      })

      const smartMoney = analyzeSmartMoney({
        current: investorType,
      })

      let rankingsMap
      if (topRankings) {
        rankingsMap = mapRankingsToSectors(topRankings, industrySector)
      }

      const inputs: InsightInputs = {
        breadth,
        sectorRotation,
        smartMoney,
        rankingsMap,
      }

      const insights = generateActionableInsights(inputs)
      analysis = insights
      filename = `insights-${targetDate}`
    }

    // Export data
    let exportResult
    if (type === 'full') {
      exportResult = exportCompleteAnalysis(analysis as any, { format, filename })
    } else {
      exportResult = exportInsights(analysis as any, { format, filename })
    }

    // Create response
    const response = new NextResponse(exportResult.data, {
      status: 200,
      headers: {
        'Content-Type': exportResult.mimeType,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        ...(shouldDownload && {
          'Content-Disposition': `attachment; filename="${exportResult.filename}.${exportResult.extension}"`,
        }),
      },
    })

    return response
  } catch (error) {
    console.error('Error in export API:', error)

    return NextResponse.json(
      {
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
