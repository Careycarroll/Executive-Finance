# Weighted Average Cost of Capital (WACC)

## Intuition
The Weighted Average Cost of Capital (WACC) represents the blended average hurdle rate that an enterprise must earn across its existing operating assets to satisfy all of its capital providers—both common equity shareholders and interest-bearing debt lenders.

Because debt interest is tax-deductible in most corporate tax codes, the effective economic cost of debt to the corporation is shielded by $(1 - t)$, making debt capital substantially cheaper than equity capital. However, adding debt increases financial leverage, elevating the volatility of residual earnings and increasing the probability of financial distress, which drives up the required **Cost of Equity ($r_e$)** and credit spreads.

WACC serves as:
1. **The Company-Wide Hurdle Rate:** The minimum return on invested capital (ROIC) needed to maintain shareholder value. When $\text{ROIC} > \text{WACC}$, the enterprise generates positive Economic Value Added (EVA).
2. **The Discount Rate in Enterprise DCF:** The rate used to discount Unlevered Free Cash Flows (FCFF) to calculate Enterprise Value.

## Formula
\text{WACC} = \left(\frac{E}{D + E}\right) \cdot r_e + \left(\frac{D}{D + E}\right) \cdot r_d \cdot (1 - t)

## Variable Glossary
- **\text{WACC}**: Weighted Average Cost of Capital (after-tax blended rate).
- **E**: Market value of equity (share price $\times$ diluted shares outstanding, NOT accounting book value).
- **D**: Market value of interest-bearing net debt.
- **\frac{E}{D + E}**: Equity weighting in the target capital structure ($w_e$).
- **\frac{D}{D + E}**: Debt weighting in the target capital structure ($w_d$).
- **r_e**: Cost of equity (typically estimated via CAPM: $r_f + \beta \times \text{ERP}$).
- **r_d**: Pre-tax marginal cost of debt (the current yield-to-maturity on newly issued debt, NOT the historical coupon on existing bonds).
- **t**: Marginal corporate income tax rate (interest tax shield factor).

## Notes for Future-Me
Common executive errors in calculating WACC:
1. **Using Book Value instead of Market Value:** Accounting book value of equity records historical retained earnings and par value, which is useless for opportunity cost. Always use current market values (or target debt-to-equity ratios for private firms). If market equity is \$5B and debt is \$1B, the weights are 83% equity and 17% debt, regardless of what the balance sheet book equity says!
2. **Using Historical Coupon Rates instead of Current YTM:** A bond issued at 3% five years ago that now trades at a 7% yield-to-maturity costs the company 7% if it attempts to raise debt today. Marginal cost of capital is forward-looking.
3. **The Leverage Fallacy:** Executives frequently think: *"Debt is 5% after-tax and equity is 12%. If we replace all equity with debt, our WACC will plummet to 5%!"* This ignores Modigliani-Miller Proposition II: as debt increases, financial risk compounds, and remaining equity holders demand a skyrocketing cost of equity $r_e$. At excessive leverage, bankruptcy and agency costs spike debt yields $r_d$ as well.
