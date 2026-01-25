# Phase 2: Cross-Analysis Implementation

## Overview

This document describes the implementation of Phase 2: Cross-Analysis for the fonPick project. This phase focuses on creating API routes to expose the new services, building an integration layer to combine services, and adding data fetching utilities for historical data.

## Implementation Status: COMPLETE

## Files Created

### API Routes (5 endpoints)

#### 1. `/api/market-breadth` - Market Breadth API
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\market-breadth\route.ts`

**Purpose:** Returns market breadth analysis including A/D ratio, volatility assessment, and breadth status.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `includeHistorical` (optional): Include historical data for trend analysis (default: true)

**Response:**
```typescript
{
  adRatio: number
  advances: number
  declines: number
  newHighs: number
  newLows: number
  status: 'Strongly Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strongly Bearish'
  volatility: 'Aggressive' | 'Moderate' | 'Calm'
  trend: 'Improving' | 'Stable' | 'Deteriorating'
  confidence: number
  observations: string[]
  timestamp: number
}
```

**Answers Question #1:** "How about market now? Aggressive vol or not?"

---

#### 2. `/api/sector-rotation` - Sector Rotation API
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\sector-rotation\route.ts`

**Purpose:** Returns sector rotation analysis including leadership, rotation patterns, and regime context.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `includeRankings` (optional): Include rankings cross-analysis (default: true)

**Response:**
```typescript
{
  leaders: Array<{ sector, name, change, signal, rank, value }>
  laggards: Array<{ sector, name, change, signal, rank, value }>
  pattern: 'Risk-On Rotation' | 'Risk-Off Rotation' | 'Broad-Based Advance' | 'Broad-Based Decline' | 'Mixed/No Clear Pattern' | 'Sector-Specific'
  marketDriver?: { sector, name, change, signal, rank }
  concentration: number
  observations: string[]
  timestamp: number
}
```

**Answers Question #2:** "What sector is heavy market up or down because xxx sector?"

---

#### 3. `/api/smart-money` - Smart Money API
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\smart-money\route.ts`

**Purpose:** Returns smart money analysis tracking foreign and institutional investor flows.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `includeHistorical` (optional): Include historical data for trend analysis (default: true)
- `includePropTrading` (optional): Include prop trading analysis (default: true)

**Response:**
```typescript
{
  investors: {
    foreign: { investor, todayNet, strength, trend, confidence, ... }
    institution: { investor, todayNet, strength, trend, confidence, ... }
  }
  combinedSignal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell'
  riskSignal: 'Risk-On' | 'Risk-On Mild' | 'Neutral' | 'Risk-Off Mild' | 'Risk-Off'
  score: number
  confidence: number
  observations: string[]
  primaryDriver?: 'foreign' | 'institution' | 'both' | 'none'
  riskOnConfirmed: boolean
  riskOffConfirmed: boolean
  timestamp: number
}
```

**Answers Question #3:** "Risk on because Foreign Investor is strong buy or Prop reduce sell vol?"

---

#### 4. `/api/insights` - Actionable Insights API
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\insights\route.ts`

**Purpose:** Returns actionable insights combining all market analyses. Answers all 6 investment questions with trading recommendations.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `summary` (optional): Return summary only (default: false)

**Response:**
```typescript
{
  // Full insights (summary=false)
  answers: InvestmentAnswers // All 6 Q&A
  trading: TradingRecommendation
  sectorFocus: SectorFocus[]
  themes: string[]
  warnings: string[]
  confidence: { overall, breakdown }
  timestamp: number

  // Summary mode (summary=true)
  verdict: string
  confidence: number
  topSectors: Array<{ sector, level, action }>
  riskLevel: 'Low' | 'Medium' | 'High'
  themes: string[]
}
```

**Answers Question #4:** "What current trade and what sector need to focus?"

---

#### 5. `/api/correlations` - Correlations API
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\correlations\route.ts`

**Purpose:** Returns correlation analysis between Top Rankings and Sector performance.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `analysis` (optional): Type of analysis - 'correlation', 'impact', or 'summary' (default: 'summary')

**Response:**
```typescript
{
  // Summary mode (default)
  summary: {
    impact: { level, explanation }
    correlation: { strength, score, explanation }
    anomalies: string[]
    insights: string[]
  }
  correlation: RankingsVsSectorAnalysis
  impact: RankingsImpactAnalysis
}
```

**Answers Questions #5 and #6:**
- Q5: "How top ranking effect to market?"
- Q6: "What we see in top ranking compare with sector?"

---

#### 6. `/api/analysis` - Combined Analysis API (BONUS)
**File:** `c:\Programing\ByAI\GLM\fonPick\src\app\api\analysis\route.ts`

**Purpose:** Main entry point for complete market analysis combining all services.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)
- `type` (optional): Analysis type - 'full', 'snapshot', or 'sector' (default: 'full')
- `historicalDays` (optional): Number of historical days to include (default: 5)
- `includeRankings` (optional): Include rankings cross-analysis (default: true)

**Response Types:**
- **Full:** Complete market analysis with all individual analyses and combined insights
- **Snapshot:** Quick snapshot with essential data only
- **Sector:** Sector-focused analysis data

---

### Service Integration Layer

#### Combined Analysis Service
**File:** `c:\Programing\ByAI\GLM\fonPick\src\services\integration\combined-analysis.ts`

**Purpose:** Orchestrates all market analysis services to provide a complete market picture.

**Main Functions:**

1. **`getCompleteMarketAnalysis(options)`**
   - Main entry point for combining all analysis services
   - Fetches all required data from RTDB in parallel
   - Performs all analyses (breadth, sector, smart-money, correlation)
   - Generates actionable insights
   - Returns complete analysis with metadata

2. **`getQuickMarketSnapshot(date?)`**
   - Quick snapshot with essential data only
   - Optimized for dashboard views

3. **`getSectorFocus(date?)`**
   - Sector-focused analysis
   - Returns sector rotation data for sector views

4. **`analyzeDateRange(dates, progressCallback?)`**
   - Analyzes multiple dates at once
   - Useful for backtesting or historical trend analysis

---

### Historical Data Queries

#### Historical Data Utilities
**File:** `c:\Programing\ByAI\GLM\fonPick\src\lib\rtdb\historical.ts`

**Purpose:** Functions for fetching historical data from RTDB. Supports 60-day lookback and batch queries.

**Main Functions:**

**Single Data Type Queries:**
- `getHistoricalMarketOverview(options)`
- `getHistoricalIndustrySector(options)`
- `getHistoricalInvestorType(options)`
- `getHistoricalTopRankings(options)`
- `getHistoricalSetIndex(options)`

**Batch Queries:**
- `getCompleteHistoricalData(options)` - All data types in parallel
- `getLookbackData(days, excludeWeekends)` - N-day lookback for trends

**Lookback Helpers:**
- `get60DayLookback(dataType)` - 60-day historical data
- `get30DayLookback(dataType)` - 30-day historical data
- `get7DayLookback(dataType)` - 7-day historical data

**Data Availability:**
- `checkDataAvailability(date)` - Check if data is available for a specific date
- `findLatestAvailableDate(maxDaysBack?)` - Find latest available date with data
- `getDataCoverageReport(options)` - Coverage report for a date range

**Date Range Options:**
```typescript
interface DateRangeOptions {
  startDate?: string      // Start date (YYYY-MM-DD)
  endDate?: string        // End date (YYYY-MM-DD)
  days?: number          // Days back from today or endDate
  excludeWeekends?: boolean
  includeOnlyWeekdays?: number[]  // 0-6, 0=Sunday
}
```

---

## Updated Files

### RTDB Index
**File:** `c:\Programing\ByAI\GLM\fonPick\src\lib\rtdb\index.ts`

**Changes:** Added exports for historical data query functions.

---

## API Response Format

All API endpoints follow a consistent response format:

**Success Response:**
```json
{
  "data": { /* analysis data */ },
  "meta": {
    "date": "YYYY-MM-DD",
    "timestamp": 1234567890,
    "hasHistoricalData": true,
    "historicalDataPoints": 5
  }
}
```

**Error Response:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `404` - Data not available
- `500` - Internal server error

---

## Caching Strategy

All endpoints implement consistent caching headers:
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=120
```

This means:
- Cache for 60 seconds on CDN/edge
- Serve stale content for up to 120 seconds while revalidating
- Reduces load on Firebase RTDB

---

## Data Flow Diagram

```
Client Request
      ↓
API Route Handler
      ↓
┌─────────────────────────────────────┐
│  RTDB Data Layer (parallel fetch)   │
│  ├─ Market Overview                 │
│  ├─ Industry Sector                 │
│  ├─ Investor Type                   │
│  ├─ Top Rankings (optional)         │
│  └─ Historical Data (optional)      │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│  Analysis Services (parallel)       │
│  ├─ Market Breadth Analyzer         │
│  ├─ Sector Rotation Analyzer        │
│  ├─ Smart Money Analyzer            │
│  ├─ Correlation Analyzer (opt)      │
│  └─ Insights Generator              │
└─────────────────────────────────────┘
      ↓
Combined Analysis / Response
```

---

## Usage Examples

### Example 1: Get Today's Market Breadth
```typescript
const response = await fetch('/api/market-breadth')
const data = await response.json()

console.log(data.status)        // 'Bullish'
console.log(data.adRatio)       // 1.85
console.log(data.volatility)    // 'Moderate'
```

### Example 2: Get Complete Analysis
```typescript
const response = await fetch('/api/analysis?type=full')
const data = await response.json()

console.log(data.data.insights.trading.action)  // 'Buy'
console.log(data.data.breadth.status)            // 'Bullish'
console.log(data.data.smartMoney.riskSignal)     // 'Risk-On'
```

### Example 3: Get Quick Snapshot
```typescript
const response = await fetch('/api/analysis?type=snapshot')
const data = await response.json()

console.log(data.data.verdict)       // 'Buy'
console.log(data.data.confidence)    // 75
console.log(data.data.topSectors)    // ['Financial', 'Energy', 'Technology']
```

### Example 4: Get Historical Data
```typescript
import { get60DayLookback } from '@/lib/rtdb/historical'

const history = await get60DayLookback('MARKET_OVERVIEW')
console.log(history.data.length)  // Number of data points
console.log(history.missingDates) // Dates without data
```

---

## Acceptance Criteria Status

- [x] All 5 API routes created and working
- [x] Combined analysis service created
- [x] Historical data queries implemented (60-day lookback)
- [x] All endpoints return proper JSON responses
- [x] Bonus: Combined analysis API route created
- [x] Caching strategy implemented
- [x] Error handling implemented
- [x] Query parameters supported

---

## Next Steps

Phase 3 should focus on:
1. Frontend integration with the new API routes
2. UI components for displaying the analysis data
3. Real-time data updates
4. Performance optimization and caching
5. Testing and validation

---

## Technical Notes

1. **Parallel Data Fetching:** All API routes fetch data from RTDB in parallel using `Promise.all()` for optimal performance.

2. **Fallback Strategy:** Uses `fetchWithFallback()` to fall back to previous day's data if current day is unavailable.

3. **Immutability:** All functions follow immutable patterns - no mutations of input data.

4. **Type Safety:** Full TypeScript types defined and exported for all responses.

5. **Error Handling:** Comprehensive error handling with meaningful error messages.

6. **Performance:** Analysis duration tracking available via `measurePerformance` option.

7. **Weekend Handling:** Historical data queries can exclude weekends automatically.

8. **Batch Operations:** Support for analyzing multiple dates at once for backtesting.

---

## Dependencies

This implementation relies on the following Phase 1 services:
- `@/services/market-breadth/analyzer`
- `@/services/sector-rotation/analyzer`
- `@/services/sector-rotation/detector`
- `@/services/sector-rotation/mapper`
- `@/services/smart-money/scorer`
- `@/services/smart-money/signal`
- `@/services/insights/generator`
- `@/services/correlations/analyzer`

And the following RTDB utilities:
- `@/lib/rtdb/client`
- `@/lib/rtdb/paths`
- `@/lib/rtdb/historical`
