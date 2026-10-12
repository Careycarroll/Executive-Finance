# Residual Income & EVA Valuation

## Intuition
Traditional accounting Net Income declares a company "profitable" as long as revenues exceed explicit accounting expenses. However, this ignores the cost of equity capital: shareholders provided equity with an opportunity cost, yet the GAAP income statement charges zero expense for using shareholder equity!

**Residual Income (also formulated as Economic Value Added / EVA by Stern Stewart)** corrects this fatal blindspot:
$$\text{Residual Income} = \text{Accounting Profit} - (\text{Capital Employed} \times \text{Cost of Capital})$$

A company only creates true economic wealth when it generates earnings in excess of the dollar cost of all capital invested in the business.

Under the **Residual Operating Income (ReOI)** model championed by Stephen Penman:
$$\text{Enterprise Value} = \text{Current Net Operating Assets (NOA}_0) + \text{PV of Expected Future Residual Operating Income}$$

This provides a profound mathematical advantage over DCF models: **value is anchored immediately on the balance sheet today**, shifting the weight of valuation away from subjective terminal year cash flow assumptions.

## Formula
$$\text{ReOI}_t = \text{NOPAT}_t - (\text{WACC} \cdot \text{NOA}_{t-1}) = (\text{RNOA}_t - \text{WACC}) \cdot \text{NOA}_{t-1}$$

$$\text{Enterprise Value} = \text{NOA}_0 + \sum_{t=1}^T \frac{\text{ReOI}_t}{(1 + \text{WACC})^t} + \frac{\text{Terminal ReOI}_T}{(1 + \text{WACC})^T}$$

$$\text{Equity Residual Income (RI}_t) = \text{Net Income}_t - (r_e \cdot \text{Book Value of Equity}_{t-1})$$

## Variable Glossary
- **$\text{ReOI}_t$**: Residual Operating Income in year $t$.
- **$\text{NOPAT}_t$**: Net Operating Profit After Tax in year $t$.
- **$\text{NOA}_{t-1}$**: Net Operating Assets at the beginning of period $t$.
- **$\text{WACC}$**: Weighted Average Cost of Capital.
- **$\text{RNOA}_t$**: Return on Net Operating Assets ($\text{NOPAT}_t / \text{NOA}_{t-1}$).
- **$\text{RNOA} - \text{WACC}$**: Economic Value spread (value creation rate).
- **$\text{NOA}_0$**: Current Net Operating Assets on the balance sheet today.

## Worked Example
An executive is evaluating a corporate division:
- Current Net Operating Assets ($\text{NOA}_0$): $\$500{,}000{,}000$
- Cost of Capital ($\text{WACC}$): $10.0\%$ ($0.10$)
- Annual Projected NOPAT:
  - Year 1: $\$70{,}000{,}000$ (with $\text{NOA}_1 = \$550\text{M}$)
  - Year 2: $\$85{,}000{,}000$ (with $\text{NOA}_2 = \$600\text{M}$)
  - Year 3: $\$95{,}000{,}000$
- Beyond Year 3, competitive forces erode abnormal advantages, so $\text{ReOI}$ drops to zero ($\text{RNOA} = \text{WACC}$).

**Step 1: Compute Required Capital Charge and ReOI**
- **Year 1 Capital Charge:** $\$500\text{M} \times 10\% = \$50{,}000{,}000$
  $$\text{ReOI}_1 = \$70\text{M} - \$50\text{M} = +\$20{,}000{,}000$$
- **Year 2 Capital Charge:** $\$550\text{M} \times 10\% = \$55{,}000{,}000$
  $$\text{ReOI}_2 = \$85\text{M} - \$55\text{M} = +\$30{,}000{,}000$$
- **Year 3 Capital Charge:** $\$600\text{M} \times 10\% = \$60{,}000{,}000$
  $$\text{ReOI}_3 = \$95\text{M} - \$60\text{M} = +\$35{,}000{,}000$$

**Step 2: Discount ReOI back to Present Value**
$$\text{PV}(\text{ReOI}_1) = \frac{\$20\text{M}}{1.10^1} = \$18{,}181{,}818$$
$$\text{PV}(\text{ReOI}_2) = \frac{\$30\text{M}}{1.10^2} = \$24{,}793{,}388$$
$$\text{PV}(\text{ReOI}_3) = \frac{\$35\text{M}}{1.10^3} = \$26{,}296{,}018$$
$$\text{Cumulative PV of ReOI} = \$18.18\text{M} + \$24.79\text{M} + \$26.30\text{M} = \$69{,}271{,}224$$

**Step 3: Calculate Total Enterprise Value**
$$\text{Enterprise Value} = \text{NOA}_0 + \text{PV}(\text{ReOI}) = \$500{,}000{,}000 + \$69{,}271{,}224 = \$569{,}271{,}224$$

Notice that $\$500\text{M}$ (88% of total value) is grounded in verifiable assets on the balance sheet today!

## When to Use
- **When to use:** Valuing capital-intensive businesses, designing executive performance incentive compensation plans (EVA bonuses align managers with shareholders), and cross-checking DCF valuations where terminal value is unnervingly high.
- **When not to use / Caveats:** Requires clean-surplus accounting. If a firm engages in off-balance-sheet financing, dirty-surplus accounting (routing large gains/losses directly through Accumulated Other Comprehensive Income instead of the income statement), or excessive restructuring write-offs, book values become distorted and must be adjusted first.

## Notes for Future-Me
The beauty of the Residual Income model is how it tames terminal value anxiety. In a DCF, $75\%$ of your valuation comes from an imaginary perpetual cash flow 10 years away. In a Residual Income model, the balance sheet gives you today's starting value ($\text{NOA}_0$), and you only have to estimate the *abnormal competitive advantage period* (the moat). Under economic theory, competition forces abnormal returns ($\text{ReOI}$) to zero over time as rivals enter. Valuing a business as "Book Value + PV of Moat Duration" is far more intellectually honest than forecasting cash flows to the year 2085.

