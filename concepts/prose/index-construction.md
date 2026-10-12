# Market Index Construction Mechanics

## Intuition
A financial market index (such as the S&P 500, Dow Jones Industrial Average, NASDAQ-100, or Russell 2000) serves two vital functions: it acts as a macroeconomic barometer of asset class performance and provides the investable benchmark for trillions of dollars of passive ETFs and institutional mandates (Bodie Ch. 2).

However, "the market" is not a single objective number. How an index is mathematically weighted fundamentally alters its sector concentration, turnover, rebalancing friction, and return trajectory.

## Structure
### The Three Primary Index Weighting Methodologies

| Weighting Methodology | Mathematical Weight of Stock $i$ | Canonical Examples | Structural Characteristics & Biases |
|---|---|---|---|
| **1. Price-Weighted** | $w_i = \frac{P_i}{\sum_{j=1}^N P_j}$ | Dow Jones Industrial Average (DJIA), Nikkei 225 | **Archaic & Arbitrary:** A stock trading at \$400/share has $10\times$ the index impact of a stock trading at \$40/share, regardless of how large or small the actual company is! Stock splits require adjusting the **Dow Divisor**. |
| **2. Market-Cap Weighted (Float-Adjusted)** | $w_i = \frac{P_i \cdot Q_{i,\text{float}}}{\sum_{j=1}^N P_j \cdot Q_{j,\text{float}}}$ | S&P 500, NASDAQ-100, Russell 2000, MSCI World | **Macro-Consistent & Self-Rebalancing:** Weights reflect true economic capital capacity. Zero turnover required when stock prices move (weights adjust automatically with price). Prone to concentration in mega-cap bubbles. |
| **3. Equal-Weighted** | $w_i = \frac{1}{N}$ | S&P 500 Equal Weight (RSP) | **Contrarian Factor Tilt:** Assigns $0.20\%$ weight to every S&P 500 company. Requires quarterly rebalancing: systematically **sells recent winners and buys recent losers**, creating a structural Small-Cap and Value factor tilt (at the cost of higher turnover and capital gains tax). |

```
Free-Float Adjustment in Modern Market-Cap Indices
┌────────────────────────────────────────────────────────┐
│ Total Shares Outstanding × Share Price = Total Mkt Cap │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Subtract Locked-Up Non-Tradable Shares:                │
│ • Government sovereign ownership stakes                │
│ • Controlling founder/family insider blocks            │
│ • Cross-held corporate treasury shares                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ = Investable Free-Float Market Capitalization          │
│ (Ensures index ETFs only buy shares that actually trade)│
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "A 2-for-1 stock split changes a company's weight in the S&P 500."**  
  *Reality:* In a market-cap-weighted index like the S&P 500, a 2-for-1 stock split doubles the share count ($2Q$) and halves the share price ($P/2$), leaving total market capitalization ($P \times Q$) and index weight completely unchanged! However, in a **price-weighted index** like the Dow Jones Industrial Average, a 2-for-1 split cuts the stock's index weight in half!
- **Misconception 2: "The S&P 500 is a purely mechanical list of the 500 largest US companies."**  
  *Reality:* Unlike the Russell 1000 (which is strictly rules-based by market cap rank), the **S&P 500 is selected by an S&P Index Committee** and imposes strict qualitative and quantitative screens, including requiring positive cumulative GAAP earnings over the trailing four quarters and minimum public float liquidity.
- **Misconception 3: "Bond indices work just like stock indices."**  
  *Reality:* Market-cap-weighted fixed income indices (like the Bloomberg US Aggregate Bond Index) suffer from the **"Bums Problem"**: the corporations or governments that issue the most debt receive the largest weight in the index! Passive bond investors automatically allocate the most capital to the most heavily indebted borrowers.

## Notes for Future-Me
When benchmarking your corporate stock performance or designing executive Long-Term Incentive Plan (LTIP) Relative Total Shareholder Return (rTSR) hurdles:
- Never compare a mid-cap operating company against a top-heavy, mega-cap-dominated index without checking **equal-weighted vs. cap-weighted divergence**. In years where 5 mega-cap tech stocks drive 70% of the cap-weighted S&P 500 return, 80% of healthy operating businesses will appear to "underperform the market."
- Use an **Equal-Weighted Industry Peer Index** for executive rTSR performance share vesting so management is rewarded for outperforming true operational peers rather than penalized for not being a trillion-dollar monopoly.

