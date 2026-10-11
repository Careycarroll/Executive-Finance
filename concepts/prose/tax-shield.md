# Tax Shields and After-Tax Cost of Debt

## Intuition
Because interest expense on debt is tax-deductible for corporations, issuing debt creates an interest tax shield that reduces the firm's total tax bill. This tax subsidy reduces the effective after-tax cost of debt capital below the nominal borrowing coupon rate, creating the classical Modigliani-Miller Proposition II tax advantage of leverage.

## Formula
r_d^{\text{after-tax}} = r_d \times (1 - t_c)
\quad \text{and} \quad
\text{Annual Tax Shield} = \text{Interest Expense} \times t_c = (D \times r_d) \times t_c

## Variable Glossary
- **r_d**: Pre-tax nominal borrowing rate / yield to maturity on debt.
- **t_c**: Marginal corporate income tax rate.
- **r_d^{\text{after-tax}}**: Effective after-tax borrowing cost entering the WACC calculation.
- **D**: Nominal market value of outstanding debt.

## Worked Example
A corporation borrows \$10,000,000 at an 8.0% annual interest rate ($r_d = 0.08$) and faces a combined corporate marginal tax rate of 25% ($t_c = 0.25$):
- **Annual Interest Expense:** $\$10,000,000 \times 0.08 = \$800,000$
- **Annual Tax Savings (Shield):** $\$800,000 \times 0.25 = \$200,000$
- **Effective After-Tax Cost:** $0.08 \times (1 - 0.25) = 6.0\%$
- **Net Cash Outflow:** $\$800,000 - \$200,000 = \$600,000$

## When to Use
- **When to use:** Estimating WACC and capital structure tradeoffs.
- **When not to use / Caveats:** Section 163(j) caps net interest deductions at 30% of adjusted taxable income (EBITDA / EBIT). If a company is already generating low taxable income or NOLs, the marginal tax shield is zero.

## Notes for future-me
The tax shield only has value if the company actually generates taxable income to shelter! In financial distress, interest deductions become worthless precisely when debt service burdens are most dangerous.
