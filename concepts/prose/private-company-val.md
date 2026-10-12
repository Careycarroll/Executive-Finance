# Private Company Valuation Adjustments (DLOM & Control)

## Intuition
Valuing privately held businesses—for M&A acquisitions, shareholder buyouts, gift/estate tax filings, or employee 409A equity valuations—requires bridging public market valuation data to an illiquid, closely held environment (Lundholm & Sloan Ch. 12).

Private company valuation differs from public equity valuation across two structural axes:
1. **Marketability (Liquidity):** Public shares can be sold in milliseconds on an exchange at near-zero transaction cost. Private shares have no public exchange, face contractual transfer restrictions, and require months (and heavy legal/banker fees) to monetize. This illiquidity requires a **Discount for Lack of Marketability (DLOM)**.
2. **Control:** A public stock price reflects a **liquid, minority position** (zero power to replace the CEO, declare dividends, or sell the company). Acquiring $51\%+$ of a company grants absolute operational and strategic authority, commanding a **Control Premium** (or conversely, applying a **Discount for Lack of Control / DLOC** to minority private stakes).

## Structure
### The Levels of Value Framework

```
The Four Levels of Corporate Valuation
┌────────────────────────────────────────────────────────┐
│ Level 1: Synergistic Strategic Value (Highest)         │
│ • Control Value + Buyer-Specific M&A Synergies         │
│ • Benchmark: Precedent Strategic M&A Multiples         │
└───────────────────────────┬────────────────────────────┘
                            │ Less: Strategic Synergies
                            ▼
┌────────────────────────────────────────────────────────┐
│ Level 2: Controlling Standalone Value                  │
│ • 100% control over cash flows, capital structure, CEO │
│ • Benchmark: Standalone DCF of Optimal Cash Flows      │
└───────────────────────────┬────────────────────────────┘
                            │ Less: Discount for Lack of Control (DLOC: 15%-25%)
                            │ (or Plus: Control Premium of 20%-35% from Level 3)
                            ▼
┌────────────────────────────────────────────────────────┐
│ Level 3: Marketable Minority Value                     │
│ • Liquid stock, zero board control                     │
│ • Benchmark: Publicly Traded Peer Multiples (S&P 500)  │
└───────────────────────────┬────────────────────────────┘
                            │ Less: Discount for Lack of Marketability (DLOM: 15%-35%)
                            ▼
┌────────────────────────────────────────────────────────┐
│ Level 4: Non-Marketable Minority Value (Lowest)        │
│ • Illiquid private shares + zero voting control        │
│ • Benchmark: Private minority stake / 409A Common Val  │
└────────────────────────────────────────────────────────┘
```

###Multiplicative Discount Math (Never Add Discounts Linearly!)
DLOC and DLOM are applied sequentially (multiplicatively), never added together:
$$\text{Combined Discount} = 1 - \left[ (1 - \text{DLOC}) \times (1 - \text{DLOM}) \right]$$
$$\text{Relationship Between Control Premium (CP) and DLOC: } \text{DLOC} = 1 - \frac{1}{1 + \text{CP}}$$
*(Example: A $25\%$ Control Premium implies a $\text{DLOC} = 1 - \frac{1}{1.25} = 20.0\%$).*

## Common Misconceptions
- **Misconception 1: "If DLOC is 20% and DLOM is 30%, the total valuation discount is 50%."**  
  *Reality:* Discounts apply sequentially to the remaining value base: $1 - (1 - 0.20)(1 - 0.30) = 1 - (0.80 \times 0.70) = 1 - 0.56 = 44.0\%$, not $50\%$.
- **Misconception 2: "You should apply a Control Premium to every DCF valuation when buying a company."**  
  *Reality:* Look at the cash flows you modeled in the DCF! If your DCF model *already* includes optimized margins, post-deal synergies, and optimal capital structure, your DCF output is **already at Level 1 / Level 2 (Control Value)**! Slapping an additional 30% Control Premium on top of an optimized DCF double-counts control and causes massive overpayment.
- **Misconception 3: "Private company financials can be used directly without owner normalization."**  
  *Reality:* Private business owners routinely run personal expenses (vehicles, travel, family salaries, above-market rent on owner-owned real estate) through the income statement to minimize taxes, or pay themselves below-market salaries. Always normalize private EBITDA for **Fair Market Executive Compensation** and arm's-length rent before applying any valuation model.

## Notes for Future-Me
How to estimate the **Discount for Lack of Marketability (DLOM)** rigorously without guessing:
1. **Restricted Stock Studies / Pre-IPO Studies:** Empirical price discounts observed on restricted Rule 144 stock placements compared to freely traded shares ($15\%-30\%$).
2. **Option-Pricing DLOM Models (Chaffe / Finnerty / Longstaff):** Model the cost of illiquidity as the value of an **At-the-Money Put Option** (or Asian lookback put) with time to expiration equal to the expected years until a liquidity event ($T$) and volatility equal to peer stock volatility ($\sigma$). Higher volatility and longer lock-up horizons mathematically justify a larger DLOM.

