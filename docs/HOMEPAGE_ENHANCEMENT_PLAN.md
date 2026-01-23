# Homepage Enhancement Plan

**Project:** Thai Stock Market Decision Web (fonPick)
**Goal:** Enhance main page to help users decide (1) whether to invest and (2) which sectors to choose
**Current Rating:** 2.5/5 - Needs Improvement
**Target Rating:** 4.5/5

---

## Executive Summary

The current homepage provides solid data visualization but lacks historical context and actionable intelligence. This plan adds trend analysis (5-day, 20-day, YTD), market context indicators (52-week range, valuation, breadth), and sector analytics (relative strength, rankings, recommendations).

**Approach:** 3-phase incremental implementation with fallback strategies and comprehensive testing.

---

## Problem Statement

| Goal | Current State | Gap |
|------|---------------|-----|
| **Whether to invest** | Single-day snapshot only | No trends, no valuation, no breadth, no volatility |
| **Which sectors** | Static heatmap | No relative strength, no trends, no fundamentals, no rankings |

---

## Solution Architecture

### Data Layer Changes

```
/settrade/
├── aggregations/               # NEW - Pre-computed aggregations
│   ├── daily/{YYYY-MM-DD}     # Market context (52w, P/E, breadth)
│   ├── trends/
│   │   ├── 5day/{date}
│   │   ├── 20day/{date}
│   │   └── ytd/{date}
│   └── sectorRankings/{date}  # Buy/Watch/Avoid by sector
└── constituents/               # NEW - Sector constituent mapping
    └── bySector/{SECTOR_ID}/{date}/stocks
```

### Component Architecture

```
Homepage (Server Component)
├── SetSnapshot (enhanced with trends)
├── MarketSummaryCard (NEW - context metrics)
├── MarketRegimeSummary (enhanced with breadth/volatility)
├── InteractiveSectorDashboard (Client Component wrapper)
│   ├── EnhancedSectorHeatmap (clickable)
│   ├── SectorRankings (NEW)
│   └── SectorDetailModal (NEW)
├── MoneyFlowChart (enhanced with trends)
└── TopRankings (existing)
```

### Caching Strategy

| Data Type | Server Cache | Client Cache | Update Frequency |
|-----------|--------------|--------------|------------------|
| Real-time (SET, flow) | 5 min | 1 min | Every 5 min |
| 5-Day Trends | 30 min | 5 min | Every hour |
| 20-Day Trends | 2 hours | 10 min | Every 4 hours |
| YTD Trends | 1 day | 1 hour | Daily EOD |
| 52-Week Range | 1 week | 1 day | Weekly |
| Sector Rankings | 30 min | 10 min | Every 30 min |

---

## Phase 1: Foundation - Trend Data & Historical Context

**Duration:** 1-2 weeks
**Goal:** Add 5-day, 20-day, YTD performance to all components
**Impact:** Transforms snapshot view into trend analysis

### Tasks

| ID | Task | Files | Complexity | Dependencies |
|----|------|-------|------------|--------------|
| 1.1 | Create historical data fetcher | `src/lib/rtdb/historical.ts` (new) | Simple | - |
| 1.2 | Create trend calculation utilities | `src/lib/utils/trends.ts` (new) | Simple | - |
| 1.3 | Extend types for trend data | `src/types/rtdb.ts` (modify) | Simple | - |
| 1.4 | Update SetSnapshot with trends | `src/components/home/SetSnapshot.tsx` | Medium | 1.1, 1.2, 1.3 |
| 1.5 | Update SectorHeatmap with trends | `src/components/home/SectorHeatmap.tsx` | Medium | 1.1, 1.2, 1.3 |
| 1.6 | Update MoneyFlowChart with trends | `src/components/home/MoneyFlowChart.tsx` | Medium | 1.1, 1.2, 1.3 |
| 1.7 | Update homepage to fetch trend data | `src/app/page.tsx` | Medium | 1.1, 1.2 |

### New Types

```typescript
// src/types/rtdb.ts additions
export interface TrendData {
  fiveDay: { change: number; changePercent: number }
  twentyDay: { change: number; changePercent: number }
  ytd: { change: number; changePercent: number }
}

export interface TrendedMarketOverview extends RTDBMarketOverview {
  trends: TrendData
}

export interface TrendedSector extends RTDBSector {
  trends: TrendData
}
```

### Success Criteria

- [ ] All components display 5D, 20D, YTD badges
- [ ] Color-coded trend direction (green up, red down, gray flat)
- [ ] Missing historical data falls back gracefully
- [ ] Performance: <2s page load with trend data

---

## Phase 2: Market Context Indicators

**Duration:** 1-2 weeks
**Goal:** Add 52-week high/low, SET P/E, volatility, breadth indicators
**Impact:** Provides valuation and market health context for investment timing

### Tasks

| ID | Task | Files | Complexity | Dependencies |
|----|------|-------|------------|--------------|
| 2.1 | Create market context service | `src/services/market-context/` (new) | Complex | Phase 1 |
| 2.2 | Extend RTDB paths for context | `src/lib/rtdb/paths.ts` (modify) | Simple | - |
| 2.3 | Create market context fetcher | `src/lib/rtdb/market-context.ts` (new) | Medium | 2.2 |
| 2.4 | Create MarketContext component | `src/components/home/MarketContext.tsx` (new) | Medium | 2.1 |
| 2.5 | Update homepage with context | `src/app/page.tsx` (modify) | Simple | 2.1, 2.3, 2.4 |
| 2.6 | Enhance regime analysis with context | `src/services/market-regime/analyzer.ts` | Medium | 2.1 |

### New Component

```typescript
// MarketContext display layout
+------------------------------------------+
| Market Context                           |
+------------------------------------------+
| 52W Range:  ████░░░░░░░░░░░  1350-1550  |
| Current: 1450 (+3.2% from mid)           |
+------------------------------------------+
| SET P/E: 15.2     [60th percentile]      |
| Volatility: 12%   (Normal)               |
| Breadth: 1.8:1    (Strong)               |
| Sentiment: [Bullish Badge]               |
+------------------------------------------+
```

### New Types

```typescript
// Market context types
export interface MarketContext {
  week52High: number
  week52Low: number
  currentVs52WeekHigh: number
  currentVs52WeekLow: number
  setPE: number | null
  setPEPercentile: number | null
  volatility: {
    current: number
    average: number
    level: 'low' | 'normal' | 'elevated' | 'extreme'
  }
  breadth: {
    advanceDeclineRatio: number
    breadthStatus: 'strong' | 'neutral' | 'weak'
    newHighs: number
    newLows: number
  }
  overallSentiment: 'bullish' | 'neutral' | 'bearish'
}
```

### Success Criteria

- [ ] MarketContext card displays all indicators
- [ ] 52-week range visual bar works correctly
- [ ] Breadth and volatility affect regime confidence
- [ ] SET P/E comparison to historical average shows
- [ ] Overall sentiment badge reflects context

---

## Phase 3: Sector Analysis & Rankings

**Duration:** 2-3 weeks
**Goal:** Add sector relative strength, Buy/Watch/Avoid rankings, interactive drill-down
**Impact:** Directly addresses "which sectors to invest" decision

### Tasks

| ID | Task | Files | Complexity | Dependencies |
|----|------|-------|------------|--------------|
| 3.1 | Create sector analysis service | `src/services/sector-analysis/` (new) | Complex | Phase 1, 2 |
| 3.2 | Extend types for sector fundamentals | `src/types/rtdb.ts` (modify) | Simple | - |
| 3.3 | Create sector fundamentals fetcher | `src/lib/rtdb/sector-fundamentals.ts` (new) | Medium | 3.2 |
| 3.4 | Create SectorRankings component | `src/components/home/SectorRankings.tsx` (new) | Complex | 3.1 |
| 3.5 | Create SectorDetailModal (Client) | `src/components/home/SectorDetailModal.tsx` (new) | Complex | 3.1, 3.3 |
| 3.6 | Create sector constituents fetcher | `src/lib/rtdb/sector-constituents.ts` (new) | Medium | - |
| 3.7 | Update SectorHeatmap with click interaction | `src/components/home/SectorHeatmap.tsx` → Client | Medium | 3.1, 3.5 |
| 3.8 | Create InteractiveSectorDashboard wrapper | `src/components/home/InteractiveSectorDashboard.tsx` (new) | Complex | 3.4, 3.5, 3.7 |
| 3.9 | Update homepage with sector rankings | `src/app/page.tsx` (modify) | Medium | 3.1, 3.4, 3.8 |

### New Component Layout

```
+--------------------------------------------------+
| Sector Rankings              [Regime: Risk-On]  |
+--------------------------------------------------+
| BUY                    | WATCH       | AVOID    |
+------------------------+-------------+----------+
| Banking [Outperform]   | Technology  | Energy   |
| +2.5% vs SET (5D)      | [Neutral]   | [-1.8%]  |
| [Strong momentum]      | +0.8% vs    | [Weak]   |
+------------------------+ SET         +----------+
| Consumer               | Property    |
| [Outperform]           | [Underperf] |
| +1.9% vs SET (5D)      | -0.5% vs    |
+------------------------+ SET         +
```

### New Types

```typescript
// Sector analysis types
export interface SectorAnalysis {
  sectorId: string
  sectorName: string
  relativeStrength: {
    vsSet5Day: number
    vsSet20Day: number
    vsSetYTD: number
    rating: 'outperform' | 'neutral' | 'underperform'
  }
  momentum: {
    trend: 'accelerating' | 'steady' | 'decelerating'
    strength: 'strong' | 'moderate' | 'weak'
  }
  volumeAnalysis: {
    avgVolume: number
    volumeTrend: 'increasing' | 'stable' | 'decreasing'
  }
}

export interface SectorRanking {
  sector: SectorAnalysis
  verdict: 'buy' | 'watch' | 'avoid'
  confidence: 'high' | 'medium' | 'low'
  reasons: {
    strengths: string[]
    concerns: string[]
  }
}
```

### Success Criteria

- [ ] SectorRankings displays Buy/Watch/Avoid columns
- [ ] Each sector shows relative strength vs SET
- [ ] Clicking sector opens detail modal
- [ ] Modal shows constituent stocks
- [ ] Rankings adjust with market regime changes
- [ ] Fundamental metrics display when available

---

## Testing Strategy

### Unit Tests (Target: 80% Coverage)

| File | Test Coverage |
|------|---------------|
| `src/lib/utils/trends.ts` | All calculation functions |
| `src/services/market-context/calculators.ts` | All context calculations |
| `src/services/sector-analysis/analyzer.ts` | Relative strength, momentum |
| `src/services/sector-analysis/ranker.ts` | Verdict generation |

### Integration Tests

| Workflow | Test Case |
|----------|-----------|
| Historical data fetch | Fetch 5, 20, YTD data and calculate trends |
| Market context | Fetch context and generate indicators |
| Sector rankings | Fetch sector data and generate rankings |
| Regime enhancement | Context affects regime confidence |

### E2E Tests (Playwright)

| User Journey | Test Steps |
|--------------|------------|
| View trends | Homepage loads → all trend indicators visible |
| View context | Scroll down → MarketContext card displays correctly |
| Sector drill-down | Click sector → modal opens → stocks visible |
| Navigate to stock | Click stock in modal → stock detail page loads |

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| RTDB historical data unavailable | High | Medium | Fallback to mock data; add data generation script |
| Sector fundamentals missing | Medium | Medium | Rankings work with price data only |
| Performance issues with multiple fetches | Medium | High | Parallel fetching; caching; aggregations |
| Client Component state complexity | Medium | Medium | Minimal state; documented patterns |
| Trend calculation accuracy | Medium | Medium | Use tested formulas; validate with samples |

---

## File Structure (New/Modified)

```
src/
├── lib/
│   ├── rtdb/
│   │   ├── historical.ts              # NEW - Phase 1
│   │   ├── market-context.ts          # NEW - Phase 2
│   │   ├── sector-fundamentals.ts     # NEW - Phase 3
│   │   └── sector-constituents.ts     # NEW - Phase 3
│   └── utils/
│       └── trends.ts                  # NEW - Phase 1
├── services/
│   ├── market-context/                # NEW - Phase 2
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── calculators.ts
│   └── sector-analysis/               # NEW - Phase 3
│       ├── index.ts
│       ├── types.ts
│       ├── analyzer.ts
│       └── ranker.ts
├── components/
│   └── home/
│       ├── SetSnapshot.tsx            # MODIFY - Phase 1
│       ├── SectorHeatmap.tsx          # MODIFY → Client - Phase 3
│       ├── MoneyFlowChart.tsx         # MODIFY - Phase 1
│       ├── MarketContext.tsx          # NEW - Phase 2
│       ├── SectorRankings.tsx         # NEW - Phase 3
│       ├── SectorDetailModal.tsx      # NEW - Phase 3 (Client)
│       └── InteractiveSectorDashboard.tsx  # NEW - Phase 3 (Client)
├── types/
│   └── rtdb.ts                        # MODIFY - All phases
└── app/
    └── page.tsx                       # MODIFY - All phases
```

---

## Success Metrics

### Before (Current State)
- Goal 1 (Whether to invest): 2/5
- Goal 2 (Which sectors): 3/5
- Overall: 2.5/5

### After Completion
- Goal 1 (Whether to invest): 4.5/5
- Goal 2 (Which sectors): 4.5/5
- Overall: 4.5/5

### Key Improvements
| Feature | Before | After |
|---------|--------|-------|
| Trend visibility | None | 5D, 20D, YTD on all components |
| Market context | None | 52w range, P/E, volatility, breadth |
| Sector guidance | Static heatmap | Rankings with Buy/Watch/Avoid |
| Interactivity | None | Click-through to details |

---

## Implementation Notes

### Data Freshness Requirements
- Real-time data: Update every 5 minutes
- Trend data: Update every 1-4 hours (by period)
- Historical data: Update daily EOD

### Progressive Enhancement
- Phase 1 enables basic trend analysis
- Phase 2 adds market timing context
- Phase 3 completes sector allocation guidance

### Backward Compatibility
- All changes maintain existing component interfaces
- New data is optional (graceful degradation)
- Mock data fallback for development/testing

---

## References

- Investor Review: See `docs/INVESTOR_REVIEW.md` for detailed gap analysis
- Architecture: See `docs/ADR-001.md` for technical decisions
- Original Assessment: Current implementation rated 2.5/5 for investment decision-making
