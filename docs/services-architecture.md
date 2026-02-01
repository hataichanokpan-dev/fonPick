# fonPick Services Architecture

Detailed documentation of fonPick's service-oriented architecture.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Core Services](#core-services)
- [Integration Layer](#integration-layer)
- [Data Flow](#data-flow)
- [Service Communication](#service-communication)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)

---

## 🎯 Overview

fonPick uses a **service-oriented architecture** where each analysis domain is encapsulated in its own service. This promotes:

- **Separation of Concerns** - Each service has a single responsibility
- **Testability** - Services can be tested independently
- **Maintainability** - Changes are isolated to specific services
- **Scalability** - Services can be optimized independently

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                  (Next.js API Routes)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Integration Layer                           │
│              (Service Orchestrator)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Market     │ │   Sector     │ │   Smart      │
│  Breadth     │ │  Rotation    │ │   Money      │
└──────────────┘ └──────────────┘ └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│              (Firebase RTDB + Yahoo Finance)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗 Architecture Principles

### 1. Single Responsibility

Each service handles **one specific analysis domain**:

```typescript
// ✅ GOOD: Single responsibility
class MarketBreadthService {
  analyze(data: MarketData): MarketBreadthResult { ... }
}

// ❌ BAD: Multiple responsibilities
class AnalysisService {
  analyzeMarket() { ... }
  analyzeSector() { ... }
  analyzeSmartMoney() { ... }
}
```

### 2. Immutable Data

All services return **new objects**, never mutate inputs:

```typescript
// ✅ GOOD: Immutable
function processSector(sector: Sector): ProcessedSector {
  return {
    ...sector,
    processed: true,
    timestamp: Date.now()
  }
}

// ❌ BAD: Mutation
function processSector(sector: Sector): ProcessedSector {
  sector.processed = true  // Mutation!
  return sector
}
```

### 3. Error Isolation

Each service handles its own errors independently:

```typescript
// ✅ GOOD: Error isolation
async function getMarketBreadth(): Promise<MarketBreadthResult> {
  try {
    return await analyzeBreadth()
  } catch (error) {
    return getDefaultBreadthResult()  // Graceful fallback
  }
}
```

### 4. Type Safety

All services use **strict TypeScript types**:

```typescript
export interface MarketBreadthService {
  analyze(data: MarketData): MarketBreadthResult
  validate(data: unknown): data is MarketData
  getDefaultResult(): MarketBreadthResult
}
```

---

## 🔧 Core Services

### 1. Market Breadth Service

**Location**: [`src/services/market-breadth/`](../src/services/market-breadth/)

**Purpose**: Analyze market breadth through advance/decline ratios and volatility

#### Responsibilities

- Calculate advance/decline ratio
- Assess volatility level
- Determine market trend
- Generate breadth strength score

#### Interface

```typescript
interface MarketBreadthService {
  /**
   * Analyze market breadth from market overview data
   */
  analyze(data: MarketOverview): MarketBreadthResult

  /**
   * Validate input data
   */
  validate(data: unknown): data is MarketOverview
}
```

#### Output Schema

```typescript
interface MarketBreadthResult {
  advanceDeclineRatio: number
  advances: number
  declines: number
  unchanged: number
  volatility: 'low' | 'medium' | 'high'
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: number  // 0-100
}
```

---

### 2. Sector Rotation Service

**Location**: [`src/services/sector-rotation/`](../src/services/sector-rotation/)

**Purpose**: Detect sector rotation patterns and identify leading/lagging sectors

#### Responsibilities

- Identify leading and lagging sectors
- Detect rotation patterns
- Generate entry/exit signals
- Calculate sector strength

#### Interface

```typescript
interface SectorRotationService {
  analyze(data: IndustrySectorData): SectorRotationResult
  getLeadingSectors(sector: IndustrySectorData[]): Sector[]
  getLaggingSectors(sector: IndustrySectorData[]): Sector[]
}
```

#### Output Schema

```typescript
interface SectorRotationResult {
  leadingSectors: Sector[]
  laggingSectors: Sector[]
  rotationPattern: 'rotating' | 'concentrated' | 'divergent'
  entrySignals: SectorSignal[]
  exitSignals: SectorSignal[]
}
```

---

### 3. Smart Money Service

**Location**: [`src/services/smart-money/`](../src/services/smart-money/)

**Purpose**: Track foreign and institutional investor flows

#### Responsibilities

- Calculate foreign investor net flow
- Calculate institutional net flow
- Detect risk-on/off signals
- Identify primary market driver

#### Interface

```typescript
interface SmartMoneyService {
  analyze(data: InvestorTypeData): SmartMoneyResult
  detectRiskSignal(flows: MoneyFlows): RiskSignal
  identifyPrimaryDriver(flows: MoneyFlows): string
}
```

#### Output Schema

```typescript
interface SmartMoneyResult {
  foreignFlow: MoneyFlow
  institutionalFlow: MoneyFlow
  riskSignal: 'risk-on' | 'risk-off' | 'neutral'
  primaryDriver: 'foreign' | 'institutional' | 'balanced'
  trend: 'bullish' | 'bearish' | 'neutral'
}
```

---

### 4. Correlations Service

**Location**: [`src/services/correlations/`](../src/services/correlations/)

**Purpose**: Analyze correlation between rankings and sector performance

#### Responsibilities

- Calculate alignment score
- Detect anomalies
- Measure concentration impact
- Identify market drivers

#### Interface

```typescript
interface CorrelationsService {
  analyze(
    rankings: TopRankingsData,
    sectors: IndustrySectorData
  ): CorrelationResult
  detectAnomalies(rankings: TopRankingsData[]): Anomaly[]
  calculateAlignment(
    rankings: TopRankingsData[],
    sectors: IndustrySectorData[]
  ): number
}
```

#### Output Schema

```typescript
interface CorrelationResult {
  alignment: number  // 0-100
  anomalies: Anomaly[]
  concentration: {
    topSector: string
    impact: number
    explanation: string
  }
  marketDrivers: string[]
}
```

---

### 5. Insights Service

**Location**: [`src/services/insights/`](../src/services/insights/)

**Purpose**: Generate actionable insights from all analysis results

#### Responsibilities

- Answer the 6 investment questions
- Generate trading recommendations
- Detect conflicts between signals
- Calculate confidence levels

#### Interface

```typescript
interface InsightsService {
  generate(results: AnalysisResults): InsightsResult
  answerQuestions(results: AnalysisResults): QuestionAnswers
  generateRecommendations(results: AnalysisResults): Recommendation[]
  detectConflicts(results: AnalysisResults): Conflict[]
}
```

#### The 6 Investment Questions

1. **How about market now?** - Market breadth and trend
2. **What sector is heavy market up or down?** - Sector rotation
3. **Risk on because Foreign Investor is strong buy?** - Smart money
4. **What sector or stock should I focus/trade?** - Trading focus
5. **Top rankings heavy sector market impact?** - Rankings impact
6. **Compare rankings vs sector performance?** - Correlation

---

## 🔗 Integration Layer

**Location**: [`src/services/integration/`](../src/services/integration/)

The **Combined Analysis Service** orchestrates all core services and provides a unified API.

### Responsibilities

- Fetch data from Firebase RTDB
- Call all analysis services in parallel
- Combine results into single response
- Handle service failures gracefully
- Cache results for performance

### Implementation

```typescript
class CombinedAnalysisService {
  async analyze(date: string): Promise<CombinedAnalysisResult> {
    // 1. Fetch data from RTDB
    const [marketData, sectorData, investorData, rankingsData] =
      await Promise.all([
        fetchMarketOverview(date),
        fetchIndustrySector(date),
        fetchInvestorType(date),
        fetchTopRankings(date)
      ])

    // 2. Run all services in parallel
    const [breadth, rotation, smartMoney, correlations] =
      await Promise.all([
        marketBreadthService.analyze(marketData),
        sectorRotationService.analyze(sectorData),
        smartMoneyService.analyze(investorData),
        correlationsService.analyze(rankingsData, sectorData)
      ])

    // 3. Generate insights
    const insights = insightsService.generate({
      breadth,
      rotation,
      smartMoney,
      correlations
    })

    // 4. Return combined result
    return { breadth, rotation, smartMoney, correlations, insights }
  }
}
```

---

## 📊 Data Flow

### Request Flow

```
Client Request
     │
     ▼
API Route Handler
     │
     ├─► Cache Check ──► Hit? ──► Return Cached
     │
     └─► Miss ──► CombinedAnalysisService
                     │
                     ├─► Fetch Data (Firebase RTDB)
                     │       │
                     │       ├─► marketOverview
                     │       ├─► industrySector
                     │       ├─► investorType
                     │       └─► topRankings
                     │
                     ├─► Parallel Analysis
                     │       │
                     │       ├─► MarketBreadthService
                     │       ├─► SectorRotationService
                     │       ├─► SmartMoneyService
                     │       └─► CorrelationsService
                     │
                     ├─► InsightsService
                     │
                     └─► Combine & Cache
                             │
                             └─► Return Response
```

### Data Transformation

```
Firebase RTDB (Raw)
     │
     ▼
Validation & Sanitization
     │
     ▼
Service Analysis (Domain Logic)
     │
     ▼
Result Aggregation
     │
     ▼
Insights Generation
     │
     ▼
API Response (Formatted)
```

---

## 🔄 Service Communication

### Synchronous Communication

Services communicate **synchronously** through function calls:

```typescript
// Integration layer calling services
const breadth = await marketBreadthService.analyze(marketData)
const rotation = await sectorRotationService.analyze(sectorData)
```

### Parallel Execution

Independent services are executed **in parallel**:

```typescript
// Execute all services concurrently
const results = await Promise.all([
  marketBreadthService.analyze(marketData),
  sectorRotationService.analyze(sectorData),
  smartMoneyService.analyze(investorData),
  correlationsService.analyze(rankingsData, sectorData)
])
```

### Data Sharing

Services share data through **typed interfaces**:

```typescript
interface AnalysisResults {
  breadth: MarketBreadthResult
  rotation: SectorRotationResult
  smartMoney: SmartMoneyResult
  correlations: CorrelationResult
}
```

---

## ⚠️ Error Handling

### Service-Level Error Handling

Each service implements **graceful degradation**:

```typescript
async function analyze(data: MarketData): Promise<Result> {
  try {
    return await performAnalysis(data)
  } catch (error) {
    console.error('Analysis failed:', error)
    return getDefaultResult()  // Fallback to default
  }
}
```

### Integration-Level Error Handling

The integration layer handles **partial failures**:

```typescript
const results = await Promise.allSettled([
  service1.analyze(data1),
  service2.analyze(data2),
  service3.analyze(data3)
])

// Process successful results, use defaults for failures
const [result1, result2, result3] = results.map(r =>
  r.status === 'fulfilled' ? r.value : getDefaultResult()
)
```

### Error Propagation

```typescript
interface ServiceError {
  service: string
  error: string
  fallbackUsed: boolean
}
```

---

## ⚡ Performance Optimization

### 1. Parallel Execution

```typescript
// ✅ GOOD: Parallel
const [breadth, rotation] = await Promise.all([
  getMarketBreadth(),
  getSectorRotation()
])

// ❌ BAD: Sequential
const breadth = await getMarketBreadth()
const rotation = await getSectorRotation()
```

### 2. Strategic Caching

```typescript
// Service-level caching
const cache = new Map<string, Result>()

async function getCachedResult(key: string): Promise<Result> {
  if (cache.has(key)) {
    return cache.get(key)!
  }
  const result = await computeResult()
  cache.set(key, result)
  return result
}
```

### 3. Response Optimization

```typescript
// Selective field projection
interface AnalysisSnapshot {
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  // Exclude detailed data for snapshot
}
```

---

## 📈 Service Metrics

Each service should track:

| Metric | Description |
|--------|-------------|
| **Execution Time** | Time to complete analysis |
| **Cache Hit Rate** | Percentage of cache hits |
| **Error Rate** | Percentage of failed requests |
| **Fallback Rate** | Percentage of fallback usage |

---

## 🧪 Testing Services

### Unit Testing

```typescript
describe('MarketBreadthService', () => {
  it('should calculate A/D ratio correctly', () => {
    const result = service.analyze(mockData)
    expect(result.advanceDeclineRatio).toBeCloseTo(1.5)
  })

  it('should handle empty data gracefully', () => {
    const result = service.analyze({})
    expect(result).toBeDefined()
  })
})
```

### Integration Testing

```typescript
describe('CombinedAnalysisService', () => {
  it('should combine all service results', async () => {
    const result = await combinedService.analyze('2025-01-15')
    expect(result.breadth).toBeDefined()
    expect(result.rotation).toBeDefined()
    expect(result.smartMoney).toBeDefined()
    expect(result.correlations).toBeDefined()
    expect(result.insights).toBeDefined()
  })
})
```

---

## 🔄 Future Enhancements

### Planned Improvements

- [ ] **Event-Driven Architecture** - Services emit events for real-time updates
- [ ] **Service Mesh** - Advanced service communication
- [ ] **Distributed Tracing** - Track requests across services
- [ ] **Circuit Breakers** - Prevent cascade failures
- [ ] **Service Discovery** - Dynamic service registration

---

<div align="center">

**Last Updated: 2025-01-15**

[Back to README](../README.md) | [API Documentation](./api-documentation.md)

</div>
