# Deferred Taxes & Net Operating Losses

## Intuition
Financial reporting rules (GAAP / IFRS) and statutory tax accounting rules (IRC / Tax Code) serve two conflicting purposes:
- **GAAP Accounting:** Designed to provide investors with an accurate picture of economic performance via accrual matching.
- **Tax Accounting:** Designed by lawmakers to collect government revenue and incentivize corporate investment via accelerated deductions.

Because GAAP and tax rules recognize revenues and expenses at different times, companies experience **temporary book-tax timing differences**:
1. **Deferred Tax Liability (DTL):** Occurs when GAAP pre-tax income is higher than taxable income today, meaning taxable income will be higher in future years. The most common driver is **accelerated tax depreciation (MACRS / Section 168(k) Bonus Depreciation)**: companies deduct equipment immediately on tax returns (paying low taxes today), but depreciate straight-line over 10 years on GAAP income statements. A DTL represents future taxes owed.
2. **Deferred Tax Asset (DTA):** Occurs when taxable income is higher than GAAP pre-tax income today, meaning future taxes will be lower. Driven by warranty accruals, deferred revenue, stock-based compensation, and **Net Operating Loss (NOL) carryforwards**.

**The Valuation Allowance Reality:** Under ASC 740, if management determines it is "more likely than not" ($> 50\%$ probability) that the company will not generate sufficient future taxable income to utilize its DTAs before expiration, it must establish a **Valuation Allowance**, writing down the DTA directly against GAAP earnings.

## Formula
$$\text{Book-Tax Temporary Difference} = \text{GAAP Carrying Value of Asset/Liability} - \text{Tax Basis of Asset/Liability}$$

$$\text{Deferred Tax Asset / Liability} = \text{Temporary Difference} \times t_{\text{statutory}}$$

$$\text{GAAP Income Tax Provision} = \text{Current Cash Tax Paid} + \Delta\text{DTL} - \Delta\text{DTA} + \Delta\text{Valuation Allowance}$$

$$\text{NOL Utilization Cap (TCJA §172)}: \text{Max Annual Offset} = 80\% \times \text{Taxable Income}$$

## Variable Glossary
- **$\text{DTL}$**: Deferred Tax Liability (future tax cash outflow liability).
- **$\text{DTA}$**: Deferred Tax Asset (future tax cash savings asset).
- **$\text{Tax Basis}$**: The value of an asset or liability recognized on tax returns filed with the IRS.
- **$t_{\text{statutory}}$**: Enacted statutory corporate income tax rate expected to apply when timing difference reverses.
- **$\text{Valuation Allowance}$**: Contra-asset account offsetting DTAs when future realization is in doubt.
- **$\text{NOL}$**: Net Operating Loss carryforward.

## Worked Example
A high-tech manufacturer purchases $\$100{,}000{,}000$ in advanced robotics equipment at the start of Year 1:
- Statutory Corporate Tax Rate ($t$): $25\%$
- **GAAP Accounting:** Straight-line depreciation over 5 years with zero salvage value ($\$20{,}000{,}000$ per year).
- **Tax Accounting:** 100% Bonus Depreciation under IRC Section 168(k) in Year 1 ($\$100{,}000{,}000$ deduction immediately).

**At the End of Year 1:**
- **GAAP Book Carrying Value:** $\$100\text{M} - \$20\text{M} = \$80{,}000{,}000$.
- **Tax Basis of Equipment:** $\$100\text{M} - \$100\text{M} = \$0$.
- **Temporary Taxable Difference:** $\$80{,}000{,}000 - \$0 = \$80{,}000{,}000$.

**Calculate Deferred Tax Liability (DTL):**
$$\text{DTL}_1 = \$80{,}000{,}000 \times 25\% = \$20{,}000{,}000$$

The company records a $\$20{,}000{,}000$ liability on its balance sheet.
Over Years 2 through 5, the company will take zero tax depreciation but will record $\$20\text{M}$ annually of GAAP depreciation, causing the DTL to reverse by $\$5{,}000{,}000$ each year until it reaches $\$0$ at Year 5.

**Economic Reality:**
The company saved $\$25{,}000{,}000$ in cash taxes in Year 1 ($100\text{M} \times 25\%$). The DTL serves as an **interest-free loan from the government** for 5 years!

## When to Use
- **When to use:** M&A transaction structuring (Section 338(h)(10) elections to step up tax basis and wipe out DTLs), valuing distressed turnaround targets with NOL carryforwards, and projecting cash taxes vs. GAAP tax expense in DCF models.
- **When not to use / Caveats (Section 382 NOL Limitation):** When acquiring a target with massive accumulated Net Operating Losses (NOLs), do NOT assume you can immediately use all those NOLs to wipe out your own corporate taxes! Under IRC Section 382, an "ownership change" ($> 50\%$ shift) imposes an **annual limit on NOL utilization**:
$$\text{Annual Section 382 Cap} = \text{Target Equity Value at Acquisition} \times \text{Long-Term Tax-Exempt Rate}$$

## Notes for Future-Me
Treat DTLs with analytical sophistication in valuation:
In a high-growth company that continually reinvests in new CapEx year after year, old DTLs reverse, but are immediately replaced by even larger new DTLs on new equipment! Consequently, the aggregate DTL balance on the balance sheet **never actually gets paid down**—it compounds perpetually into the future as long as the business grows.

In DCF valuation models, never treat a compounding, growing DTL as immediate debt that reduces equity value. Model actual projected cash taxes paid in Free Cash Flow instead of relying on distorted GAAP tax provision accruals.

