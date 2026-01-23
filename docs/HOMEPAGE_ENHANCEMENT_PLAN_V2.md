# Homepage Enhancement Plan v2

**Project:** Thai Stock Market Decision Web (fonPick)
**Update:** Restructured for DAILY data updates (18:30 RTDB sync)
**Date:** 2026-01-23

---

## Executive Summary

**Architecture Change:** This plan simplifies the original approach by leveraging existing RTDB data for trends and adding Yahoo Finance integration for SET index historical prices.

**Key Changes from v1:**
- Data is DAILY (not real-time) - updates at 18:30
- Sector & investor trends ALREADY EXIST in RTDB - just query historical dates
- Yahoo Finance API integration for SET index history only
- Simplified caching (no complex aggregations)
- API route structure for client data fetching

**Target:** Improve homepage from 2.5/5 → 4.5/5 for investment decision-making

---

## Problem Statement

| Goal | Current State | Solution |
|------|---------------|----------|
| **Whether to invest** | Single-day snapshot only | Add 5D, 20D, YTD trends from existing RTDB data |
| **Which sectors** | Static heatmap | Add trend indicators, 52-week range from Yahoo Finance |

---

## Architecture Overview

### Data Sources

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. RTDB (existing)                         2. Yahoo Finance    │
│  ┌─────────────────────────────────┐      ┌──────────────────┐ │
│  │ /settrade/marketOverview/       │      │ ^SET index       │ │
│  │   byDate/{YYYY-MM-DD}           │      │ Historical prices│ │
│  │                                 │      └──────────────────┘ │
│  │ /settrade/industrySector/       │              │            │
│  │   byDate/{YYYY-MM-DD}           │◄─────────────┘            │
│  │                                 │                            │
│  │ /settrade/investorType/         │                            │
│  │   byDate/{YYYY-MM-DD}           │                            │
│  └─────────────────────────────────┘                            │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────────────────────┐                            │
│  │ TREND CALCULATIONS              │                            │
│  │ (Query historical dates)        │                            │
│  └─────────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### API Route Structure

```
/api/
├── market/
│   ├── trends/                          # GET all market trends
│   ├── set-index/
│   │   ├── history/                     # GET SET index history
│   │   └── sync/                        # POST (cron) sync from Yahoo
│   └── sectors/
│       └── trends/                      # GET sector trends
└── investors/
    └── trends/                          # GET investor flow trends
```

### Component Data Flow

```
┌──────────────────┐
│   page.tsx       │
│  (Server Comp)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Direct RTDB queries (parallel)      │
│  - fetchTodayData()                   │
│  - fetchHistoricalForTrends()         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Components                           │
│  ├─ SetSnapshot (with trends)         │
│  ├─ MarketContextCard (52w, P/E)      │
│  ├─ SectorHeatmap (with trends)       │
│  ├─ MoneyFlowChart (with trends)      │
│  └─ TopRankings                       │
└──────────────────────────────────────┘
```

---

## Phase 1: Yahoo Finance API Integration

**Duration:** 3-5 days
**Goal:** Fetch and store SET index historical data

### 1.1 Install Yahoo Finance Library

**Action:** Add `yahoo-finance2` package

```bash
npm install yahoo-finance2
```

**Files Modified:**
- `package.json`

**Complexity:** Simple
**Dependencies:** None

---

### 1.2 Create Yahoo Finance Module

**Files Created:**
- `src/lib/yahoo-finance/types.ts` - Type definitions
- `src/lib/yahoo-finance/cache.ts` - Rate limiting cache
- `src/lib/yahoo-finance/set-index.ts` - SET index fetchers
- `src/lib/yahoo-finance/index.ts` - Main exports

**Key Functions:**
```typescript
// Fetch SET index historical data
fetchYahooSetIndexHistorical(startDate: Date, endDate: Date)
  : Promise<YahooSetIndexData | null>

// Fetch SET index for specific date
fetchYahooSetIndexByDate(date: Date)
  : Promise<YahooSetIndexSnapshot | null>

// Convert to RTDB format
toRTDBSetIndexEntry(snapshot: YahooSetIndexSnapshot)
  : RTDBSetIndexEntry
```

**Features:**
- In-memory cache with 24-hour TTL
- Rate limiting (1 second between calls)
- Error handling for missing dates

**Complexity:** Medium
**Dependencies:** Task 1.1

---

### 1.3 Extend RTDB for SET Index

**Files Modified:**
- `src/lib/rtdb/paths.ts` - Add SET index paths
- `src/types/rtdb.ts` - Add SET index types

**New Paths:**
```typescript
SET_INDEX_BASE: `${SETTRADE_BASE}/setIndex`
SET_INDEX_BY_DATE: (date: string) => `${SETTRADE_BASE}/setIndex/byDate/${date}`
SET_INDEX_LATEST: `${SETTRADE_BASE}/setIndex/byDate/${getTodayDate()}`
```

**New Types:**
```typescript
interface RTDBSetIndexData {
  close: number
  open: number
  high: number
  low: number
  volume: number
  change: number
  changePercent: number
}
```

**Complexity:** Simple
**Dependencies:** None

---

### 1.4 Create SET Index Sync API

**File Created:** `src/app/api/market/set-index/sync/route.ts`

**Endpoint:** `POST /api/market/set-index/sync`

**Purpose:** Cron job endpoint to sync Yahoo Finance data to RTDB

**Features:**
- Admin-only (API key or cron header validation)
- Single day or backfill mode
- Returns sync results

**Body:**
```json
{
  "date": "2026-01-23",      // optional, defaults to today
  "backfillDays": 30         // optional, for backfilling
}
```

**Cron Configuration:** `vercel.json`
```json
{
  "crons": [{
    "path": "/api/market/set-index/sync",
    "schedule": "30 18 * * 1-5"
  }]
}
```

**Complexity:** Medium
**Dependencies:** Tasks 1.1, 1.2, 1.3

---

### 1.5 Create SET Index History API

**File Created:** `src/app/api/market/set-index/history/route.ts`

**Endpoint:** `GET /api/market/set-index/history`

**Query Params:**
- `period`: `5D` | `20D` | `YTD` (or)
- `startDate`: YYYY-MM-DD (required if no period)
- `endDate`: YYYY-MM-DD (required if no period)

**Returns:**
```json
{
  "success": true,
  "data": {
    "history": [{ "date": "2026-01-23", "close": 1450.23, ... }],
    "startDate": "2026-01-01",
    "endDate": "2026-01-23",
    "count": 20
  }
}
```

**Complexity:** Simple
**Dependencies:** Task 1.3

---

## Phase 2: Trend Calculations from Existing RTDB

**Duration:** 5-7 days
**Goal:** Calculate 5D, 20D, YTD trends by querying historical RTDB data

### 2.1 Create Trend Types

**File Created:** `src/lib/trends/types.ts`

**Types:**
```typescript
interface TrendValue {
  value: number
  change: number
  changePercent: number
  period: '5D' | '20D' | 'YTD'
}

interface SectorTrend {
  sectorId: string
  sectorName: string
  fiveDay: TrendValue | null
  twentyDay: TrendValue | null
  ytd: TrendValue | null
}

interface InvestorTrend {
  type: 'foreign' | 'institution' | 'retail' | 'prop'
  fiveDayNet: number
  twentyDayNet: number
  ytdNet: number
}
```

**Complexity:** Simple
**Dependencies:** None

---

### 2.2 Create Sector Trend Calculations

**File Created:** `src/lib/trends/sector.ts`

**Functions:**
```typescript
// Query multiple dates from RTDB
fetchSectorDataForDates(dates: string[]): Promise<Map<string, RTDBIndustrySectorEntry>>

// Calculate trend for period
calculateTrend(sectorId, dataMap, dates): TrendValue | null

// Calculate 5-day trend
calculateSector5DayTrend(): Promise<SectorTrend[]>

// Calculate 20-day trend
calculateSector20DayTrend(): Promise<SectorTrend[]>

// Calculate YTD trend
calculateSectorYTDTrend(): Promise<SectorTrend[]>

// Calculate all trends
calculateAllSectorTrends(): Promise<SectorTrend[]>
```

**Strategy:**
- Query RTDB for historical dates
- Use `Promise.all()` for parallel fetches
- Calculate change from first to last data point

**Complexity:** Medium
**Dependencies:** Task 2.1

---

### 2.3 Create Investor Trend Calculations

**File Created:** `src/lib/trends/investor.ts`

**Functions:**
```typescript
// Calculate cumulative net flow over period
calculateCumulativeNetFlow(investorType, dataMap): number

// 5-day investor flow trends
calculateInvestor5DayTrend(): Promise<InvestorTrend[]>

// 20-day investor flow trends
calculateInvestor20DayTrend(): Promise<InvestorTrend[]>

// YTD investor flow trends
calculateInvestorYTDTrend(): Promise<InvestorTrend[]>

// All investor flow trends
calculateAllInvestorTrends(): Promise<InvestorTrend[]>
```

**Complexity:** Medium
**Dependencies:** Task 2.1

---

### 2.4 Create Trend Module Exports

**File Created:** `src/lib/trends/index.ts`

**Exports all trend functions and types**

**Complexity:** Simple
**Dependencies:** Tasks 2.1, 2.2, 2.3

---

### 2.5 Create Trend API Routes

**Files Created:**
- `src/app/api/market/trends/route.ts` - All market trends
- `src/app/api/market/sectors/trends/route.ts` - Sector trends
- `src/app/api/investors/trends/route.ts` - Investor trends

**Endpoints:**
```
GET /api/market/trends
GET /api/market/sectors/trends?period=5D&sortBy=5D
GET /api/investors/trends
```

**Complexity:** Simple
**Dependencies:** Tasks 2.2, 2.3, 2.4

---

## Phase 3: Market Context Components

**Duration:** 5-7 days
**Goal:** Create components for market context indicators

### 3.1 Create Base Context Card

**File Created:** `src/components/home/MarketContextCard.tsx`

**Props:**
```typescript
interface MarketContextCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  size?: 'sm' | 'md' | 'lg'
}
```

**Complexity:** Simple
**Dependencies:** None

---

### 3.2 Create 52-Week Range Component

**File Created:** `src/components/home/Week52Range.tsx`

**Features:**
- Visual bar showing current position in 52-week range
- Color coding (near high = green, near low = red)
- Display current, high, low values

**Data Source:** Yahoo Finance historical data

**Complexity:** Medium
**Dependencies:** Tasks 1.2, 1.5, 3.1

---

### 3.3 Create Market Breadth Component

**File Created:** `src/components/home/MarketBreadth.tsx`

**Features:**
- Advance/decline ratio display
- Visual gauge
- Color coding (>1.5 bullish, <0.67 bearish)

**Data Source:** RTDB marketOverview (existing data)

**Complexity:** Simple
**Dependencies:** Task 3.1

---

### 3.4 Create SET P/E Ratio Component

**File Created:** `src/components/home/SetPERatio.tsx`

**Features:**
- Current SET P/E display
- Historical comparison
- Valuation label (cheap/fair/expensive)

**Data Source:** Yahoo Finance (if available) or calculated from RTDB

**Complexity:** Medium
**Dependencies:** Tasks 1.2, 1.5, 3.1

---

### 3.5 Create Volatility Indicator Component

**File Created:** `src/components/home/VolatilityIndicator.tsx`

**Features:**
- Calculate from price standard deviation
- Color coded (low/normal/elevated/extreme)
- Visual gauge

**Data Source:** Yahoo Finance historical prices

**Complexity:** Medium
**Dependencies:** Tasks 1.2, 1.5, 3.1

---

## Phase 4: Component Enhancements

**Duration:** 5-7 days
**Goal:** Enhance existing components with trend data

### 4.1 Enhance SetSnapshot with Trends

**File Modified:** `src/components/home/SetSnapshot.tsx`

**Changes:**
- Add trend badges (5D, 20D, YTD)
- Small arrow indicators
- Color coding

**Props Addition:**
```typescript
interface SetSnapshotProps {
  // ... existing
  trends?: {
    fiveDay?: { change: number; changePercent: number }
    twentyDay?: { change: number; changePercent: number }
    ytd?: { change: number; changePercent: number }
  }
}
```

**Complexity:** Simple
**Dependencies:** Tasks 2.2, 2.4

---

### 4.2 Enhance SectorHeatmap with Trends

**File Modified:** `src/components/home/SectorHeatmap.tsx`

**Changes:**
- Add trend indicator on hover or small badge
- Show 5D trend direction

**Props Addition:**
```typescript
interface SectorHeatmapProps {
  data: {
    sectors: Array<{
      // ... existing
      trend5Day?: { change: number; changePercent: number }
    }>
  }
}
```

**Complexity:** Medium
**Dependencies:** Task 2.2

---

### 4.3 Enhance MoneyFlowChart with Trends

**File Modified:** `src/components/home/MoneyFlowChart.tsx`

**Changes:**
- Add cumulative net flow trend below each bar
- Small arrow + percentage

**Props Addition:**
```typescript
interface MoneyFlowChartProps {
  data: {
    foreign: { /* existing */ trend5Day?: number }
    institution: { /* existing */ trend5Day?: number }
    // ...
  }
}
```

**Complexity:** Medium
**Dependencies:** Task 2.3

---

### 4.4 Create Data Freshness Indicator

**File Created:** `src/components/shared/DataFreshness.tsx`

**Purpose:** Show "Data as of [date]" for daily updates

**Props:**
```typescript
interface DataFreshnessProps {
  timestamp?: number
  date?: string
  className?: string
}
```

**Complexity:** Simple
**Dependencies:** None

---

### 4.5 Update Homepage Data Fetching

**File Modified:** `src/app/page.tsx`

**Changes:**
- Fetch historical data for trend calculations
- Call trend calculation functions
- Pass trend data to components
- Add market context row

**New Data Fetch Pattern:**
```typescript
// Parallel fetch for performance
const [
  todayData,
  sectorTrends,
  investorTrends,
  setIndexHistory
] = await Promise.all([
  fetchTodayData(),
  calculateAllSectorTrends(),
  calculateAllInvestorTrends(),
  fetchSetIndexHistory({ period: 'YTD' })
])
```

**Complexity:** Complex
**Dependencies:** All Phase 1-3 tasks

---

### 4.6 Update Homepage Layout

**File Modified:** `src/app/page.tsx`

**Layout Changes:**
```jsx
<div className="space-y-6">
  {/* SetSnapshot with trends + DataFreshness */}
  <SetSnapshot data={market.set} trends={setIndexTrends} />
  <DataFreshness timestamp={market.timestamp} />

  {/* Market Context Grid */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Week52Range data={week52Data} />
    <MarketBreadth data={breadthData} />
    <SetPERatio data={peData} />
    <VolatilityIndicator data={volatilityData} />
  </div>

  {/* Existing components */}
  <MarketRegimeSummary regime={regime} />
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <MoneyFlowChart data={investor} trends={investorTrends} />
    <SectorHeatmap data={sector} trends={sectorTrends} />
  </div>
  <TopRankings data={rankings} />
</div>
```

**Complexity:** Simple
**Dependencies:** Task 4.5

---

## Implementation Order

```
Phase 1 (Yahoo Finance):    1.1 → 1.2 → 1.3 → 1.4 → 1.5
Phase 2 (Trend Data):        2.1 → 2.2 → 2.3 → 2.4 → 2.5
Phase 3 (Context Widgets):   3.1 → 3.2 → 3.3 → 3.4 → 3.5
Phase 4 (Enhancements):      4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6
```

---

## Files Summary

### New Files (23)
| File | Purpose |
|------|---------|
| `src/lib/yahoo-finance/types.ts` | Yahoo Finance types |
| `src/lib/yahoo-finance/cache.ts` | Rate limiting cache |
| `src/lib/yahoo-finance/set-index.ts` | SET index fetchers |
| `src/lib/yahoo-finance/index.ts` | Module exports |
| `src/lib/trends/types.ts` | Trend types |
| `src/lib/trends/sector.ts` | Sector trends |
| `src/lib/trends/investor.ts` | Investor trends |
| `src/lib/trends/index.ts` | Trend exports |
| `src/app/api/market/trends/route.ts` | Market trends API |
| `src/app/api/market/set-index/history/route.ts` | SET history API |
| `src/app/api/market/set-index/sync/route.ts` | SET sync API (cron) |
| `src/app/api/market/sectors/trends/route.ts` | Sector trends API |
| `src/app/api/investors/trends/route.ts` | Investor trends API |
| `src/components/home/MarketContextCard.tsx` | Base context card |
| `src/components/home/Week52Range.tsx` | 52-week range |
| `src/components/home/MarketBreadth.tsx` | Market breadth |
| `src/components/home/SetPERatio.tsx` | SET P/E ratio |
| `src/components/home/VolatilityIndicator.tsx` | Volatility indicator |
| `src/components/shared/DataFreshness.tsx` | Data freshness badge |
| `vercel.json` | Cron configuration |

### Modified Files (7)
| File | Changes |
|------|---------|
| `package.json` | Add yahoo-finance2 |
| `src/lib/rtdb/paths.ts` | Add SET index paths |
| `src/types/rtdb.ts` | Add SET index types |
| `src/components/home/SetSnapshot.tsx` | Add trend props |
| `src/components/home/SectorHeatmap.tsx` | Add trend props |
| `src/components/home/MoneyFlowChart.tsx` | Add trend props |
| `src/app/page.tsx` | Enhanced data fetching + layout |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Yahoo Finance rate limits | Medium | In-memory cache, 1s throttle, daily sync only |
| Missing dates in RTDB | Low | Fallback to nearest available date |
| Performance with multiple queries | Medium | Parallel `Promise.all()` fetches |
| Weekends/holidays gaps | Low | Skip Sat/Sun in date calculations |

---

## Success Criteria

- [ ] Yahoo Finance sync runs daily at 18:30
- [ ] SET index 52-week range displays correctly
- [ ] Sector 5D, 20D, YTD trends calculate from RTDB
- [ ] Investor flow trends calculate from RTDB
- [ ] All trend indicators show on components
- [ ] Data freshness indicator displays
- [ ] Page load time < 3 seconds
- [ ] Mobile layout works correctly

---

## Daily Update Flow

```
18:30 Daily Cron
    │
    ▼
┌─────────────────────────────────┐
│ Yahoo Finance Sync              │
│ /api/market/set-index/sync      │
│ - Fetch ^SET close, high, low   │
│ - Store to RTDB                 │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ RTDB Updated                    │
│ /settrade/setIndex/byDate/{date}│
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Next Page Load                  │
│ - Fetch today's data            │
│ - Query historical for trends   │
│ - Calculate 5D, 20D, YTD        │
│ - Display with freshness badge  │
└─────────────────────────────────┘
```
