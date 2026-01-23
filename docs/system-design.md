# Stock Decision Web - System Design Document

## Document Information

| Field | Value |
|-------|-------|
| Project | fonPick - Stock Decision Web |
| Version | 1.0.0 |
| Date | 2025-01-22 |
| Author | System Architecture Team |
| Status | Draft |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Layer Design](#3-data-layer-design)
4. [Service Layer Design](#4-service-layer-design)
5. [Component Architecture](#5-component-architecture)
6. [API Design](#6-api-design)
7. [Security Considerations](#7-security-considerations)
8. [Performance Considerations](#8-performance-considerations)
9. [Scalability Considerations](#9-scalability-considerations)

---

## 1. System Overview

### 1.1 Project Purpose

**fonPick** is a web application designed to help Thai stock market investors make faster, more informed decisions. The system answers two fundamental questions:

1. **Market Regime**: What is the market condition today? Where is money flowing? Is the market ready to rise?
2. **Stock Verdict**: Should I invest in this specific stock? (Buy / Watch / Avoid)

### 1.2 North Star Goals

| Goal | Metric | Target |
|------|--------|--------|
| Time to Clarity | Homepage readability | < 10 seconds |
| Time to Decision | Stock verdict | < 60 seconds |
| Explainability | Verdicts with evidence | 100% |
| Reliability | Data fallback handling | 99% |

### 1.3 User Journeys

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JOURNEY A: Homepage                          │
├─────────────────────────────────────────────────────────────────────┤
│  User Action: Open website                                          │
│  Expected Outcome (within 10 seconds):                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. SET Index (green/red) + market cap + atmosphere          │   │
│  │ 2. Money flow by investor type (foreign/retail/inst/prop)   │   │
│  │ 3. Sector heatmap (leading/dragging)                        │   │
│  │ 4. Market regime summary (Risk-On/Neutral/Risk-Off)         │   │
│  │ 5. 1-line focus/caution guidance                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         JOURNEY B: Stock Search                       │
├─────────────────────────────────────────────────────────────────────┤
│  User Action: Search for stock                                       │
│  Expected Outcome (within 30-60 seconds):                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. Verdict: Buy / Watch / Avoid                             │   │
│  │ 2. Confidence level (High/Medium/Low)                       │   │
│  │ 3. 3-5 bullet reasons (strengths, warnings, market fit)     │   │
│  │ 4. Key metrics (3 max) + peer comparison                    │   │
│  │ 5. Next step guidance                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Overview

### 2.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router) │ React 18 │ Tailwind CSS │ TypeScript    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Market Regime Service  │  Verdict Engine  │  Alert Service         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  RTDB Client Wrapper │ Zod Validation │ Fallback Handlers           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                             │
├─────────────────────────────────────────────────────────────────────┤
│  Firebase Realtime Database (RTDB)                                  │
│  - marketOverview/latest                                             │
│  - investorType/latest                                               │
│  - industrySector/latest                                             │
│  - topRankings/latest                                                │
│  - nvdr/latest                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
app/
├── layout.tsx                    # Root layout with providers
│   └── providers/
│       ├── FirebaseProvider.tsx
│       └── ThemeProvider.tsx
│
├── page.tsx                      # Homepage (Server Component)
│   ├── home/
│   │   ├── SetSnapshot.tsx          # SET index display
│   │   ├── MoneyFlowChart.tsx       # Investor flow visualization
│   │   ├── SectorHeatmap.tsx        # Sector performance heatmap
│   │   ├── TopRankings.tsx          # Top gainers/losers/volume
│   │   └── MarketRegimeSummary.tsx  # Regime detection summary
│   └── shared/
│       ├── DataBadge.tsx            # Data freshness indicator
│       └── ErrorFallback.tsx        # Error handling UI
│
├── search/
│   └── page.tsx                  # Stock search (Server Component)
│       └── shared/
│           └── SearchBar.tsx         # Search input component
│
├── stock/
│   └── [symbol]/
│       └── page.tsx              # Stock detail (Server Component)
│           └── stock/
│               ├── DecisionHeader.tsx    # Verdict badge display
│               ├── VerdictBullets.tsx    # Reasons breakdown
│               ├── EvidenceCards.tsx     # Key metrics display
│               ├── LensScores.tsx        # Quality/Valuation/Timing
│               └── WatchlistButton.tsx   # Add to watchlist
│
├── watchlist/
│   └── page.tsx                  # User's saved stocks
│
└── compare/
    └── page.tsx                  # Side-by-side stock comparison
```

### 2.3 Data Flow Diagrams

#### Journey A: Homepage Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│   Browser   │───▶│ Next.js App  │───▶│ RTDB Client     │───▶│ Firebase │
│  (Client)   │    │ (Server)     │    │ Wrapper         │    │   RTDB   │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Parallel Data│
                   │   Fetching   │
                   └──────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Market   │   │ Investor │   │  Sector  │
    │ Overview │   │   Type   │   │  Data    │
    └──────────┘   └──────────┘   └──────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   ┌──────────────┐
                   │ Regime       │
                   │ Analyzer     │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Component    │
                   │ Rendering    │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ HTML to      │
                   │ Browser      │
                   └──────────────┘
```

#### Journey B: Stock Verdict Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│   Browser   │───▶│ Stock Page   │───▶│ RTDB Client     │───▶│ Firebase │
│  (Client)   │    │ [symbol]     │    │ Stock Fetcher   │    │   RTDB   │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Fetch Stock  │
                   │ + Peers Data │
                   └──────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Quality  │   │Valuation │   │  Timing  │
    │  Lens    │   │  Lens    │   │  Lens    │
    └──────────┘   └──────────┘   └──────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   ┌──────────────┐
                   │ Verdict      │
                   │ Engine       │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Generate:    │
                   │ - Verdict    │
                   │ - Confidence │
                   │ - Bullets    │
                   │ - Next Step  │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Component    │
                   │ Rendering    │
                   └──────────────┘
```

---

## 3. Data Layer Design

### 3.1 RTDB Data Structure

```
Firebase RTDB Root
│
├── /marketOverview/
│   └── /latest/
│       ├── set: { index, change, changePercent }
│       ├── totalMarketCap: number
│       └── timestamp: number
│
├── /investorType/
│   └── /latest/
│       ├── foreign: { buy, sell, net }
│       ├── institution: { buy, sell, net }
│       ├── retail: { buy, sell, net }
│       ├── prop: { buy, sell, net }
│       └── timestamp: number
│
├── /industrySector/
│   └── /latest/
│       ├── sectors: Array<{ name, index, change, changePercent, marketCap }>
│       └── timestamp: number
│
├── /topRankings/
│   └── /latest/
│       ├── topGainers: Array<{ symbol, price, change }>
│       ├── topLosers: Array<{ symbol, price, change }>
│       ├── topVolume: Array<{ symbol, volume }>
│       └── timestamp: number
│
├── /nvdr/                    # Optional, may not exist
│   └── /latest/
│       └── ...
│
├── /stocks/                  # Individual stock data
│   └── /{symbol}/
│       ├── symbol: string
│       ├── name: string
│       ├── price: number
│       ├── change: number
│       ├── changePercent: number
│       ├── volume: number
│       ├── marketCap: number
│       ├── pe?: number
│       ├── pbv?: number
│       ├── dividendYield?: number
│       ├── sector?: string
│       └── timestamp: number
│
└── /meta/
    ├── lastUpdate: number
    └── version: string
```

### 3.2 TypeScript Data Models

```typescript
// src/types/rtdb.ts

export interface RTDBMarketOverview {
  set: {
    index: number
    change: number
    changePercent: number
  }
  totalMarketCap: number
  timestamp: number
}

export interface RTDBInvestorFlow {
  buy: number
  sell: number
  net: number
}

export interface RTDBInvestorType {
  foreign: RTDBInvestorFlow
  institution: RTDBInvestorFlow
  retail: RTDBInvestorFlow
  prop: RTDBInvestorFlow
  timestamp: number
}

export interface RTDBSector {
  name: string
  index: number
  change: number
  changePercent: number
  marketCap: number
}

export interface RTDBIndustrySector {
  sectors: RTDBSector[]
  timestamp: number
}

export interface RTDBTopStock {
  symbol: string
  price: number
  change: number
  volume?: number
}

export interface RTDBTopRankings {
  topGainers: RTDBTopStock[]
  topLosers: RTDBTopStock[]
  topVolume: RTDBTopStock[]
  timestamp: number
}

export interface RTDBStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe?: number
  pbv?: number
  dividendYield?: number
  sector?: string
  timestamp: number
}

export interface RTDBMeta {
  lastUpdate: number
  version: string
}
```

### 3.3 Data Access Patterns

#### Server-Side Fetching (Preferred)

```typescript
// Server Components - fetch data on the server
// src/app/page.tsx
export default async function HomePage() {
  const [market, investor, sector, rankings] = await Promise.all([
    fetchMarketOverview(),
    fetchInvestorType(),
    fetchIndustrySector(),
    fetchTopRankings(),
  ])

  return <HomePageView market={market} investor={investor} ... />
}
```

**Advantages:**
- Faster initial page load
- Reduces client-side JavaScript
- Better SEO
- Data fetched closer to database

#### Client-Side Fetching (When Needed)

```typescript
// Client Components - fetch data on client
// src/components/home/RealtimeUpdates.tsx
'use client'

export function RealtimeUpdates() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Subscribe to RTDB changes
    const unsubscribe = subscribeToMarketUpdates((update) => {
      setData(update)
    })

    return () => unsubscribe()
  }, [])

  return <div>{/* display live data */}</div>
}
```

**Use Cases:**
- Real-time updates after initial load
- User interactions requiring fresh data
- Watchlist personalization

### 3.4 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CACHING LAYERS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Next.js Data Cache (Server)                                      │
│     - fetch() with automatic caching                                 │
│     - revalidate: 60 (1 minute)                                      │
│     - Stale-while-revalidate pattern                                 │
│                                                                       │
│  2. RTDB Client Cache (Memory)                                       │
│     - In-memory cache for frequently accessed data                   │
│     - TTL: 30 seconds                                                │
│     - Cache key: `${path}:${timestamp}`                              │
│                                                                       │
│  3. Browser Cache (HTTP)                                             │
│     - Cache-Control headers                                          │
│     - Static assets: 1 year                                          │
│     - API responses: no-cache for /latest                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 Error Handling & Fallback

```typescript
// src/lib/rtdb/client.ts

export async function fetchWithFallback<T>(
  path: string,
  fallbackPath?: string
): Promise<T | null> {
  try {
    const data = await rtdbGet<T>(path)

    // Validate data has content
    if (!data || Object.keys(data).length === 0) {
      if (fallbackPath) {
        // Try fallback (e.g., previous day's data)
        const fallback = await rtdbGet<T>(fallbackPath)
        return fallback ?? null
      }
      return null
    }

    return data
  } catch (error) {
    console.error(`RTDB fetch error for ${path}:`, error)
    return null
  }
}

// Usage example
const market = await fetchWithFallback<RTDBMarketOverview>(
  RTDB_PATHS.MARKET_OVERVIEW_LATEST,
  RTDB_PATHS.MARKET_OVERVIEW_PREVIOUS // fallback to yesterday
)
```

**Fallback Hierarchy:**
```
Primary: /marketOverview/latest
    │
    ├─▶ Fallback 1: /marketOverview/previous
    │        (yesterday's data)
    │
    └─▶ Fallback 2: Cached data
             (from Next.js cache)

If all fail: Display clear error message with "Data unavailable" UI
```

---

## 4. Service Layer Design

### 4.1 Market Regime Service

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MARKET REGIME SERVICE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Input: Market data (SET, flow, sectors)                             │
│  Output: Regime + Summary + Evidence                                 │
│                                                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   Rules     │───▶│  Analyzer   │───▶│  Summary    │             │
│  │   Engine    │    │  ( scoring) │    │ Generator   │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Regime Detection Rules

```typescript
// src/services/market-regime/rules.ts

export type MarketRegime = 'Risk-On' | 'Neutral' | 'Risk-Off'

export interface RegimeInput {
  setChange: number          // SET index % change
  investorFlow: {
    foreignNet: number
    institutionNet: number
  }
  sectors: {
    defensivePerformance: number  // How defensive sectors performed
    overallPerformance: number     // Overall sector performance
  }
  liquidity: number         // Trading volume indicator
}

export interface RegimeResult {
  regime: MarketRegime
  confidence: 'High' | 'Medium' | 'Low'
  reasons: string[]        // 3 bullet points
  focus: string            // What to focus on
  caution: string          // What to be careful of
}

export function detectRegime(input: RegimeInput): RegimeResult {
  const scores = {
    riskOn: 0,
    riskOff: 0,
  }

  // Rule 1: SET Direction
  if (input.setChange > 0.5) scores.riskOn += 2
  else if (input.setChange < -0.5) scores.riskOff += 2

  // Rule 2: Smart Money Flow
  if (input.investorFlow.foreignNet > 0) scores.riskOn += 1
  else if (input.investorFlow.foreignNet < 0) scores.riskOff += 1

  if (input.investorFlow.institutionNet > 0) scores.riskOn += 1
  else if (input.investorFlow.institutionNet < 0) scores.riskOff += 1

  // Rule 3: Sector Behavior
  const defensiveOutperforming =
    input.sectors.defensivePerformance > input.sectors.overallPerformance

  if (defensiveOutperforming && input.setChange < 0) {
    scores.riskOff += 2  // Confirmation of Risk-Off
  }

  // Rule 4: Liquidity
  if (input.liquidity > 1.2) scores.riskOn += 1  // Above average
  else if (input.liquidity < 0.8) scores.riskOff += 1

  // Determine Regime
  let regime: MarketRegime
  let confidence: RegimeResult['confidence']

  if (scores.riskOn >= scores.riskOff + 2) {
    regime = 'Risk-On'
    confidence = scores.riskOn >= 4 ? 'High' : 'Medium'
  } else if (scores.riskOff >= scores.riskOn + 2) {
    regime = 'Risk-Off'
    confidence = scores.riskOff >= 4 ? 'High' : 'Medium'
  } else {
    regime = 'Neutral'
    confidence = 'Medium'
  }

  // Generate summary
  return generateSummary(regime, confidence, input)
}
```

### 4.2 Verdict Engine Service

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VERDICT ENGINE SERVICE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Input: Stock data + Market regime                                   │
│  Output: Verdict + Confidence + Reasons + Evidence                   │
│                                                                       │
│         ┌─────────────────────────────────────────────┐              │
│         │              Stock Analysis                  │              │
│         └─────────────────────────────────────────────┘              │
│                           │                                          │
│         ┌─────────────────┼─────────────────┐                        │
│         ▼                 ▼                 ▼                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Quality    │  │ Valuation   │  │   Timing    │                 │
│  │   Lens      │  │   Lens      │  │   Lens      │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                 │                 │                        │
│         └─────────────────┼─────────────────┘                        │
│                           ▼                                          │
│                  ┌─────────────┐                                     │
│                  │ Verdict     │                                     │
│                  │ Aggregator  │                                     │
│                  └─────────────┘                                     │
│                           │                                          │
│                           ▼                                          │
│                  ┌─────────────┐                                     │
│                  │ Summary     │                                     │
│                  │ Generator   │                                     │
│                  └─────────────┘                                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Three-Lens System

```typescript
// src/services/verdict/types.ts

export type LensStatus = 'Pass' | 'Fail' | 'Partial'

export interface LensScore {
  lens: 'quality' | 'valuation' | 'timing'
  status: LensStatus
  score: number        // 0-100
  notes: string[]      // Explainable reasons
}

export type Verdict = 'Buy' | 'Watch' | 'Avoid'

export interface StockVerdict {
  symbol: string
  verdict: Verdict
  confidence: 'High' | 'Medium' | 'Low'
  bullets: {
    strengths: string[]     // ✅ Main strengths (1-2)
    warnings: string[]      // ⚠️ What to watch (1-2)
    marketFit: string       // 🧭 Market fit (1)
  }
  lenses: LensScore[]
  nextStep?: string
  dataCompleteness: number  // 0-100
}
```

#### Quality Lens

```typescript
// src/services/verdict/lenses/quality.ts

export interface QualityInput {
  // Financial metrics
  netProfitMargin?: number
  roe?: number              // Return on Equity
  debtToEquity?: number
  cashFlow?: number
  earningsGrowth?: number
}

export function assessQuality(input: QualityInput): LensScore {
  const scores: number[] = []
  const notes: string[] = []

  // Profitability
  if (input.netProfitMargin !== undefined) {
    if (input.netProfitMargin > 10) {
      scores.push(100)
      notes.push('Strong profitability (margin > 10%)')
    } else if (input.netProfitMargin > 5) {
      scores.push(70)
      notes.push('Moderate profitability')
    } else {
      scores.push(30)
      notes.push('Low profitability')
    }
  }

  // Return on Equity
  if (input.roe !== undefined) {
    if (input.roe > 15) {
      scores.push(100)
      notes.push('Excellent ROE (> 15%)')
    } else if (input.roe > 10) {
      scores.push(70)
      notes.push('Good ROE')
    } else {
      scores.push(40)
      notes.push('Below average ROE')
    }
  }

  // Debt Level
  if (input.debtToEquity !== undefined) {
    if (input.debtToEquity < 0.5) {
      scores.push(100)
      notes.push('Low debt (healthy)')
    } else if (input.debtToEquity < 1) {
      scores.push(70)
      notes.push('Moderate debt level')
    } else {
      scores.push(30)
      notes.push('High debt (caution)')
    }
  }

  // Calculate final score
  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 50

  const status: LensStatus =
    avgScore >= 70 ? 'Pass' :
    avgScore >= 50 ? 'Partial' : 'Fail'

  return {
    lens: 'quality',
    status,
    score: avgScore,
    notes,
  }
}
```

#### Verdict Aggregation Logic

```typescript
// src/services/verdict/engine.ts

export function generateVerdict(
  quality: LensScore,
  valuation: LensScore,
  timing: LensScore,
  dataCompleteness: number
): StockVerdict {
  // Count passes
  const passCount = [quality, valuation, timing]
    .filter(l => l.status === 'Pass').length

  const partialCount = [quality, valuation, timing]
    .filter(l => l.status === 'Partial').length

  // Determine verdict
  let verdict: Verdict
  let confidence: 'High' | 'Medium' | 'Low'

  // Data completeness affects confidence
  if (dataCompleteness < 50) {
    verdict = 'Watch'
    confidence = 'Low'
  } else if (passCount >= 2 && timing.status !== 'Fail') {
    verdict = 'Buy'
    confidence = dataCompleteness > 80 ? 'High' : 'Medium'
  } else if (passCount === 0 || timing.status === 'Fail') {
    verdict = 'Avoid'
    confidence = dataCompleteness > 70 ? 'High' : 'Medium'
  } else {
    verdict = 'Watch'
    confidence = 'Medium'
  }

  // Generate bullets
  const bullets = generateBullets(quality, valuation, timing, verdict)

  // Generate next step
  const nextStep = generateNextStep(verdict, timing)

  return {
    symbol: '', // Set by caller
    verdict,
    confidence,
    bullets,
    lenses: [quality, valuation, timing],
    nextStep,
    dataCompleteness,
  }
}
```

---

## 5. Component Architecture

### 5.1 Server vs Client Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPONENT TYPE STRATEGY                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  SERVER COMPONENTS (Default)                                         │
│  ✅ Fetch data on server                                             │
│  ✅ Reduce client JavaScript                                         │
│  ✅ Better SEO                                                       │
│  ✅ Faster initial load                                              │
│                                                                       │
│  Examples:                                                            │
│  - app/page.tsx (Homepage)                                           │
│  - app/stock/[symbol]/page.tsx (Stock detail)                        │
│  - components/home/SetSnapshot.tsx                                   │
│  - components/stock/DecisionHeader.tsx                               │
│                                                                       │
│  ─────────────────────────────────────────────────────────────────   │
│                                                                       │
│  CLIENT COMPONENTS (Opt-in)                                          │
│  ✅ User interaction                                                  │
│  ✅ Real-time updates                                                │
│  ✅ Browser APIs                                                     │
│  ✅ Local state management                                           │
│                                                                       │
│  Examples:                                                            │
│  - components/shared/SearchBar.tsx                                   │
│  - components/stock/WatchlistButton.tsx                              │
│  - Real-time price updates (future)                                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 State Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT STRATEGY                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Server State (URL params, searchParams)                         │
│     - Stock symbol from URL                                          │
│     - Search query from URL                                          │
│     - No global state needed                                         │
│                                                                       │
│  2. Local Component State (useState)                                │
│     - Search input value                                             │
│     - Loading states                                                 │
│     - UI toggles                                                     │
│                                                                       │
│  3. Persistent State (localStorage)                                 │
│     - Watchlist                                                      │
│     - User preferences                                               │
│                                                                       │
│  4. Real-time State (React Context)                                 │
│     - Live price updates (future)                                    │
│     - Notification alerts (future)                                   │
│                                                                       │
│  ❌ NOT NEEDED:                                                      │
│     - Redux/Zustand (no complex global state)                        │
│     - React Query (server fetching is sufficient)                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Component Props Flow

```typescript
// Homepage Example
// app/page.tsx (Server Component)
async function HomePage() {
  const market = await fetchMarketOverview()
  const regime = analyzeMarketRegime(market)

  return (
    <div>
      <SetSnapshot data={market.set} />
      <MoneyFlowChart data={market.investorFlow} />
      <SectorHeatmap data={market.sectors} />
      <MarketRegimeSummary regime={regime} />
    </div>
  )
}

// components/home/SetSnapshot.tsx (Server Component)
interface SetSnapshotProps {
  data: {
    index: number
    change: number
    changePercent: number
  }
}

export function SetSnapshot({ data }: SetSnapshotProps) {
  const isPositive = data.changePercent >= 0

  return (
    <Card>
      <Badge color={isPositive ? 'green' : 'red'}>
        {isPositive ? '▲' : '▼'} {data.changePercent.toFixed(2)}%
      </Badge>
      <div>{data.index.toLocaleString()}</div>
    </Card>
  )
}
```

---

## 6. API Design

### 6.1 Firebase RTDB Path Structure

```
RTDB_ROOT/
│
├── /marketOverview/latest         → GET
├── /investorType/latest           → GET
├── /industrySector/latest         → GET
├── /topRankings/latest            → GET
├── /nvdr/latest                   → GET (optional)
├── /stocks/{symbol}               → GET
└── /meta                          → GET
```

### 6.2 Data Fetching Patterns

#### Pattern 1: Parallel Fetching (Homepage)

```typescript
// src/lib/rtdb/index.ts
export async function fetchHomepageData() {
  const [market, investor, sector, rankings, meta] = await Promise.all([
    fetchMarketOverview(),
    fetchInvestorType(),
    fetchIndustrySector(),
    fetchTopRankings(),
    fetchMeta(),
  ])

  return { market, investor, sector, rankings, meta }
}
```

#### Pattern 2: Single Stock Fetch

```typescript
// src/lib/rtdb/stock.ts
export async function fetchStock(symbol: string): Promise<RTDBStock | null> {
  return fetchWithFallback<RTDBStock>(
    `/stocks/${symbol}`
  )
}

export async function fetchStockWithPeers(
  symbol: string
): Promise<{ stock: RTDBStock | null; peers: RTDBStock[] }> {
  const stock = await fetchStock(symbol)

  if (!stock || !stock.sector) {
    return { stock, peers: [] }
  }

  // Fetch sector peers (simplified)
  const peers = await fetchStocksBySector(stock.sector, symbol)

  return { stock, peers: peers.slice(0, 3) } // Top 3 peers
}
```

### 6.3 Real-time Updates (Future)

```typescript
// src/lib/rtdb/subscribe.ts
export function subscribeToMarketUpdates(
  callback: (data: RTDBMarketOverview) => void
): () => void {
  const ref = rtdbRef('/marketOverview/latest')

  const unsubscribe = onValue(ref, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      callback(data)
    }
  })

  return unsubscribe
}
```

---

## 7. Security Considerations

### 7.1 Firebase Security Rules

```javascript
// firestore.rules or database.rules.json

{
  "rules": {
    // Read-only access for all authenticated users
    ".read": "auth != null",

    // No write access from client
    ".write": "false",

    // Specific path rules
    "marketOverview": {
      ".read": true,  // Public read access
      ".write": false
    },
    "investorType": {
      ".read": true,
      ".write": false
    },
    "industrySector": {
      ".read": true,
      ".write": false
    },
    "topRankings": {
      ".read": true,
      ".write": false
    },
    "stocks": {
      ".read": true,
      ".write": false
    },
    "meta": {
      ".read": true,
      ".write": false
    }
  }
}
```

### 7.2 Data Validation

```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod'

export const MarketOverviewSchema = z.object({
  set: z.object({
    index: z.number(),
    change: z.number(),
    changePercent: z.number(),
  }),
  totalMarketCap: z.number(),
  timestamp: z.number(),
})

export const InvestorTypeSchema = z.object({
  foreign: z.object({
    buy: z.number(),
    sell: z.number(),
    net: z.number(),
  }),
  institution: z.object({
    buy: z.number(),
    sell: z.number(),
    net: z.number(),
  }),
  retail: z.object({
    buy: z.number(),
    sell: z.number(),
    net: z.number(),
  }),
  prop: z.object({
    buy: z.number(),
    sell: z.number(),
    net: z.number(),
  }),
  timestamp: z.number(),
})

// Usage in data fetcher
export async function fetchMarketOverview(): Promise<RTDBMarketOverview | null> {
  const data = await rtdbGet('/marketOverview/latest')

  if (!data) return null

  // Validate before returning
  return MarketOverviewSchema.parse(data)
}
```

### 7.3 Environment Variables

```bash
# .env.local (NEVER commit to git)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

```typescript
// src/lib/firebase/config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
```

### 7.4 Input Sanitization

```typescript
// src/lib/utils/validation.ts
import { z } from 'zod'

export const StockSymbolSchema = z.string()
  .min(1)
  .max(10)
  .regex(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers')
  .transform(s => s.toUpperCase())

export function sanitizeStockSymbol(input: string): string {
  return StockSymbolSchema.parse(input)
}

// Usage in stock page
export default async function StockPage({ params }: { params: { symbol: string } }) {
  const symbol = sanitizeStockSymbol(params.symbol)
  const stock = await fetchStock(symbol)

  // ...
}
```

---

## 8. Performance Considerations

### 8.1 Server-Side Rendering Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RENDERING STRATEGY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Priority 1: Static Generation (build-time)                          │
│  - Not applicable (data changes daily)                               │
│                                                                       │
│  Priority 2: Server-Side Rendering (request-time)                    │
│  ✅ Homepage (app/page.tsx)                                          │
│  ✅ Stock pages (app/stock/[symbol]/page.tsx)                         │
│  ✅ Search results (app/search/page.tsx)                             │
│                                                                       │
│  Priority 3: Incremental Static Regeneration                         │
│  - Future: Consider for stock pages with low volatility              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Data Fetching Optimization

```typescript
// ✅ GOOD: Parallel fetching
const [market, investor, sector] = await Promise.all([
  fetchMarketOverview(),
  fetchInvestorType(),
  fetchIndustrySector(),
])

// ❌ BAD: Sequential fetching
const market = await fetchMarketOverview()
const investor = await fetchInvestorType()
const sector = await fetchIndustrySector()
```

### 8.3 Bundle Size Optimization

```javascript
// next.config.js
module.exports = {
  // Split chunks for better caching
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Compress output
  compress: true,

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### 8.4 Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Company Logo"
  width={200}
  height={100}
  priority  // For above-the-fold images
/>
```

### 8.5 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to First Byte (TTFB) | < 600ms | WebPageTest |

---

## 9. Scalability Considerations

### 9.1 Handling More Stocks

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SCALING STOCK COVERAGE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Current: ~500 SET stocks                                            │
│  Target: ~1000 SET + maNET stocks                                    │
│                                                                       │
│  Strategy:                                                            │
│  1. Lazy loading for stock lists                                     │
│  2. Pagination for rankings (50 per page)                           │
│  3. Index stocks by symbol for fast lookup                           │
│  4. Cache popular stocks (top 100 by volume)                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Adding More Data Sources

```
┌─────────────────────────────────────────────────────────────────────┐
│                   MULTI-SOURCE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Current: RTDB (single source)                                       │
│  Future: Multiple sources with aggregation                          │
│                                                                       │
│                    ┌─────────────────┐                              │
│                    │  Data Aggregator│                              │
│                    └─────────────────┘                              │
│                           │                                         │
│         ┌─────────────────┼─────────────────┐                       │
│         ▼                 ▼                 ▼                       │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                  │
│  │   RTDB   │      │   API    │      │  Cache   │                  │
│  │ Primary  │      │ Backup   │      │  Fallback │                  │
│  └──────────┘      └──────────┘      └──────────┘                  │
│                                                                       │
│  Implementation:                                                     │
│  - Abstract data source interface                                   │
│  - Priority-based fetching (try each source in order)                │
│  - Merge results from multiple sources                              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.3 Adding More Rules/Lenses

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTENSIBLE RULE SYSTEM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Current: 3 lenses (Quality, Valuation, Timing)                      │
│  Future: Add custom lenses without modifying core                    │
│                                                                       │
│  Design Pattern: Plugin Architecture                                 │
│                                                                       │
│  interface Lens {                                                    │
│    name: string                                                      │
│    assess(input: unknown): LensScore                                │
│  }                                                                   │
│                                                                       │
│  // Register custom lens                                             │
│  verdictEngine.registerLens('momentum', new MomentumLens())          │
│                                                                       │
│  // Engine now uses 4 lenses                                        │
│  const verdict = verdictEngine.analyze(stock)                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.4 Database Scaling

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE SCALING PATH                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Phase 1 (MVP): Firebase RTDB                                        │
│  - Single region                                                     │
│  - ~1000 concurrent users                                            │
│  - ~100 MB data                                                      │
│                                                                       │
│  Phase 2 (Growth): Firebase RTDB + Cloud Functions                   │
│  - Pre-compute verdicts                                              │
│  - Cache popular stocks                                              │
│  - ~10,000 concurrent users                                          │
│                                                                       │
│  Phase 3 (Scale): PostgreSQL + Redis                                 │
│  - Structured data storage                                           │
│  - Redis for hot data cache                                          │
│  - CDN for static content                                            │
│  - ~100,000 concurrent users                                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### A. Key Terminology

| Term | Definition |
|------|------------|
| RTDB | Firebase Realtime Database |
| Regime | Market condition state (Risk-On/Neutral/Risk-Off) |
| Lens | Analysis dimension (Quality/Valuation/Timing) |
| Verdict | Investment recommendation (Buy/Watch/Avoid) |
| Smart Money | Foreign and institutional investors |

### B. Reference Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase RTDB Documentation](https://firebase.google.com/docs/database)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)

### C. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-22 | Initial design document |
