# Cost of Equity (CAPM, DDM & Build-Up)

## Intuition
The Cost of Equity ($r_e$) is the expected rate of return that common shareholders require to invest capital into an enterprise rather than allocating to other equity investments of comparable risk. Unlike debt, equity has no contractual coupon payment and no maturity date; its cost is entirely an **implicit opportunity cost**.

Because equity holders occupy the most junior (residual) position in the capital structure, they absorb all business operational variance and bankruptcy downside. Therefore, the cost of equity is always strictly higher than the cost of debt for any given firm.

Executives primarily estimate $r_e$ through three core frameworks:
1. **The Capital Asset Pricing Model (CAPM):** Anchored on systematic risk ($\beta$) and the market equity risk premium. The gold standard for public equities.
2. **The Dividend Discount Model (DDM / Gordon Growth):** Expresses required return as the sum of forward dividend yield and sustainable growth ($r_e = \frac{D_1}{P_0} + g$).
3. **The Build-Up Method:** Common in private company appraisal and lower-middle-market M&A, layering size and company-specific risk premiums onto base CAPM.

## Formula
r_e = r_f + \beta_L \cdot \left( E[R_m] - r_f \right) = r_f + \beta_L \cdot \text{ERP}

$$\beta_L = \beta_U \cdot \left[ 1 + (1 - t) \cdot \frac{D}{E} \right]$$

## Variable Glossary
- **r_e**: Cost of equity (required return on common stock).
- **r_f**: Risk-free rate of return (matching sovereign bond matching duration of cash flows).
- **\beta_L**: Levered equity beta (measuring systematic risk inclusive of financial leverage).
- **\beta_U**: Unlevered asset beta (measuring pure business operating risk independent of debt).
- **\text{ERP}**: Equity Risk Premium ($E[R_m] - r_f$), historically $5.0\% - 6.0\%$.
- **\frac{D}{E}**: Debt-to-Equity market value ratio (financial leverage).
- **t**: Corporate marginal income tax rate.
- **\text{Hamada Equation}**: Converts pure operating risk ($\beta_U$) to levered equity risk ($\beta_L$).

## Worked Example
An executive is valuing a division spin-off or private competitor in the enterprise SaaS sector:
1. **Peer Group Unlevered Beta ($\beta_U$):** Analysis of 5 comparable publicly traded SaaS peers shows an average unlevered operating asset beta $\beta_U = 1.15$.
2. **Target Capital Structure:** The target company will maintain a $30\%$ Debt-to-Equity ratio ($D/E = 0.30$) with a corporate tax rate $t = 25\%$.
3. **Re-lever the target's Beta ($\beta_L$) via the Hamada equation:**
   $$\beta_L = 1.15 \times [1 + (1 - 0.25) \times 0.30] = 1.15 \times [1 + 0.225] = 1.15 \times 1.225 = 1.409$$
4. **Current Market Parameters:**
   - 10-year US Treasury yield ($r_f$) $= 4.25\%$
   - Market Equity Risk Premium ($\text{ERP}$) $= 5.50\%$
   - Small-company size premium ($\alpha_{\text{size}}$) $= 1.50\%$ (for lower-mid market illiquidity)

**Calculate Cost of Equity ($r_e$):**
$$r_e = 4.25\% + (1.409 \times 5.50\%) + 1.50\% = 4.25\% + 7.75\% + 1.50\% = 13.50\%$$

The spin-off must generate an expected equity return of at least $13.50\%$ to justify shareholder commitment.

## When to Use
- **When to use:** Computing WACC inputs, discounting Levered Free Cash Flow (FCFE) in equity-side DCFs, setting hurdle rates for divisional corporate ventures, and pricing management incentive equity grants.
- **When not to use / Caveats:** Do not confuse the cost of equity with historical dividend payouts or earnings yield ($E/P$). A company that pays zero dividends does not have a 0% cost of equity! Retained earnings belong to shareholders and must earn their opportunity cost of capital just like newly contributed equity capital.

## Notes for Future-Me
Unlevering and re-levering betas via the Hamada equation is one of the most powerful tools in an executive's valuation arsenal. When a private equity sponsor or banker tells you a private target has a beta of 0.8, check if that was borrowed from a giant debt-free conglomerate. Once you apply the target's proposed $4.0\times$ debt leverage structure, the levered beta will rocket toward 2.0+, and the cost of equity will leap from 9% to 16%. Financial leverage amplifies equity risk linearly.
