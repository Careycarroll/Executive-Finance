# Capital Asset Pricing Model (CAPM)

## Intuition
The Capital Asset Pricing Model (CAPM), independently developed by William Sharpe, John Lintner, and Jan Mossin in the mid-1960s, provides the fundamental theoretical link between an asset's systematic risk and its equilibrium expected return.

CAPM’s core breakthrough is that **in an efficient market, investors are not compensated for taking diversifiable (firm-specific) risk**. Because an investor can eliminate unsystematic variance at zero cost by holding the broad market portfolio, the only risk that commands an equilibrium premium is **systematic risk**—the asset's sensitivity to aggregate macroeconomic shocks.

This sensitivity is captured entirely by **Beta ($\beta$)**:
- $\beta = 1.0$: The asset moves in lockstep with the broad market.
- $\beta > 1.0$: Aggressive, cyclical asset (e.g., semiconductors, luxury goods, high-growth tech) that amplifies market swings.
- $\beta < 1.0$: Defensive asset (e.g., regulated electric utilities, healthcare, consumer staples) that dampens market swings.

## Formula
E[R_i] = r_f + \beta_i \cdot \left( E[R_m] - r_f \right) = r_f + \beta_i \cdot \text{ERP}

$$\beta_i = \frac{\text{Cov}(R_i, R_m)}{\text{Var}(R_m)} = \rho_{i,m} \cdot \frac{\sigma_i}{\sigma_m}$$

## Variable Glossary
- **E[R_i]**: Expected equilibrium rate of return on security $i$ (cost of equity $r_e$).
- **r_f**: Risk-free rate of return (yield on 10-year US Treasury bond).
- **E[R_m] - r_f**: Equity Risk Premium ($\text{ERP}$), the excess return demanded by investors to hold the market portfolio over cash.
- **\beta_i**: Systematic risk coefficient of security $i$.
- **\text{Cov}(R_i, R_m)**: Covariance between returns of asset $i$ and market $m$.
- **\sigma_i, \sigma_m**: Volatilities of asset $i$ and market $m$.
- **\rho_{i,m}**: Correlation coefficient between asset $i$ and the market index.

## Worked Example
An investment committee is estimating the required return on equity for an enterprise software provider:
1. **Risk-free rate ($r_f$):** 10-year US Treasury yield $= 4.10\%$.
2. **Equity Risk Premium ($\text{ERP}$):** $5.50\%$ based on long-term historical excess returns.
3. **Statistical Regression Analysis:**
   - 60-month regression of monthly excess returns against the S&P 500 gives an unadjusted raw beta of $\beta_{\text{raw}} = 1.35$.
   - Apply the **Blume adjustment** to correct for mean-reversion toward 1.0:
     $$\beta_{\text{adj}} = \frac{2}{3}(1.35) + \frac{1}{3}(1.0) = 0.90 + 0.333 = 1.233$$

**Calculate Expected Return via CAPM:**
$$E[R_i] = 4.10\% + 1.233 \times 5.50\% = 4.10\% + 6.78\% = 10.88\%$$

The stock must offer an expected return of at least $10.88\%$ to clear its risk hurdle.

## When to Use
- **When to use:** Estimating the Cost of Equity ($r_e$) in WACC calculations, setting hurdle rates for corporate capital budgeting projects, evaluating hedge fund alpha, and benchmarking portfolio managers.
- **When not to use / Caveats:** CAPM assumes single-factor risk (market variance). In reality, empirical asset pricing (Fama & French) shows that size, value, profitability, and momentum factors also systematically drive returns. Additionally, historical regression betas are notoriously noisy: a 5-year monthly beta often has a standard error of $\pm 0.25$ to $0.40$!

## Notes for Future-Me
Never accept a beta without checking the regression $R^2$. If a stock has a beta of 1.2 but an $R^2$ of only $0.15$ against the S&P 500, that means $85\%$ of the company's return variance is driven by company-specific drama, not macroeconomic market swings. In that situation, CAPM is only explaining a tiny sliver of the company's risk profile. Always cross-check single-stock regression betas against industry-wide peer average unlevered betas.

