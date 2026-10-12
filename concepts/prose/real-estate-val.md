# Commercial Real Estate Valuation (NOI & Cap Rates)

## Intuition
Commercial Real Estate (CRE)—encompassing industrial warehouses, multifamily apartments, office towers, data centers, and retail centers—is valued as an income-producing cash flow stream. Whether an executive is evaluating a corporate headquarters sale-leaseback, acquiring a manufacturing facility, or allocating institutional capital to real estate funds, the universal valuation language centers on two metrics: **Net Operating Income (NOI)** and the **Capitalization Rate (Cap Rate)**.

Direct Capitalization applies the constant-growth perpetuity formula directly to property cash flows:
$$\text{Property Value } (V_0) = \frac{\text{Expected Next-12-Month Net Operating Income } (\text{NOI}_1)}{\text{Capitalization Rate } (R_{\text{cap}})}$$

Where the **Cap Rate** is fundamentally the property's required unlevered discount rate ($r$) minus the expected long-term constant growth rate of rents and NOI ($g$):
$$R_{\text{cap}} = r - g = \frac{\text{NOI}_1}{V_0}$$

## Structure
### The Commercial Real Estate Income & Cash Flow Waterfall

```
Commercial Property Cash Flow Statement Architecture
┌────────────────────────────────────────────────────────┐
│ Gross Potential Rent (GPR) (100% Occupancy at Mkt Rent)│
│ Less: Vacancy & Collection Loss (-5% to -10%)          │
│ Plus: Ancillary Income (Parking, tenant reimbursements)│
├────────────────────────────────────────────────────────┤
│ = EFFECTIVE GROSS INCOME (EGI)                         │
│ Less: Operating Expenses (Property taxes, insurance,   │
│       utilities, maintenance, property management fees)│
├────────────────────────────────────────────────────────┤
│ = NET OPERATING INCOME (NOI)  [Unlevered, Pre-Tax]     │
│ Less: Capital Expenditures (TI - Tenant Improvements,  │
│       LC - Leasing Commissions, Structural Reserves)   │
├────────────────────────────────────────────────────────┤
│ = UNLEVERED PROPERTY CASH FLOW (PBTCF)                 │
│ Less: Annual Mortgage Debt Service (Principal + Int.)  │
├────────────────────────────────────────────────────────┤
│ = LEVERED BEFORE-TAX CASH FLOW (EBTCF / Cash-on-Cash)  │
└────────────────────────────────────────────────────────┘
```

### Core Underwriting Ratios Used by Lenders & Investment Committees

| Metric | Formula | Institutional Lending / Underwriting Threshold |
|---|---|---|
| **Cap Rate ($R_{\text{cap}}$)** | $\frac{\text{NOI}_1}{\text{Property Value}}$ | Inverse of valuation multiple ($5\% \text{ Cap Rate} = 20\times \text{NOI}$). Lower cap rate = higher property price. |
| **Debt Service Coverage Ratio (DSCR)** | $\frac{\text{NOI}}{\text{Annual Debt Service (P + I)}}$ | Senior mortgage lenders require $\text{DSCR} \ge 1.25\times - 1.35\times$. |
| **Debt Yield** | $\frac{\text{NOI}}{\text{Total Loan Amount}}$ | Lender's unlevered return if they foreclose Day 1; typically require $\ge 8\% - 10\%$. |
| **Loan-to-Value (LTV)** | $\frac{\text{Loan Amount}}{\text{Appraised Property Value}}$ | Institutional commercial mortgages cap LTV at $55\% - 70\%$. |
| **Cash-on-Cash Return** | $\frac{\text{Levered Before-Tax Cash Flow}}{\text{Equity Down Payment}}$ | Measures current cash yield on actual equity check invested. |

## Common Misconceptions
- **Misconception 1: "NOI is equivalent to corporate EBITDA."**  
  *Reality:* While similar, NOI does not deduct recurring **Tenant Improvements (TIs)**, **Leasing Commissions (LCs)**, or roof/HVAC structural reserves. In office and retail real estate, TIs and LCs required to sign new tenants can consume $20\%-35\%$ of NOI! Professional buyers value properties on **Adjusted NOI (Cash Flow Available for Debt Service)** after deducting capital reserves.
- **Misconception 2: "A higher Cap Rate means a better investment."**  
  *Reality:* Just like a high dividend yield on a troubled stock, a high Cap Rate ($8\%-10\%$) reflects high perceived risk, tenant default exposure, functional obsolescence, or zero growth ($g \le 0$). A prime logistics warehouse leased to Amazon for 15 years trades at a low Cap Rate ($4.5\%-5.5\%$) because cash flows are bond-like and rents escalate annually.
- **Misconception 3: "Mortgage interest expenses are deducted when calculating NOI."**  
  *Reality:* **NOI is strictly an unlevered metric**. Debt service and income taxes are never deducted in NOI, ensuring properties can be compared apples-to-apples regardless of how the current owner financed the building.

## Notes for Future-Me
When evaluating **Corporate Sale-Leaseback Transactions** (selling company-owned factories or headquarters to a REIT and leasing them back under a 15-year Triple-Net / NNN lease):
- Compare the **Lease Cap Rate** (initial annual rent divided by sale proceeds) against your corporate **After-Tax Cost of Debt** and **WACC**.
- A sale-leaseback is simply an alternative form of 100% LTV financing! If you can issue senior secured corporate bonds at $6.0\%$, selling your mission-critical factory to a REIT at an $8.5\%$ Cap Rate with $3\%$ annual rent escalators is value-destructive financing—unless your internal ROIC on redeploying that cash exceeds $15\%+$.
