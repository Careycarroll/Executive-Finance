# Selecting Comparables & Peer Benchmarking

## Intuition
Relative valuation (Multiples Analysis) estimates an asset's value by pricing it relative to how the market currently prices similar assets. While mathematically simple, the entire validity of a multiples valuation rests on a single foundational discipline: **how the comparable peer group ("Comps") is constructed and normalized** (Easton Mod. 13; Lundholm & Sloan Ch. 11).

Two companies in the same industry classification (SIC / NAICS / GICS code) do not automatically warrant the same valuation multiple. From fundamental valuation algebra (Gordon Growth / DCF), a company's equilibrium multiple is a direct function of three fundamental value drivers:
$$\text{Equilibrium Multiple} = f\left( \underbrace{\text{Expected Growth } (g)}_{+}, \quad \underbrace{\text{Return on Invested Capital } (\text{ROIC})}_{+}, \quad \underbrace{\text{Risk / Cost of Capital } (\text{WACC})}_{-} \right)$$

Consequently, selecting a defensible peer group requires filtering by **economic fundamentals and business model characteristics**, not superficial industry labels.

## Structure
### The Four-Filter Comparable Selection Protocol

| Selection Filter | Analytical Criteria | Why It Matters for Multiples |
|---|---|---|
| **1. Business Model & Revenue Mix** | Recurring subscription vs hardware transactional; B2B vs B2C; asset-light vs capital-intensive. | Recurring revenue commands $2\times-3\times$ higher multiples due to lower cash flow volatility (lower WACC). |
| **2. Scale & Market Position** | Revenue size band ($0.5\times$ to $2.0\times$ target), geographic footprint, customer concentration. | Sub-scale companies suffer from illiquidity discounts and lack operating leverage. |
| **3. Growth & Profitability Profile** | Expected 3-year revenue CAGR and EBITDA / EBIT margin trajectory ("Rule of 40" in software). | High-growth companies trade at compressed near-term multiples that normalize 3 years out. |
| **4. Capital Structure & Accounting** | Leverage ratios, US GAAP vs IFRS lease accounting, fiscal year-end calendar alignment. | Prevents mechanical distortions in P/E and EV/EBITDA numerators and denominators. |

```
Comp Sheet Normalization Checklist (Before Computing Any Multiple)
┌────────────────────────────────────────────────────────┐
│ 1. Calendarize Financial Statements                    │
│ • Align all peers to Trailing Twelve Months (LTM) and  │
│   Next Twelve Months (NTM) calendar periods.           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Scrub Non-Recurring Items ("Clean EBITDA / NOPAT")  │
│ • Strip out one-time litigation settlements, M&A fees, │
│   asset impairments, and restructuring charges.        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Harmonize Accounting Policies                       │
│ • Deduct Stock-Based Comp uniformly across all peers   │
│ • Capitalize operating leases consistently (EBITDAR)   │
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "The industry mean or median multiple is the 'fair value' for our target."**  
  *Reality:* If your target company grows at 4% with an 8% ROIC while the peer group median grows at 12% with a 20% ROIC, applying the peer median multiple to your target massively overvalues the asset! Always use **value-driver regression** (e.g., plotting EV/Sales against EBITDA Margin + Growth) rather than blind averages.
- **Misconception 2: "Management's 'Adjusted EBITDA' press release numbers can be plugged directly into a comp table."**  
  *Reality:* Different companies define "Adjusted EBITDA" wildly differently—some add back normal recurring software development, customer acquisition costs, or store opening expenses. Always rebuild adjusted metrics from the raw audited GAAP 10-K footnotes using a single uniform definition across all peers.
- **Misconception 3: "Trading Comps and Precedent Transaction Comps measure the same thing."**  
  *Reality:* **Public Trading Comps** reflect the value of a liquid, minority single share on an exchange. **Precedent M&A Transaction Comps** include a $20\%-40\%$ **Control Premium** and priced-in buyer synergies, representing the price required to acquire 100% ownership.

## Notes for Future-Me
Never allow an investment banker or corporate development analyst to cherry-pick aspirational peers ("aspirational comps") to inflate a valuation pitch:
- A regional brick-and-mortar retailer launching a website is **not** comparable to Amazon.
- An automotive manufacturer developing electric batteries is **not** comparable to a pure-play AI software company.
Whenever presented with a comparable valuation table, immediately inspect the **dispersion (interquartile range)** and ask: *"Which specific company was excluded from this peer list, and how does the median change if we put them back in?"*
