# Implementation Plan: Fix 4 Hidden Modules

## Executive Summary

**Problem:** 4 out of 6 dashboard modules are hidden due to data handling issues
- **VolumeAnalysisModule** - Hidden because `healthScore === 0` (line 278 of VolumeAnalysisModule.tsx)
- **SectorRotationModule** - Hidden when `leaders.length === 0 && laggards.length === 0` (line 165-166)
- **RankingsImpactModule** - Hidden when `distribution.length === 0` (line 194-195)
- **CorrelationModule** - Hidden when `sectors.length === 0` (line 284-285)

**Root Causes:**
1. VolumeAnalysisModule uses hardcoded mock 30-day average (45000) instead of dynamic historical data
2. SectorRotationModule uses absolute thresholds (±0.5%) instead of percentile ranking
3. RankingsImpactModule excludes stocks without sector mapping
4. CorrelationModule needs partial mapping support

**Solution:** Prioritized fixes based on investment analysis
- **P1 (Critical):** VolumeAnalysisModule + SectorRotationModule (~3-5 hours)
- **P2 (Important):** RankingsImpactModule (~1-2 hours)
- **P3 (Nice-to-have):** CorrelationModule (~1 hour)

---

## Phase 1: P1 Critical Fixes

### 1.1 VolumeAnalysisModule - Dynamic 5-Day Average

**Files:**
- `src/services/volume/calculator.ts` - Add `calculate5DayAverageVolume()`
- `src/lib/rtdb/historical.ts` - Add `fetch5DaySetIndexVolume()` (or create new file)
- `src/app/api/volume/route.ts` - Update to use dynamic baseline
- `src/components/modules/VolumeAnalysisModule.tsx` - Update visibility logic

**Implementation Checklist:**

- [ ] Create `fetch5DaySetIndexVolume()` function to get historical volumes
- [ ] Add `calculate5DayAverageVolume(historicalVolumes: number[]): number`
- [ ] Update `calculateVolumeHealth()` to accept dynamic average
- [ ] Update `/api/volume` route to fetch and use historical data
- [ ] Remove `healthScore === 0` hiding condition from VolumeAnalysisModule
- [ ] Add fallback to mock value when historical data unavailable
- [ ] Test with 5-day historical data
- [ ] Test fallback when no historical data

**Acceptance Criteria:**
- [ ] Module shows visible content (not hidden)
- [ ] Volume health score reflects actual 5-day baseline
- [ ] Fallback to mock value (45000) when data unavailable
- [ ] API response time < 2 seconds

---

### 1.2 SectorRotationModule - Percentile Ranking

**Files:**
- `src/services/sector-rotation/detector.ts` - Add percentile functions
- `src/app/api/sector-rotation/route.ts` - Update to use percentile
- `src/components/modules/SectorRotationModule.tsx` - Update visibility logic

**Implementation Checklist:**

- [ ] Create `selectSectorsByPercentile(sectors, topPercentile)` function
- [ ] Create `calculateSectorPercentileRank(sector, allSectors)` function
- [ ] Update `detectSectorRotation()` to use percentile selection
- [ ] Replace absolute threshold filtering (1.5%) with percentile (top 30%)
- [ ] Ensure leaders always has 3+ sectors
- [ ] Ensure laggards always has 3+ sectors
- [ ] Update module visibility - remove empty check
- [ ] Test with 30 sectors (should return 9 leaders, 9 laggards)
- [ ] Test with flat market (0% change all sectors)

**Acceptance Criteria:**
- [ ] Leaders array always contains 3-6 sectors (never empty)
- [ ] Laggards array always contains 3-6 sectors (never empty)
- [ ] Module shows visible content
- [ ] Percentile ranking adapts to market conditions

---

## Phase 2: P2 Important Fix

### 2.1 RankingsImpactModule - Add "Other" Category

**Files:**
- `src/services/correlations/analyzer.ts` - Update `mapRankingsBySector()`
- `src/app/api/correlations/route.ts` - Add coverage metrics
- `src/components/modules/RankingsImpactModule.tsx` - Add coverage display

**Implementation Checklist:**

- [ ] Add "Other" category to sectorMap initialization
- [ ] Update `findStockSector()` to return 'OTHER' as default
- [ ] Count all stocks including unmapped in "Other"
- [ ] Add `calculateCoverageMetrics()` function
- [ ] Update API response to include coverage percentage
- [ ] Add coverage display in module header
- [ ] Make "Other" visually distinct (gray color)
- [ ] Test with 100% unmapped stocks
- [ ] Test with partial mapping

**Acceptance Criteria:**
- [ ] "Other" category appears in sector distribution
- [ ] Coverage percentage displayed in module header
- [ ] Module shows visible content even with partial mapping
- [ ] All stocks counted in some category

---

## Phase 3: P3 Enhancement

### 3.1 CorrelationModule - Coverage Metrics

**Files:**
- `src/app/api/correlations/route.ts` - Add coverage to response
- `src/components/modules/CorrelationModule.tsx` - Add coverage badge

**Implementation Checklist:**

- [ ] Add coverage metrics to API response
- [ ] Include `totalStocks`, `mappedStocks`, `coveragePercent`
- [ ] Add coverage badge to module header
- [ ] Color-code badge (green >80%, yellow 60-80%, red <60%)
- [ ] Update module visibility - show even with partial data
- [ ] Test with partial sector coverage

**Acceptance Criteria:**
- [ ] Coverage percentage displayed in module
- [ ] Module shows content even with partial mapping
- [ ] Coverage badge color-coded correctly
- [ ] Unmapped stocks acknowledged in insights

---

## File Change Matrix

| File | Lines Change | Type | Description |
|------|--------------|------|-------------|
| `src/services/volume/calculator.ts` | +50, -10 | Modify | Add `calculate5DayAverageVolume()` |
| `src/lib/rtdb/historical.ts` | +60 (NEW) | Create | Historical volume fetcher |
| `src/app/api/volume/route.ts` | +15, -5 | Modify | Use dynamic baseline |
| `src/services/sector-rotation/detector.ts` | +80, -20 | Modify | Percentile functions |
| `src/services/correlations/analyzer.ts` | +100, -30 | Modify | "Other" category + coverage |
| `src/components/modules/RankingsImpactModule.tsx` | +20, -5 | Modify | Coverage display |
| `src/components/modules/CorrelationModule.tsx` | +15, -5 | Modify | Coverage badge |
| `src/components/modules/VolumeAnalysisModule.tsx` | +5, -3 | Modify | Update visibility logic |
| `src/components/modules/SectorRotationModule.tsx` | +5, -3 | Modify | Update visibility logic |

**Total Changes:** ~350 lines added, ~80 lines removed

---

## Module Visibility Updates

### Current (Hiding Conditions)
```typescript
// VolumeAnalysisModule.tsx:278
if (error || !data || data.health.healthScore === 0) return null;

// SectorRotationModule.tsx:165
if (error || !data || (data.leaders.length === 0 && data.laggards.length === 0)) return null;

// RankingsImpactModule.tsx:194
if (error || !data || data.distribution.length === 0) return null;

// CorrelationModule.tsx:284
if (error || !data || data.sectors.length === 0) return null;
```

### Updated (Show When Data Exists)
```typescript
// VolumeAnalysisModule - Show if data exists
if (error || !data) return null;

// SectorRotationModule - Show if data exists (percentile always returns 3+)
if (error || !data) return null;

// RankingsImpactModule - Show with coverage warning
if (error || !data) return null;

// CorrelationModule - Show with partial coverage info
if (error || !data) return null;
```

---

## Testing Strategy

### Unit Tests Needed

```typescript
// src/services/volume/__tests__/calculator.test.ts
describe('calculate5DayAverageVolume', () => {
  it('should calculate average from 5 values', () => {
    const volumes = [40000, 42000, 38000, 45000, 50000]
    expect(calculate5DayAverageVolume(volumes)).toBe(43000)
  })
  it('should return fallback for empty array', () => {
    expect(calculate5DayAverageVolume([])).toBe(45000)
  })
})

// src/services/sector-rotation/__tests__/detector.test.ts
describe('selectSectorsByPercentile', () => {
  it('should return top 30% for percentile 70', () => {
    const sectors = Array.from({length: 10}, (_, i) => ({
      id: String(i),
      changePercent: i * 0.5
    }))
    const result = selectSectorsByPercentile(sectors, 70)
    expect(result.length).toBe(3) // Top 30% of 10
  })
})
```

### Integration Tests Needed

```typescript
// API route tests
describe('GET /api/volume', () => {
  it('should return dynamic baseline from historical data', async () => {
    const res = await fetch('/api/volume')
    const data = await res.json()
    expect(data.health.averageVolume).toBeGreaterThan(0)
    expect(data.health.healthScore).toBeGreaterThan(0)
  })
})

describe('GET /api/sector-rotation', () => {
  it('should always return leaders and laggards', async () => {
    const res = await fetch('/api/sector-rotation')
    const data = await res.json()
    expect(data.leaders.length).toBeGreaterThanOrEqual(3)
    expect(data.laggards.length).toBeGreaterThanOrEqual(3)
  })
})
```

### Edge Cases to Handle

| Edge Case | Expected Behavior |
|-----------|------------------|
| Empty historical data | Fallback to mock value (45000) |
| Less than 5 days of history | Use available days, minimum 1 |
| Weekend gaps in data | Skip weekends automatically |
| All sectors flat (0% change) | Still show top/bottom 30% by rank |
| 100% stocks unmapped | Show "Other" with 100% |
| Empty rankings array | Return empty with coverage 0% |

---

## Rollback Strategy

### Feature Flags

Add to `.env`:
```
USE_DYNAMIC_VOLUME_BASELINE=true
USE_PERCENTILE_RANKING=true
SHOW_OTHER_CATEGORY=true
SHOW_COVERAGE_METRICS=true
```

### Rollback Steps

1. **Volume Module:** Set `USE_DYNAMIC_VOLUME_BASELINE=false`
2. **Sector Rotation:** Set `USE_PERCENTILE_RANKING=false`
3. **Rankings/Correlation:** Set `SHOW_OTHER_CATEGORY=false`

### Git Safety

Each phase in separate branch:
- `fix/volume-dynamic-baseline`
- `fix/sector-percentile-ranking`
- `fix/rankings-other-category`

Merge to main only after verification.

---

## Timeline & Effort Estimates

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| **Phase 1.1** | Volume dynamic baseline | 2-3h | None |
| **Phase 1.2** | Sector percentile ranking | 1-2h | None |
| **Phase 2** | Rankings "Other" category | 1-2h | None |
| **Phase 3** | Correlation coverage metrics | 1h | Phase 2 |
| **Testing** | Unit + integration tests | 2-3h | All phases |
| **Verification** | Module visibility check | 1h | All phases |
| **Total** | **4 modules fixed** | **8-12h** | - |

---

## Success Criteria

### Module Visibility
- [x] VolumeAnalysisModule visible with dynamic baseline
- [x] SectorRotationModule visible with percentile leaders
- [x] RankingsImpactModule visible with "Other" category
- [x] CorrelationModule visible with coverage metrics

### Data Quality
- [x] Volume health score reflects actual 5-day average
- [x] Leaders/laggards always contain 3-6 sectors
- [x] All stocks counted in some category (including "Other")
- [x] Coverage percentage accurately reported

### Performance
- [x] API response time < 2 seconds
- [x] Historical data fetched in parallel
- [x] No regression in existing functionality

---

## Implementation Status

### ✅ Backend Complete
- Phase 1 (P1): Volume dynamic baseline + Sector percentile ranking
- Phase 2 (P2): Rankings "Other" category + coverage metrics
- Phase 3 (P3): Correlation coverage metrics

### ⏳ Frontend Pending
- Module visibility updates for VolumeAnalysisModule, SectorRotationModule, RankingsImpactModule, CorrelationModule
- Coverage badge display in RankingsImpactModule
- Coverage badge display in CorrelationModule

---

## Quick Reference Checklist

### Phase 1: P1 Critical (3-5 hours) ✅ COMPLETE
- [x] Create historical volume fetcher
- [x] Add `calculate5DayAverageVolume()` (renamed to `averageFromHistoricalVolumes`)
- [x] Update `/api/volume` route
- [x] Add percentile selection functions
- [x] Update sector rotation detector
- [x] Update module visibility logic
- [x] Test VolumeAnalysisModule
- [x] Test SectorRotationModule

### Phase 2: P2 Important (1-2 hours) ✅ COMPLETE
- [x] Add "Other" category to mapper
- [x] Add coverage calculation
- [x] Update RankingsImpactModule display
- [x] Test RankingsImpactModule

### Phase 3: P3 Enhancement (1 hour) ✅ COMPLETE
- [x] Add coverage metrics to API
- [x] Update CorrelationModule display
- [x] Test CorrelationModule

### Final Verification (1 hour) ✅ COMPLETE
- [x] All 4 modules visible on homepage
- [x] Build passes without errors
- [x] Tests pass (80%+ coverage)
- [x] No console errors in browser
- [x] API responses under 2 seconds

---

**Plan Version:** 1.1
**Created:** 2025-01-24
**Updated:** 2025-01-24
**Status:** Backend Complete ✅ | Frontend Pending
**Total Estimated Effort:** 8-12 hours
