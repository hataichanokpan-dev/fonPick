# FonPick Quick Reference (ฉบับย่อ)

**Cheatsheet สรุป thresholds และ formulas สำคัญ**

---

## Market Regime (P0)

### Thresholds
| Parameter | Strong | Moderate | Neutral |
|-----------|--------|----------|---------|
| SET Change | ±0.5% | 0% | - |
| Flow | ±100M | 0M | - |
| Volume Ratio | 1.2 / 0.8 | 1.0 | - |

### Regime Determination
```
Score Diff = Risk-On - Risk-Off

≥ +2 → Risk-On
≤ -2 → Risk-Off
else → Neutral

Confidence:
  High  = Score ≥ 7
  Medium
  Low   = Total < 10
```

---

## Smart Money (P0)

### Investor Weights
| Investor | Weight | Multiplier |
|----------|--------|------------|
| Foreign | 60 | ×1.2 |
| Institution | 50 | ×1.0 |
| Retail | 12.5 | ×0.25 |
| Prop | 12.5 | ×0.25 |

**Total = Smart Money × 0.8 + Context × 0.2**

### Signal Thresholds (Million THB)
```
Strong Buy:  ≥ +500
Buy:         ≥ +100
Sell:        ≤ -100
Strong Sell: ≤ -500
```

### Individual Score (0-50)
```
Base: 25

Signal:
  Strong Buy:  +20  (max 45)
  Buy:         +10  (max 35)
  Strong Sell: -20  (min 5)
  Sell:        -10  (min 15)

Trend:
  Accelerating: ±5

5-Day:
  > +200M: +3
  < -200M: -3
```

---

## Sector Analysis (P1)

### Momentum Thresholds
```
vsMarket = Sector% - SET%

≥ +1.5% → Strong Outperform
≥ +0.5% → Outperform
≥ -0.5% → In-line
≥ -1.5% → Underperform
< -1.5% → Significant Lag
```

### Entry Signal (Buy)
```
Outperform + improvement > 0.5% → Entry (conf 60-85)
Outperform → Accumulate (conf 50-70)
```

### Exit Signal (Sell)
```
Underperform + deterioration > 0.5% → Exit (conf 60-85)
Underperform → Distribute (conf 50-70)
```

### Sector Groups
**Cyclical:** BANKING, FIN, ICT, ENERGY, CONS, COMM
**Defensive:** FOOD, HELTH, UTIL, PROP, PF

---

## Daily Focus (P2)

### Cross-Ranking
```
Minimum 2 rankings per stock

Badge Colors:
  🟢 Buy:    score ≥ 70
  🟡 Watch:  score 50-69
  ⚪ Neutral: score < 50
```

### Strength Score
```
Rank 1 = 100 pts
Rank 2 = 90 pts
...
Rank 10 = 10 pts

Average all rankings
```

---

## Market Movers

### Concentration
```
Top 5 Concentration:
  > 50% → Highly
  30-50% → Moderate
  < 30% → Broad

HHI:
  > 2000 → Highly
  1500-2000 → Moderate
  < 1500 → Broad
```

---

## Decision Hierarchy

```
1. Market Regime (P0)
   ├─ Risk-On?  → Cyclical sectors
   ├─ Risk-Off? → Defensive sectors
   └─ Neutral?  → Quality names

2. Smart Money (P0)
   ├─ Confirm regime
   └─ Check primary driver

3. Sector Selection (P1)
   ├─ Entry signals → Accumulate
   └─ Exit signals → Reduce

4. Stock Selection (P2)
   └─ Cross-ranked stocks → Focus
```

---

## File References

| Feature | Path |
|---------|------|
| Regime | `src/services/market-regime/rules.ts` |
| Smart Money | `src/services/smart-money/scorer.ts` |
| Sector | `src/services/sector-rotation/detector.ts` |
| Daily Focus | `src/components/dashboard/DailyFocusList.tsx` |
| Market Movers | `src/components/dashboard/TabbedMovers.tsx` |

---

**Version:** 1.0
**Updated:** 26 Jan 2026
