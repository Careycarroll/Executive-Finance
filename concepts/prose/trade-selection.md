# Quantitative Trade Selection & Structure Rules

## Intuition
Retail option traders almost universally follow a backward workflow: they pick a famous company in the news, guess whether the stock will go up or down, and buy a random Call or Put. Because options are a multidimensional pricing surface governed by Implied Volatility, Skew, Term Structure, and Bid-Ask Friction, **being right on stock direction frequently still results in losing money** (due to post-event volatility crush or Theta decay).

In institutional options trading (Sinclair Ch. 4; Natenberg Ch. 18), trade selection follows a strict **three-stage funnel**:
1. **Identify the Source of Statistical Edge:** Why is this option mispriced? (Variance Risk Premium, Earnings IV overstatement, Skew dislocation, or Term Structure distortion).
2. **Select the Optimal Structure to Isolate That Edge:** Choose the exact spread geometry that maximizes exposure to your desired Greek while neutralizing unwanted risks.
3. **Pass the Execution & Liquidity Filter:** If bid-ask slippage consumes more than $25\%$ of your theoretical Expected Value (EV), reject the trade immediately.

## Structure
### The Institutional Option Structure Selection Matrix

| Forecasted Market View | Implied Volatility Regime | Optimal Option Structure | Why This Structure Wins |
|---|---|---|---|
| **Neutral / Range-Bound** | High IV Rank + Steep Skew | **Short Iron Condor / Strangle** | Harvests Variance Risk Premium ($+\Theta, -\mathcal{V}$) from both tails. |
| **Neutral / Volatility Pin** | Moderate IV + Near Expiry | **Long Butterfly Spread** | High $4:1+$ payout ratio with strictly capped risk if market breaks out. |
| **Moderate Bullish** | High Implied Volatility | **Bull Put Credit Spread** or **$1 \times 2$ Put Ratio** | Sells expensive OTM put skew; profits from stock rising, staying flat, OR vol crushing! |
| **Aggressive Bullish Breakout** | Low Implied Volatility | **Long Call** or **Call Backspread** | Maximizes positive Gamma ($+\Gamma$) and Long Vega ($+\mathcal{V}$) when options are cheap. |
| **Event Catalyst (Earnings)** | Extreme Front-Month Backwardation | **Long Calendar Spread** or **Iron Fly** | Sells $100\%+$ front-month event IV while hedging tail risk with back-month or wing legs. |

```
The 4-Gate Quantitative Trade Filtering Funnel
┌────────────────────────────────────────────────────────┐
│ Gate 1: Volatility Valuation Screen                    │
│ • Compare Current IV vs Forecasted Realized Vol (RV)   │
│ • Requires |IV - RV| > 4.0 vol points of statistical edge│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Gate 2: Skew & Term Structure Alignment                │
│ • Buy low-IV legs; Sell high-IV legs along the surface │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Gate 3: Bid-Ask Friction & Liquidity Audit             │
│ • Bid-Ask Width must be < 5% of option premium         │
│ • Open Interest > 1,000 contracts; tight market makers │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Gate 4: Kelly / Tail-Risk Position Sizing              │
│ • Max loss under 3-sigma shock < 1.5% of total NAV     │
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "Adding more legs to an option strategy makes it more sophisticated and profitable."**  
  *Reality:* Every additional leg you add to an option structure (e.g., a 4-legged Condor or Double Diagonal) **multiplies your bid-ask slippage and exchange fees by $4\times$** both on entry and exit! If a single-leg or two-leg vertical spread expresses 90% of the same Greek exposure with half the transaction friction, **always choose the simpler structure**.
- **Misconception 2: "High Implied Volatility means you should always sell options."**  
  *Reality:* High Implied Volatility means the market is pricing in a major move. Selling options before a binary biotech FDA ruling or an M&A buyout rumor because "IV is at the 99th percentile" is picking up pennies in front of a steamroller. Only sell high IV when it represents **structural risk-aversion hedging demand** (the Variance Risk Premium), not informed event jump risk!

## Notes for Future-Me
Before clicking "Transmit" on any options order, answer the **"Who Is On The Other Side?" Test**:
- If a counterparty is paying you a massive premium, ask *why*: Are they a price-insensitive hedger (e.g., a pension fund forced by mandate to buy monthly S&P 500 puts regardless of price)? If yes, you are getting paid to provide liquidity and insurance—**take the trade**.
- Or is the counterparty an informed institutional flow trader aggressively sweeping the offer on 2-week Out-of-the-Money calls in an illiquid mid-cap stock? If yes, you are being adverse-selected by informed flow—**step aside immediately**.

