# Terminal Value (Exit Multiple vs Perpetuity Growth)

## Intuition
Because an ongoing business is a going concern expected to generate cash flows in perpetuity, financial models cannot forecast individual line-item income statements out to infinity. Instead, valuation models split time into two phases:
1. **Explicit Forecast Period ($t = 1 \dots T$):** Typically 5 to 10 years, where detailed revenue growth, operational margins, working capital, and capital expenditures are modeled explicitly.
2. **Terminal Period ($t > T$):** The infinite horizon beyond year $T$, captured in a single figure: the **Terminal Value (TV)**.

Valuation professionals calculate Terminal Value using two primary methods:
- **Perpetuity Growth Method (Gordon Growth):** Assumes the business reaches a mature, steady state where Free Cash Flow grows at a constant, sustainable long-term rate $g$ in perpetuity.
- **Exit Multiple Method:** Assumes the business is sold or valued at year $T$ at a benchmark multiple of final-year EBITDA, NOPAT, or Revenues (e.g., $10.0\times$ EV/EBITDA).

Best practice requires cross-checking both methods: an assumed exit multiple implicitly embeds a perpetual growth rate, and an assumed perpetual growth rate implies an exit multiple. Reconciling the two eliminates absurd hidden assumptions.

## Formula
\text{TV}_{\text{Perpetuity}} = \frac{\text{FCFF}_{T+1}}{\text{WACC} - g} = \frac{\text{FCFF}_T \cdot (1 + g)}{\text{WACC} - g}

$$\text{TV}_{\text{Multiple}} = \text{EBITDA}_T \cdot \text{Exit Multiple}$$

$$\text{Implied } g = \text{WACC} - \frac{\text{FCFF}_{T+1}}{\text{TV}_{\text{Multiple}}}$$

## Variable Glossary
- **\text{TV}**: Terminal Value in nominal dollars at the end of year $T$.
- **\text{FCFF}_T**: Free Cash Flow to the Firm in the final year of the explicit forecast horizon.
- **\text{FCFF}_{T+1}**: Normalized steady-state Free Cash Flow in the first year of the terminal period.
- **\text{WACC}**: Weighted Average Cost of Capital.
- **g**: Perpetual sustainable growth rate.
- **\text{EBITDA}_T**: Earnings Before Interest, Taxes, Depreciation, and Amortization in year $T$.
- **\text{Exit Multiple}**: Target enterprise valuation multiple (e.g., EV/EBITDA) derived from comparable mature transactions.

## Worked Example
A corporate strategy team is valuing a business unit with the following Year 5 projections:
- Year 5 FCFF ($\text{FCFF}_5$): $\$50{,}000{,}000$
- Year 5 EBITDA: $\$90{,}000{,}000$
- Discount Rate ($\text{WACC}$): $9.0\%$ ($0.09$)

**Method A: Perpetuity Growth Method**
Assume a long-term sustainable growth rate equal to long-term nominal GDP growth ($g = 2.5\%$):
$$\text{FCFF}_6 = \$50{,}000{,}000 \times (1 + 0.025) = \$51{,}250{,}000$$
$$\text{TV}_{\text{Perpetuity}} = \frac{\$51{,}250{,}000}{0.09 - 0.025} = \frac{\$51{,}250{,}000}{0.065} = \$788{,}461{,}538$$

Discounted back to Year 0 present value:
$$\text{PV}(\text{TV}) = \frac{\$788{,}461{,}538}{(1 + 0.09)^5} = \frac{\$788{,}461{,}538}{1.5386} = \$512{,}446{,}593$$

**Method B: Exit Multiple Cross-Check**
An M&A banker suggests using a $10.0\times$ EV/EBITDA exit multiple:
$$\text{TV}_{\text{Multiple}} = \$90{,}000{,}000 \times 10.0 = \$900{,}000{,}000$$

**Implied Growth Rate Reality Check:**
What perpetual growth rate $g$ is the banker's $10.0\times$ multiple actually assuming?
$$\text{Implied } g = \text{WACC} - \frac{\text{FCFF}_6}{\text{TV}} = 0.09 - \frac{\$51{,}250{,}000}{\$900{,}000{,}000} = 0.09 - 0.0569 = 3.31\%$$
A 3.31% perpetual growth rate exceeds projected long-term US GDP growth ($2.0\%-2.5\%$). The $10.0\times$ multiple implicitly assumes the company will grow faster than the global economy forever!

## When to Use
- **When to use:** Every DCF model, impairment testing of long-lived assets, private equity buyout returns modeling, and fair-value fairness opinions.
- **When not to use / Caveats:** Do not assume a perpetual growth rate $g > \text{WACC}$! If $g \ge \text{WACC}$, the Gordon Growth denominator $(\text{WACC} - g) \le 0$, resulting in an infinite or negative mathematical impossibility. Furthermore, $g$ should never exceed the projected long-run nominal growth rate of the economy in which the business operates (typically $2.0\% - 3.0\%$); otherwise, your single company would eventually become 100% of the entire world economy!

## Notes for Future-Me
Beware the **"Terminal Year Reinvestment Distortion"**: In year $T$, models frequently show high growth (e.g., 10% revenue growth) but show CapEx equal to Depreciation and zero working capital changes! In reality, if a company grows at $g$ in perpetuity, it MUST reinvest capital to support that growth:
$$\text{Reinvestment Rate} = \frac{g}{\text{RONIC}}$$
If you assume a 3% perpetual growth rate and a 10% Return on New Invested Capital (RONIC), the firm MUST reinvest $30\%$ of its NOPAT every year ($3\% / 10\% = 30\%$). If your model assumes $g = 3\%$ but gives the company 100% free cash flow conversion, you are creating phantom value out of thin air.

