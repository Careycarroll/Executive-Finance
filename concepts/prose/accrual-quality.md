# Accrual Quality & Earnings Persistence

## Intuition
Under accrual accounting, revenues and expenses are recognized when economic performance obligations are satisfied, not when cash changes hands. Consequently, **Net Income = Cash Flow from Operations + Accruals**.

Accruals are essential for matching revenues with expenses, but they require managerial judgment, estimates, and subjectivity (revenue recognition milestones, bad debt allowances, inventory obsolescence provisions, capitalized software development).

Richard Sloan’s seminal research (1996) documented the **Accrual Anomaly**: earnings driven by cash flows are far more persistent and sustainable than earnings driven by large accounting accruals. When a firm reports record net income but cash flow from operations stagnates or turns negative, the high accrual component will inevitably mean-revert or result in write-downs in future quarters. High accruals signal low earnings quality.

## Formula
\text{Total Accruals} = \text{Net Income} - \text{Operating Cash Flow (CFO)}

$$\text{Balance Sheet Accrual Ratio} = \frac{\Delta\text{NOA}}{\text{Average NOA}} = \frac{\text{NOA}_t - \text{NOA}_{t-1}}{\frac{1}{2}(\text{NOA}_t + \text{NOA}_{t-1})}$$

$$\text{Cash Flow Accrual Ratio} = \frac{\text{Net Income} - (\text{CFO} + \text{CFI})}{\text{Average Total Assets}}$$

## Variable Glossary
- **\text{Total Accruals}**: Difference between accounting net earnings and actual cash flow generated from operations.
- **\text{CFO}**: Cash Flow from Operating Activities (from GAAP Cash Flow Statement).
- **\text{CFI}**: Cash Flow from Investing Activities.
- **\text{NOA}**: Net Operating Assets ($\text{Operating Assets} - \text{Operating Liabilities}$).
- **\Delta\text{NOA}**: Annual change in net operating assets. Under clean-surplus accounting, all cumulative accounting accruals eventually build up on the balance sheet inside net operating assets.
- **\text{Sloan Accrual Measure}**: Scaled accruals as a percentage of average total assets.

## Worked Example
A fast-growing healthcare services firm announces impressive FY2025 financial results:
- **FY25 Net Income:** $\$85{,}000{,}000$ (up $30\%$ from $\$65{,}000{,}000$ in FY24)
- **FY25 Cash Flow from Operations (CFO):** $\$20{,}000{,}000$ (down $50\%$ from $\$40{,}000{,}000$ in FY24)
- **Average Total Assets:** $\$500{,}000{,}000$

**Step 1: Calculate Total Accruals and Accrual Ratio**
$$\text{Total Accruals} = \$85{,}000{,}000 - \$20{,}000{,}000 = +\$65{,}000{,}000$$
$$\text{Cash Flow Accrual Ratio} = \frac{+\$65{,}000{,}000}{\$500{,}000{,}000} = +13.0\%$$

**Forensic Evaluation:**
In empirical studies across US public equities, companies with accrual ratios in the top decile ($> +10\%$) underperform the market by an average of $8\%$ annually over the subsequent 24 months. 

Investigation of the balance sheet reveals:
- Accounts Receivable surged from $\$30\text{M}$ to $\$75\text{M}$ (uncollected sales booked aggressively at year-end).
- Capitalized R&D and deferred contract acquisition costs grew by $\$20\text{M}$.
- Operating cash conversion is only $23.5\%$ ($\$20\text{M} / \$85\text{M}$).

The reported earnings growth is illusory: future quarters will suffer massive bad-debt provisions or contract write-downs.

## When to Use
- **When to use:** Pre-acquisition M&A due diligence (identifying aggressive revenue pull-forwards or deferred expense capitalization), short-seller forensic screening, and board audit committee oversight.
- **When not to use / Caveats:** Fast-growing businesses legitimately build up working capital accruals (inventory and receivables) to support genuine unit volume growth. High accruals are only toxic when they grow significantly faster than underlying sales or when receivables days (DSO) spiral out of control.

## Notes for Future-Me
Whenever a CFO presents an earnings beat, look straight to the Cash Flow Statement. If Net Income is up but CFO is down, you are looking at red-flag accrual inflation. Ask the simple question: *"Where did the cash go?"* If it is trapped in uncollected receivables, capitalized intangibles, or ballooning inventory that hasn't sold, earnings are being manufactured by spreadsheet entries. Quality earnings convert directly into cash in the bank.

