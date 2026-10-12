# Security Market Line and Alpha

## Intuition
The Security Market Line (SML) is the graphical representation of the Capital Asset Pricing Model (CAPM). While the Capital Market Line (CML) plots expected return against **total risk ($\sigma$)** for complete portfolios, the SML plots expected return against **systematic risk ($\beta$)** for individual securities, portfolios, or corporate business units.

In equilibrium, all correctly priced securities must lie directly on the SML.

When a security's expected return diverges from its CAPM fair required return, it generates **Jensen’s Alpha ($\alpha$)**:
- **Positive Alpha ($\alpha > 0$):** The asset plots **above the SML**. It generates an expected return higher than warranted by its systematic risk. The asset is **underpriced (bargain)**.
- **Negative Alpha ($\alpha < 0$):** The asset plots **below the SML**. It offers inadequate expected return for the risk incurred. The asset is **overpriced**.

Alpha is the holy grail of active investment management: generating risk-adjusted excess returns that cannot be explained by passive factor exposure.

## Formula
E[R_i] = r_f + \beta_i \cdot \left( E[R_m] - r_f \right)

$$\alpha_i = R_i - \left[ r_f + \beta_i \cdot (R_m - r_f) \right]$$

## Variable Glossary
- **\text{SML}**: Linear locus of points where $E[R] = r_f + \beta \times \text{ERP}$.
- **\alpha_i**: Jensen’s Alpha (abnormal risk-adjusted return of asset $i$).
- **R_i**: Realized or forecasted return of security $i$.
- **\beta_i**: Beta systematic risk coefficient (the slope of the security's characteristic line).
- **r_f**: Risk-free rate (the vertical intercept of the SML where $\beta = 0$).
- **E[R_m] - r_f**: Slope of the Security Market Line (the Equity Risk Premium).

## Worked Example
An equity analyst is evaluating two competing industrial stocks:
- **Macro environment:** $r_f = 4.0\%$, Market return $E[R_m] = 10.0\%$ (SML slope $= 6.0\%$).
- **Stock AlphaTech ($\beta = 1.20$):** Consensus 12-month expected return $= 13.5\%$.
- **Stock LegacyMetal ($\beta = 0.80$):** Consensus 12-month expected return $= 7.5\%$.

**Step 1: Calculate SML Benchmark Required Returns**
$$r_{\text{SML, AlphaTech}} = 4.0\% + (1.20 \times 6.0\%) = 4.0\% + 7.20\% = 11.20\%$$
$$r_{\text{SML, LegacyMetal}} = 4.0\% + (0.80 \times 6.0\%) = 4.0\% + 4.80\% = 8.80\%$$

**Step 2: Calculate Jensen’s Alpha**
$$\alpha_{\text{AlphaTech}} = 13.5\% - 11.20\% = +2.30\% \ (\text{Plots ABOVE SML})$$
$$\alpha_{\text{LegacyMetal}} = 7.5\% - 8.80\% = -1.30\% \ (\text{Plots BELOW SML})$$

**Strategic Evaluation:**
- **AlphaTech** delivers $+2.30\%$ of positive alpha: it compensates the investor for its above-average volatility ($\beta = 1.2$) and provides an extra cushion of value creation. Recommendation: **Overweight / Buy**.
- **LegacyMetal** fails to clear its hurdle rate, offering negative $-1.30\%$ alpha despite having lower volatility ($\beta = 0.8$). Recommendation: **Underweight / Sell**.

## When to Use
- **When to use:** Evaluating active fund manager performance, selecting individual equities for active portfolios, pricing corporate project hurdles, and identifying market mispricings.
- **When not to use / Caveats:** Be careful with historical backward-looking alpha. In statistical regressions, positive alpha is often indistinguishable from statistical luck (sampling noise). True persistent alpha requires a $t$-statistic $> 2.0$ over at least 5 to 7 years of data.

## Notes for Future-Me
"Alpha" is the most abused term in financial sales pitches. When a hedge fund or asset manager pitches you a "market-beating 12% return," look at their beta first. If the market returned 15% and their beta was 1.4, their required return was $4\% + 1.4 \times 11\% = 19.4\%$. That manager didn't generate positive alpha—they generated negative $-7.4\%$ alpha while taking massive leveraged risk! Always strip out the SML beta return before paying any manager an incentive performance fee.

