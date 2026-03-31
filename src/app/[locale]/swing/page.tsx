/**
 * Swing Trading Page
 *
 * หน้ารวม swing trading components พร้อม catalyst integration
 * Target holding: 30-90 days
 * Target return: 20%+
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import SwingVerdictCard from '@/components/swing-trading/SwingVerdictCard'
import PositionSizingCard from '@/components/swing-trading/PositionSizingCard'
import EntryPlanCard from '@/components/swing-trading/EntryPlanCard'
import ExitPlanCard from '@/components/swing-trading/ExitPlanCard'
import HistoricalTrendChart from '@/components/swing-trading/HistoricalTrendChart'
import { fetchAndParseCatalyst } from '@/lib/api/catalyst-api'
import type { ParsedCatalystData } from '@/types/catalyst'
import { calculateEntryZoneWithCatalyst } from '@/services/swing-trading/catalyst-aware-entry'

// ============================================================================
// TYPES
// ============================================================================

interface SwingPageProps {
  params: {
    locale: 'en' | 'th'
    symbol: string
  }
}

interface SwingTradingData {
  symbol: string
  catalystData: ParsedCatalystData | null
  currentPrice: number
  supportLevels: Array<{
    price: number
    strength: 'strong' | 'moderate' | 'weak'
  }>
  movingAverages: {
    ma20?: number
    ma50?: number
  }
  trendPhase: 'early' | 'mature' | 'exhausted'
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: SwingPageProps): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase()

  return {
    title: `Swing Trading Analysis - ${symbol} | fonPick`,
    description: `30-90 day swing trading analysis for ${symbol} with catalyst-aware entry points`,
  }
}

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch swing trading data
 * ดึงข้อมูล catalyst และ technical data
 */
async function fetchSwingTradingData(
  symbol: string
): Promise<SwingTradingData | null> {
  try {
    // Validate symbol
    const upperSymbol = symbol.toUpperCase()
    if (!upperSymbol || upperSymbol.length === 0) {
      return null
    }

    // Fetch catalyst data
    const catalystData = await fetchAndParseCatalyst(upperSymbol)

    // TODO: Fetch technical data from your API
    // สำหรับตอนนี้ใช้ mock data
    const currentPrice = 150.0
    const supportLevels = [
      { price: 148.0, strength: 'strong' as const },
      { price: 145.0, strength: 'moderate' as const }
    ]
    const movingAverages = {
      ma20: 149.0,
      ma50: 147.0
    }
    const trendPhase = 'early' as const

    return {
      symbol: upperSymbol,
      catalystData,
      currentPrice,
      supportLevels,
      movingAverages,
      trendPhase
    }
  } catch (error) {
    console.error(`Error fetching swing trading data for ${symbol}:`, error)
    return null
  }
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function SwingPage({ params }: SwingPageProps) {
  const { locale, symbol: rawSymbol } = params
  const symbol = rawSymbol.toUpperCase()

  // Validate symbol
  if (!symbol || symbol.length === 0) {
    notFound()
  }

  // Fetch data
  const data = await fetchSwingTradingData(symbol)

  if (!data) {
    notFound()
  }

  // Validate data has required fields
  if (!data.currentPrice) {
    notFound()
  }

  // Calculate entry with catalyst awareness
  const entryWithCatalyst = calculateEntryZoneWithCatalyst({
    currentPrice: data.currentPrice,
    supportLevels: data.supportLevels || [],
    movingAverages: data.movingAverages || {},
    trendPhase: data.trendPhase || 'mature',
    catalystData: data.catalystData
  })

  // TODO: Calculate other components (position sizing, exit plan, etc.)
  // สำหรับตอนนี้ใช้ mock data

  const positionSizing = {
    percentage: 5,
    riskAmount: 750,
    rationale: 'Based on 2% risk with stop loss at 145.00'
  }

  const exitPlan = {
    stopLoss: {
      price: 145.00,
      percentFromEntry: -2.9,
      rationale: 'Below strong support'
    },
    takeProfits: [
      { level: 1, price: 165.00, percentFromEntry: 11.5 },
      { level: 2, price: 180.00, percentFromEntry: 21.7 },
      { level: 3, price: 195.00, percentFromEntry: 32.0 }
    ],
    riskRewardRatio: '1:3.9'
  }

  const verdict = {
    verdict: 'Strong Buy' as const,
    confidence: 'High' as const,
    keyFactors: [
      'Strong catalyst support',
      'Early trend phase',
      'Solid support level nearby'
    ]
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {locale === 'th' ? 'การวิเคราะห์ Swing Trading' : 'Swing Trading Analysis'}
        </h1>
        <p className="text-muted-foreground">
          {symbol} • {locale === 'th' ? 'เป้าหมาย: 30-90 วัน | ผลตอบแทน: 20%+' : 'Target: 30-90 days | Return: 20%+'}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Verdict Card */}
        <div className="lg:col-span-2">
          <SwingVerdictCard
            verdict={{
              symbol,
              horizon: 60,
              verdict: verdict.verdict,
              confidence: verdict.confidence,
              entry: {
                zone: entryWithCatalyst.entryZone,
                discountFromCurrent: entryWithCatalyst.discountPercent,
                rationale: entryWithCatalyst.rationale
              },
              exit: exitPlan,
              position: positionSizing,
              analysis: {
                trendQuality: 'good',
                trendSustainability: 75,
                timing: 'good',
                keyFactors: verdict.keyFactors
              },
              timeEstimate: {
                minDays: 30,
                maxDays: 90,
                rationale: 'Based on catalyst timeline'
              },
              timestamp: Date.now(),
              dataQuality: 85
            }}
            locale={locale}
          />
        </div>

        {/* Historical Trend Chart */}
        <div className="lg:col-span-2">
          <HistoricalTrendChart symbol={symbol} />
        </div>
      </div>

      {/* Entry & Exit Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Entry Plan (with Catalyst) */}
        <EntryPlanCard
          entry={{
            zone: entryWithCatalyst.entryZone,
            discountFromCurrent: entryWithCatalyst.discountPercent,
            rationale: entryWithCatalyst.rationale
          }}
          locale={locale}
        />

        {/* Exit Plan */}
        <ExitPlanCard
          exit={exitPlan}
          locale={locale}
        />
      </div>

      {/* Position Sizing */}
      <div className="mb-6">
        <PositionSizingCard
          position={positionSizing}
          locale={locale}
        />
      </div>

      {/* Catalyst Information (if available) */}
      {data.catalystData && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {locale === 'th' ? 'ข้อมูล Catalyst' : 'Catalyst Information'}
          </h3>

          {/* Theme */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {locale === 'th' ? 'ธีมการลงทุน' : 'Investment Theme'}
            </h4>
            <p className="text-base">{data.catalystData.theme}</p>
          </div>

          {/* Upcoming Catalysts */}
          {entryWithCatalyst.catalystAdjustment?.upcomingCatalysts &&
           entryWithCatalyst.catalystAdjustment.upcomingCatalysts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {locale === 'th' ? 'เหตุการณ์ที่กำลังจะเกิดขึ้น' : 'Upcoming Events'}
              </h4>
              <ul className="space-y-2">
                {entryWithCatalyst.catalystAdjustment.upcomingCatalysts.map((catalyst, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <div>
                      <p className="text-sm">{catalyst.description}</p>
                      {catalyst.daysUntil !== undefined && catalyst.daysUntil !== Infinity && (
                        <p className="text-xs text-muted-foreground">
                          {locale === 'th' ? 'อีก' : 'In'} {catalyst.daysUntil} {locale === 'th' ? 'วัน' : 'days'}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to Watch */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {locale === 'th' ? 'สิ่งที่ควรติดตาม' : 'What to Watch'}
            </h4>
            <ul className="space-y-1">
              {data.catalystData.whatToWatch.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Score */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {locale === 'th' ? 'คะแนน AI:' : 'AI Score:'}
              </span>
              <span className={`text-lg font-bold ${
                data.catalystData.aiScore >= 7 ? 'text-green-600' :
                data.catalystData.aiScore >= 5 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {data.catalystData.aiScore}/10
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          {locale === 'th'
            ? 'คำเตือน: ข้อมูลนี้เป็นเพียงการวิเคราะห์เชิงเทคนิคและไม่ใช่คำแนะนำการลงทุน โปรดศึกษาข้อมูลเพิ่มเติมและประเมินความเสี่ยงด้วยตัวเอง'
            : 'Disclaimer: This analysis is for informational purposes only and does not constitute investment advice. Please do your own research and assess risks before investing.'
          }
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export async function generateStaticParams() {
  // Generate static pages for popular symbols
  return []
}
