# Real vs. Nominal Returns

## Intuition
Nominal returns measure the growth of raw dollars; real returns measure the growth of your actual purchasing power after adjusting for inflation. When inflation is elevated, high nominal interest rates can mask negative real purchasing power gains. The Fisher Equation mathematically separates the two.

## Formula
1 + R = (1 + r)(1 + i)
\implies r = \frac{1 + R}{1 + i} - 1 \approx R - i

## Variable Glossary
- **R**: Nominal rate of return.
- **r**: Real rate of return (purchasing power growth).
- **i**: Rate of inflation (measured via CPI / PCE deflator).
- **R - i**: Standard first-order Fisher approximation (valid when rates are small).

## Worked Example
An investor earns a 7.0% nominal return ($R = 0.07$) on a Treasury note during a year where consumer prices inflate by 4.0% ($i = 0.04$):
- **Exact Fisher Calculation:** $r = \frac{1 + 0.07}{1 + 0.04} - 1 = \frac{1.07}{1.04} - 1 \approx 2.885\%$
- **Approximation:** $r \approx 0.07 - 0.04 = 3.0\%$

The investor's true real wealth growth is 2.88%, not the headline 7.0%.

## When to Use
- **When to use:** Multi-decade retirement planning, long-term infrastructure discounting, TIPS pricing, and macroeconomic asset allocation.
- **When not to use / Caveats:** Do not mix real cash flows with nominal discount rates in DCF models! If cash flows are projected with inflation, use the nominal WACC; if cash flows are in constant dollars, use the real WACC.

## Notes for future-me
The Fisher effect implies that when expected inflation rises, nominal yields must rise point-for-point to preserve required real yields. The biggest silent destroyer of long-duration fixed income is unanticipated inflation.
