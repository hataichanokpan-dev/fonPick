# Entry/Exit Calculation Plan
# แผนการคำนวณและวิเคราะห์ Entry/Exit สำหรับ Swing Trading

**วันที่**: 2026-02-14
**สถานะ**: P0 Critical Feature
**ผู้รับผิดชอบ**: Backend Developer + Risk Manager

---

## Executive Summary

เอกสารฉบับนี้ระบุวิธีการคำนวณ **Entry/Exit** สำหรับการลงทุน 30-90 วัน โดยใช้ Hybrid Approach (Technical + Value) เพื่อให้ได้:

1. **Entry Zone** ที่เหมาะสมที่สุด (support-based)
2. **Stop Loss** ที่ปลอดภัย (ATR-based + support)
3. **Take Profit** levels (Risk-Reward 1:2, 1:3)
4. **Position Sizing** (2% risk per trade)

---

## 1. Entry Zone Calculation

### 1.1 Support-Based Entry

**หลักการ:** ซื้อใกล้แนวรับเพื่อลด risk และเพิ่ม reward

**สูตร:**
```typescript
function calculateEntryZone(
  currentPrice: number,
  supportLevels: number[],
  rsi?: number
): {
  entryPrice: number
  zoneHigh: number
  zoneLow: number
  rationale: string
} {
  // 1. หาแนวรับที่ใกล้ที่สุด
  const nearestSupport = supportLevels
    .filter(s => s < currentPrice)
    .sort((a, b) => b - a)[0]  // แนวรับที่ใกล้ราคาปัจจุบันสุด

  // 2. คำนวณ Entry Zone
  const zoneHigh = currentPrice * 0.98  // 2% จากราคาปัจจุบัน
  const zoneLow = nearestSupport * 1.02  // 2% จากแนวรับ

  // 3. กำหนด Entry Price
  let entryPrice = (zoneHigh + zoneLow) / 2
  let rationale = `Entry Zone: ${zoneLow.toFixed(2)} - ${zoneHigh.toFixed(2)}`

  // 4. ปรับจูนตาม RSI
  if (rsi) {
    if (rsi < 30) {
      // Oversold → เพิ่มขนาด
      entryPrice = zoneLow * 1.01
      rationale += ', RSI Oversold เพิ่มขนาด'
    } else if (rsi > 70) {
      // Overbought → รอราคาดีกว่า
      entryPrice = zoneLow
      rationale += ', RSI Overbought รอราคาดีกว่า'
    }
  }

  return {
    entryPrice,
    zoneHigh,
    zoneLow,
    rationale,
  }
}
```

### 1.2 Thai Market Entry Strategy

**กฎการเข้าซื้อ:**

| Condition | Strategy | Thai Example |
|-----------|----------|--------------|
| ราคาอยู่ 3% เหนือแนวรับ | ซื้อที่ 2% เหนือแนวรับ | KBANK @ 150 (Support @ 148) → Buy @ 150.96 |
| ราคาอยู่ 2% เหนือแนวรับ | ซื้อที่แนวรับ | TRUE @ 68 (Support @ 66.5) → Buy @ 67.8 |
| ราคาทะลุแนวรับแล้ว | รอ pullback | ADVANC @ 160 (Break @ 155) → Wait |

---

## 2. Stop Loss Calculation

### 2.1 ATR-Based Stop Loss

**สูตร:**
```
Stop Loss = Entry Price - (ATR × Multiplier)

เมื่อ:
- ATR = Average True Range (วัด volatility)
- Multiplier = 2 สำหรับ Thai market (หรือ 3 สำหรับ high volatility)
```

**ATR Calculation:**
```typescript
function calculateATR(
  data: { high: number; low: number; close: number }[],
  period: number = 14
): number {
  const trueRanges: number[] = []

  for (let i = 1; i < data.length; i++) {
    const tr = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i-1].close),
      Math.abs(data[i].low - data[i-1].close)
    )
    trueRanges.push(tr)
  }

  // Average ของ True Range ล่าสุด period วัน
  return sum(trueRanges.slice(-period)) / period
}
```

### 2.2 Hybrid Stop Loss (ATR + Support)

**สูตร:**
```typescript
function calculateHybridStopLoss(
  entryPrice: number,
  atr: number,
  supportLevel: number,
  riskPercentage: number = 0.08  // 8% default
): {
  stopLoss: number
  atrBased: number
  supportBased: number
  rationale: string
} {
  // 1. ATR-based Stop Loss
  const atrBased = entryPrice - (atr * 2)

  // 2. Support-based Stop Loss (2% ใต้แนวรับ)
  const supportBased = supportLevel * 0.98

  // 3. ใช้ราคาที่สูงกว่า (ปกป้องมากกว่า)
  const stopLoss = Math.max(atrBased, supportBased)

  // 4. Cap ที่ 15% จากราคาซื้อ
  const maxLoss = entryPrice * (1 - riskPercentage)
  const finalSL = Math.max(stopLoss, maxLoss)

  // 5. สร้างคำอธิบาย
  let rationale = `Stop Loss: ${finalSL.toFixed(2)}`
  if (finalSL === atrBased) {
    rationale += ' (ATR-based 2×ATR)'
  } else {
    rationale += ' (Support-based 2% ใต้แนวรับ)'
  }

  return {
    stopLoss: finalSL,
    atrBased,
    supportBased,
    rationale,
  }
}
```

### 2.3 Thai Market Stop Loss Guidelines

**Multiplier:**
- Big Cap (SET50): **2×ATR**
- Mid Cap (SET100): **2.5×ATR**
- Small Cap (mai): **3×ATR**

**Max Loss:**
- สำหรับ Swing Trading (30-90 วัน): **8-12%**
- หุ้นที่มี Catalyst ใกล้เข้า: **10-15%**

---

## 3. Take Profit Calculation

### 3.1 Risk-Reward Based Take Profit

**หลักการ:**
- **TP1** (1:2): ปิด 30% ของ position
- **TP2** (1:3): ปิด 40% ของ position
- **TP3** (1:5): ปิด 30% ของ position

**สูตร:**
```typescript
function calculateTakeProfitLevels(
  entryPrice: number,
  stopLoss: number
): {
  tp1: { price: number; pct: number; close: number }
  tp2: { price: number; pct: number; close: number }
  tp3: { price: number; pct: number; close: number }
} {
  const risk = entryPrice - stopLoss

  // TP1: 1:2 Risk-Reward (ปิด 30%)
  const tp1Price = entryPrice + (risk * 2)

  // TP2: 1:3 Risk-Reward (ปิด 40%)
  const tp2Price = entryPrice + (risk * 3)

  // TP3: 1:5 Risk-Reward (ปิด 30%)
  const tp3Price = entryPrice + (risk * 5)

  return {
    tp1: {
      price: tp1Price,
      pct: ((tp1Price - entryPrice) / entryPrice) * 100,
      close: 30,  // ปิด 30%
    },
    tp2: {
      price: tp2Price,
      pct: ((tp2Price - entryPrice) / entryPrice) * 100,
      close: 40,  // ปิด 40%
    },
    tp3: {
      price: tp3Price,
      pct: ((tp3Price - entryPrice) / entryPrice) * 100,
      close: 30,  // ปิด 30%
    },
  }
}
```

### 3.2 Resistance-Based Take Profit

**สูตร:**
```typescript
function calculateResistanceBasedTP(
  entryPrice: number,
  resistanceLevels: number[],
  stopLoss: number
): {
  tp1: { price: number; pct: number }
  tp2: { price: number; pct: number }
  tp3: { price: number; pct: number }
} {
  // 1. หาแนวต้านที่ใกล้ที่สุด 3 ระดับ
  const resistances = resistanceLevels
    .filter(r => r > entryPrice)
    .sort((a, b) => a - b)
    .slice(0, 3)

  // 2. กำหนด TP ที่ใต้แนวต้าน (2% margin)
  const tp1 = resistances[0] ? resistances[0] * 0.98 : entryPrice * 1.05
  const tp2 = resistances[1] ? resistances[1] * 0.98 : entryPrice * 1.10
  const tp3 = resistances[2] ? resistances[2] * 0.98 : entryPrice * 1.15

  return {
    tp1: { price: tp1, pct: ((tp1 - entryPrice) / entryPrice) * 100 },
    tp2: { price: tp2, pct: ((tp2 - entryPrice) / entryPrice) * 100 },
    tp3: { price: tp3, pct: ((tp3 - entryPrice) / entryPrice) * 100 },
  }
}
```

### 3.3 Hybrid Take Profit (Weighted Average)

**สูตร:**
```typescript
function calculateHybridTP(
  entryPrice: number,
  stopLoss: number,
  resistanceLevels: number[],
  valueTargets: {
    intrinsicValue?: number
    avgForecast?: number
  }
): {
  finalTP: number
  components: {
    rrTP: number
    resistanceTP: number
    valueTP: number
  }
  rationale: string
} {
  // 1. Risk-Reward TP (1:3)
  const risk = entryPrice - stopLoss
  const rrTP = entryPrice + (risk * 3)

  // 2. Resistance TP
  const nearestResistance = resistanceLevels
    .filter(r => r > entryPrice)
    .sort((a, b) => a - b)[0]
  const resistanceTP = nearestResistance
    ? nearestResistance * 0.98
    : entryPrice * 1.10

  // 3. Value TP
  const valueTPs = [
    valueTargets.intrinsicValue,
    valueTargets.avgForecast,
  ].filter(v => v && v > entryPrice)

  const valueTP = valueTPs.length > 0
    ? valueTPs.reduce((a, b) => a + b) / valueTPs.length
    : entryPrice * 1.08

  // 4. Weighted Average (40% RR + 30% Resistance + 30% Value)
  const finalTP = (rrTP * 0.4) + (resistanceTP * 0.3) + (valueTP * 0.3)

  return {
    finalTP,
    components: {
      rrTP,
      resistanceTP,
      valueTP,
    },
    rationale: `TP แบบบูรณาการ: RR 40% + Resistance 30% + Value 30%`,
  }
}
```

---

## 4. Position Sizing Calculation

### 4.1 Risk-Based Position Sizing (2% Rule)

**หลักการ:** ไม่เสียเกิน 2% ของ portfolio ต่อ 1 trade

**สูตร:**
```
Position Size = (Portfolio Value × Risk%) / Risk per Share

เมื่อ:
- Risk% = 2% (หรือ 1% สำหรับ conservative)
- Risk per Share = Entry Price - Stop Loss
```

**วิธีคำนวณ:**
```typescript
function calculatePositionSize(
  portfolioValue: number,
  entryPrice: number,
  stopLoss: number,
  riskPerTrade: number = 0.02,  // 2%
  maxPosition: number = 0.20      // Max 20%
): {
  shares: number
  positionValue: number
  positionPct: number
  riskAmount: number
  rationale: string
} {
  // 1. คำนวณ Risk ต่อหุ้น
  const riskPerShare = entryPrice - stopLoss
  const riskPct = (riskPerShare / entryPrice) * 100

  // 2. คำนวณ Position Size จาก Risk
  const riskAmount = portfolioValue * riskPerTrade
  const shares = Math.floor(riskAmount / riskPerShare)
  const positionValue = shares * entryPrice
  const positionPct = positionValue / portfolioValue

  // 3. Cap ที่ Max Position
  const finalPct = Math.min(positionPct, maxPosition)
  const finalShares = Math.floor(shares * (finalPct / positionPct))

  // 4. สร้างคำอธิบาย
  const actualRisk = (finalShares * riskPerShare) / portfolioValue * 100
  const rationale = `Position: ${finalPct.toFixed(1)}%, Risk: ${actualRisk.toFixed(2)}%`

  return {
    shares: finalShares,
    positionValue: finalShares * entryPrice,
    positionPct: finalPct,
    riskAmount: finalShares * riskPerShare,
    rationale,
  }
}
```

### 4.2 Kelly Criterion (Optional)

**สูตร:**
```
f = (bp - q) / b

เมื่อ:
- f = fraction of bankroll to wager
- b = odds received (Risk/Reward)
- p = probability of winning
- q = probability of losing (1 - p)
```

**วิธีคำนวณ:**
```typescript
function calculateKellyPosition(
  winRate: number,       // % เวลาชนะ
  avgWin: number,        // กำไรเฉลี่ย
  avgLoss: number,       // ขาดทุนเฉลี่ย
  portfolioValue: number,
  entryPrice: number,
  stopLoss: number
): {
  kellyPct: number
  halfKellyPct: number
  shares: number
} {
  // 1. คำนวณ Kelly %
  const b = avgWin / avgLoss  // Odds
  const p = winRate / 100
  const q = 1 - p
  const kellyPct = (b * p - q) / b

  // 2. Half Kelly (สำหรับ risk management)
  const halfKellyPct = kellyPct / 2

  // 3. คำนวณ shares
  const riskPerShare = entryPrice - stopLoss
  const shares = Math.floor(
    (portfolioValue * halfKellyPct) / riskPerShare
  )

  return {
    kellyPct: kellyPct * 100,
    halfKellyPct: halfKellyPct * 100,
    shares,
  }
}
```

---

## 5. Risk-Reward Ratio Analysis

### 5.1 Risk-Reward Calculation

**สูตร:**
```
Risk = Entry Price - Stop Loss
Reward = Take Profit - Entry Price
Risk-Reward Ratio = Reward / Risk
```

**วิธีคำนวณ:**
```typescript
function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number
): {
  ratio: string
  risk: number
  reward: number
  riskPct: number
  rewardPct: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
} {
  const risk = entryPrice - stopLoss
  const reward = takeProfit - entryPrice
  const ratio = reward / risk

  const riskPct = (risk / entryPrice) * 100
  const rewardPct = (reward / entryPrice) * 100

  // ประเมินคุณภาพ
  let quality: 'excellent' | 'good' | 'fair' | 'poor'
  if (ratio >= 3) quality = 'excellent'
  else if (ratio >= 2) quality = 'good'
  else if (ratio >= 1.5) quality = 'fair'
  else quality = 'poor'

  return {
    ratio: `1:${ratio.toFixed(1)}`,
    risk,
    reward,
    riskPct,
    rewardPct,
    quality,
  }
}
```

### 5.2 Risk-Reward Guidelines

| R:R Ratio | Quality | Action |
|------------|---------|--------|
| **≥ 1:3** | Excellent | Full position size |
| **1:2 - 1:3** | Good | Full position size |
| **1:1.5 - 1:2** | Fair | Half position size |
| **< 1:1.5** | Poor | Avoid |

---

## 6. Data Requirements

### 6.1 Input Data

```typescript
interface EntryExitInput {
  // Price Data
  currentPrice: number
  supportLevels: number[]
  resistanceLevels: number[]

  // Technical Indicators
  atr?: number
  rsi?: number

  // Valuation Targets
  valuationTargets?: {
    intrinsicValue?: number
    avgForecast?: number
    highForecast?: number
  }

  // Portfolio Data
  portfolioValue?: number

  // Screening Score
  screeningScore?: number
}
```

### 6.2 Output Data

```typescript
interface EntryExitPlan {
  // Entry
  entry: {
    price: number
    zoneHigh: number
    zoneLow: number
    rationale: string
  }

  // Stop Loss
  stopLoss: {
    price: number
    atrBased: number
    supportBased: number
    riskPct: number
    rationale: string
  }

  // Take Profit
  takeProfit: {
    tp1: { price: number; pct: number; close: number }
    tp2: { price: number; pct: number; close: number }
    tp3: { price: number; pct: number; close: number }
    final: number
    rationale: string
  }

  // Position Sizing
  positionSize: {
    shares: number
    value: number
    pct: number
    rationale: string
  }

  // Risk-Reward
  riskReward: {
    ratio: string
    risk: number
    reward: number
    quality: string
  }

  // Recommendation
  recommendation: {
    action: 'buy' | 'wait' | 'avoid'
    confidence: number
    reason: string
  }
}
```

---

## 7. Thai Market Examples

### 7.1 Example 1: KBANK

**Input:**
- Current Price: 152
- Support: 148, 145
- Resistance: 158, 162
- ATR: 3.5
- RSI: 45

**Calculation:**
```
Entry Zone: 148 × 1.02 = 151 → 152 × 0.98 = 149
Entry Price: 150

Stop Loss: 150 - (3.5 × 2) = 143
Support-based: 148 × 0.98 = 145
Final SL: 145 (ใช้ราคาสูงกว่า)

Risk: 150 - 145 = 5 (3.33%)

Take Profit:
- TP1: 150 + (5 × 2) = 160 (+6.67%)
- TP2: 150 + (5 × 3) = 165 (+10%)
- TP3: 150 + (5 × 5) = 175 (+16.67%)

Risk-Reward: 1:3 → Good
```

### 7.2 Example 2: DELTA

**Input:**
- Current Price: 68
- Support: 65, 62
- Resistance: 72, 76
- ATR: 2.5
- RSI: 28 (Oversold)

**Calculation:**
```
Entry Zone: RSI Oversold → ซื้อที่ 65 × 1.01 = 65.65
Entry Price: 66

Stop Loss: 66 - (2.5 × 2.5) = 59.75
Support-based: 65 × 0.98 = 63.7
Final SL: 63.7 (ใช้ราคาสูงกว่า)

Risk: 66 - 63.7 = 2.3 (3.48%)

Take Profit:
- TP1: 66 + (2.3 × 2) = 70.6 (+7%)
- TP2: 66 + (2.3 × 3) = 72.9 (+10.5%)
- TP3: 66 + (2.3 × 5) = 77.5 (+17.4%)

Risk-Reward: 1:3 → Good
```

---

## 8. Implementation Checklist

- [ ] Create `entry-exit-calculator` service
- [ ] Implement ATR calculation
- [ ] Implement Entry Zone calculation
- [ ] Implement Hybrid Stop Loss
- [ ] Implement Hybrid Take Profit
- [ ] Implement Position Sizing (2% rule)
- [ ] Implement Risk-Reward analysis
- [ ] Add validation for input data
- [ ] Add Thai market specific adjustments
- [ ] Create unit tests
- [ ] Create documentation for frontend
- [ ] Add backtesting capability

---

**อ้างอิง:**
- Master Report: `MASTER_UPDATE/master_report.md`
- Entry Plan Calculator: `src/lib/entry-plan-calculator.ts`
- Technical Indicators: `src/lib/technical-indicators.ts`
- Technical Types: `src/types/technical-chart.ts`
