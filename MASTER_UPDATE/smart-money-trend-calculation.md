# Smart Money Trend Calculation Plan
# แผนการคำนวณและวิเคราะห์ Smart Money Trend

**วันที่**: 2026-02-14
**สถานะ**: P0 Critical Feature
**ผู้รับผิดชอบ**: Backend Developer + Data Analyst

---

## Executive Summary

เอกสารฉบับนี้ระบุวิธีการคำนวณ **Smart Money Trend** สำหรับการตรวจจับและยืนยันแนวโน้มการไหลของเงินจาก **Foreign + Institutional Investors** ซึ่งเป็นสัญญาณที่สำคัญสำหรับ Swing Trading ในตลาดหุ้นไทย

**ความสำคัญ:** Smart Money ในตลาดหุ้นไทยควบคุม ~35-40% ของ market cap และมี information advantage ที่เหนือกว่า

---

## 1. Multi-Day Accumulation/Distribution Detection

### 1.1 Accumulation Pattern (การสะสมหุ้น)

**สูตร:**
```
Accumulation เกิดเมื่อ:
1. Smart Money Net Buy ติดกัน ≥ 3 วัน
2. Total Flow ในช่วงนั้น ≥ Threshold
3. Volume เพิ่มขึ้น (optional confirmation)
```

**Algorithm:**
```typescript
function detectAccumulation(
  foreignData: DailyTrendPoint[],
  institutionData: DailyTrendPoint[],
  threshold: number = 100  // Million THB
): {
  detected: boolean
  consecutiveDays: number
  totalFlow: number
  strength: number  // 0-100
  participants: {
    foreign: 'driving' | 'following' | 'absent' | 'opposing'
    institution: 'driving' | 'following' | 'absent' | 'opposing'
  }
} {
  // 1. รวม Smart Money Net (Foreign + Institution)
  const smartMoneyNet = foreignData.map((f, i) => ({
    date: f.date,
    net: f.net + (institutionData[i]?.net || 0),
    foreignNet: f.net,
    institutionNet: institutionData[i]?.net || 0,
  }))

  // 2. ตรวจสอบ Consecutive Buy Days
  let consecutiveDays = 0
  let maxConsecutiveDays = 0
  let totalFlow = 0

  for (const point of smartMoneyNet) {
    if (point.net > threshold) {
      consecutiveDays++
      totalFlow += point.net

      if (consecutiveDays > maxConsecutiveDays) {
        maxConsecutiveDays = consecutiveDays
      }
    } else {
      consecutiveDays = 0
    }
  }

  // 3. กำหนดว่าตรวจพบหรือไม่
  const detected = maxConsecutiveDays >= 3

  // 4. คำนวณ Strength (0-100)
  const strength = Math.min(100,
    maxConsecutiveDays * 15 + Math.abs(totalFlow) / 100
  )

  // 5. ระบุผู้มีส่วนร่วม
  const totalForeignFlow = foreignData.reduce((sum, d) => sum + d.net, 0)
  const totalInstitutionFlow = institutionData.reduce((sum, d) => sum + d.net, 0)
  const totalFlowAbs = Math.abs(totalFlow)

  const participants = {
    foreign: getParticipantRole(totalForeignFlow, totalFlowAbs, 200),
    institution: getParticipantRole(totalInstitutionFlow, totalFlowAbs, 200),
  }

  return {
    detected,
    consecutiveDays: maxConsecutiveDays,
    totalFlow,
    strength,
    participants,
  }
}

function getParticipantRole(
  investorNet: number,
  totalNet: number,
  threshold: number
): 'driving' | 'following' | 'absent' | 'opposing' {
  const absNet = Math.abs(investorNet)
  const pct = totalNet !== 0 ? Math.abs(investorNet / totalNet) : 0

  if (absNet < threshold) return 'absent'
  if (pct > 0.5 && investorNet * totalNet > 0) return 'driving'
  if (investorNet * totalNet > 0) return 'following'
  return 'opposing'
}
```

### 1.2 Distribution Pattern (การแจกจ่ายหุ้น)

**สูตร:**
```
Distribution เกิดเมื่อ:
1. Smart Money Net Sell ติดกัน ≥ 3 วัน
2. Total Flow ในช่วงนั้น ≤ -Threshold
3. Volume เพิ่มขึ้น (optional confirmation)
```

**Algorithm:**
```typescript
function detectDistribution(
  foreignData: DailyTrendPoint[],
  institutionData: DailyTrendPoint[],
  threshold: number = -100  // Million THB
): {
  detected: boolean
  consecutiveDays: number
  totalFlow: number
  strength: number  // 0-100
  participants: {
    foreign: 'driving' | 'following' | 'absent' | 'opposing'
    institution: 'driving' | 'following' | 'absent' | 'opposing'
  }
} {
  // 1. รวม Smart Money Net (Foreign + Institution)
  const smartMoneyNet = foreignData.map((f, i) => ({
    date: f.date,
    net: f.net + (institutionData[i]?.net || 0),
    foreignNet: f.net,
    institutionNet: institutionData[i]?.net || 0,
  }))

  // 2. ตรวจสอบ Consecutive Sell Days
  let consecutiveDays = 0
  let maxConsecutiveDays = 0
  let totalFlow = 0

  for (const point of smartMoneyNet) {
    if (point.net < threshold) {
      consecutiveDays++
      totalFlow += point.net

      if (consecutiveDays > maxConsecutiveDays) {
        maxConsecutiveDays = consecutiveDays
      }
    } else {
      consecutiveDays = 0
    }
  }

  // 3. กำหนดว่าตรวจพบหรือไม่
  const detected = maxConsecutiveDays >= 3

  // 4. คำนวณ Strength (0-100)
  const strength = Math.min(100,
    maxConsecutiveDays * 15 + Math.abs(totalFlow) / 100
  )

  // 5. ระบุผู้มีส่วนร่วม
  const totalForeignFlow = foreignData.reduce((sum, d) => sum + d.net, 0)
  const totalInstitutionFlow = institutionData.reduce((sum, d) => sum + d.net, 0)
  const totalFlowAbs = Math.abs(totalFlow)

  const participants = {
    foreign: getParticipantRole(totalForeignFlow, totalFlowAbs, 200),
    institution: getParticipantRole(totalInstitutionFlow, totalFlowAbs, 200),
  }

  return {
    detected,
    consecutiveDays: maxConsecutiveDays,
    totalFlow,
    strength,
    participants,
  }
}
```

---

## 2. Sustainability Score Calculation

### 2.1 Sustainability Score (0-100)

**ความหมาย:** คะแนนที่บ่งบอกว่า Trend ของ Smart Money นั้นยังยืนแค่ไหน

**สูตร:**
```typescript
function calculateSustainabilityScore(
  smartMoneyData: DailyTrendPoint[],
  period: number = 5
): {
  score: number  // 0-100
  confidence: 'low' | 'medium' | 'high'
  components: {
    consistency: number
    magnitude: number
    volumeConfirmation: number
  }
} {
  // 1. Consistency Score (0-40)
  // วัดความสม่ำเสมอของทิศทาง
  let consistentDays = 0
  for (let i = 1; i < smartMoneyData.length; i++) {
    const prev = smartMoneyData[i - 1].net
    const curr = smartMoneyData[i].net

    // ถ้าเครื่องหมายเหมือนกัน = consistent
    if ((prev > 0 && curr > 0) || (prev < 0 && curr < 0)) {
      consistentDays++
    }
  }
  const consistency = (consistentDays / (smartMoneyData.length - 1)) * 40

  // 2. Magnitude Score (0-30)
  // วัดขนาดของ flow
  const avgFlow = Math.abs(
    smartMoneyData.reduce((sum, d) => sum + d.net, 0) / smartMoneyData.length
  )
  const magnitude = Math.min(30, (avgFlow / 500) * 30)  // 500M = 30 points

  // 3. Volume Confirmation (0-30)
  // ตรวจสอบว่า volume เพิ่มขึ้นตาม smart money flow หรือไม่
  // (ถ้ามีข้อมูล volume)
  const volumeConfirmation = 15  // Default หากไม่มีข้อมูล

  // 4. Total Score
  const score = Math.round(consistency + magnitude + volumeConfirmation)

  // 5. Confidence Level
  let confidence: 'low' | 'medium' | 'high'
  if (score >= 70) confidence = 'high'
  else if (score >= 40) confidence = 'medium'
  else confidence = 'low'

  return {
    score,
    confidence,
    components: {
      consistency: Math.round(consistency),
      magnitude: Math.round(magnitude),
      volumeConfirmation,
    },
  }
}
```

### 2.2 Sustainability Score Levels

| Score | Confidence | Meaning | Swing Strategy |
|-------|------------|---------|----------------|
| **70-100** | High | Trend แข็งแรง, ยั่งยืน | Full position |
| **40-69** | Medium | Trend ปานกลาง | Half position |
| **0-39** | Low | Trend อ่อนแอ | Avoid |

---

## 3. Confirmation Status

### 3.1 Confirmation Logic

**สูตร:**
```
Confirmed เมื่อ:
1. Accumulation/Distribution ติดกัน ≥ 3 วัน (Minimum)
2. Sustainability Score ≥ 50 (Minimum)
3. ไม่มี Divergence ระหว่าง Smart Money และ Retail
```

**Algorithm:**
```typescript
function checkConfirmation(
  accumulation: ReturnType<typeof detectAccumulation>,
  sustainability: ReturnType<typeof calculateSustainabilityScore>,
  retailData: DailyTrendPoint[]
): {
  confirmed: boolean
  status: 'confirmed' | 'pending' | 'rejected'
  reason: string
  daysToConfirm: number
} {
  // 1. ตรวจสอบ Accumulation
  if (!accumulation.detected) {
    return {
      confirmed: false,
      status: 'rejected',
      reason: 'ไม่พบ Accumulation Pattern',
      daysToConfirm: 0,
    }
  }

  // 2. ตรวจสอบ Sustainability
  if (sustainability.score < 50) {
    return {
      confirmed: false,
      status: 'pending',
      reason: `Sustainability Score ต่ำ (${sustainability.score}/100)`,
      daysToConfirm: 3 - accumulation.consecutiveDays,
    }
  }

  // 3. ตรวจสอบ Divergence กับ Retail
  const smartMoneyNet = accumulation.totalFlow
  const retailNet = retailData.reduce((sum, d) => sum + d.net, 0)

  // Bullish Divergence: Smart Money Buy, Retail Sell
  const bullishDivergence = smartMoneyNet > 200 && retailNet < -100
  // Bearish Divergence: Smart Money Sell, Retail Buy
  const bearishDivergence = smartMoneyNet < -200 && retailNet > 100

  if (bullishDivergence || bearishDivergence) {
    return {
      confirmed: true,
      status: 'confirmed',
      reason: 'Divergence ยืนยันสัญญาณ',
      daysToConfirm: 0,
    }
  }

  // 4. ตรวจสอบว่า Smart Money และ Retail ไปด้วยกันหรือไม่
  const sameDirection = (smartMoneyNet > 0 && retailNet > 0) ||
                        (smartMoneyNet < 0 && retailNet < 0)

  if (sameDirection) {
    return {
      confirmed: true,
      status: 'confirmed',
      reason: 'Smart Money และ Retail ไปด้วยกัน',
      daysToConfirm: 0,
    }
  }

  // 5. Default: Pending
  return {
    confirmed: false,
    status: 'pending',
    reason: 'รอการยืนยันเพิ่มเติม',
    daysToConfirm: 3 - accumulation.consecutiveDays,
  }
}
```

---

## 4. Trend Strength Calculation

### 4.1 Trend Strength (0-100)

**ความหมาย:** ความแรงของ Trend ของ Smart Money

**สูตร:**
```typescript
function calculateTrendStrength(
  smartMoneyData: DailyTrendPoint[],
  period: number = 5
): {
  strength: number  // 0-100
  direction: 'up' | 'down' | 'sideways'
  acceleration: 'increasing' | 'stable' | 'decreasing'
} {
  // 1. คำนวณทิศทาง (Linear Regression)
  const n = smartMoneyData.length
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += smartMoneyData[i].net
    sumXY += i * smartMoneyData[i].net
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

  // กำหนดทิศทาง
  let direction: 'up' | 'down' | 'sideways'
  if (slope > 50) direction = 'up'
  else if (slope < -50) direction = 'down'
  else direction = 'sideways'

  // 2. คำนวณ R-squared (ความแรงของ trend)
  const mean = sumY / n
  let totalSS = 0, residualSS = 0

  for (let i = 0; i < n; i++) {
    const predicted = slope * i + (mean - slope * (n - 1) / 2)
    totalSS += Math.pow(smartMoneyData[i].net - mean, 2)
    residualSS += Math.pow(smartMoneyData[i].net - predicted, 2)
  }

  const rSquared = totalSS !== 0 ? 1 - (residualSS / totalSS) : 0
  const strength = Math.round(rSquared * 100)

  // 3. คำนวณ Acceleration
  const recentAvg = smartMoneyData.slice(-2).reduce((sum, d) => sum + d.net, 0) / 2
  const olderAvg = smartMoneyData.slice(0, 2).reduce((sum, d) => sum + d.net, 0) / 2

  let acceleration: 'increasing' | 'stable' | 'decreasing'
  const accelerationPct = (recentAvg - olderAvg) / Math.abs(olderAvg)

  if (direction === 'up' && accelerationPct > 0.1) acceleration = 'increasing'
  else if (direction === 'up' && accelerationPct < -0.1) acceleration = 'decreasing'
  else acceleration = 'stable'

  return {
    strength,
    direction,
    acceleration,
  }
}
```

---

## 5. Consecutive Buy/Sell Day Tracking

### 5.1 Consecutive Days Counter

**สูตร:**
```typescript
function trackConsecutiveDays(
  smartMoneyData: DailyTrendPoint[],
  threshold: number = 100
): {
  currentStreak: number
  maxStreak: number
  streakType: 'buy' | 'sell' | 'neutral'
  history: {
    date: string
    streak: number
    type: 'buy' | 'sell' | 'neutral'
  }[]
} {
  let currentStreak = 0
  let maxStreak = 0
  let streakType: 'buy' | 'sell' | 'neutral' = 'neutral'
  const history: typeof trackConsecutiveDays.prototype.history = []

  for (const data of smartMoneyData) {
    if (data.net > threshold) {
      // Buy Day
      if (streakType === 'buy') {
        currentStreak++
      } else {
        currentStreak = 1
        streakType = 'buy'
      }
    } else if (data.net < -threshold) {
      // Sell Day
      if (streakType === 'sell') {
        currentStreak++
      } else {
        currentStreak = 1
        streakType = 'sell'
      }
    } else {
      // Neutral Day
      currentStreak = 0
      streakType = 'neutral'
    }

    maxStreak = Math.max(maxStreak, currentStreak)

    history.push({
      date: data.date,
      streak: currentStreak,
      type: streakType,
    })
  }

  return {
    currentStreak,
    maxStreak,
    streakType,
    history,
  }
}
```

---

## 6. Data Requirements

### 6.1 Firebase RTDB Structure (มีอยู่แล้ว)

```
/settrade/investorType/byDate/{YYYY-MM-DD}/
├── rows:
│   ├── FOREIGN: { buyPct, buyValue, name, netValue, sellPct, sellValue }
│   ├── LOCAL_INDIVIDUAL: { ... }
│   ├── LOCAL_INST: { ... }
│   └── PROPRIETARY: { ... }
└── meta: { capturedAt, schemaVersion, source }
```

### 6.2 Data Structure (สำหรับ Trend Analysis)

```typescript
interface SmartMoneyTrendData {
  symbol?: string  // Optional สำหรับ stock-specific

  // Daily Data
  daily: {
    date: string
    foreign: { buy: number; sell: number; net: number }
    institution: { buy: number; sell: number; net: number }
    retail: { buy: number; sell: number; net: number }
    prop: { buy: number; sell: number; net: number }
  }[]

  // Smart Money Aggregation
  smartMoney: {
    net: number
    trend: 'up' | 'down' | 'sideways'
    strength: number  // 0-100
  }

  // Pattern Detection
  patterns: {
    accumulation?: {
      detected: boolean
      consecutiveDays: number
      totalFlow: number
      strength: number
    }
    distribution?: {
      detected: boolean
      consecutiveDays: number
      totalFlow: number
      strength: number
    }
  }

  // Sustainability
  sustainability: {
    score: number  // 0-100
    confidence: 'low' | 'medium' | 'high'
  }

  // Confirmation
  confirmation: {
    status: 'confirmed' | 'pending' | 'rejected'
    reason: string
  }

  // Consecutive Days
  streak: {
    current: number
    max: number
    type: 'buy' | 'sell' | 'neutral'
  }

  timestamp: number
}
```

---

## 7. Aggregation Logic (3/5/10 Day)

### 7.1 Multi-Period Aggregation

**สูตร:**
```typescript
function aggregateMultiPeriod(
  smartMoneyData: DailyTrendPoint[],
  periods: [3, 5, 10]
): {
  ma3: number | null
  ma5: number | null
  ma10: number | null
  trend3d: TrendDirection
  trend5d: TrendDirection
  trend10d: TrendDirection
} {
  const result = {
    ma3: null as number | null,
    ma5: null as number | null,
    ma10: null as number | null,
    trend3d: 'sideways' as TrendDirection,
    trend5d: 'sideways' as TrendDirection,
    trend10d: 'sideways' as TrendDirection,
  }

  // 3-Day Aggregation
  if (smartMoneyData.length >= 3) {
    const recent3 = smartMoneyData.slice(-3)
    result.ma3 = recent3.reduce((sum, d) => sum + d.net, 0) / 3
    result.trend3d = calculateTrendDirection(recent3)
  }

  // 5-Day Aggregation
  if (smartMoneyData.length >= 5) {
    const recent5 = smartMoneyData.slice(-5)
    result.ma5 = recent5.reduce((sum, d) => sum + d.net, 0) / 5
    result.trend5d = calculateTrendDirection(recent5)
  }

  // 10-Day Aggregation
  if (smartMoneyData.length >= 10) {
    const recent10 = smartMoneyData.slice(-10)
    result.ma10 = recent10.reduce((sum, d) => sum + d.net, 0) / 10
    result.trend10d = calculateTrendDirection(recent10)
  }

  return result
}

function calculateTrendDirection(
  data: DailyTrendPoint[]
): 'up' | 'down' | 'sideways' {
  const avgNet = data.reduce((sum, d) => sum + d.net, 0) / data.length

  if (avgNet > 100) return 'up'
  if (avgNet < -100) return 'down'
  return 'sideways'
}
```

---

## 8. Pattern Recognition Rules

### 8.1 Pattern Types

| Pattern | Condition | Meaning | Action |
|---------|-----------|---------|--------|
| **Accumulation** | Smart Money Net Buy ≥ 3 วัน | กำลังสะสม | Accumulate |
| **Distribution** | Smart Money Net Sell ≥ 3 วัน | กำลังแจกจ่าย | Reduce |
| **Bullish Divergence** | Smart Money Buy, Retail Sell | แนวโน้มขึ้น | Buy |
| **Bearish Divergence** | Smart Money Sell, Retail Buy | แนวโน้มลง | Sell |
| **FOMO** | Retail Heavy Buy | Retail ฟองโม้ | Wait |
| **Panic** | Retail Heavy Sell | Retail ขายตื่น | Wait |

### 8.2 Pattern Detection Algorithm

```typescript
function detectPattern(
  smartMoneyData: DailyTrendPoint[],
  retailData: DailyTrendPoint[],
  period: number = 5
): {
  pattern: 'accumulation' | 'distribution' | 'bullish_divergence' | 'bearish_divergence' | 'fomo' | 'panic' | 'none'
  confidence: number
  description: string
} {
  // 1. Accumulation Detection
  const accumulation = detectAccumulation(smartMoneyData, smartMoneyData)
  if (accumulation.detected && accumulation.strength >= 60) {
    return {
      pattern: 'accumulation',
      confidence: accumulation.strength,
      description: `Smart Money Accumulation (${accumulation.consecutiveDays} วัน, +${accumulation.totalFlow.toFixed(0)}M)`,
    }
  }

  // 2. Distribution Detection
  const distribution = detectDistribution(smartMoneyData, smartMoneyData)
  if (distribution.detected && distribution.strength >= 60) {
    return {
      pattern: 'distribution',
      confidence: distribution.strength,
      description: `Smart Money Distribution (${distribution.consecutiveDays} วัน, ${distribution.totalFlow.toFixed(0)}M)`,
    }
  }

  // 3. Bullish Divergence
  const smartMoneyNet = smartMoneyData.reduce((sum, d) => sum + d.net, 0) / period
  const retailNet = retailData.reduce((sum, d) => sum + d.net, 0) / period

  if (smartMoneyNet > 200 && retailNet < -200) {
    return {
      pattern: 'bullish_divergence',
      confidence: 75,
      description: `Bullish Divergence: Smart Money +${smartMoneyNet.toFixed(0)}M, Retail ${retailNet.toFixed(0)}M`,
    }
  }

  // 4. Bearish Divergence
  if (smartMoneyNet < -200 && retailNet > 200) {
    return {
      pattern: 'bearish_divergence',
      confidence: 75,
      description: `Bearish Divergence: Smart Money ${smartMoneyNet.toFixed(0)}M, Retail +${retailNet.toFixed(0)}M`,
    }
  }

  // 5. FOMO
  if (retailNet > 500 && smartMoneyNet < 100) {
    return {
      pattern: 'fomo',
      confidence: 80,
      description: `FOMO: Retail Heavy Buy +${retailNet.toFixed(0)}M, Smart Money Flat`,
    }
  }

  // 6. Panic
  if (retailNet < -500 && smartMoneyNet > -100) {
    return {
      pattern: 'panic',
      confidence: 80,
      description: `Panic: Retail Heavy Sell ${retailNet.toFixed(0)}M, Smart Money Flat`,
    }
  }

  return {
    pattern: 'none',
    confidence: 0,
    description: 'ไม่พบ Pattern ที่ชัดเจน',
  }
}
```

---

## 9. Thai Market Specific Considerations

### 9.1 Thai Market Smart Money Behavior

| Investor Type | Market Share | Behavior |
|---------------|--------------|----------|
| **Foreign** | ~35% | ติดตาม Fed, Global Trend |
| **Institution** | ~15% | ติดตาม Fundamentals |
| **Prop Trading** | ~5% | Amplify Volatility |
| **Retail** | ~45% | Momentum, Sentiment |

### 9.2 Thai Market Thresholds

**Accumulation Threshold:**
- Foreign: **> 500M** ต่อวัน = Strong Buy
- Institution: **> 300M** ต่อวัน = Strong Buy

**Distribution Threshold:**
- Foreign: **< -500M** ต่อวัน = Strong Sell
- Institution: **< -300M** ต่อวัน = Strong Sell

**Sustainability Threshold:**
- Score **≥ 70**: High confidence
- Score **50-69**: Medium confidence
- Score **< 50**: Low confidence

### 9.3 Thai Market Seasonality

| Quarter | Pattern | Reason |
|---------|---------|---------|
| **Q1** | Foreign Net Buy | Bonus season, Dividend play |
| **Q2** | Mixed | Earnings season |
| **Q3** | Foreign Net Sell | Holiday season |
| **Q4** | Mixed | Year-end window dressing |

---

## 10. Implementation Checklist

- [ ] Implement Accumulation Detection
- [ ] Implement Distribution Detection
- [ ] Implement Sustainability Score
- [ ] Implement Confirmation Status
- [ ] Implement Trend Strength
- [ ] Implement Consecutive Days Tracking
- [ ] Implement Multi-Period Aggregation (3/5/10 day)
- [ ] Implement Pattern Recognition
- [ ] Add Thai Market specific thresholds
- [ ] Create API endpoints
- [ ] Add caching layer
- [ ] Write unit tests
- [ ] Create documentation for frontend

---

**อ้างอิง:**
- Master Report: `MASTER_UPDATE/master_report.md`
- Smart Money Types: `src/types/smart-money.ts`
- Trend Analyzer: `src/services/smart-money/trend-analyzer.ts`
- RTDB Investor Type: `src/lib/rtdb/investor-type.ts`
