# Performance Attribution (Brinson-Fachler Model)

## Intuition
When an investment portfolio outperforms (or underperforms) its benchmark by $+250\text{ bps}$, an investment committee must answer a fundamental diagnostic question: **Where did the excess return come from?** Did the manager make a brilliant macroeconomic call to overweight the technology sector (**Asset Allocation**), or did they pick the best individual stocks within each sector (**Security Selection**)?

**Performance Attribution** (Bodie Ch. 24; Brinson, Hood & Beebower, 1986; Brinson & Fachler, 1985) mathematically decomposes total active portfolio return ($R_P - R_B$) into exact, additive components across asset classes or industry sectors.

## Structure
### The Brinson-Fachler Attribution Decomposition

Let $w_{p,i}$ and $w_{b,i}$ denote the portfolio and benchmark weights in sector $i$, and let $R_{p,i}$ and $R_{b,i}$ denote the portfolio and benchmark returns in sector $i$, with total benchmark return $R_B = \sum w_{b,i} R_{b,i}$:

$$\text{Total Active Return} = R_P - R_B = \sum_{i=1}^N w_{p,i} R_{p,i} - \sum_{i=1}^N w_{b,i} R_{b,i} = \text{Allocation} + \text{Selection} + \text{Interaction}$$

| Attribution Effect | Mathematical Formula | Economic Interpretation |
|---|---|---|
| **1. Asset Allocation Effect** | $\sum_{i} (w_{p,i} - w_{b,i}) \cdot (R_{b,i} - R_B)$ | Value added by overweighting sectors whose benchmark return beat the overall total benchmark ($R_{b,i} > R_B$), or underweighting lagging sectors. |
| **2. Security Selection Effect** | $\sum_{i} w_{b,i} \cdot (R_{p,i} - R_{b,i})$ | Value added by picking individual securities within sector $i$ that outperformed that sector's own benchmark ($R_{p,i} > R_{b,i}$), evaluated at benchmark weight. |
| **3. Interaction Effect** | $\sum_{i} (w_{p,i} - w_{b,i}) \cdot (R_{p,i} - R_{b,i})$ | Cross-product effect: positive when the manager both overweights a sector *and* picks outperforming stocks within that same sector (often folded into Selection in institutional reporting). |

```
Worked Two-Sector Attribution Example (Total Benchmark Return R_B = 10.0%)
┌────────────────────────────────────────────────────────┐
│ Technology Sector:                                     │
│ • Benchmark Weight = 30%, Benchmark Return = 18.0%     │
│ • Portfolio Weight = 45%, Portfolio Return = 22.0%     │
├────────────────────────────────────────────────────────┤
│ 1. Allocation Effect:                                  │
│    (45% - 30%) × (18.0% - 10.0%) = +15% × +8% = +1.20% │
│ 2. Selection Effect:                                   │
│    30% × (22.0% - 18.0%) = 30% × +4.0% = +1.20%        │
│ 3. Interaction Effect:                                 │
│    (45% - 30%) × (22.0% - 18.0%) = +15% × +4% = +0.60% │
│ → Total Value Added from Tech = +3.00% (+300 bps)      │
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "Brinson-Hood-Beebower (BHB) and Brinson-Fachler (BF) give the same sector allocation numbers."**  
  *Reality:* In the older BHB formula, sector allocation is measured as $(w_{p,i} - w_{b,i}) \times R_{b,i}$. Under BHB, overweighting a sector that returned $+5\%$ when the overall market returned $+15\%$ looks like a "positive $+5\%$ allocation contribution," even though overweighting that lagging sector dragged down relative performance! **Brinson-Fachler** fixes this by subtracting overall $R_B$: $(w_{p,i} - w_{b,i}) \times (R_{b,i} - R_B)$, properly showing that overweighting a sector that underperformed the overall market is a negative allocation decision.
- **Misconception 2: "The famous Brinson study proved that 90% of returns come from asset allocation, so security selection doesn't matter."**  
  *Reality:* Brinson et al. showed that ~90% of the *time-series variance* of a pension fund's quarterly total return is explained by its policy benchmark asset allocation. Among active managers with similar benchmarks, *cross-sectional differences* in excess return are frequently driven by security selection and factor tilts.
- **Misconception 3: "Single-period arithmetic attribution sums cleanly across multiple years."**  
  *Reality:* Because portfolio returns compound multiplicatively over time, single-period arithmetic attribution effects do not sum cleanly across multi-year horizons without geometric smoothing adjustments (e.g., Carino or Menchero linking algorithms).

## Notes for Future-Me
Use Brinson-Fachler attribution as your **Manager Accountability Audit**:
- If a fund manager markets themselves as a "bottom-up fundamental stock picker," their excess return should come overwhelmingly from the **Security Selection** bucket. If attribution reveals that $95\%$ of their outperformance came from an unhedged macro Allocation bet on Energy or Tech, they are charging stock-picking fees for a sector ETF bet!
- Apply this exact same math in **Corporate FP&A Variance Analysis** to decompose division revenue variances into **Market Share Effect**, **Industry Growth Effect**, and **Price/Mix Effect**.
