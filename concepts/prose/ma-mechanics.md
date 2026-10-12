# M&A Deal Mechanics & Accretion/Dilution

## Intuition
Mergers and acquisitions (M&A) represent the most capital-intensive, high-stakes decisions an executive team can execute. Behind the strategic narrative lies rigorous transaction arithmetic: purchase consideration mix, synergy realization, purchase price allocation (PPA), and pro-forma **EPS Accretion / Dilution** modeling.

Corporate buyers evaluate transaction financing across two primary modes:
1. **Cash / Debt Financing:** Buyer issues corporate debt or draws revolver liquidity. Transaction cost is the after-tax cost of debt: $r_{\text{debt}} \times (1 - t)$.
2. **Stock Financing:** Buyer issues new shares to target shareholders at a negotiated **Exchange Ratio**:
   $$\text{Exchange Ratio} = \frac{\text{Offer Price per Target Share}}{\text{Buyer Stock Price}}$$

The immediate test demanded by Wall Street equity analysts is whether the transaction is **Accretive** (pro-forma EPS increases) or **Dilutive** (pro-forma EPS decreases). In an all-stock transaction without synergies, accretion is governed by relative valuation multiples:
$$\text{If Buyer P/E} > \text{Target P/E} \implies \text{Deal is Accretive to Buyer EPS}$$
$$\text{If Buyer P/E} < \text{Target P/E} \implies \text{Deal is Dilutive to Buyer EPS}$$

## Structure
### Consideration Architecture: Cash vs. Stock Transactions

| Dimension | All-Cash Consideration | All-Stock Consideration |
|---|---|---|
| **Shareholder Approval** | Generally does not require buyer shareholder vote if within credit lines | Typically requires buyer shareholder vote if dilution exceeds 20% (NYSE/NASDAQ rules) |
| **Tax Impact on Sellers** | Immediate taxable capital gains event for target shareholders | Can qualify as a tax-free reorganization under IRC §368 (tax deferred until sale) |
| **Risk / Reward Sharing** | Buyer absorbs 100% of integration, synergy, and macro risks | Target shareholders become equity partners; risk of failure is shared pro-rata |
| **Balance Sheet Impact** | Leverages balance sheet; increases Net Debt / EBITDA ratio | De-levers balance sheet; dilutes existing equity ownership and control |
| **P/E Arbitrage** | Driven by after-tax borrowing cost vs target earnings yield | Driven purely by buyer vs target P/E valuation differential |

```
Purchase Price Allocation (PPA) Waterfall
┌────────────────────────────────────────────────────────┐
│ Offer Purchase Equity Value: $1,000M                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Less: Target Book Value of Net Assets: $300M           │
│ = Purchase Price Excess over Book: $700M               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Step-up to Fair Value of Identifiable Assets:          │
│ • Write-up Plant, Property & Equipment: +$100M         │
│ • Identify Customer Relationships & IP: +$200M         │
│ • Deferred Tax Liability Created (DTL): -$75M          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Residual Unallocated Excess = GOODWILL: $475M          │
│ (Subject to annual ASC 350 impairment testing)         │
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "An EPS accretive transaction always creates economic shareholder value."**  
  *Reality:* EPS accretion is an accounting illusion. A company trading at 25x P/E can acquire a troubled, declining business at 8x P/E with zero synergies and instantly show "accretive EPS" because it issued expensive stock to buy cheap earnings. If the buyer overpays relative to true discounted cash flows, **economic value is destroyed** and the buyer's stock price will fall upon announcement.
- **Misconception 2: "Cost synergies and revenue synergies carry equal credibility."**  
  *Reality:* In board and investment committee evaluations, discount revenue synergies to zero. Eliminating duplicate headquarters, consolidating corporate IT licenses, and merging procurement contracts (cost synergies) are under management control and 80%+ achievable. Cross-selling products to each other's customer bases (revenue synergies) fails more than 70% of the time.
- **Misconception 3: "Goodwill is an asset that can be amortized."**  
  *Reality:* Under US GAAP (ASC 350), goodwill is never amortized. It sits on the balance sheet indefinitely until poor post-deal performance triggers a mandatory, non-cash **Goodwill Impairment Charge**, which directly wipes out GAAP net income and equity book value.

## Notes for Future-Me
"Beware the CEO empire-building virus."
Most large M&A transactions fail to earn back the buyer's cost of capital. Before signing off on any acquisition:
1. **Benchmark ROIC vs. WACC:** Calculate post-deal Return on Invested Capital:
   $$\text{ROIC}_{\text{deal}} = \frac{\text{Target NOPAT} + \text{After-Tax Synergies}}{\text{Total Purchase Price} + \text{Transaction Fees} + \text{Integration CapEx}}$$
   If projected Year 3 ROIC is less than the combined entity WACC, the deal destroys shareholder wealth, regardless of what investment bankers claim about EPS accretion.
2. **Calculate Break-Even Synergies:** Determine the minimum dollar amount of annual synergies required just to cover the acquisition premium paid. If the required synergy number exceeds 20% of the target's operating costs, walk away.

