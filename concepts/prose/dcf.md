# Discounted Cash Flow Valuation (Enterprise vs Equity)

## Intuition
Discounted Cash Flow (DCF) valuation is the gold standard of fundamental intrinsic valuation. It embodies the core axiom of finance: **an asset is worth the present value of the future cash flows it will generate for its owners, discounted at a rate reflecting the risk and timing of those cash flows.**

Practitioners employ two primary DCF architectures:
1. **The Enterprise Approach (Unlevered DCF):** Forecasts **Free Cash Flow to the Firm (FCFF)** over an explicit forecast horizon plus a **Terminal Value (TV)** representing perpetual post-forecast operations. FCFF is discounted at the **Weighted Average Cost of Capital (WACC)** to determine **Enterprise Value (EV)**. Equity value is derived by adding non-operating cash and subtracting net debt ($\text{Equity Value} = \text{EV} + \text{Cash} - \text{Debt}$).
2. **The Equity Approach (Levered DCF):** Forecasts **Free Cash Flow to Equity (FCFE)** directly, discounted at the **Cost of Equity ($r_e$)** to arrive directly at **Equity Value**.

The Enterprise approach is universally preferred for non-financial corporations because it isolates the core operating performance of the business from arbitrary leverage and capital structure decisions.

## Formula
\text{Enterprise Value (EV)} = \sum_{t=1}^T \frac{\text{FCFF}_t}{(1 + \text{WACC})^t} + \frac{\text{Terminal Value}_T}{(1 + \text{WACC})^T}

$$\text{Terminal Value}_T = \frac{\text{FCFF}_{T+1}}{\text{WACC} - g} = \frac{\text{FCFF}_T \cdot (1 + g)}{\text{WACC} - g}$$

$$\text{Equity Value} = \text{EV} + \text{Cash \& Marketable Securities} - \text{Total Debt} - \text{Preferred Stock} - \text{Minority Interests}$$

## Variable Glossary
- **\text{EV}**: Enterprise Value (market value of the core operating business).
- **\text{FCFF}_t**: Free Cash Flow to the Firm in year $t$ ($\text{NOPAT} + \text{D\&A} - \Delta\text{NWC} - \text{CapEx}$).
- **\text{WACC}**: Weighted Average Cost of Capital (discount rate matching unlevered cash flows).
- **T**: Explicit forecast horizon (typically 5 to 10 years).
- **\text{Terminal Value}_T**: Value of all expected cash flows beyond year $T$.
- **g**: Perpetual long-term sustainable growth rate (theoretically capped by long-term nominal GDP growth, $\le 2.5\% - 3.5\%$).
- **\text{Net Debt}**: Total interest-bearing debt minus unrestricted cash reserves.

## Notes for Future-Me
DCF models suffer from the **"Terminal Value Domination Problem"**: in a standard 5-year DCF, the Terminal Value typically represents $65\%-85\%$ of the total calculated Enterprise Value! This means the 40-tab financial model detailing quarterly revenues, gross margins, and headcount across the 5-year forecast horizon is driving less than a third of the total valuation; the remaining two-thirds hangs entirely on two subjective assumptions: the exit WACC and the perpetuity growth rate $g$.

Always run a two-variable sensitivity table crossing WACC against $g$ (or against exit EV/EBITDA multiple). If the valuation drops by 35% when WACC rises from 8.5% to 9.5% or when $g$ falls from 3% to 2%, your model is not providing certainty—it is mapping vulnerability.
