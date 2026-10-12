# Cost of Debt (Pre-Tax & After-Tax)

## Intuition
The Cost of Debt represents the effective interest rate an enterprise must pay to raise new debt financing in the capital markets. Because debt holders have contractual seniority and collateral liens over company assets in liquidation, their downside is capped (absent default), making the required pre-tax cost of debt ($r_d$) lower than the cost of equity.

Crucially, in the corporate tax systems of the United States and most developed jurisdictions, interest expense paid on corporate debt is a tax-deductible expense (subject to IRC Section 163(j) limitations). Every dollar paid in interest reduces taxable corporate income, creating a **debt tax shield**. The true economic cost to the enterprise is therefore the **after-tax cost of debt**:
$$r_{d,\text{after-tax}} = r_d \cdot (1 - t)$$

If a company borrows at $8\%$ with a $25\%$ marginal corporate tax rate, the government effectively subsidizes $2\%$, leaving an actual net economic cost of $6\%$.

## Formula
r_{d,\text{after-tax}} = r_d \cdot (1 - t) = (r_f + \text{Credit Spread}) \cdot (1 - t)

## Variable Glossary
- **r_{d,\text{after-tax}}**: Effective after-tax cost of debt used directly in the WACC formula.
- **r_d**: Pre-tax marginal cost of debt (the current market yield-to-maturity on newly issued bonds or revolving credit lines).
- **r_f**: Benchmark risk-free interest rate matching the maturity of the debt.
- **\text{Credit Spread}**: Risk premium demanded by lenders based on the company's credit rating / default probability (e.g., BBB, BB, B).
- **t**: Marginal corporate income tax rate (federal + state effective rate).

## Worked Example
A corporate treasurer is evaluating the capital structure impact of issuing $\$200{,}000{,}000$ of 10-year senior unsecured notes to finance plant modernization:
1. **Benchmark Yield:** 10-year US Treasury bond yields $4.20\%$.
2. **Credit Rating Assessment:** The company's credit profile aligns with an **S&P BBB rating**, where market credit spreads are currently $180\text{ bps}$ ($1.80\%$).
   $$r_d = 4.20\% + 1.80\% = 6.00\% \text{ pre-tax yield}$$
3. **Flotation & Origination Costs:** Underwriting and legal fees amount to $1.0\%$ annualized adjustment $\implies r_{d,\text{gross}} = 6.10\%$.
4. **Tax Shield:** Combined federal ($21\%$) and state net of federal deduction ($4\%$) marginal tax rate is $t = 25\%$.

**Calculate After-Tax Cost of Debt:**
$$r_{d,\text{after-tax}} = 6.10\% \times (1 - 0.25) = 6.10\% \times 0.75 = 4.575\%$$

Even though the debt contract specifies a $6.0\%$ coupon, the actual cash cost dragging down corporate returns is only $4.58\%$.

## When to Use
- **When to use:** Computing WACC, structuring debt vs. equity recapitalizations, evaluating lease financing vs. debt-financed asset purchases, and negotiating syndicated credit facilities.
- **When not to use / Caveats:** Do not calculate the cost of debt by dividing historical interest expense from the income statement by total debt on the balance sheet! That backward-looking accounting ratio reflects ancient low-rate loans that cannot be renewed at today's rates. Cost of capital is strictly the *marginal* cost of new funding.
- **Tax Cap Caveat (IRC §163(j)):** Under current US tax law, net business interest expense deduction is capped at $30\%$ of adjusted taxable income (EBIT). If your firm is highly levered and exceeds this 30% cap, interest on marginal debt is NOT deductible in the current year, making the marginal after-tax cost of debt equal to the full $100\%$ pre-tax rate!

## Notes for Future-Me
Watch out for debt covenants and synthetic rating traps: as you increase leverage, your pre-tax debt yield does not stay flat—it steps up discontinuously if your rating falls from investment grade (BBB-) into high yield (BB+). The "junk bond barrier" immediately forces institutional bond funds (pension funds, insurance companies) to dump the paper, expanding credit spreads by 200–300 basis points overnight and tightening restrictive covenants. Always calculate after-tax debt cost across stress-tested credit rating buckets, not just today's baseline spread.

