# Homepage Enhancement Checklist

**Project:** Thai Stock Market Decision Web (fonPick)
**Plan:** [HOMEPAGE_ENHANCEMENT_PLAN.md](./HOMEPAGE_ENHANCEMENT_PLAN.md)
**Current Phase:** Not Started
**Last Updated:** 2026-01-23

---

## Quick Progress

| Phase | Tasks | Complete | Progress |
|-------|-------|----------|----------|
| Phase 1: Foundation | 7 | 0 | 0% |
| Phase 2: Market Context | 6 | 0 | 0% |
| Phase 3: Sector Analysis | 9 | 0 | 0% |
| **Total** | **22** | **0** | **0%** |

---

## Phase 1: Foundation - Trend Data & Historical Context

### 1.1 Create Historical Data Fetcher
- [ ] Create `src/lib/rtdb/historical.ts`
- [ ] Implement `fetchMarketOverviewByDate(date: string)`
- [ ] Implement `fetchIndustrySectorByDate(date: string)`
- [ ] Implement `fetchInvestorTypeByDate(date: string)`
- [ ] Implement `fetchDateRange(startDate, endDate, dataType)`
- [ ] Export from `src/lib/rtdb/index.ts`
- [ ] Write unit tests

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 1.2 Create Trend Calculation Utilities
- [ ] Create `src/lib/utils/trends.ts`
- [ ] Implement `calculateIndexTrend()` with 5D, 20D, YTD
- [ ] Implement `calculateSectorTrend()`
- [ ] Implement `calculateInvestorFlowTrend()`
- [ ] Implement `getYTDStartDate()`
- [ ] Implement `getTradingDaysAgo(days)`
- [ ] Export from `src/lib/utils/index.ts`
- [ ] Write unit tests for edge cases

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 1.3 Extend Types for Trend Data
- [ ] Add `TrendData` interface to `src/types/rtdb.ts`
- [ ] Add `TrendedMarketOverview` interface
- [ ] Add `TrendedSector` interface
- [ ] Add `TrendedInvestorFlow` interface

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 1.4 Update SetSnapshot Component with Trends
- [ ] Add `trends?: TrendData` prop to `SetSnapshot.tsx`
- [ ] Add 5D trend badge below SET index
- [ ] Add 20D trend badge below SET index
- [ ] Add YTD trend badge below SET index
- [ ] Implement color coding (green/red/gray)
- [ ] Test with mock trend data

**Status:** Not Started | **Assignee:** | **Blocked:** 1.1, 1.2, 1.3

---

### 1.5 Update SectorHeatmap Component with Trends
- [ ] Add `trends?: TrendData` to sector data type
- [ ] Add `showTrends?: boolean` prop
- [ ] Add trend indicator to each sector cell
- [ ] Implement hover state for trend details
- [ ] Update color intensity for trend + daily combined
- [ ] Test with various trend scenarios

**Status:** Not Started | **Assignee:** | **Blocked:** 1.1, 1.2, 1.3

---

### 1.6 Update MoneyFlowChart Component with Trends
- [ ] Add 5D trend sum to each investor type
- [ ] Add trend arrow indicator
- [ ] Color code based on trend direction
- [ ] Display "5D Net: X" below each bar
- [ ] Test with positive/negative trends

**Status:** Not Started | **Assignee:** | **Blocked:** 1.1, 1.2, 1.3

---

### 1.7 Update Homepage to Fetch Trend Data
- [ ] Add `fetchHistoricalMarketData()` function
- [ ] Fetch 5-day ago market data
- [ ] Fetch 20-day ago market data
- [ ] Fetch YTD start market data
- [ ] Calculate trends using utilities
- [ ] Pass trend data to SetSnapshot
- [ ] Pass trend data to SectorHeatmap
- [ ] Pass trend data to MoneyFlowChart
- [ ] Handle missing historical data gracefully
- [ ] Test page load performance

**Status:** Not Started | **Assignee:** | **Blocked:** 1.1, 1.2

---

## Phase 2: Market Context Indicators

### 2.1 Create Market Context Service
- [ ] Create `src/services/market-context/types.ts`
- [ ] Create `src/services/market-context/calculators.ts`
- [ ] Implement `calculate52WeekRange()`
- [ ] Implement `calculateVolatility()`
- [ ] Implement `calculateBreadth()`
- [ ] Implement `determineSentiment()`
- [ ] Create `src/services/market-context/index.ts`
- [ ] Export all functions
- [ ] Write unit tests

**Status:** Not Started | **Assignee:** | **Blocked:** Phase 1 complete

---

### 2.2 Extend RTDB Paths for Context Data
- [ ] Add `MARKET_CONTEXT_BASE` to `RTDB_PATHS`
- [ ] Add `MARKET_CONTEXT_BY_DATE(date)` function
- [ ] Add `MARKET_CONTEXT_LATEST` constant
- [ ] Add `SET_INDEX_HISTORY` constant
- [ ] Add `SET_INDEX_HISTORY_RANGE(start, end)` function

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 2.3 Create Market Context Fetcher
- [ ] Create `src/lib/rtdb/market-context.ts`
- [ ] Implement `fetchMarketContext()`
- [ ] Implement `fetchSetPE()`
- [ ] Implement `fetch52WeekHistory()`
- [ ] Implement `fetchBreadthData()`
- [ ] Export from `src/lib/rtdb/index.ts`
- [ ] Write integration tests

**Status:** Not Started | **Assignee:** | **Blocked:** 2.2

---

### 2.4 Create MarketContext Component
- [ ] Create `src/components/home/MarketContext.tsx`
- [ ] Design 52-week range bar visualization
- [ ] Implement SET P/E with percentile
- [ ] Implement volatility gauge
- [ ] Implement breadth indicators
- [ ] Add overall sentiment badge
- [ ] Export from `src/components/home/index.ts`

**Status:** Not Started | **Assignee:** | **Blocked:** 2.1

---

### 2.5 Update Homepage with Market Context
- [ ] Fetch market context data in `page.tsx`
- [ ] Insert MarketContext after SetSnapshot
- [ ] Pass context to regime analyzer
- [ ] Handle missing context data gracefully

**Status:** Not Started | **Assignee:** | **Blocked:** 2.1, 2.3, 2.4

---

### 2.6 Enhance Market Regime Analysis with Context
- [ ] Add context parameter to `buildRegimeInput()`
- [ ] Incorporate breadth into confidence scoring
- [ ] Incorporate volatility into confidence scoring
- [ ] Update reason generation with context factors
- [ ] Test with various context scenarios

**Status:** Not Started | **Assignee:** | **Blocked:** 2.1

---

## Phase 3: Sector Analysis & Rankings

### 3.1 Create Sector Analysis Service
- [ ] Create `src/services/sector-analysis/types.ts`
- [ ] Create `src/services/sector-analysis/analyzer.ts`
- [ ] Implement `analyzeSectorRelativeStrength()`
- [ ] Implement `analyzeSectorMomentum()`
- [ ] Implement `analyzeSectorVolume()`
- [ ] Create `src/services/sector-analysis/ranker.ts`
- [ ] Implement `rankSectors()`
- [ ] Implement `generateSectorVerdict()`
- [ ] Create `src/services/sector-analysis/index.ts`
- [ ] Write comprehensive unit tests

**Status:** Not Started | **Assignee:** | **Blocked:** Phase 1, Phase 2 complete

---

### 3.2 Extend Types for Sector Fundamentals
- [ ] Add `RTDBSectorFundamentals` interface
- [ ] Add `RTDBSectorWithFundamentals` interface
- [ ] Update sector-related types

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 3.3 Create Sector Fundamentals Fetcher
- [ ] Create `src/lib/rtdb/sector-fundamentals.ts`
- [ ] Implement `fetchSectorFundamentals()`
- [ ] Implement `fetchSectorFundamentalsById()`
- [ ] Implement `getTopSectorsByPE()`
- [ ] Implement `getTopSectorsByDividendYield()`
- [ ] Export from `src/lib/rtdb/index.ts`

**Status:** Not Started | **Assignee:** | **Blocked:** 3.2

---

### 3.4 Create SectorRankings Component
- [ ] Create `src/components/home/SectorRankings.tsx`
- [ ] Implement three-column layout (Buy/Watch/Avoid)
- [ ] Display relative strength indicators
- [ ] Add trend arrows for each sector
- [ ] Implement onClick handler for drill-down
- [ ] Export from `src/components/home/index.ts`
- [ ] Test with various ranking scenarios

**Status:** Not Started | **Assignee:** | **Blocked:** 3.1

---

### 3.5 Create SectorDetailModal Component (Client)
- [ ] Create `src/components/home/SectorDetailModal.tsx`
- [ ] Add `'use client'` directive
- [ ] Implement modal open/close state
- [ ] Display sector verdict badge
- [ ] Display relative strength chart (5D, 20D, YTD)
- [ ] Display momentum indicator
- [ ] Display volume analysis
- [ ] Display fundamental metrics
- [ ] Display top constituent stocks
- [ ] Implement stock click navigation
- [ ] Export from `src/components/home/index.ts`

**Status:** Not Started | **Assignee:** | **Blocked:** 3.1, 3.3

---

### 3.6 Create Sector Constituents Fetcher
- [ ] Create `src/lib/rtdb/sector-constituents.ts`
- [ ] Implement `fetchSectorConstituents()`
- [ ] Implement `fetchTopConstituentsByMarketCap()`
- [ ] Implement `fetchTopConstituentsByVolume()`
- [ ] Implement `getSectorStockCount()`
- [ ] Export from `src/lib/rtdb/index.ts`

**Status:** Not Started | **Assignee:** | **Blocked:** No

---

### 3.7 Update SectorHeatmap with Click Interaction
- [ ] Convert SectorHeatmap to Client Component
- [ ] Add `'use client'` directive
- [ ] Add `onSectorClick` prop
- [ ] Add `selectedSector` prop for highlight
- [ ] Implement click handlers on sector cells
- [ ] Add visual selection state
- [ ] Test click-through to modal

**Status:** Not Started | **Assignee:** | **Blocked:** 3.1, 3.5

---

### 3.8 Create InteractiveSectorDashboard Wrapper (Client)
- [ ] Create `src/components/home/InteractiveSectorDashboard.tsx`
- [ ] Add `'use client'` directive
- [ ] Implement `selectedSector` state
- [ ] Implement `modalOpen` state
- [ ] Implement `selectedSectorData` state
- [ ] Handle sector clicks
- [ ] Fetch additional data on demand
- [ ] Manage modal open/close
- [ ] Export from `src/components/home/index.ts`

**Status:** Not Started | **Assignee:** | **Blocked:** 3.4, 3.5, 3.7

---

### 3.9 Update Homepage with Sector Rankings
- [ ] Add `fetchSectorAnalysis()` function
- [ ] Fetch sector rankings with market regime
- [ ] Add SectorRankings component
- [ ] Wrap interactive components in client wrapper
- [ ] Pass ranking data to SectorHeatmap
- [ ] Test complete user flow

**Status:** Not Started | **Assignee:** | **Blocked:** 3.1, 3.4, 3.8

---

## Testing Checklist

### Unit Tests
- [ ] `src/lib/utils/trends.ts` - All calculation functions
- [ ] `src/services/market-context/calculators.ts` - All context calculations
- [ ] `src/services/sector-analysis/analyzer.ts` - Relative strength, momentum
- [ ] `src/services/sector-analysis/ranker.ts` - Verdict generation
- [ ] Coverage target: 80%

### Integration Tests
- [ ] Fetch historical data and calculate trends
- [ ] Fetch market context and generate indicators
- [ ] Fetch sector data and generate rankings
- [ ] Regime enhancement with context data

### E2E Tests (Playwright)
- [ ] User views homepage and sees trend indicators
- [ ] User views market context card and understands breadth
- [ ] User clicks sector in heatmap and sees detail modal
- [ ] User navigates from sector detail to stock detail

---

## Sign-Off

### Phase 1 Sign-Off
- [ ] All tasks complete
- [ ] Unit tests passing (80% coverage)
- [ ] Integration tests passing
- [ ] Code review approved
- [ ] Performance tested (<2s page load)

**Signed:** __________________ **Date:** ________

---

### Phase 2 Sign-Off
- [ ] All tasks complete
- [ ] Unit tests passing (80% coverage)
- [ ] Integration tests passing
- [ ] Code review approved
- [ ] MarketContext displays correctly

**Signed:** __________________ **Date:** ________

---

### Phase 3 Sign-Off
- [ ] All tasks complete
- [ ] Unit tests passing (80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code review approved
- [ ] User flows tested

**Signed:** __________________ **Date:** ________

---

## Notes

### Blockers
- Document any blocking issues here

### Decisions
- Document any architectural decisions or scope changes here

### Risks
- Document any new risks discovered during implementation
