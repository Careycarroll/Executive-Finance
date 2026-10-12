# Discount Rates and Opportunity Cost

## Intuition
The discount rate is the rate of return an investor or enterprise requires to commit capital to a specific project or asset rather than the next best alternative of identical risk. It is fundamentally an **opportunity cost of capital**: if capital can earn $10\%$ elsewhere in the market at the same risk level, deploying that capital into an internal project yielding only $8\%$ destroys shareholder value, even if the project is nominally "profitable" on an accounting income statement.

In executive capital allocation, the discount rate serves as the hurdle rate that sets the price of time and risk. When discounting cash flows, higher discount rates penalize long-dated cash flows exponentially, favoring near-term liquidity and raising the bar for multi-year capital expenditures.

## Formula
r = r_f + \beta \cdot \text{ERP} + \alpha_{\text{size}} + \alpha_{\text{specific}}

## Variable Glossary
- **r**: Nominal discount rate / required rate of return (hurdle rate).
- **r_f**: Risk-free rate (typically the yield on a 10-year or 20-year US Treasury bond matching the cash flow currency and duration).
- **\beta**: Beta coefficient measuring systematic exposure to macroeconomic/market variance.
- **\text{ERP}**: Equity Risk Premium ($E[R_m] - r_f$), historically $4.5\% - 6.0\%$ in developed markets.
- **\alpha_{\text{size}}**: Size premium adjustment for micro-cap or small-cap liquidity constraints (Duff & Phelps / Kroll data).
- **\alpha_{\text{specific}}**: Company-specific or project-specific unsystematic risk premium (regulatory hurdle, execution risk, customer concentration).

## Worked Example
A corporate strategy team is evaluating an organic expansion project with a 7-year cash flow profile. The company's CFO determines the appropriate hurdle rate using a build-up approach:
1. **Risk-free benchmark ($r_f$):** 10-year US Treasury yield $= 4.25\%$.
2. **Systematic market risk:** Project asset beta $= 1.20$, and market equity risk premium $(\text{ERP}) = 5.50\% \implies 1.20 \times 5.50\% = 6.60\%$.
3. **Execution & liquidity premium ($\alpha$):** Unhedged currency and emerging market supplier exposure $= 1.50\%$.

$$\text{Project Discount Rate } (r) = 4.25\% + 6.60\% + 1.50\% = 12.35\%$$

If Year 5 projected Free Cash Flow is $\$15{,}000{,}000$, its present value today is:
$$\text{PV} = \frac{\$15{,}000{,}000}{(1 + 0.1235)^5} = \frac{\$15{,}000{,}000}{1.7896} = \$8{,}381{,}761$$

Every $\$1.00$ expected in Year 5 is worth only $\$0.56$ today under this hurdle rate.

## When to Use
- **When to use:** Project appraisal (NPV/IRR screening), M&A acquisition pricing, impairment testing of goodwill and intangibles (ASC 350 / IAS 36), and lease vs. buy determinations.
- **When not to use / Caveats:** Do not use the corporate firm-wide WACC as a universal discount rate across all internal business units. A high-risk R&D venture evaluated at a low firm-wide WACC will be systematically overvalued, while a stable low-risk infrastructure project will be wrongly rejected. Match the discount rate to the *risk of the cash flows being evaluated*, not the historical cost of the parent company's funding.

## Notes for Future-Me
Discount rates are subjective assumptions that masquerade as objective precision. In DCF models and boardroom pitch decks, moving the discount rate by 100 basis points (e.g., from 9.5% to 8.5%) moves the enterprise valuation far more than changing revenue growth projections by 3%. Whenever a deal sponsor brings you an NPV calculation, interrogate the discount rate derivation first: where did they get beta? Are they using trailing 10-year risk-free rates or current spot rates? Did they strip out company-specific risks that should have been modeled directly into scenario cash flows rather than dumped into an arbitrary hurdle rate adder?
