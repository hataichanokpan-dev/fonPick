# หลักการและสูตรการคำนวณ FonPick Dashboard

**เอกสารฉบับนี้สรุปหลักการ สูตร และแนวคิดการคำนวณทั้งหมด**
**สำหรับการพัฒนาและบำรุงรักษา FonPick Dashboard**

---

## สารบัญ

1. [ปรัชญาการลงทุน](#1-ปรัชญาการลงทุน)
2. [สถาปัตยกรรมข้อมูล](#2-สถาปัตยกรรมข้อมูล)
3. [P0: Market Regime Detection](#3-p0-market-regime-detection)
4. [P0: Smart Money Analysis](#4-p0-smart-money-analysis)
5. [P1: Sector Rotation Analysis](#5-p1-sector-rotation-analysis)
6. [P2: Active Stocks Concentration](#6-p2-active-stocks-concentration)
7. [Architectural Decisions](#7-architectural-decisions)
8. [Scaling Considerations](#8-scaling-considerations)

---

## 1. ปรัชญาการลงทุน

### 1.1 หลักการพื้นฐาน

FonPick Dashboard สร้างมาจาก **ปรัชญา "Follow Smart Money"** (ตามเงินฉลาด) โดยอาศัยหลักการ:

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE PHILOSOPHY                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Follow Smart Money                                       │
│    → Foreign + Institution = นำตลาด                      │
│    → Retail = Contrarian indicator (ใช้ดู sentiment)       │
├─────────────────────────────────────────────────────────────┤
│ 2. Regime-Based Allocation                                  │
│    → Risk-On: Focus หุ้นเสี่ยง (Tech, Finance)            │
│    → Risk-Off: Focus หุ้นป้องกัน (Food, Health)          │
├─────────────────────────────────────────────────────────────┤
│ 3. Sector Rotation                                          │
│    → ติดตามการไหลเข้า-ออกของเงินระหว่าง sectors   │
│    → Entry signal = สะสมตำแหน่ง                         │
│    → Exit signal = ลด exposure                             │
├─────────────────────────────────────────────────────────────┤
│ 4. Concentration Awareness                                  │
│    → สูง = ตลาดบอบบาง (few stocks)                      │
│    → ต่ำ = ตลาดแข็งแกร่ง (broad participation)         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 ลำดับการตัดสินใจ (Decision Hierarchy)

```
Step 1: Market Regime (P0)
  ├─ Risk-On?  → Focus: Cyclical sectors
  ├─ Risk-Off? → Focus: Defensive sectors
  └─ Neutral?  → Focus: Quality names

Step 2: Smart Money Confirmation (P0)
  ├─ Foreign + Institution buying? → Confirm Risk-On
  ├─ Foreign + Institution selling? → Confirm Risk-Off
  └─ Prop reducing sell volume? → Bullish (Thai specific)

Step 3: Sector Selection (P1)
  ├─ Entry signals → Accumulate
  ├─ Exit signals → Reduce
  └─ Hold signals → Maintain

Step 4: Stock Selection (P2)
  ├─ Cross-ranked stocks → True strength
  └─ High concentration → Market leaders
```

---

## 2. สถาปัตยกรรมข้อมูล

### 2.1 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCE LAYER                       │
│  Firebase RTDB (/settrade)                                  │
│  ├── marketOverview/byDate/{YYYY-MM-DD}                     │
│  ├── investorType/byDate/{YYYY-MM-DD}                       │
│  ├── industrySector/byDate/{YYYY-MM-DD}                     │
│  ├── topRankings/byDate/{YYYY-MM-DD}                        │
│  └── nvdr/byDate/{YYYY-MM-DD}                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA FETCHING LAYER                     │
│  src/lib/rtdb/client.ts                                     │
│  ├── fetchWithFallback() - รองรับ weekend/holiday        │
│  └── fetchLatestAvailable() - หาวันล่าสุดที่มีข้อมูล│
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│  src/app/api/market-intelligence/route.ts                   │
│  ├── Promise.allSettled (parallel fetch)                    │
│  ├── aggregateMarketIntelligence()                          │
│  └── Cache: 30s CDN + 60s stale-while-revalidate           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SIGNAL PROCESSING LAYER                    │
│  src/services/market-intelligence/                          │
│  ├── Market Regime (P0)                                     │
│  ├── Smart Money (P0)                                       │
│  ├── Sector Rotation (P1)                                   │
│  └── Concentration (P2)                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  React Components (MarketRegimeCard, SmartMoneyCard, etc.)  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Cache Strategy

```typescript
// API Response Headers
Cache-Control: public, s-maxage=30, stale-while-revalidate=60
CDN-Cache-Control: public, s-maxage=30

// Interpretation:
- 30s: ข้อมูล fresh ที่สุด
- 60s: ให้ serve stale data ระหว่าง revalidate
- ป้องกัน RTDB overload
```

### 2.3 Error Handling Strategy

**Pattern: Always-Return-200**

```typescript
// API ไม่เคย throw error ไปยัง client
// เสมอ return 200 พร้อม error field
{
  success: boolean,
  error?: string,
  data?: { ... }
}

// Frontend ตรวจสอบ:
if (response.error) {
  // Show error state
} else if (response.data) {
  // Show data
}
```

---

## 3. P0: Market Regime Detection

### 3.1 วัตถุประสงค์

ตอบคำถาม: **"ตอนนี้ตลาดอยู่ในสถานะ Risk-On หรือ Risk-Off?"**

### 3.2 Input Parameters

| Parameter | Source | หน่วย |
|-----------|--------|-------|
| SET Index Change | `marketOverview.set.changePercent` | % |
| Foreign Net Flow | `investorType.rows[FOREIGN].net` | ล้านบาท |
| Institution Net Flow | `investorType.rows[LOCAL_INST].net` | ล้านบาท |
| Cyclical Performance | Average of cyclical sectors | % |
| Defensive Performance | Average of defensive sectors | % |
| Liquidity Ratio | Current Volume / Average Volume | ratio |

### 3.3 Default Thresholds

```typescript
const DEFAULT_THRESHOLDS = {
  // SET Index thresholds
  SET_CHANGE_STRONG: 0.5,    // % เปลี่ยนแปลงที่ถือว่าแข็งแกร่ง
  SET_CHANGE_WEAK: -0.5,     // % เปลี่ยนแปลงที่ถือว่าอ่อนแอ

  // Flow thresholds (ล้านบาท)
  STRONG_FLOW: 100,          // Flow ที่ถือว่าแข็งแกร่ง
  WEAK_FLOW: -100,           // Flow ที่ถือว่าอ่อนแอ

  // Liquidity thresholds
  HIGH_LIQUIDITY: 1.2,       // Volume เหนือกว่า average 20%
  LOW_LIQUIDITY: 0.8,        // Volume ต่ำกว่า average 20%
}
```

### 3.4 Risk-On Score Calculation (0-10 คะแนน)

```typescript
function calculateRiskOnScore(input: RegimeInput): number {
  let score = 0

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rule 1: SET Direction (สูงสุด 2 คะแนน)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (input.setChange > 0.5) {      // แข็งแกร่ง
    score += 2
  } else if (input.setChange > 0) { // เล็กน้อย
    score += 1
  }
  // setChange ≤ 0 → ไม่ได้คะแนน

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rule 2: Foreign Flow (สูงสุด 2 คะแนน)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (input.foreignNet > 100) {     // ซื้อหนัก
    score += 2
  } else if (input.foreignNet > 0) { // ซื้อเล็กน้อย
    score += 1
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rule 3: Institution Flow (สูงสุด 2 คะแนน)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (input.institutionNet > 100) {  // ซื้อหนัก
    score += 2
  } else if (input.institutionNet > 0) { // ซื้อเล็กน้อย
    score += 1
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rule 4: Sector Behavior (สูงสุด 2 คะแนน)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const cyclicalsOutperforming =
    input.cyclicalPerformance > input.defensivePerformance

  if (cyclicalsOutperforming && input.setChange > 0) {
    score += 2  // Cyclical นำตลาดขึ้น
  } else if (input.sectorOverall > 0) {
    score += 1  // Sector ส่วนใหญ่ขึ้น
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Rule 5: Liquidity (สูงสุด 2 คะแนน)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (input.liquidity > 1.2) {      // High volume
    score += 2
  } else if (input.liquidity > 1) { // Above average
    score += 1
  }

  return score  // 0-10 scale
}
```

### 3.5 Risk-Off Score Calculation (0-10 คะแนน)

```typescript
function calculateRiskOffScore(input: RegimeInput): number {
  let score = 0

  // Inverse logic of Risk-On

  // Rule 1: SET Direction (inverse)
  if (input.setChange < -0.5) {     // ลงหนัก
    score += 2
  } else if (input.setChange < 0) { // ลงเล็กน้อย
    score += 1
  }

  // Rule 2: Foreign Flow (inverse)
  if (input.foreignNet < -100) {    // ขายหนัก
    score += 2
  } else if (input.foreignNet < 0) { // ขายเล็กน้อย
    score += 1
  }

  // Rule 3: Institution Flow (inverse)
  if (input.institutionNet < -100) { // ขายหนัก
    score += 2
  } else if (input.institutionNet < 0) { // ขายเล็กน้อย
    score += 1
  }

  // Rule 4: Sector Behavior (defensive outperforming)
  const defensiveOutperforming =
    input.defensivePerformance > input.cyclicalPerformance

  if (defensiveOutperforming && input.setChange < 0) {
    score += 2  // Defensive นำตลาดลง
  } else if (input.sectorOverall < 0) {
    score += 1
  }

  // Rule 5: Liquidity (low volume = risk-off)
  if (input.liquidity < 0.8) {      // Low volume
    score += 2
  } else if (input.liquidity < 1) { // Below average
    score += 1
  }

  return score  // 0-10 scale
}
```

### 3.6 Regime Determination

```typescript
function determineRegime(
  riskOnScore: number,
  riskOffScore: number
): { regime: MarketRegime, confidence: RegimeConfidence } {

  const scoreDiff = riskOnScore - riskOffScore

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Decision Logic
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (scoreDiff >= 2) {
    // Risk-On confirmed
    const confidence = riskOnScore >= 7 ? 'High' : 'Medium'
    return { regime: 'Risk-On', confidence }

  } else if (scoreDiff <= -2) {
    // Risk-Off confirmed
    const confidence = riskOffScore >= 7 ? 'High' : 'Medium'
    return { regime: 'Risk-Off', confidence }

  } else {
    // Neutral (scores are close)
    const totalScore = riskOnScore + riskOffScore
    const confidence = totalScore >= 10 ? 'Medium' : 'Low'
    return { regime: 'Neutral', confidence }
  }
}
```

### 3.7 Example Calculation

```
Input:
- SET Change: +0.8%
- Foreign Net: +350M
- Institution Net: +200M
- Cyclical: +1.2%, Defensive: +0.3%
- Liquidity: 1.3

Risk-On Score:
- SET Direction: 2 (strong positive)
- Foreign Flow: 2 (strong buy)
- Institution Flow: 2 (strong buy)
- Sector Behavior: 2 (cyclicals leading)
- Liquidity: 2 (high volume)
Total: 10/10

Risk-Off Score:
- All rules: 0
Total: 0/10

Result:
- Score Diff: 10 - 0 = 10 (>> 2)
- Regime: Risk-On
- Confidence: High
```

---

## 4. P0: Smart Money Analysis

### 4.1 วัตถุประสงค์

ตอบคำถาม: **"Smart Money ทำอะไรอยู่?"**

### 4.2 Investor Types & Weights

| Investor Type | Weight | ความสำคัญ | เหตุผล |
|---------------|--------|------------|---------|
| **Foreign** | 50 points (×1.2) | สูงสุด | มีเงินมากที่สุด เห็นภาพกว้าง |
| **Institution** | 50 points | สูง | มีข้อมูลดีกว่า วิเคราะห์ลึก |
| **Retail** | 25 points (×0.25) | ต่ำ-ปานกลาง | Contrarian indicator |
| **Prop** | 25 points (×0.25) | ต่ำ-ปานกลาง | Amplifier ในตลาดไทย |

### 4.3 Signal Strength Thresholds

```typescript
const SIGNAL_THRESHOLDS = {
  STRONG_BUY:  +500,  // ล้านบาท
  BUY:         +100,
  NEUTRAL_MIN: -100,
  SELL:        -100,
  STRONG_SELL: -500,
}
```

### 4.4 Individual Score Calculation (0-50 points)

```typescript
function calculateIndividualScore(analysis: InvestorAnalysis): number {
  let score = 25  // Start at midpoint

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Signal Strength Adjustment
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  switch (analysis.strength) {
    case 'Strong Buy':
      score += 20  // → 45
      break
    case 'Buy':
      score += 10  // → 35
      break
    case 'Strong Sell':
      score -= 20  // → 5
      break
    case 'Sell':
      score -= 10  // → 15
      break
    // Neutral: no change (25)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Trend Adjustment
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (analysis.trend === 'Accelerating Buy') {
    score += 5
  } else if (analysis.trend === 'Accelerating Sell') {
    score -= 5
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5-Day Trend Adjustment
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (analysis.trend5Day > 200) {
    score += 3   // Sustained buying
  } else if (analysis.trend5Day < -200) {
    score -= 3   // Sustained selling
  }

  return Math.max(0, Math.min(50, score))  // Clamp to [0, 50]
}
```

### 4.5 Combined Smart Money Score (0-100)

```typescript
function calculateSmartMoneyScore(
  foreign: InvestorAnalysis,
  institution: InvestorAnalysis,
  retail?: InvestorAnalysis,
  prop?: InvestorAnalysis
): SmartMoneyScoreComponents {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Smart Money (Foreign + Institution) = 80% weight
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const foreignScore = calculateIndividualScore(foreign) * 1.2
  const institutionScore = calculateIndividualScore(institution)

  // Smart Money Total (0-100)
  const smartMoneyTotal = Math.min(100, foreignScore + institutionScore)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Context Investors (Retail + Prop) = 20% weight
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const retailScore = retail
    ? calculateIndividualScore(retail) * 0.25
    : 0

  const propScore = prop
    ? calculateIndividualScore(prop) * 0.25
    : 0

  const contextTotal = retailScore + propScore

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Total Score (0-100)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const totalScore = Math.min(100,
    smartMoneyTotal * 0.8 + contextTotal * 0.2
  )

  return {
    foreignScore: Math.min(50, foreignScore),
    institutionScore: Math.min(50, institutionScore),
    retailScore: Math.min(25, retailScore),
    propScore: Math.min(25, propScore),
    totalScore,
  }
}
```

### 4.6 Combined Signal Matrix

| Total Net Flow | Combined Signal | Risk Signal |
|----------------|----------------|-------------|
| ≥ +600M | Strong Buy | Risk-On |
| ≥ +100M | Buy | Risk-On (Mild) |
| -100M ~ +100M | Neutral | Neutral |
| ≤ -100M | Sell | Risk-Off (Mild) |
| ≤ -600M | Strong Sell | Risk-Off |

### 4.7 Primary Driver Detection

```typescript
function detectPrimaryDriver(scores: SmartMoneyScoreComponents): {
  driver: InvestorType
  confidence: number
} {
  const { foreignScore, institutionScore, retailScore, propScore } = scores

  // Find highest scorer
  const maxScore = Math.max(
    foreignScore,
    institutionScore,
    retailScore,
    propScore
  )

  if (maxScore === foreignScore) {
    return {
      driver: 'Foreign',
      confidence: (foreignScore / 50) * 100
    }
  }
  // ... similar for others

  return { driver: 'Foreign', confidence: 50 }  // default
}
```

### 4.8 Thai Market Specific: Prop Trading

```typescript
function analyzePropTrading(propFlow: FlowData): string {
  const absFlow = Math.abs(propFlow.net)

  if (propFlow.net < 0) {  // Prop กำลังขาย
    if (absFlow < 200) {
      // Light selling = BULLISH (ลดแรงขาย)
      return "Prop firms reducing sell volume"
    } else {
      // Heavy selling = BEARISH (amplifying risk)
      return "Prop firms heavy selling"
    }
  }

  return "Prop firms buying"
}
```

---

## 5. P1: Sector Rotation Analysis

### 5.1 วัตถุประสงค์

ตอบคำถาม: **"Sector ไหนน่า Focus?"**

### 5.2 Sector Classification

**Cyclical Sectors (สูงความเสี่ยง):**
- BANKING, FIN, ICT, ENERGY, CONS, COMM

**Defensive Sectors (ต่ำความเสี่ยง):**
- FOOD, HELTH, UTIL, PROP, PF

### 5.3 Momentum Classification Thresholds

```typescript
const ROTATION_THRESHOLDS = {
  STRONG_OUTPERFORM: +1.5,   // % points above market
  OUTPERFORM:        +0.5,
  INLINE:            -0.5,   // Within ±0.5% of market
  UNDERPERFORM:      -1.5,
  SIGNIFICANT_LAG:   < -1.5,
}
```

### 5.4 vsMarket Calculation

```typescript
// วัด performance เทียบกับตลาด
vsMarket = sector.changePercent - market.changePercent

// Example:
//   Sector ICT: +2.5%
//   Market SET: +0.8%
//   vsMarket = 2.5 - 0.8 = +1.7% (Strong Outperform)
```

### 5.5 Momentum Classification

```typescript
function classifySectorMomentum(vsMarket: number): SectorMomentum {
  if (vsMarket >= +1.5) return 'Strong Outperform'
  if (vsMarket >= +0.5) return 'Outperform'
  if (vsMarket >= -0.5) return 'In-line'
  if (vsMarket >= -1.5) return 'Underperform'
  return 'Significant Lag'
}
```

### 5.6 Rotation Signal Detection

```typescript
function detectRotationSignal(
  sector: RTDBSector,
  marketChange: number,
  historicalChange?: number
): { signal: RotationSignal, confidence: number } {

  const vsMarket = sector.changePercent - marketChange
  const momentum = classifySectorMomentum(vsMarket)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Entry Signal (เงินไหลเข้า)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (momentum === 'Outperform' || momentum === 'Strong Outperform') {
    if (historicalChange !== undefined) {
      const improvement = sector.changePercent - historicalChange

      if (improvement > 0.5) {
        return {
          signal: 'Entry',
          confidence: Math.min(85, 60 + Math.abs(vsMarket) * 10)
        }
      }
    }

    return {
      signal: 'Accumulate',
      confidence: Math.min(70, 50 + Math.abs(vsMarket) * 8)
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Exit Signal (เงินไหลออก)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (momentum === 'Underperform' || momentum === 'Significant Lag') {
    if (historicalChange !== undefined) {
      const deterioration = historicalChange - sector.changePercent

      if (deterioration > 0.5) {
        return {
          signal: 'Exit',
          confidence: Math.min(85, 60 + Math.abs(vsMarket) * 10)
        }
      }
    }

    return {
      signal: 'Distribute',
      confidence: Math.min(70, 50 + Math.abs(vsMarket) * 8)
    }
  }

  return { signal: 'Hold', confidence: 50 }
}
```

### 5.7 Rotation Pattern Detection

```typescript
function detectRotationPattern(sectors: RTDBSector[]): RotationPattern {
  const cyclicals = sectors.filter(s => isCyclical(s))
  const defensive = sectors.filter(s => isDefensive(s))

  const cyclicalAvg = cyclicals.reduce((sum, s) => sum + s.changePercent, 0) / cyclicals.length
  const defensiveAvg = defensive.reduce((sum, s) => sum + s.changePercent, 0) / defensive.length

  const outperformingCount = sectors.filter(s =>
    (s.changePercent - marketChange) > 0
  ).length

  const outperformRatio = outperformingCount / sectors.length

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Pattern Detection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (outperformRatio >= 0.6) {
    return 'Broad-Based Advance'  // ≥60% sectors outperforming
  }

  if (cyclicalAvg - defensiveAvg > 1.0) {
    return 'Risk-On Rotation'  // Cyclical > Defensive + 1%
  }

  if (defensiveAvg - cyclicalAvg > 1.0) {
    return 'Risk-Off Rotation'  // Defensive > Cyclical + 1%
  }

  return 'Mixed Rotation'
}
```

### 5.8 Sector Selection by Percentile

```typescript
function selectSectorsByPercentile(
  sectors: RTDBSector[],
  topPercentile: number = 30,
  bottomPercentile: number = 30
): { leaders: RTDBSector[], laggards: RTDBSector[] } {

  // Sort by changePercent descending
  const sorted = [...sectors].sort((a, b) =>
    b.changePercent - a.changePercent
  )

  const total = sorted.length

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Percentile-based selection with guardrails
  // Minimum 3 sectors, Maximum 6 sectors
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const topCount = Math.min(6, Math.max(3,
    Math.ceil((topPercentile / 100) * total)
  ))

  const bottomCount = Math.min(6, Math.max(3,
    Math.ceil((bottomPercentile / 100) * total)
  ))

  const leaders = sorted.slice(0, topCount)
  const laggards = sorted.slice(-bottomCount).reverse()

  return { leaders, laggards }
}
```

### 5.9 Concentration Metrics (HHI)

```typescript
function calculateSectorConcentration(sectors: RTDBSector[]): {
  hhi: number
  interpretation: ConcentrationLevel
} {
  const totalMarketCap = sectors.reduce((sum, s) =>
    sum + (s.marketCap || 0), 0
  )

  // Calculate market shares
  const shares = sectors.map(s =>
    (s.marketCap || 0) / totalMarketCap
  )

  // HHI = Σ(share²) × 10000
  const hhi = shares.reduce((sum, share) =>
    sum + share * share, 0
  ) * 10000

  // Interpretation
  let interpretation: ConcentrationLevel
  if (hhi > 2000) {
    interpretation = 'Highly Concentrated'
  } else if (hhi > 1500) {
    interpretation = 'Moderately Concentrated'
  } else {
    interpretation = 'Broadly Distributed'
  }

  return { hhi, interpretation }
}
```

---

## 6. P2: Active Stocks Concentration

### 6.1 วัตถุประสงค์

ตอบคำถาม: **"หุ้นไหนโดนพูดถึงหลายด้าน?"**

### 6.2 Cross-Ranking Detection

```typescript
function detectCrossRankings(
  rankings: MarketRankings
): CrossRankedStock[] {

  const stockMap = new Map<string, CrossRankedStock>()

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Helper: Add stock to map
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const addStock = (
    symbol: string,
    name: string,
    category: 'value' | 'volume' | 'gainer' | 'loser',
    rank: number
  ) => {
    if (!stockMap.has(symbol)) {
      stockMap.set(symbol, {
        symbol,
        name,
        rankings: {},
        rankingCount: 0,
        strengthScore: 0
      })
    }

    const stock = stockMap.get(symbol)!
    stock.rankings[category] = rank
    stock.rankingCount = Object.keys(stock.rankings).length
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Process each ranking category
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  rankings.topValue.forEach((s, i) =>
    addStock(s.symbol, s.name, 'value', i + 1)
  )

  rankings.topVolume.forEach((s, i) =>
    addStock(s.symbol, s.name, 'volume', i + 1)
  )

  rankings.topGainers.forEach((s, i) =>
    addStock(s.symbol, s.name, 'gainer', i + 1)
  )

  rankings.topLosers.forEach((s, i) =>
    addStock(s.symbol, s.name, 'loser', i + 1)
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Calculate strength score
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  stockMap.forEach(stock => {
    stock.strengthScore = calculateStrengthScore(stock.rankings)
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Return only cross-ranked stocks (≥2 rankings)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return Array.from(stockMap.values())
    .filter(s => s.rankingCount >= 2)
}
```

### 6.3 Strength Score Calculation

```typescript
function calculateStrengthScore(
  rankings: Record<string, number>
): number {
  const values = Object.values(rankings)

  if (values.length === 0) return 0

  // Lower rank = Higher score
  // Rank 1 = 100 points, Rank 2 = 90 points, etc.
  const scores = values.map(rank =>
    Math.max(0, 100 - (rank - 1) * 10)
  )

  // Average across all rankings
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}
```

### 6.4 Concentration Metrics

```typescript
function calculateConcentrationMetrics(
  topValue: StockValue[],
  totalMarketValue: number
): ConcentrationMetrics {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Top 10 Concentration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const top10Value = topValue.slice(0, 10)
    .reduce((sum, s) => sum + (s.value || 0), 0)

  const top10Concentration = (top10Value / totalMarketValue) * 100

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Top 5 Concentration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const top5Value = topValue.slice(0, 5)
    .reduce((sum, s) => sum + (s.value || 0), 0)

  const top5Concentration = (top5Value / totalMarketValue) * 100

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HHI Calculation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const marketShares = topValue.slice(0, 10)
    .map(s => (s.value || 0) / totalMarketValue)

  const hhi = marketShares.reduce((sum, share) =>
    sum + share * share, 0
  ) * 10000

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Interpretation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let interpretation: ConcentrationLevel
  if (top5Concentration > 50 || hhi > 2000) {
    interpretation = 'Highly Concentrated'
  } else if (top5Concentration > 30 || hhi > 1500) {
    interpretation = 'Moderately Concentrated'
  } else {
    interpretation = 'Broadly Distributed'
  }

  return {
    top10ValueConcentration: Math.round(top10Concentration),
    top5StockConcentration: Math.round(top5Concentration),
    hhi: Math.round(hhi),
    interpretation,
    totalValue: totalMarketValue
  }
}
```

### 6.5 Cross-Rank Badge Display

```typescript
function getCrossRankBadge(stock: CrossRankedStock): {
  label: string
  color: 'buy' | 'watch' | 'neutral'
} {
  const count = stock.rankingCount
  const score = stock.strengthScore

  // Badge label: "SYMBOL (count)"
  const label = `${stock.symbol} (${count})`

  // Color based on strength score
  let color: 'buy' | 'watch' | 'neutral'
  if (score >= 70) {
    color = 'buy'
  } else if (score >= 50) {
    color = 'watch'
  } else {
    color = 'neutral'
  }

  return { label, color }
}
```

---

## 7. Architectural Decisions

### ADR-001: Priority-Based Signal Architecture

**Context:** ต้องประมวลผล signals หลายประเภทให้เป็นระเบียบ

**Decision:** ใช้ P0/P1/P2 tiered architecture

**Rationale:**
- P0 = Market regime (สำคัญที่สุด)
- P1 = Sector selection (สำคัญรองลงมา)
- P2 = Stock selection (รายละเอียด)

**Consequences:**
- ✅ Clear decision hierarchy
- ✅ Modular (ปิด P1/P2 ได้เพื่อ performance)
- ❌ ซับซ้อนกว่า flat architecture

### ADR-002: Deterministic Scoring Rules

**Context:** ต้องการ regime detection ที่ reproducible

**Decision:** ใช้ explicit scoring rules (ไม่ใช่ ML)

**Rationale:**
- โปร่งใส (transparent)
- ง่ายต่อการ debug
- Consistent behavior

**Consequences:**
- ✅ Explainable
- ✅ Easy to tune
- ❌ Less adaptive than ML

### ADR-003: Parallel Fetching with Graceful Degradation

**Context:** RTDB sources หลายที่, บางที่อาจ fail

**Decision:** Promise.allSettled + null fallbacks

**Rationale:**
- Partial failures ไม่ block response
- Better UX

**Consequences:**
- ✅ Always get some data
- ❌ Cannot distinguish "no data" vs "error"

### ADR-004: Percentile-Based Sector Selection

**Context:** Absolute thresholds ใช้ไม่ได้ในตลาดผันผวนต่ำ

**Decision:** Percentile-based (min 3 sectors)

**Rationale:**
- Works in all market conditions
- Always returns leaders/laggards

**Consequences:**
- ✅ Robust
- ❌ May include weak sectors in flat markets

---

## 8. Scaling Considerations

### Current Capacity: ~10K users

**Bottlenecks:**
- RTDB connections: 100 concurrent
- API processing: ~200ms per request
- CDN cache hit ratio: Critical

### Scaling Plan

**10K → 100K users:**
- Redis caching layer (30s TTL)
- WebSocket for real-time
- Optimize RTDB queries

**100K → 1M users:**
- Microservices architecture
- Separate read/write databases
- Edge computing (Cloudflare Workers)

**1M+ users:**
- Event-driven (Kafka)
- Redis Cluster
- Multi-region deployment

---

## ไฟล์อ้างอิง

| Component | Path |
|-----------|------|
| API Endpoint | `src/app/api/market-intelligence/route.ts` |
| Aggregator | `src/services/market-intelligence/aggregator.ts` |
| Market Regime | `src/services/market-regime/` |
| Smart Money | `src/services/smart-money/signal.ts` |
| Sector Rotation | `src/services/sector-rotation/detector.ts` |
| RTDB Client | `src/lib/rtdb/client.ts` |
| Types | `src/types/market-intelligence.ts` |

---

**เอกสารนี้อัปเดตล่าสุด:** 25 มกราคม 2026
**เวอร์ชัน:** 1.0
