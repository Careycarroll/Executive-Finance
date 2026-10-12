# Capital Budgeting & Capital Allocation Decisions

## Intro
Capital allocation is the preeminent, non-delegable duty of the Chief Executive Officer and senior leadership team. Warren Buffett once observed that over a ten-year tenure, a CEO whose company retains 10% of earnings annually will allocate capital equal to more than 60% of the firm's entire starting net worth. Doing this well creates enduring competitive advantage; doing it poorly squanders decades of operational brilliance.

Capital budgeting is the formalized process of planning, evaluating, and selecting long-term investments in tangible and intangible assets:
1. **Organic Growth:** Building new factories, data centers, product lines, and geographic expansion.
2. **Inorganic Growth (M&A):** Acquiring competitors, bolt-on technologies, or strategic supply chain targets.
3. **Operational Efficiency / Maintenance:** Upgrading automation, cybersecurity, compliance, and plant overhauls.
4. **Capital Return to Investors:** Paying regular or special cash dividends, repurchasing undervalued shares, or paying down debt.

The executive objective is unambiguous: allocate every dollar of discretionary capital to the highest risk-adjusted Net Present Value opportunity available across the entire enterprise portfolio.

## Diagram
### The Executive Capital Allocation Hierarchy

```
                      ┌─────────────────────────────────────────┐
                      │    Gross Operating Cash Flow (NOPAT)    │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
             ┌──────────────────────────────────────────────────────────┐
             │       Mandatory Commitments (Base Preservation)          │
             │  • Maintenance CapEx (Replace depreciated capacity)      │
             │  • Required Working Capital Support (CCC)                │
             │  • Senior Debt Service & Interest Obligations            │
             └─────────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Discretionary Free Cash Flow (FCF)   │
                      └────────────────────┬────────────────────┘
                                           │
      ┌────────────────────────────────────┼────────────────────────────────────┐
      ▼                                    ▼                                    ▼
┌───────────────┐                  ┌───────────────┐                  ┌───────────────────┐
│ Reinvestment  │                  │  M&A / Bolt-On │                  │  Capital Return   │
│ In Growth     │                  │  Acquisitions │                  │  To Shareholders  │
├───────────────┤                  ├───────────────┤                  ├───────────────────┤
│ • R&D Labs    │                  │ • Synergy M&A │                  │ • Share Buybacks  │
│ • New Plants  │                  │ • Tech Talent │                  │   (if P0 < IV)    │
│ • Org. Sales  │                  │ • Carve-Outs  │                  │ • Cash Dividends  │
│ Criteria:     │                  │ Criteria:     │                  │ • Debt Prepayment │
│ NPV > 0       │                  │ Return > WACC │                  │   (De-risking)    │
│ ROIC > WACC   │                  │ Post-Synergy  │                  │                   │
└───────────────┘                  └───────────────┘                  └───────────────────┘
```

### Capital Allocation Rule Comparison

| Valuation Metric | Formula / Rule | Executive Strengths | Fatal Traps / Vulnerabilities |
|---|---|---|---|
| **Net Present Value (NPV)** | $\sum \frac{\text{CF}_t}{(1+r)^t} - C_0 > 0$ | Measures actual wealth creation in currency; additive across projects; monotonic. | Sensitive to discount rate assumptions; doesn't intuitively communicate rate of return. |
| **Internal Rate of Return (IRR)** | $\text{Rate where NPV} = 0$ | Convenient percentage hurdle easily grasped by boards and non-finance managers. | Assumes cash reinvestment at IRR; ignores project scale; fails with sign-reversing cash flows. |
| **Profitability Index (PI)** | $\frac{\text{PV of Inflows}}{\text{CapEx Outlay}}$ | Perfect for **capital rationing** (ranking projects when capex budget is fixed). | Ignores absolute dollar wealth creation; biased against massive infrastructure projects. |
| **Payback Period** | $\text{Years to recoup } C_0$ | Extreme focus on liquidity and downside survival in volatile environments. | Completely ignores all cash flows after payback date; ignores time value of money. |

## Common Misconceptions
- **Misconception 1: "Always accept all positive-NPV projects."**
  *Reality:* In a theoretical frictionless world, firms raise unlimited capital. In the real world, companies operate under **capital rationing** (limits on debt covenants, executive bandwidth, engineering talent, and organizational absorption capacity). When capital is constrained, maximize total NPV subject to constraints using the Profitability Index ($\text{PI}$) or integer programming.
- **Misconception 2: "Share repurchases are always good because they increase Earnings Per Share (EPS)."**
  *Reality:* Repurchasing shares at prices above their Intrinsic Value ($P > \text{IV}$) destroys value for remaining long-term shareholders, regardless of whether EPS increases mechanically. Buybacks are only value-accretive when shares trade at a discount to conservative intrinsic value.
- **Misconception 3: "Sunk costs must be factored into our decision to continue funding a project."**
  *Reality:* Money already spent is gone forever. Decisions must look forward exclusively at **incremental future cash flows** versus **incremental future investment**. The "Concorde Fallacy" (pouring billions into a doomed asset because "we've already invested too much to stop") is the hallmark of insecure leadership.

## Notes for Future-Me
Maintain an explicit **Capital Allocation Hurdle Rate Register** and track post-completion audits. When division heads submit capital expenditure requests (AFEs), their pitch decks will always forecast 25% IRRs and hockey-stick revenues. Institute a mandatory 2-year and 5-year **Look-Back Review**: compare actual realized project cash flows against the original pitch deck. 

When you discover that a team systematically over-forecasts revenues by 30% and under-forecasts CapEx overruns by 20%, adjust their future capital budgets accordingly. Great CEOs do not pick winners by trusting unchecked spreadsheets; they create governance that enforces accountability for invested capital.

