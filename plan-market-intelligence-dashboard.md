# Implementation Plan: Market Intelligence Dashboard
## แผนงานละเอียดสำหรับสร้าง Dashboard ตอบโจทย์นักลงทุน

---

## Executive Summary

สร้าง Market Intelligence Dashboard ที่ตอบ 3 คำถามสำคัญของนักลงทุน:

| Priority | Feature | คำถามที่ตอบ | เวลา |
|----------|---------|--------------|------|
| **P0** | Market Regime + Smart Money | "Should I be in the market?" | 2-3 วัน |
| **P1** | Sector Strength & Rotation | "Which sectors to buy/avoid?" | 2-3 วัน |
| **P2** | Active Stocks Concentration | "Where's the market attention?" | 1-2 วัน |

**Total Effort:** 13-19 hours (5-8 วันทำการ)

---

## 📁 ไฟล์ที่ต้องสร้าง (New Files)

```
src/types/
└── market-intelligence.ts                [NEW] Types สำหรับ dashboard

src/services/market-intelligence/
├── aggregator.ts                         [NEW] รวมข้อมูลทุก source
└── index.ts                              [NEW] Export service

src/app/api/market-intelligence/
└── route.ts                              [NEW] API endpoint รวม

src/app/(dashboard)/market-intelligence/
├── layout.tsx                            [NEW] Dashboard layout
├── page.tsx                              [NEW] Server Component
└── loading.tsx                           [NEW] Loading state

src/components/dashboard/
├── MarketRegimeCard.tsx                  [NEW] P0: Regime display
├── SmartMoneyCard.tsx                    [NEW] P0: Smart money flows
├── SectorStrengthCard.tsx                [NEW] P1: Sector performance
├── SectorRotationCard.tsx                [NEW] P1: Rotation signals
└── ActiveStocksCard.tsx                  [NEW] P2: Concentration
```

---

## 🔄 ขั้นตอนการทำงาน (Implementation Steps)

### Phase 1: Foundation (Types + Service) - 2-3 ชั่วโมง
**Agent:** `nextjs_backend`

#### Step 1.1: Create Dashboard Types
**File:** `src/types/market-intelligence.ts`

- สร้าง types: `MarketIntelligenceData`, `ActiveStocksAnalysis`, `ConcentrationMetrics`
- กำหนดโครงสร้างข้อมูลที่จะใช้ทั้ง dashboard

#### Step 1.2: Create Aggregator Service
**File:** `src/services/market-intelligence/aggregator.ts`

- `aggregateMarketIntelligence()` - รวมข้อมูลจากทุก source
- `analyzeRegimeComponent()` - วิเคราะห์ market regime
- `analyzeSmartMoneyComponent()` - วิเคราะห์ smart money
- `analyzeSectorRotationComponent()` - วิเคราะห์ sector rotation
- `analyzeActiveStocksComponent()` - วิเคราะห์ concentration

#### Step 1.3: Create Service Index
**File:** `src/services/market-intelligence/index.ts`

- Export ฟังก์ชันทั้งหมดเพื่อใช้งาน

---

### Phase 2: API Routes - 1-2 ชั่วโมง
**Agent:** `nextjs_backend`

#### Step 2.1: Create Unified API Endpoint
**File:** `src/app/api/market-intelligence/route.ts`

```
GET /api/market-intelligence
Query: ?includeP0=true&includeP1=true&includeP2=true
```

- Fetch ข้อมูลจาก RTDB (parallel)
- Aggregate ผ่าน service
- Return พร้อม cache headers

---

### Phase 3: Dashboard Components - 4-6 ชั่วโมง
**Agent:** `nextjs_frontend`

#### Step 3.1: Market Regime Card (P0)
**File:** `src/components/dashboard/MarketRegimeCard.tsx`

แสดง:
- Regime badge (Risk-On/Neutral/Risk-Off)
- Confidence dots
- Supporting reasons
- Focus guidance
- Caution guidance

#### Step 3.2: Smart Money Card (P0)
**File:** `src/components/dashboard/SmartMoneyCard.tsx`

ใช้ `SmartMoneyModule` ที่มีอยู่แล้ว + wrapper

#### Step 3.3: Sector Strength Card (P1)
**File:** `src/components/dashboard/SectorStrengthCard.tsx`

แสดง:
- Top 5 leaders
- Bottom 5 laggards
- Buy/Avoid/Watch signals

#### Step 3.4: Sector Rotation Card (P1)
**File:** `src/components/dashboard/SectorRotationCard.tsx`

ใช้ `SectorRotationModule` ที่มีอยู่แล้ว + wrapper

#### Step 3.5: Active Stocks Card (P2)
**File:** `src/components/dashboard/ActiveStocksCard.tsx`

แสดง:
- Top 10 by value
- Concentration bars
- Cross-ranked stocks
- HHI metric

---

### Phase 4: Dashboard Page - 2-3 ชั่วโมง
**Agent:** `nextjs_frontend`

#### Step 4.1: Create Dashboard Route
**File:** `src/app/(dashboard)/market-intelligence/page.tsx`

- Server Component ที่ fetch data server-side
- ส่ง data ไป client components ผ่าน props
- แสดง cards ใน ResponsiveGrid

#### Step 4.2: Create Layout
**File:** `src/app/(dashboard)/market-intelligence/layout.tsx`

- Header + Footer + main content area

#### Step 4.3: Create Loading State
**File:** `src/app/(dashboard)/market-intelligence/loading.tsx`

- Skeleton screens สำหรับแต่ละ section

---

### Phase 5: Integration - 1 ชั่วโมง
**Agent:** `nextjs_frontend`

#### Step 5.1: Add Navigation Link
เพิ่ม link ใน Header → "Market Intelligence"

#### Step 5.2: Update Type Exports
Export dashboard types ใน `src/types/index.ts`

---

## ✅ Acceptance Criteria

### P0: Market Regime + Smart Money
- [ ] Regime card displays Risk-On/Off with confidence
- [ ] Smart money shows all 4 investor types flows
- [ ] Focus/Caution guidance แสดงชัดเจน
- [ ] API response < 2 seconds

### P1: Sector Strength & Rotation
- [ ] Top/bottom 5 sectors แสดงพร้อม signal
- [ ] Buy/Avoid/Watch list ชัดเจน
- [ ] Rotation pattern badge แสดง

### P2: Active Stocks
- [ ] Top 10 by value พร้อม concentration bar
- [ ] Cross-ranked stocks แสดง
- [ ] HHI interpretation แสดง

### General
- [ ] Loading states สำหรับทุก card
- [ ] Error states จัดการ gracefully
- [ ] Data freshness indicator แสดง
- [ ] Responsive layout
- [ ] Auto-refresh ทุก 2 นาที

---

## 📊 Component Structure (Example)

```typescript
// MarketRegimeCard.tsx
'use client'
export function MarketRegimeCard({ data }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-regime'],
    queryFn: fetchMarketRegime,
    initialData: data,
    refetchInterval: 120000,
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErrorState />

  return (
    <Card>
      <RegimeBadge>{data.regime}</RegimeBadge>
      <ConfidenceDots level={data.confidence} />
      <Reasons list={data.reasons} />
      <Focus text={data.focus} />
      <Caution text={data.caution} />
    </Card>
  )
}
```

---

## 🎨 Dashboard Layout Preview

```
┌─────────────────────────────────────────────────────────────┐
│                    MARKET INTELLIGENCE                       │
│  Data updated 5m ago                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  P0: MARKET OVERVIEW                                        │
│  ┌───────────────────────┬─────────────────────────────┐   │
│  │  Market Regime        │  Smart Money Flow           │   │
│  │  🟢 RISK-ON           │  Foreign:  +3,356M ✅      │   │
│  │  Confidence: ●●○      │  Instit:   -1,401M ❌      │   │
│  │  Focus: Cyclical      │  Retail:   -3,142M ❌      │   │
│  │  Caution: Watch       │  Prop:     +1,187M ✅      │   │
│  └───────────────────────┴─────────────────────────────┘   │
│                                                              │
│  P1: SECTOR ANALYSIS                                       │
│  ┌───────────────────────┬─────────────────────────────┐   │
│  │  Sector Strength      │  Sector Rotation            │   │
│  │  🔥 Leaders:          │  Pattern: Risk-On           │   │
│  │  1. พลังงาน +1.91%   │  Entry: ENER, ICT          │   │
│  │  2. อิเล็กทรอนิกส์    │  Exit: FASH, CONSTR        │   │
│  │  3. การเงิน +0.82%   │                             │   │
│  │  ❌ Laggards:         │                             │   │
│  │  แฟชั่น -1.23%        │                             │   │
│  └───────────────────────┴─────────────────────────────┘   │
│                                                              │
│  P2: ACTIVE STOCKS                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Concentration: Broadly Distributed                   │ │
│  │  Top 5: 18.5%  |  Top 10: 32.1%  |  Cross: 4 stocks │ │
│  │                                                          │ │
│  │  CPALL  [███████████] 12.3%                           │ │
│  │  DELTA  [█████████  ] 8.4%                            │ │
│  │  BDMS   [████████    ] 7.2%                           │ │
│  │                                                          │ │
│  │  🔥 Cross-Ranked: CPALL, DELTA, BDMS, PTTEP           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Execution Plan (Sprint)

### Sprint 1: P0 Foundation (2-3 วัน)
1. Types + Service + API
2. MarketRegimeCard
3. SmartMoneyCard
4. Dashboard page (P0 section)

### Sprint 2: P1 Addition (2-3 วัน)
1. SectorStrengthCard
2. SectorRotationCard
3. Dashboard page (P1 section)

### Sprint 3: P2 Polish (1-2 วัน)
1. ActiveStocksCard
2. Layout + Loading states
3. Testing + Documentation

---

## 📝 Notes สำคัญ

1. **Reuse Existing Components:** ใช้ `SmartMoneyModule` และ `SectorRotationModule` ที่มีอยู่แล้ว
2. **Server Components:** Page เป็น Server Component สำหรับ SEO/Performance
3. **Client Refetch:** Cards ใช้ React Query สำหรับ auto-refresh
4. **Graceful Degradation:** แต่ละ card จัดการ error เองได้
5. **Styling:** ใช้ color scheme ที่มีอยู่แล้ว (up/down/warn/info)

---

**Document Version:** 1.0
**Date:** 2026-01-25
**Status:** Ready for Implementation
**Total Estimated Effort:** 13-19 hours
