/**
 * RTDB Diagnostic API Endpoint
 *
 * GET /api/diagnostic
 *
 * Runs diagnostics on RTDB connection and data availability
 * Returns detailed report of what's wrong
 */

import { NextRequest, NextResponse } from 'next/server'
import { diagnoseRTDB, formatDiagnosticReport } from '@/services/diagnostic/rtdb-diagnostic'

export async function GET(_request: NextRequest) {
  try {
    const report = await diagnoseRTDB()
    const formatted = formatDiagnosticReport(report)

    return NextResponse.json({
      success: true,
      report,
      formatted,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
