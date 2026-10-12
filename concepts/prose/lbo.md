# Leveraged Buyout (LBO) Structure & Returns Math

## Intuition
A Leveraged Buyout (LBO) is the acquisition of a mature company funded using a substantial proportion of borrowed capital (typically 50% to 70% debt) and a minority equity check (30% to 50%) provided by a private equity sponsor.

The financial engineering magic of an LBO relies on using the target company's own **future operating free cash flows to service and pay down the acquisition debt**. Over a standard 3-to-7 year private equity holding period, as corporate debt is paid down, the private equity fund's equity value expands dramatically—even if the total Enterprise Value of the company does not grow!

Private equity investment committees evaluate buyout performance using two core return benchmarks:
1. **Internal Rate of Return (IRR):** The annualized compound rate of return on invested equity (target threshold typically $20\%-25\%$).
2. **Multiple on Invested Capital (MoIC / Cash-on-Cash):** The total cash distributed at exit divided by initial sponsor equity invested (target $2.0\times - 3.0\times$).

## Structure
### The Three Levers of Private Equity Value Creation

$$\Delta \text{Equity Value} = \underbrace{\Delta \text{Net Debt Paid Down}}_{\text{Financial Engineering}} + \underbrace{\Delta \text{EBITDA Growth}}_{\text{Operational Improvement}} + \underbrace{\Delta \text{EV/EBITDA Multiple}}_{\text{Market Expansion}}$$

```
LBO Financing Structure & Capital Tranche Waterfall
┌────────────────────────────────────────────────────────┐
│ Senior Secured Bank Debt (Revolver + Term Loan A)      │
│ • Cost: SOFR + 200-300 bps | Collateral: 1st Lien A/R  │
├────────────────────────────────────────────────────────┤
│ Institutional Term Loan B                              │
│ • Cost: SOFR + 350-450 bps | Tenor: 7 Years            │
├────────────────────────────────────────────────────────┤
│ Senior Unsecured / High-Yield Notes                    │
│ • Cost: Fixed 7.5% - 10.0% | Tenor: 8-10 Years         │
├────────────────────────────────────────────────────────┤
│ Mezzanine / Subordinated Debt (w/ equity warrants)     │
│ • Cost: 12% - 15% | High flexibility                   │
├────────────────────────────────────────────────────────┤
│ SPONSOR EQUITY CHECK (20% - 40% of Purchase Price)     │
│ • Absorbs 100% first-loss risk; captures 100% residual │
└────────────────────────────────────────────────────────┘
```

| Return Benchmark | 3-Year Hold | 5-Year Hold | 7-Year Hold |
|---|---|---|---|
| **$2.0\times\text{ MoIC}$** | $26.0\%\text{ IRR}$ | $14.9\%\text{ IRR}$ | $10.4\%\text{ IRR}$ |
| **$2.5\times\text{ MoIC}$** | $35.7\%\text{ IRR}$ | $20.1\%\text{ IRR}$ | $14.0\%\text{ IRR}$ |
| **$3.0\times\text{ MoIC}$** | $44.2\%\text{ IRR}$ | $24.6\%\text{ IRR}$ | $17.0\%\text{ IRR}$ |

## Common Misconceptions
- **Misconception 1: "LBO returns rely primarily on multiple expansion."**  
  *Reality:* Professional buyout models never underwrite deals assuming multiple expansion. Buying at 10x EBITDA and exiting at 13x is speculative hope. A durable, defensible LBO thesis assumes flat or slightly contracted exit multiples (e.g., buy at 10x, exit at 9.5x) and generates 20%+ IRR strictly through operational EBITDA margin expansion and rapid debt paydown.
- **Misconception 2: "EBITDA is the cash available to service debt."**  
  *Reality:* "EBITDA doesn't pay interest; cash does." To service debt, EBITDA must be reduced by taxes, interest expense, working capital expansion, and **Maintenance CapEx**. A company with \$50M EBITDA but \$35M annual maintenance CapEx cannot support high debt leverage.
- **Misconception 3: "Adding more leverage always boosts equity IRR."**  
  *Reality:* Leverage increases financial risk non-linearly. If debt becomes excessive, high interest burdens consume cash needed for operational growth, restrictive bank covenants choke strategic flexibility, and a modest $15\%$ recessionary drop in revenue can trigger covenant default and total equity wipeout.

## Notes for Future-Me
The ideal "LBO Target Profile" has five non-negotiable characteristics:
1. **High Cash Conversion:** Free Cash Flow / EBITDA ratio exceeding $60\%$ (low capital intensity, low working capital drag).
2. **Predictable Recurring Revenues:** High customer retention, contractual subscription models, or mission-critical enterprise software.
3. **Defensible Economic Moat:** Pricing power that allows passing inflation through to customers without volume churn.
4. **Strong Asset Collateral Base:** Substantial accounts receivable, inventory, or owned real estate to support cheap first-lien bank borrowing.
5. **Clear Operational Exit Plan:** Identified carve-out cost reductions and strategic strategic acquirers ready to buy the scaled business in Year 5.

