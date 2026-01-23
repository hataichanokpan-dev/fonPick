# Homepage Enhancement Checklist v2

**Project:** Thai Stock Market Decision Web (fonPick)
**Plan:** [HOMEPAGE_ENHANCEMENT_PLAN_V2.md](./HOMEPAGE_ENHANCEMENT_PLAN_V2.md)
**Architecture:** Daily data updates (18:30 RTDB sync) + Yahoo Finance for SET index
**Current Phase:** Not Started
**Last Updated:** 2026-01-23

---

## Quick Progress

| Phase | Tasks | Complete | Progress |
|-------|-------|----------|----------|
| Phase 1: Yahoo Finance API | 5 | 0 | 0% |
| Phase 2: Trend Calculations | 5 | 0 | 0% |
| Phase 3: Market Context | 5 | 0 | 0% |
| Phase 4: Component Enhancements | 6 | 0 | 0% |
| **Total** | **21** | **0** | **0%** |

---

## Phase 1: Yahoo Finance API Integration

### 1.1 Install Yahoo Finance Library
- [ ] Add `yahoo-finance2` to package.json
- [ ] Run `npm install`
- [ ] Verify installation

**Status:** Not Started | **Complexity:** Simple | **Blocked:** No

---

### 1.2 Create Yahoo Finance Module
- [ ] Create `src/lib/yahoo-finance/types.ts`
  - [ ] `YahooHistoricalQuote` interface
  - [ ] `YahooSetIndexData` interface
  - [ ] `YahooSetIndexSnapshot` interface
  - [ ] `RTDBSetIndexEntry` interface
- [ ] Create `src/lib/yahoo-finance/cache.ts`
  - [ ] `YahooFinanceCache` class
  - [ ] `get()` method with TTL
  - [ ] `set()` method
  - [ ] `throttleYahooCall()` function
- [ ] Create `src/lib/yahoo-finance/set-index.ts`
  - [ ] `fetchYahooSetIndexHistorical()` function
  - [ ] `fetchYahooSetIndexByDate()` function
  - [ ] `toRTDBSetIndexEntry()` converter
  - [ ] `getMissingDates()` helper
- [ ] Create `src/lib/yahoo-finance/index.ts`
  - [ ] Export all functions and types
- [ ] Write unit tests for cache
- [ ] Write unit tests for fetch functions

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 1.1

---

### 1.3 Extend RTDB for SET Index
- [ ] Add to `src/lib/rtdb/paths.ts`:
  - [ ] `SET_INDEX_BASE` constant
  - [ ] `SET_INDEX_BY_DATE(date)` function
  - [ ] `SET_INDEX_LATEST` constant
  - [ ] `SET_INDEX_DATES` constant
  - [ ] `SET_INDEX_META` constant
- [ ] Add to `src/types/rtdb.ts`:
  - [ ] `RTDBSetIndexData` interface
  - [ ] `RTDBSetIndexMeta` interface
  - [ ] `RTDBSetIndexEntry` interface
  - [ ] `RTDBSetIndex` simplified interface
- [ ] Verify TypeScript compilation

**Status:** Not Started | **Complexity:** Simple | **Blocked:** No

---

### 1.4 Create SET Index Sync API (Cron)
- [ ] Create `src/app/api/market/set-index/sync/route.ts`
  - [ ] Implement `validateRequest()` function
  - [ ] Implement POST handler
  - [ ] Add backfill support
  - [ ] Add error handling
  - [ ] Return sync results
- [ ] Create `vercel.json`
  - [ ] Add cron configuration for 18:30 weekdays
  - [ ] Configure cron path
- [ ] Test cron endpoint locally
- [ ] Add API key to environment variables

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 1.1, 1.2, 1.3

---

### 1.5 Create SET Index History API
- [ ] Create `src/app/api/market/set-index/history/route.ts`
  - [ ] Implement GET handler
  - [ ] Add period param support (5D, 20D, YTD)
  - [ ] Add date range param support
  - [ ] Fetch from RTDB
  - [ ] Return formatted history
  - [ ] Add error handling
- [ ] Test with period parameter
- [ ] Test with date range parameters
- [ ] Test with missing data

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 1.3

---

## Phase 2: Trend Calculations from RTDB

### 2.1 Create Trend Types
- [ ] Create `src/lib/trends/types.ts`
  - [ ] `TrendValue` interface
  - [ ] `SectorTrend` interface
  - [ ] `InvestorTrend` interface
  - [ ] `MarketTrend` interface
- [ ] Verify TypeScript compilation

**Status:** Not Started | **Complexity:** Simple | **Blocked:** No

---

### 2.2 Create Sector Trend Calculations
- [ ] Create `src/lib/trends/sector.ts`
  - [ ] `getTradingDays()` helper
  - [ ] `fetchSectorDataForDates()` function
  - [ ] `calculateTrend()` helper
  - [ ] `calculateSector5DayTrend()` function
  - [ ] `calculateSector20DayTrend()` function
  - [ ] `calculateSectorYTDTrend()` function
  - [ ] `calculateAllSectorTrends()` function
- [ ] Write unit tests for trend calculations
- [ ] Test with mock RTDB data
- [ ] Test with missing dates

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 2.1

---

### 2.3 Create Investor Trend Calculations
- [ ] Create `src/lib/trends/investor.ts`
  - [ ] `getTradingDays()` helper
  - [ ] `fetchInvestorDataForDates()` function
  - [ ] `calculateCumulativeNetFlow()` helper
  - [ ] `calculateInvestor5DayTrend()` function
  - [ ] `calculateInvestor20DayTrend()` function
  - [ ] `calculateInvestorYTDTrend()` function
  - [ ] `calculateAllInvestorTrends()` function
- [ ] Write unit tests for flow calculations
- [ ] Test with mock RTDB data

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 2.1

---

### 2.4 Create Trend Module Exports
- [ ] Create `src/lib/trends/index.ts`
  - [ ] Export sector functions
  - [ ] Export investor functions
  - [ ] Export all types
- [ ] Verify exports work correctly

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 2.1, 2.2, 2.3

---

### 2.5 Create Trend API Routes
- [ ] Create `src/app/api/market/trends/route.ts`
  - [ ] GET handler
  - [ ] Call all trend functions
  - [ ] Return combined trends
- [ ] Create `src/app/api/market/sectors/trends/route.ts`
  - [ ] GET handler
  - [ ] Query params (period, sortBy)
  - [ ] Return sorted sectors
- [ ] Create `src/app/api/investors/trends/route.ts`
  - [ ] GET handler
  - [ ] Return investor trends
  - [ ] Add summary (top buyer/seller)
- [ ] Test all API endpoints

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 2.2, 2.3, 2.4

---

## Phase 3: Market Context Components

### 3.1 Create Base Context Card
- [ ] Create `src/components/home/MarketContextCard.tsx`
  - [ ] Props interface
  - [ ] Card layout
  - [ ] Label display
  - [ ] Value display
  - [ ] Optional trend indicator
  - [ ] Size variants (sm, md, lg)
- [ ] Export from `src/components/home/index.ts`
- [ ] Visual test with all variants

**Status:** Not Started | **Complexity:** Simple | **Blocked:** No

---

### 3.2 Create 52-Week Range Component
- [ ] Create `src/components/home/Week52Range.tsx`
  - [ ] Props interface (current, high, low)
  - [ ] Calculate position in range
  - [ ] Visual bar implementation
  - [ ] Color coding (near high/low)
  - [ ] Display values
- [ ] Export from index
- [ ] Test at various positions
- [ ] Test with missing data

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 1.2, 1.5, 3.1

---

### 3.3 Create Market Breadth Component
- [ ] Create `src/components/home/MarketBreadth.tsx`
  - [ ] Props interface (advances, declines)
  - [ ] Calculate A/D ratio
  - [ ] Visual gauge
  - [ ] Color coding (>1.5 bullish, <0.67 bearish)
  - [ ] Display ratio and status
- [ ] Export from index
- [ ] Test with bullish/neutral/bearish data

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 3.1

---

### 3.4 Create SET P/E Ratio Component
- [ ] Create `src/components/home/SetPERatio.tsx`
  - [ ] Props interface (currentPE, historicalAvg)
  - [ ] Calculate percentile
  - [ ] Display current P/E
  - [ ] Show historical comparison
  - [ ] Valuation label (cheap/fair/expensive)
- [ ] Export from index
- [ ] Test at different P/E levels

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 1.2, 1.5, 3.1

---

### 3.5 Create Volatility Indicator Component
- [ ] Create `src/components/home/VolatilityIndicator.tsx`
  - [ ] Props interface (volatility, average)
  - [ ] Calculate level (low/normal/elevated/extreme)
  - [ ] Visual gauge
  - [ ] Color coding
  - [ ] Display value and level
- [ ] Export from index
- [ ] Test with different volatility levels

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 1.2, 1.5, 3.1

---

## Phase 4: Component Enhancements

### 4.1 Enhance SetSnapshot with Trends
- [ ] Modify `src/components/home/SetSnapshot.tsx`
  - [ ] Add trends prop interface
  - [ ] Add 5D trend badge
  - [ ] Add 20D trend badge
  - [ ] Add YTD trend badge
  - [ ] Color coding for direction
  - [ ] Arrow icons
- [ ] Test with various trend combinations
- [ ] Ensure backward compatibility

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 2.2, 2.4

---

### 4.2 Enhance SectorHeatmap with Trends
- [ ] Modify `src/components/home/SectorHeatmap.tsx`
  - [ ] Add trend props to sector data
  - [ ] Add trend indicator (hover or badge)
  - [ ] Show 5D trend direction
  - [ ] Update colors based on trend
- [ ] Test hover interaction
- [ ] Verify readability

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 2.2

---

### 4.3 Enhance MoneyFlowChart with Trends
- [ ] Modify `src/components/home/MoneyFlowChart.tsx`
  - [ ] Add trend props to investor data
  - [ ] Add cumulative trend display
  - [ ] Small arrow + percentage
  - [ ] Color coding
- [ ] Test with positive/negative trends
- [ ] Verify layout

**Status:** Not Started | **Complexity:** Medium | **Blocked:** 2.3

---

### 4.4 Create Data Freshness Indicator
- [ ] Create `src/components/shared/DataFreshness.tsx`
  - [ ] Props interface (timestamp, date)
  - [ ] Date formatting
  - [ ] Clock icon
  - [ ] "Data as of" text
- [ ] Export from `src/components/shared/index.ts`
- [ ] Test with various timestamp formats

**Status:** Not Started | **Complexity:** Simple | **Blocked:** No

---

### 4.5 Update Homepage Data Fetching
- [ ] Modify `src/app/page.tsx`
  - [ ] Add imports for trend functions
  - [ ] Add parallel data fetching pattern
  - [ ] Call `calculateAllSectorTrends()`
  - [ ] Call `calculateAllInvestorTrends()`
  - [ ] Fetch SET index history
  - [ ] Calculate 52-week range
  - [ ] Calculate volatility
  - [ ] Pass trend data to SetSnapshot
  - [ ] Pass trend data to SectorHeatmap
  - [ ] Pass trend data to MoneyFlowChart
  - [ ] Handle missing data gracefully
- [ ] Test data flow
- [ ] Test performance

**Status:** Not Started | **Complexity:** Complex | **Blocked:** All Phase 1-3 tasks

---

### 4.6 Update Homepage Layout
- [ ] Modify `src/app/page.tsx` layout
  - [ ] Add DataFreshness component
  - [ ] Add market context grid row
  - [ ] Place Week52Range
  - [ ] Place MarketBreadth
  - [ ] Place SetPERatio
  - [ ] Place VolatilityIndicator
  - [ ] Ensure responsive design
  - [ ] Test mobile layout
  - [ ] Test tablet layout
  - [ ] Test desktop layout

**Status:** Not Started | **Complexity:** Simple | **Blocked:** 4.5

---

## Testing Checklist

### Unit Tests
- [ ] `src/lib/yahoo-finance/cache.ts` - Cache operations
- [ ] `src/lib/yahoo-finance/set-index.ts` - Fetch functions
- [ ] `src/lib/trends/sector.ts` - Trend calculations
- [ ] `src/lib/trends/investor.ts` - Flow calculations
- [ ] Coverage target: 80%

### Integration Tests
- [ ] Yahoo Finance → RTDB sync
- [ ] RTDB → Trend calculations
- [ ] API routes return correct data
- [ ] Components render with trend data

### E2E Tests (Playwright)
- [ ] Homepage loads with all trend data
- [ ] Data freshness indicator shows correct date
- [ ] Market context widgets display correctly
- [ ] Trend badges show on components

---

## Sign-Off

### Phase 1 Sign-Off
- [ ] All tasks complete
- [ ] Yahoo Finance sync working
- [ ] Cron job configured
- [ ] SET index history API working
- [ ] Unit tests passing

**Signed:** __________________ **Date:** ________

---

### Phase 2 Sign-Off
- [ ] All tasks complete
- [ ] Sector trends calculate correctly
- [ ] Investor trends calculate correctly
- [ ] API routes working
- [ ] Unit tests passing (80% coverage)

**Signed:** __________________ **Date:** ________

---

### Phase 3 Sign-Off
- [ ] All tasks complete
- [ ] All context components created
- [ ] Visual testing passed
- [ ] Responsive design verified

**Signed:** __________________ **Date:** ________

---

### Phase 4 Sign-Off
- [ ] All tasks complete
- [ ] Components enhanced with trends
- [ ] Homepage updated with new layout
- [ ] Data flow end-to-end working
- [ ] Performance tested (<3s load time)
- [ ] Mobile layout verified

**Signed:** __________________ **Date:** ________

---

## Notes

### Dependencies Summary
```
Phase 1: Yahoo Finance API
  1.1 ──> 1.2 ──> 1.3 ──> 1.4 ──> 1.5

Phase 2: Trend Calculations
  2.1 ──> 2.2 ──┐
         └───────> 2.4 ──> 2.5
  2.1 ──> 2.3 ──┘

Phase 3: Market Context
  1.2, 1.5, 3.1 ──> 3.2
  3.1 ──> 3.3, 3.4, 3.5

Phase 4: Component Enhancements
  2.2, 2.4 ──> 4.1
  2.2 ──> 4.2
  2.3 ──> 4.3
  ───────> 4.4 ──┐
               └──> 4.6
  All Phase 1-3 ──> 4.5 ──┘
```

### Blockers
- Document any blocking issues here

### Decisions
- Document any architectural changes or scope adjustments

### Risks
- Yahoo Finance rate limits - mitigated with cache and daily sync only
- Missing RTDB dates - fallback to nearest available
- Performance with multiple queries - parallel Promise.all() fetches
