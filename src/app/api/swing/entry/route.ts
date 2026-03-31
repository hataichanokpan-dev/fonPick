/**
 * Swing Trading Entry API with Catalyst Integration
 *
 * POST /api/swing/entry
 *
 * คำนวณ entry zone โดยคำนึงถึง catalyst events
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateEntryZoneWithCatalyst } from '@/services/swing-trading/catalyst-aware-entry'
import type { CatalystAwareEntryInput } from '@/types/swing-trading'
import { z } from 'zod'

// ============================================================================
// REQUEST SCHEMA
// ============================================================================

/**
 * Request schema for entry calculation
 */
const EntryRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  currentPrice: z.number().positive(),
  supportLevels: z.array(
    z.object({
      price: z.number().positive(),
      strength: z.enum(['strong', 'moderate', 'weak'])
    })
  ).optional().default([]),
  movingAverages: z.object({
    ma20: z.number().positive().optional(),
    ma50: z.number().positive().optional()
  }).optional().default({}),
  trendPhase: z.enum(['early', 'mature', 'exhausted']).optional().default('mature'),
  catalystData: z.object({
    theme: z.string(),
    catalysts: z.array(z.string()),
    whatToWatch: z.array(z.string()),
    aiScore: z.number().min(0).max(10)
  }).optional()
})

type EntryRequest = z.infer<typeof EntryRequestSchema>

// ============================================================================
// ERROR HANDLING
// ============================================================================

class EntryCalculationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'EntryCalculationError'
  }
}

// ============================================================================
// HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate request
    const validated = EntryRequestSchema.parse(body)

    // Prepare input for calculator
    const input: CatalystAwareEntryInput = {
      currentPrice: validated.currentPrice,
      supportLevels: validated.supportLevels,
      movingAverages: validated.movingAverages,
      trendPhase: validated.trendPhase,
      catalystData: validated.catalystData
    }

    // Calculate entry zone with catalyst awareness
    const result = calculateEntryZoneWithCatalyst(input)

    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        symbol: validated.symbol,
        timestamp: Date.now()
      }
    })

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      }, { status: 400 })
    }

    // Handle calculation errors
    if (error instanceof EntryCalculationError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode })
    }

    // Handle unknown errors
    console.error('Entry calculation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
