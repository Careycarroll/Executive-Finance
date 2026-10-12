# Corporate Hedging Strategy & Risk Governance

## Intuition
In a frictionless Modigliani-Miller world, corporate hedging is irrelevant: diversified shareholders can hedge currency, commodity, or interest rate risks in their own personal portfolios at the exact same cost as the corporation.

In real-world executive finance (Hawawini & Viallet; Froot, Scharfstein & Stein, 1993), **corporate hedging directly increases firm value** by eliminating market frictions and financial distress costs:
1. **Avoiding Costly External Financing (Underinvestment Problem):** Without hedging, a sudden commodity spike or currency crash depletes internal operating cash flow. If capital markets are frozen or expensive, the firm is forced to slash high-NPV R&D and CapEx projects. Hedging ensures internal cash flow is available when strategic investment opportunities arise.
2. **Reducing Expected Costs of Financial Distress:** By smoothing cash flow volatility, hedging lowers the probability of breaching debt covenants or defaulting on bond payments, expanding the firm's debt capacity and lowering its cost of debt.
3. **Tax Convexity Optimization:** Under progressive tax schedules or limited NOL carryforwards, a firm paying taxes on volatile earnings pays higher expected cumulative taxes than a firm earning stable pre-tax income.

## Structure
### The Executive Hedging Decision Matrix

| Corporate Exposure Scenario | Optimal Hedging Action | Rationale |
|---|---|---|
| **High Leverage / Tight Debt Covenants** | Hedge Aggressively ($75\%-100\%$) | Cash flow shock could trigger technical default, bankruptcy costs, or fire-sale asset liquidations. |
| **High R&D / Growth CapEx Pipeline** | Hedge Operating Cash Flows | Guarantees internal funding for strategic investments without issuing dilutive equity in downturns. |
| **Zero Debt + Massive Cash Reserves** | Minimal Financial Hedging | Balance sheet acts as a natural buffer; save derivative transaction spreads and margin lock-ups. |
| **Competitors Pass Costs to Customers** | Do Not Over-Hedge Fixed Prices | If raw material prices fall and you locked in high fixed forward prices while unhedged competitors cut retail prices, your margins collapse! |

```
Natural Operational Hedges vs. Financial Derivative Hedges
┌────────────────────────────────────────────────────────┐
│ Step 1: Operational / Natural Hedging (Zero Friction)  │
│ • Match currency of costs to currency of revenues      │
│ • Build multi-region manufacturing plants              │
│ • Include raw material price escalators in B2B contracts│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Step 2: Balance Sheet Hedging                          │
│ • Issue Euro-denominated debt to fund European assets  │
│ • Match debt maturity duration to asset cash duration  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Step 3: Derivative Hedging (Residual Net Exposure Only)│
│ • Use Forwards/Swaps for certain contractual exposures │
│ • Use Options (Caps/Floors) for uncertain/contingent   │
│   exposures (e.g., pending M&A bids, competitive pricing)│
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "The treasury department should be evaluated as a profit center."**  
  *Reality:* Treating corporate treasury as a profit center is one of the fastest ways to destroy a corporation (e.g., Procter & Gamble 1994 derivatives scandal, Metallgesellschaft). The goal of hedging is **variance reduction and cash flow certainty**, not beating the market.
- **Misconception 2: "If our hedge lost money this quarter, the hedging decision was a mistake."**  
  *Reality:* If a hedge loses money on settlement, it means the underlying commercial business made an offsetting windfall gain! Evaluating a hedge in isolation from the underlying operational exposure is like complaining that your house didn't burn down after paying fire insurance.
- **Misconception 3: "Forwards are always better than options because forwards cost zero upfront premium."**  
  *Reality:* Forwards lock in a symmetric obligation. If you hedge a *contingent* exposure (like bidding on a foreign acquisition) with an FX forward and the deal falls through, you are left holding a massive naked speculative currency position! Always hedge contingent exposures with **Options**, never Forwards.

## Notes for Future-Me
Establish three ironclad rules in your Board Risk Committee charter:
1. **Net Across the Enterprise First:** Never allow Division A to pay bank spreads to buy EUR/USD forwards while Division B pays bank spreads to sell EUR/USD forwards. Centralize all exposures in a single global treasury netting center and hedge only the **net residual exposure**.
2. **Watch Liquidity Margin Calls (The Metallgesellschaft Trap):** Never hedge long-term illiquid physical assets with short-term rolling futures unless you have massive credit lines to fund daily variation margin calls. A mismatch between cash margin outflows today and physical asset inflows 5 years from now can bankrupt a solvent company.
3. **Match Instrument to Exposure:** Certain cash flow $\to$ Forward/Swap. Uncertain or competitive cash flow $\to$ Option Cap/Floor.
