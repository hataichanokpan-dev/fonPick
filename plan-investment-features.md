# fonPick Investment Features Implementation Plan
## แผนพัฒนาฟีเจอร์การลงทุน - ตอบโจทย์ 6 คำถาม + คำแนะนำหุ้นระดับ Stock

---

## Executive Summary

**Date:** 2026-01-25
**Status:** Planning Phase
**Duration:** 6-8 weeks estimated

### Current State Assessment

| Aspect | Status | Score | Gap |
|--------|--------|-------|-----|
| Architecture Foundation | ✅ Complete | 9/10 | None |
| 6-Question Answering | ⚠️ Partial | 7/10 | Needs historical data |
| Stock Recommendations | ❌ Missing | 2/10 | **CRITICAL** |
| Risk Management | ❌ Missing | 3/10 | **HIGH** |
| Thai Market Context | ⚠️ Partial | 4/10 | Needs enhancement |
| Real-time Signals | ❌ Missing | 1/10 | **MEDIUM** |

### Overall Investment Value: **6/10 → Target: 9/10**

---

## 🎯 6 คำถามการลงทุน (Core Requirements)

| # | คำถาม | Module | Current | Target |
|---|--------|--------|---------|--------|
| 1 | ตลาดผันผวนแรงหรือไม่? | VolatilityModule | ✅ Working | ✅ Complete |
| 2 | ภาคไหนลากตลาดขึ้น/ลง เพราอะไร? | SectorRotationModule | ✅ Working | ✅ Complete |
| 3 | Risk-On/Off เพราอะไร? | SmartMoneyModule | ✅ Working | ✅ Complete |
| 4 | ควรซื้อขายอะไร? โฟกัสภาคไหน? | InsightsModule | ⚠️ Sector only | **Stock Picks** |
| 5 | Top Rankings ส่งผลต่อตลาดอย่างไร? | RankingsImpactModule | ⚠️ Basic | **Market Cap Impact** |
| 6 | Top Rankings vs Sector เปรียบเทียบอย่างไร? | CorrelationModule | ⚠️ Basic | **Divergence Trades** |

---

## 🚨 Critical Gaps Identified

### Gap 1: No Stock-Level Recommendations (CRITICAL - P0)

**Current Behavior:**
```
InsightsModule: "Focus on Technology, Banking sectors"
```

**Investor Needs:**
```
StockRecommendationEngine:
- KBANK: BUY @ 128-130, Stop 124, Target 138/145/155, Size 3-5%
- ADVANC: BUY @ 168-170, Stop 164, Target 178/185/195, Size 2-4%
- BDMS: HOLD, Wait for pullback to 28-30 range
```

### Gap 2: Missing Historical Data (CRITICAL - P0)

**Current State:** Only 3 days historical data fetched
**Impact:** 5D/20D/YTD trends inaccurate → Low confidence scores

**Required:** 60-day historical data pipeline

### Gap 3: No Risk Management Framework (HIGH - P0)

**Current State:** Basic volatility label
**Investor Needs:** Portfolio VaR, concentration alerts, beta targeting

### Gap 4: Missing Thai Market Specific Features (HIGH - P1)

- Foreign Flow Impact Modeling (Foreign > 500M = 1-2% SET gain)
- Prop Trading Monitor
- SET vs Regional comparison
- Liquidity Analysis

### Gap 5: No BAT Signals (HIGH - P1)

- Buy After Trigger signals
- Breakout/Pullback/Reversal detection
- Entry price targets with stop-loss

---

## 📋 Implementation Phases

---

### Phase 1: Historical Data Pipeline (Week 1-2)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL
**Dependencies:** None (Foundation for all other features)

#### Objectives
1. Collect and store 60-day historical data
2. Pre-calculate 5D/20D/YTD trends
3. Reduce API queries from 12 → 3

#### Tasks

**1.1 Data Structure Design**
```
RTDB Structure:
├── /historical/market/{YYYY-MM-DD}
│   └── { setIndex, marketCap, timestamp }
├── /historical/sector/{YYYY-MM-DD}
│   └── { sectors: [{ name, changePct, valMn }] }
├── /historical/investor/{YYYY-MM-DD}
│   └── { foreign, institution, retail, prop }
└── /trends/cache/{timestamp}
    ├── setIndex: { fiveDay, twentyDay, ytd }
    ├── sectors: { [sectorName]: { fiveDay, twentyDay, ytd } }
    └── investors: { foreign, institution, retail, prop }
```

**1.2 Historical Data Collector**
```typescript
// NEW: src/services/historical-data/collector.ts
export async function collectHistoricalData(daysBack: number = 60) {
  const dates = getDateRange({ days: daysBack, excludeWeekends: true })

  for (const date of dates) {
    const [market, sector, investor, rankings] = await Promise.all([
      fetchMarketOverviewByDate(date),
      fetchIndustrySectorByDate(date),
      fetchInvestorTypeByDate(date),
      fetchTopRankingsByDate(date),
    ])

    await writeToHistoricalPaths(date, { market, sector, investor, rankings })
  }
}
```

**1.3 Trend Pre-Aggregator**
```typescript
// NEW: src/services/trends/pre-aggregator.ts
export async function preCalculateTrends() {
  const lookback60 = await get60DayLookback()

  const trends = {
    setIndex: {
      fiveDay: calculateTrend(lookback60, 5),
      twentyDay: calculateTrend(lookback60, 20),
      ytd: calculateYTD(lookback60),
    },
    sectors: calculateSectorTrends(lookback60),
    investors: calculateInvestorTrends(lookback60),
  }

  await writeTrendsToCache(trends)
}
```

**1.4 New API Routes**
```typescript
// NEW: src/app/api/trends/route.ts
export async function GET() {
  const trends = await getTrendsFromCache()
  return cachedJson(trends, { revalidate: 3600 })
}

// NEW: src/app/api/current/route.ts
export async function GET() {
  const [market, sector, investor] = await Promise.all([
    fetchMarketOverview(),
    fetchIndustrySector(),
    fetchInvestorType(),
  ])
  return cachedJson({ market, sector, investor }, { revalidate: 300 })
}
```

**Deliverables:**
- ✅ Historical data collector
- ✅ Trend pre-aggregator
- ✅ /api/trends endpoint
- ✅ /api/current endpoint
- ✅ 60-day data coverage

**Acceptance:**
- Historical data available for 60+ days
- Trends cached and < 100ms response
- API queries reduced 75%

---

### Phase 2: Stock Recommendation Engine (Week 2-3)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL
**Dependencies:** Phase 1 (Historical data)

#### Objectives
1. Generate specific stock picks with entry/exit/stop-loss
2. Score stocks by conviction level
3. Provide actionable trading signals

#### Tasks

**2.1 Type Definitions**
```typescript
// NEW: src/types/stock-recommendation.ts
export interface StockRecommendation {
  symbol: string
  name: string
  sector: string

  action: 'BUY' | 'SELL' | 'HOLD' | 'SHORT'
  conviction: 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number // 0-100

  entry: {
    current: number
    target: number
    limit: number // max entry price
  }

  riskManagement: {
    stopLoss: number
    takeProfit: number[] // [TP1, TP2, TP3]
    positionSize: string // "% of portfolio"
    riskReward: string // "1:3.5"
  }

  catalysts: {
    bullish: string[]
    bearish: string[]
  }

  timeHorizon: string
  volatility: 'LOW' | 'MEDIUM' | 'HIGH'
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface StockRecommendations {
  timestamp: number
  marketRegime: 'Risk-On' | 'Risk-Off' | 'Neutral'
  equityAllocation: string // "70-75%"

  strongBuy: StockRecommendation[] // 2-3 stocks
  buy: StockRecommendation[] // 3-5 stocks
  hold: StockRecommendation[] // watchlist
  avoid: StockRecommendation[] // overbought/weak

  summary: {
    topPick: StockRecommendation
    focusSectors: string[]
    avoidSectors: string[]
  }
}
```

**2.2 Recommendation Algorithm**
```typescript
// NEW: src/services/stock-recommendation/generator.ts
export async function generateStockRecommendations(
  inputs: RecommendationInputs
): Promise<StockRecommendations> {

  const { sectorRotation, smartMoney, rankings, trends } = inputs

  // Step 1: Identify leading sectors
  const leadingSectors = sectorRotation.leaders.map(s => s.name)

  // Step 2: Get top stocks in leading sectors
  const candidateStocks = await getTopStocksInSectors(leadingSectors, rankings)

  // Step 3: Score each stock
  const scoredStocks = await Promise.all(
    candidateStocks.map(stock => scoreStock(stock, inputs))
  )

  // Step 4: Filter and rank
  const strongBuy = scoredStocks
    .filter(s => s.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const buy = scoredStocks
    .filter(s => s.score >= 60 && s.score < 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Step 5: Calculate entry/exit prices
  const recommendations = strongBuy.concat(buy).map(stock => ({
    ...stock,
    entry: calculateEntryPrice(stock),
    riskManagement: calculateRiskManagement(stock),
  }))

  return {
    timestamp: Date.now(),
    marketRegime: determineMarketRegime(inputs),
    equityAllocation: calculateEquityAllocation(inputs),
    strongBuy: recommendations.filter(r => r.action === 'STRONG_BUY'),
    buy: recommendations.filter(r => r.action === 'BUY'),
    summary: generateSummary(recommendations),
  }
}

async function scoreStock(
  stock: RankedStock,
  inputs: RecommendationInputs
): Promise<ScoredStock> {

  let score = 0
  const factors: ScoreFactor[] = []

  // Factor 1: Sector momentum (30 points)
  const sectorScore = calculateSectorScore(stock.sector, inputs)
  score += sectorScore
  factors.push({ name: 'Sector', score: sectorScore, max: 30 })

  // Factor 2: Smart money flow (25 points)
  const flowScore = calculateFlowScore(stock, inputs)
  score += flowScore
  factors.push({ name: 'Smart Money', score: flowScore, max: 25 })

  // Factor 3: Ranking strength (20 points)
  const rankingScore = calculateRankingScore(stock, inputs)
  score += rankingScore
  factors.push({ name: 'Ranking', score: rankingScore, max: 20 })

  // Factor 4: Volume breakout (15 points)
  const volumeScore = calculateVolumeScore(stock, inputs)
  score += volumeScore
  factors.push({ name: 'Volume', score: volumeScore, max: 15 })

  // Factor 5: Trend confirmation (10 points)
  const trendScore = calculateTrendScore(stock, inputs)
  score += trendScore
  factors.push({ name: 'Trend', score: trendScore, max: 10 })

  return {
    ...stock,
    score,
    confidence: score,
    factors,
  }
}
```

**2.3 Entry/Exit Calculator**
```typescript
// NEW: src/services/stock-recommendation/calculator.ts
export function calculateEntryPrice(stock: ScoredStock): EntryPrice {
  const atr = calculateATR(stock, 14) // Average True Range

  return {
    current: stock.price,
    target: stock.price * 0.98, // 2% below current
    limit: stock.price * 1.02, // 2% above current
  }
}

export function calculateRiskManagement(stock: ScoredStock): RiskManagement {
  const atr = calculateATR(stock, 14)
  const currentPrice = stock.price

  // Stop loss: 2x ATR below entry
  const stopLoss = currentPrice - (atr * 2)

  // Take profits: 2R, 3R, 5R (risk multiples)
  const risk = currentPrice - stopLoss
  const takeProfit = [
    currentPrice + (risk * 2), // TP1: 2R
    currentPrice + (risk * 3), // TP2: 3R
    currentPrice + (risk * 5), // TP3: 5R
  ]

  // Position sizing based on conviction
  const positionSize = stock.score >= 80 ? '3-5%' :
                       stock.score >= 70 ? '2-4%' :
                       '1-3%'

  return {
    stopLoss,
    takeProfit,
    positionSize,
    riskReward: `1:${Math.round((takeProfit[0] - currentPrice) / risk)}`,
  }
}
```

**2.4 API Endpoint**
```typescript
// NEW: src/app/api/stock-recommendations/route.ts
export async function GET() {
  const [trends, current, rankings] = await Promise.all([
    fetch('/api/trends').then(r => r.json()),
    fetch('/api/current').then(r => r.json()),
    fetchTopRankings(),
  ])

  const inputs = {
    sectorRotation: await analyzeSectorRotation(current, trends),
    smartMoney: await analyzeSmartMoney(current, trends),
    rankings,
    trends,
  }

  const recommendations = await generateStockRecommendations(inputs)

  return cachedJson(recommendations, { revalidate: 600 }) // 10 min
}
```

**Deliverables:**
- ✅ Stock recommendation engine
- ✅ Entry/exit calculator
- ✅ API endpoint
- ✅ 5-10 actionable stock picks per day

**Acceptance:**
- Each recommendation has entry, stop-loss, targets
- Risk-reward ratio >= 1:2
- Position sizing provided
- Catalysts explained

---

### Phase 3: Risk Management Dashboard (Week 3-4)
**Priority:** ⭐⭐⭐⭐⭐ CRITICAL
**Dependencies:** None (Parallel with Phase 2)

#### Objectives
1. Portfolio risk metrics
2. Concentration alerts
3. Beta targeting system

#### Tasks

**3.1 Type Definitions**
```typescript
// NEW: src/types/portfolio-risk.ts
export interface PortfolioRisk {
  timestamp: number
  overall: RiskStatus // 'GREEN' | 'YELLOW' | 'RED'

  var: {
    daily95: number // 95% confidence daily VaR
    weekly95: number
    monthly95: number
  }

  drawdown: {
    current: number
    max: number
    warningThreshold: number
    distanceToMax: number
  }

  concentration: {
    sectors: SectorConcentration[]
    stocks: StockConcentration[]
    warnings: string[]
  }

  beta: {
    current: number
    target: number
    adjustment: string
  }

  riskOnOff: {
    mode: 'Risk-On' | 'Risk-Off' | 'Neutral'
    equityAllocation: number // Recommended % in equities
    rationale: string
  }
}
```

**3.2 Risk Calculator**
```typescript
// NEW: src/services/portfolio-risk/calculator.ts
export async function calculatePortfolioRisk(
  inputs: RiskInputs
): Promise<PortfolioRisk> {

  // Calculate VaR using historical simulation
  const varMetrics = await calculateVaR(inputs.historicalReturns)

  // Calculate drawdown
  const drawdown = calculateDrawdown(inputs.currentIndex, inputs.highWaterMark)

  // Check concentration
  const concentration = analyzeConcentration(inputs.sectorWeights, inputs.holdings)

  // Calculate portfolio beta
  const beta = calculatePortfolioBeta(inputs.holdings, inputs.sectorBetas)

  // Determine Risk-On/Off mode
  const riskOnOff = determineRiskOnOffMode(inputs.smartMoney, inputs.marketRegime)

  // Overall risk status
  const overall = determineOverallRisk({
    var: varMetrics.daily95,
    drawdown: drawdown.current,
    concentration: concentration.warnings.length,
  })

  return {
    timestamp: Date.now(),
    overall,
    var: varMetrics,
    drawdown,
    concentration,
    beta,
    riskOnOff,
  }
}
```

**3.3 API Endpoint**
```typescript
// NEW: src/app/api/portfolio-risk/route.ts
export async function GET() {
  const [trends, current] = await Promise.all([
    fetch('/api/trends').then(r => r.json()),
    fetch('/api/current').then(r => r.json()),
  ])

  const risk = await calculatePortfolioRisk({
    historicalReturns: trends.setIndex,
    currentIndex: current.market.set.index,
    smartMoney: current.investor,
    sectorWeights: calculateSectorWeights(current.sector),
  })

  return cachedJson(risk, { revalidate: 300 })
}
```

**Deliverables:**
- ✅ Portfolio risk calculator
- ✅ Concentration analyzer
- ✅ Beta targeting system
- ✅ API endpoint

**Acceptance:**
- VaR calculated at 95% confidence
- Concentration warnings generated
- Risk-on/off signals accurate

---

### Phase 4: Thai Market Specific Features (Week 4-5)
**Priority:** ⭐⭐⭐⭐ HIGH
**Dependencies:** Phase 1, 2

#### Objectives
1. Foreign flow impact modeling
2. Prop trading monitor
3. SET vs regional comparison

#### Tasks

**4.1 Foreign Flow Impact Model**
```typescript
// NEW: src/services/thai-market/foreign-flow-impact.ts
export interface ForeignFlowImpact {
  todayNet: number
  vs5DayAvg: number
  vs20DayAvg: number

  impact: {
    expectedSetMove: number // % if foreign buys/sells
    probability: number // % confidence
  }

  signal: {
    type: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
    threshold: number
    rationale: string
  }

  batSignal: string // "Buy when foreign > 300M for 3 consecutive days"
}

export async function analyzeForeignFlowImpact(
  investor: InvestorData,
  historical: InvestorTrend[]
): Promise<ForeignFlowImpact> {

  const todayNet = investor.foreign.net
  const avg5Day = historical.slice(0, 5).reduce((sum, d) => sum + d.foreign, 0) / 5
  const avg20Day = historical.slice(0, 20).reduce((sum, d) => sum + d.foreign, 0) / 20

  // Thai market: 500M foreign flow ≈ 1-2% SET move
  const expectedSetMove = (todayNet / 500) * 1.5 // approximate

  // Calculate signal
  let signal: ForeignFlowImpact['signal']
  if (todayNet > 500) {
    signal = {
      type: 'STRONG_BUY',
      threshold: 500,
      rationale: 'Foreign buying > 500M typically leads to 1.5-2% SET gain',
    }
  } else if (todayNet > 300) {
    signal = {
      type: 'BUY',
      threshold: 300,
      rationale: 'Foreign buying > 300M supports bullish momentum',
    }
  } else if (todayNet < -500) {
    signal = {
      type: 'STRONG_SELL',
      threshold: -500,
      rationale: 'Foreign selling > 500M typically leads to 1.5-2% SET decline',
    }
  } else {
    signal = {
      type: 'NEUTRAL',
      threshold: 0,
      rationale: 'Foreign flow within normal range',
    }
  }

  return {
    todayNet,
    vs5DayAvg: todayNet - avg5Day,
    vs20DayAvg: todayNet - avg20Day,
    impact: {
      expectedSetMove,
      probability: calculateProbability(todayNet, historical),
    },
    signal,
    batSignal: generateBATSignal(historical),
  }
}
```

**4.2 Prop Trading Monitor**
```typescript
// NEW: src/services/thai-market/prop-monitor.ts
export interface PropTradingMonitor {
  activity: 'HIGH' | 'NORMAL' | 'LOW'
  intensity: number // 0-100

  analysis: {
    position: 'NET_BUY' | 'NET_SELL' | 'NEUTRAL'
    implication: string
  }

  warning: {
    level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'
    message: string
  }
}

export function monitorPropTrading(investor: InvestorData): PropTradingMonitor {
  const propNet = investor.prop.net
  const propValue = investor.prop.buy + investor.prop.sell

  // Calculate activity level
  const avgValue = 500 // average daily prop value in millions
  const intensity = Math.min(100, (propValue / avgValue) * 100)

  let activity: PropTradingMonitor['activity']
  if (intensity > 80) activity = 'HIGH'
  else if (intensity > 40) activity = 'NORMAL'
  else activity = 'LOW'

  // Analyze positioning
  const position = propNet > 100 ? 'NET_BUY' :
                  propNet < -100 ? 'NET_SELL' : 'NEUTRAL'

  const implication =
    position === 'NET_BUY' ? 'Prop buying supports short-term bullish outlook' :
    position === 'NET_SELL' ? 'Prop selling indicates short-term caution' :
    'Prop positioning neutral'

  // Warning level
  const warning =
    activity === 'HIGH' && position === 'NET_SELL' ? {
      level: 'HIGH',
      message: 'High prop selling activity = elevated short-term risk',
    } : activity === 'HIGH' ? {
      level: 'MEDIUM',
      message: 'High prop activity = elevated short-term volatility',
    } : {
      level: 'NONE',
      message: '',
    }

  return {
    activity,
    intensity,
    analysis: { position, implication },
    warning,
  }
}
```

**4.3 SET vs Regional Comparison**
```typescript
// NEW: src/services/thai-market/regional-comparison.ts
export interface RegionalComparison {
  set: {
    value: number
    change: number
  }

  regionalAvg: {
    value: number
    change: number
    markets: string[] // ['SGX', 'KLSE', 'IDX']
  }

  divergence: {
    exists: boolean
    magnitude: number
    interpretation: string
  }
}

export async function compareWithRegional(
  setIndex: number,
  setChange: number
): Promise<RegionalComparison> {

  // Fetch regional indices (mock or via API)
  const regional = await fetchRegionalIndices()

  const avgChange = regional.markets.reduce((sum, m) => sum + m.change, 0) / regional.markets.length

  const divergence = setChange - avgChange

  return {
    set: { value: setIndex, change: setChange },
    regionalAvg: {
      value: regional.avg,
      change: avgChange,
      markets: regional.markets.map(m => m.name),
    },
    divergence: {
      exists: Math.abs(divergence) > 0.5,
      magnitude: divergence,
      interpretation: divergence > 0.5 ?
        'SET outperforming region - strong local support' :
        divergence < -0.5 ?
        'SET underperforming region - foreign outflows' :
        'SET tracking region - normal correlation',
    },
  }
}
```

**Deliverables:**
- ✅ Foreign flow impact model
- ✅ Prop trading monitor
- ✅ Regional comparison
- ✅ API endpoints

**Acceptance:**
- Foreign impact model calibrated to Thai market
- Prop warnings trigger appropriately
- Regional comparison available

---

### Phase 5: BAT Signals & Entry/Exit System (Week 5-6)
**Priority:** ⭐⭐⭐⭐ HIGH
**Dependencies:** Phase 2, 4

#### Objectives
1. Buy After Trigger signals
2. Breakout/pullback/reversal detection
3. Real-time entry alerts

#### Tasks

**5.1 Type Definitions**
```typescript
// NEW: src/types/bat-signals.ts
export interface BATSignal {
  symbol: string
  name: string

  trigger: {
    type: 'BREAKOUT' | 'PULLBACK' | 'REVERSAL'
    price: number
    currentPrice: number
    distance: number // % to trigger
    status: 'WAITING' | 'READY' | 'TRIGGERED' | 'MISSED'
  }

  setup: {
    pattern: string
    confirmation: string[]
    invalidation: number
  }

  risk: {
    entryZone: [number, number] // [low, high]
    stopLoss: number
    target: number[]
    riskReward: string
  }

  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  timeToTrigger: string // "2 hours ago" | "expected in 1 day"
}
```

**5.2 BAT Signal Generator**
```typescript
// NEW: src/services/bat-signals/generator.ts
export async function generateBATSignals(
  stocks: StockRecommendation[],
  marketData: MarketData
): Promise<BATSignal[]> {

  const signals: BATSignal[] = []

  for (const stock of stocks) {
    // Check for breakout setup
    const breakout = await checkBreakoutSetup(stock, marketData)
    if (breakout) signals.push(breakout)

    // Check for pullback setup
    const pullback = await checkPullbackSetup(stock, marketData)
    if (pullback) signals.push(pullback)

    // Check for reversal setup
    const reversal = await checkReversalSetup(stock, marketData)
    if (reversal) signals.push(reversal)
  }

  // Sort by urgency and distance to trigger
  return signals
    .sort((a, b) => {
      const urgencyScore = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return urgencyScore[b.urgency] - urgencyScore[a.urgency] ||
             a.distance - b.distance
    })
    .slice(0, 10) // Top 10 signals
}

async function checkBreakoutSetup(
  stock: StockRecommendation,
  marketData: MarketData
): Promise<BATSignal | null> {

  const resistance = await findResistanceLevel(stock.symbol)
  const currentPrice = stock.entry.current
  const distanceToTrigger = ((resistance - currentPrice) / currentPrice) * 100

  // Breakout valid if: within 2% of resistance + volume confirmation
  if (distanceToTrigger < 2 && distanceToTrigger > 0) {
    const volume = await getVolume(stock.symbol)
    const avgVolume = await getAvgVolume(stock.symbol, 20)
    const volumeConfirmed = volume > avgVolume * 1.5

    if (volumeConfirmed) {
      return {
        symbol: stock.symbol,
        name: stock.name,
        trigger: {
          type: 'BREAKOUT',
          price: resistance,
          currentPrice,
          distance: distanceToTrigger,
          status: distanceToTrigger < 0.5 ? 'READY' : 'WAITING',
        },
        setup: {
          pattern: 'Resistance Breakout',
          confirmation: [
            'Price at resistance level',
            'Volume 1.5x average',
            marketData.riskOnOff.mode === 'Risk-On' ? 'Market in Risk-On mode' : null,
          ].filter(Boolean),
          invalidation: currentPrice * 0.95,
        },
        risk: {
          entryZone: [resistance * 0.99, resistance * 1.02],
          stopLoss: currentPrice * 0.95,
          target: [
            resistance * 1.05,
            resistance * 1.10,
            resistance * 1.15,
          ],
          riskReward: '1:3',
        },
        urgency: distanceToTrigger < 0.5 ? 'HIGH' : 'MEDIUM',
        timeToTrigger: distanceToTrigger < 0.5 ? 'Ready to enter' : 'Expected soon',
      }
    }
  }

  return null
}

async function checkPullbackSetup(
  stock: StockRecommendation,
  marketData: MarketData
): Promise<BATSignal | null> {

  const support = await findSupportLevel(stock.symbol)
  const currentPrice = stock.entry.current
  const distanceToTrigger = ((currentPrice - support) / currentPrice) * 100

  // Pullback valid if: within 3% of support + uptrend intact
  if (distanceToTrigger < 3 && distanceToTrigger > 0) {
    const trend = await getTrend(stock.symbol)
    const uptrendIntact = trend === 'BULLISH'

    if (uptrendIntact) {
      return {
        symbol: stock.symbol,
        name: stock.name,
        trigger: {
          type: 'PULLBACK',
          price: support,
          currentPrice,
          distance: distanceToTrigger,
          status: distanceToTrigger < 1 ? 'READY' : 'WAITING',
        },
        setup: {
          pattern: 'Bullish Pullback',
          confirmation: [
            'Price pulling back to support',
            'Uptrend intact',
            'Foreign flow supports sector',
          ].filter(Boolean),
          invalidation: support * 0.95,
        },
        risk: {
          entryZone: [support, support * 1.03],
          stopLoss: support * 0.95,
          target: [
            currentPrice * 1.05,
            currentPrice * 1.10,
            currentPrice * 1.15,
          ],
          riskReward: '1:4',
        },
        urgency: distanceToTrigger < 1 ? 'HIGH' : 'MEDIUM',
        timeToTrigger: distanceToTrigger < 1 ? 'Ready to enter' : 'Approaching support',
      }
    }
  }

  return null
}
```

**Deliverables:**
- ✅ BAT signal generator
- ✅ Breakout detection
- ✅ Pullback detection
- ✅ Reversal detection
- ✅ API endpoint

**Acceptance:**
- 5-10 signals generated daily
- Distance to trigger calculated
- Entry zones clearly defined

---

### Phase 6: UI Components (Week 6-7)
**Priority:** ⭐⭐⭐ MEDIUM
**Dependencies:** All previous phases

#### Objectives
1. Stock recommendation cards
2. Risk dashboard widget
3. BAT signal display
4. Compact layout

#### Tasks

**6.1 Stock Recommendation Card**
```typescript
// NEW: src/components/modules/StockRecommendationCard.tsx
export function StockRecommendationCard({
  recommendation,
}: {
  recommendation: StockRecommendation
}) {
  const { symbol, action, conviction, entry, riskManagement } = recommendation

  return (
    <Card variant={action === 'BUY' ? 'success' : 'default'}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{symbol}</h3>
          <Badge variant={action === 'BUY' ? 'success' : 'neutral'}>
            {action}
          </Badge>
          <Badge variant={conviction === 'HIGH' ? 'success' : 'warning'}>
            {conviction}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-up">
            {entry.current.toFixed(2)}
          </div>
          <div className="text-xs text-text-2">
            Target: {entry.target.toFixed(2)} - {entry.limit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-text-2">Stop Loss</div>
          <div className="text-lg font-bold text-down">
            {riskManagement.stopLoss.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-2">Targets</div>
          <div className="text-sm font-semibold text-up">
            {riskManagement.takeProfit.map(tp => tp.toFixed(0)).join(' / ')}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-2">R:R</div>
          <div className="text-lg font-bold">
            {riskManagement.riskReward}
          </div>
        </div>
      </div>

      {/* Position Size */}
      <div className="mt-2 text-center">
        <div className="text-xs text-text-2">Position Size</div>
        <div className="text-xl font-bold">
          {riskManagement.positionSize}
        </div>
      </div>

      {/* Catalysts */}
      <div className="mt-4">
        <div className="text-xs font-semibold mb-1">Catalysts</div>
        <ul className="text-xs space-y-1">
          {recommendation.catalysts.bullish.map(c => (
            <li key={c} className="text-up">• {c}</li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
```

**6.2 Risk Dashboard Widget**
```typescript
// NEW: src/components/modules/RiskDashboardWidget.tsx
export function RiskDashboardWidget({
  risk,
}: {
  risk: PortfolioRisk
}) {
  return (
    <Card variant={risk.overall === 'GREEN' ? 'success' : risk.overall === 'YELLOW' ? 'warning' : 'error'}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Portfolio Risk</h3>
        <StatusBadge status={risk.overall} />
      </div>

      {/* VaR Display */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-text-2">Daily VaR (95%)</div>
          <div className="text-xl font-bold">
            {risk.var.daily95.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text-2">Weekly VaR</div>
          <div className="text-xl font-bold">
            {risk.var.weekly95.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text-2">Max Drawdown</div>
          <div className="text-xl font-bold text-down">
            {risk.drawdown.max.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Concentration Warnings */}
      {risk.concentration.warnings.length > 0 && (
        <div className="mt-4 p-2 bg-warning/10 rounded">
          <div className="text-xs font-semibold text-warning mb-1">Warnings</div>
          {risk.concentration.warnings.map(w => (
            <div key={w} className="text-xs text-warning">• {w}</div>
          ))}
        </div>
      )}

      {/* Beta Targeting */}
      <div className="mt-4">
        <div className="text-xs text-text-2">Beta: {risk.beta.current.toFixed(2)} (Target: {risk.beta.target})</div>
        <div className="text-xs">{risk.beta.adjustment}</div>
      </div>

      {/* Risk-On/Off */}
      <div className="mt-4 p-2 bg-surface rounded">
        <div className="text-sm font-semibold">
          Mode: {risk.riskOnOff.mode}
        </div>
        <div className="text-xs text-text-2">
          Equity Allocation: {risk.riskOnOff.equityAllocation}%
        </div>
      </div>
    </Card>
  )
}
```

**6.3 BAT Signal Display**
```typescript
// NEW: src/components/modules/BATSignalDisplay.tsx
export function BATSignalDisplay({
  signals,
}: {
  signals: BATSignal[]
}) {
  return (
    <Card variant="default">
      <h3 className="text-lg font-bold mb-4">BAT Signals (Buy After Trigger)</h3>

      <div className="space-y-3">
        {signals.map(signal => (
          <div
            key={signal.symbol}
            className={`p-3 rounded border ${
              signal.urgency === 'HIGH' ? 'border-accent-blue bg-accent-blue/10' :
              signal.urgency === 'MEDIUM' ? 'border-warning bg-warning/10' :
              'border-surface bg-surface'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold">{signal.symbol}</span>
                <Badge variant={signal.trigger.status === 'READY' ? 'success' : 'neutral'}>
                  {signal.trigger.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  {signal.trigger.type}
                </div>
                <div className="text-xs text-text-2">
                  {signal.distance.toFixed(1)}% to trigger
                </div>
              </div>
            </div>

            {/* Setup */}
            <div className="mt-2 text-xs">
              <div className="font-semibold">{signal.setup.pattern}</div>
              {signal.setup.confirmation.map(c => (
                <div key={c} className="text-text-2">✓ {c}</div>
              ))}
            </div>

            {/* Risk */}
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-text-2">Entry</div>
                <div>{signal.risk.entryZone[0].toFixed(2)} - {signal.risk.entryZone[1].toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-2">Stop</div>
                <div className="text-down">{signal.risk.stopLoss.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-text-2">Targets</div>
                <div className="text-up">{signal.risk.target[0].toFixed(0)}+</div>
              </div>
              <div>
                <div className="text-text-2">R:R</div>
                <div>{signal.risk.riskReward}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

**6.4 Updated Homepage Layout**
```typescript
// UPDATE: src/app/page.tsx
export default async function HomePage() {
  const [recommendations, risk, batSignals, insights] = await Promise.all([
    fetchStockRecommendations(),
    fetchPortfolioRisk(),
    fetchBATSignals(),
    fetchInsights(),
  ])

  return (
    <div className="space-y-6">
      {/* Top Row: Risk Status + Top Picks */}
      <ResponsiveGrid preset="half">
        <RiskDashboardWidget risk={risk} />
        <TopPicksWidget recommendations={recommendations} />
      </ResponsiveGrid>

      {/* Second Row: Stock Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.strongBuy.map(r => (
          <StockRecommendationCard key={r.symbol} recommendation={r} />
        ))}
      </div>

      {/* Third Row: BAT Signals + 6 Questions */}
      <ResponsiveGrid preset="default">
        <BATSignalDisplay signals={batSignals} />
        <InsightsModule insights={insights} />
      </ResponsiveGrid>

      {/* Existing modules below */}
      {/* ... */}
    </div>
  )
}
```

**Deliverables:**
- ✅ StockRecommendationCard component
- ✅ RiskDashboardWidget component
- ✅ BATSignalDisplay component
- ✅ Updated homepage layout
- ✅ Compact design

**Acceptance:**
- All new components responsive
- Professional finance UI
- Numbers prominent over colors

---

### Phase 7: Polish & Optimization (Week 7-8)
**Priority:** ⭐⭐ MEDIUM
**Dependencies:** All previous phases

#### Tasks

**7.1 Performance Optimization**
- Implement aggressive caching
- Optimize image loading
- Code splitting

**7.2 Data Quality Monitoring**
- Real-time health checks
- Missing data alerts
- Confidence score validation

**7.3 Documentation**
- API documentation
- Component documentation
- User guide

**7.4 Testing**
- Unit tests for all new services
- Integration tests for API routes
- E2E tests for critical flows

---

## 📊 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Stock Picks Quality | N/A | >70% win rate | Track actual performance |
| Time to Actionable Trade | >30 min | <5 min | From login to trade decision |
| Risk Warning Accuracy | N/A | >80% | Drawdown prediction |
| Foreign Impact Model | N/A | >70% | SET move prediction |
| API Response Time | 2-3s | <500ms | P95 response time |
| User Satisfaction | N/A | >4/5 | Survey feedback |

---

## 🗂️ File Structure Summary

### New Files to Create

```
src/types/
├── stock-recommendation.ts [NEW]
├── portfolio-risk.ts [NEW]
├── bat-signals.ts [NEW]
└── thai-market.ts [NEW]

src/services/
├── historical-data/
│   ├── collector.ts [NEW]
│   ├── pipeline.ts [NEW]
│   └── types.ts [NEW]
├── trends/
│   ├── pre-aggregator.ts [NEW]
│   └── calculator.ts [NEW]
├── stock-recommendation/
│   ├── generator.ts [NEW]
│   ├── calculator.ts [NEW]
│   └── scorer.ts [NEW]
├── portfolio-risk/
│   ├── calculator.ts [NEW]
│   ├── concentration.ts [NEW]
│   └── var.ts [NEW]
├── thai-market/
│   ├── foreign-flow-impact.ts [NEW]
│   ├── prop-monitor.ts [NEW]
│   └── regional.ts [NEW]
├── bat-signals/
│   ├── generator.ts [NEW]
│   ├── breakout.ts [NEW]
│   ├── pullback.ts [NEW]
│   └── reversal.ts [NEW]

src/app/api/
├── trends/route.ts [NEW]
├── current/route.ts [NEW]
├── stock-recommendations/route.ts [NEW]
├── portfolio-risk/route.ts [NEW]
├── bat-signals/route.ts [NEW]
└── thai-market/route.ts [NEW]

src/components/modules/
├── StockRecommendationCard.tsx [NEW]
├── RiskDashboardWidget.tsx [NEW]
├── BATSignalDisplay.tsx [NEW]
└── TopPicksWidget.tsx [NEW]
```

---

## 🎯 Final Implementation Checklist

### Phase 1: Historical Data Pipeline (Week 1-2)
- [ ] Create historical data collector
- [ ] Implement 60-day lookback
- [ ] Create trend pre-aggregator
- [ ] Setup /trends RTDB path
- [ ] Create /api/trends endpoint
- [ ] Create /api/current endpoint
- [ ] Verify 60-day coverage
- [ ] Measure query reduction

### Phase 2: Stock Recommendations (Week 2-3)
- [ ] Define StockRecommendation types
- [ ] Create stock scoring algorithm
- [ ] Implement sector momentum scoring
- [ ] Implement smart money scoring
- [ ] Implement ranking strength scoring
- [ ] Implement volume breakout scoring
- [ ] Create entry/exit calculator
- [ ] Create /api/stock-recommendations endpoint
- [ ] Generate 5-10 picks daily
- [ ] Verify risk-reward >= 1:2

### Phase 3: Risk Management (Week 3-4)
- [ ] Define PortfolioRisk types
- [ ] Create VaR calculator
- [ ] Create drawdown calculator
- [ ] Create concentration analyzer
- [ ] Create beta targeting system
- [ ] Implement Risk-On/Off detector
- [ ] Create /api/portfolio-risk endpoint
- [ ] Verify confidence scores

### Phase 4: Thai Market Features (Week 4-5)
- [ ] Define ThaiMarket types
- [ ] Create foreign flow impact model
- [ ] Create prop trading monitor
- [ ] Implement SET vs regional comparison
- [ ] Calibrate to Thai market
- [ ] Create /api/thai-market endpoint
- [ ] Validate foreign impact accuracy

### Phase 5: BAT Signals (Week 5-6)
- [ ] Define BATSignal types
- [ ] Create breakout detector
- [ ] Create pullback detector
- [ ] Create reversal detector
- [ ] Implement trigger distance calc
- [ ] Create entry zone calculator
- [ ] Create /api/bat-signals endpoint
- [ ] Generate 5-10 signals daily

### Phase 6: UI Components (Week 6-7)
- [ ] Create StockRecommendationCard
- [ ] Create RiskDashboardWidget
- [ ] Create BATSignalDisplay
- [ ] Create TopPicksWidget
- [ ] Update homepage layout
- [ ] Implement responsive design
- [ ] Apply professional styling
- [ ] Verify mobile compatibility

### Phase 7: Polish & Optimization (Week 7-8)
- [ ] Implement caching strategy
- [ ] Add performance monitoring
- [ ] Create data quality checks
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Create documentation
- [ ] Final review and deploy

---

## Summary

This plan transforms fonPick from a **market awareness tool** (current: 6/10) to an **actionable investment platform** (target: 9/10).

### Key Transformations:

| Before | After |
|--------|-------|
| "Focus on Technology sector" | "KBANK: Buy @ 128-130, Stop 124, Targets 138/145/155" |
| "Aggressive volatility" | "Daily VaR: 2.3%, Reduce equity to 65%" |
| "Foreign buying 500M" | "Foreign > 500M = 1.5% SET gain expected, 75% probability" |
| "6 questions answered" | "6 questions + 5-10 actionable trades + risk alerts" |

### Investment Value:
- **Time to Trade Decision:** >30 min → <5 min
- **Confidence:** Estimated → Evidence-based (60-day history)
- **Risk Management:** Basic label → VaR + concentration + beta
- **Thai Market:** Generic → Foreign flow calibrated

**Estimated Effort:** 6-8 weeks
**Team Size:** 2-3 developers
**Budget:** Mid-range project

---

**Document Version:** 1.0
**Last Updated:** 2026-01-25
**Status:** Ready for Implementation
