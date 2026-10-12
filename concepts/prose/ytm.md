# Yield to Maturity and Spot Yields

## Intuition
Yield to Maturity (YTM) is the internal rate of return (IRR) of a bond: it is the single annualized discount rate that equates the present value of all remaining contractual coupon and principal cash flows to the bond's current market price.

While YTM is the universal quotation standard across global fixed-income markets, it contains two critical implicit assumptions that executives must understand:
1. **Hold to Maturity:** The investor holds the bond until final redemption without defaulting.
2. **Reinvestment Assumption:** All interim coupon cash flows can be continuously reinvested at that exact same YTM rate over the entire life of the bond.

If interest rates drop after you purchase a 10-year bond, your interim coupons are reinvested at lower prevailing rates, resulting in a **realized compound yield** that is strictly lower than the original YTM!

To avoid the single-rate distortion of YTM, institutional quantitative finance uses **Spot Rates ($r_t$)**—the yields on zero-coupon bonds of tenor $t$—which price cash flows period-by-period without reinvestment risk.

## Formula
P = \sum_{t=1}^{2T} \frac{C/2}{\left(1 + \frac{\text{YTM}}{2}\right)^t} + \frac{M}{\left(1 + \frac{\text{YTM}}{2}\right)^{2T}}

$$\text{Pricing with Spot Yields: } P = \sum_{t=1}^{2T} \frac{C/2}{(1 + r_t/2)^t} + \frac{M}{(1 + r_{2T}/2)^{2T}}$$

$$\text{Current Yield} = \frac{\text{Annual Coupon}}{P}$$

## Variable Glossary
- **\text{YTM}**: Yield to Maturity (annualized bond IRR).
- **P**: Current market price of the bond.
- **C/2**: Semi-annual dollar coupon payment.
- **M**: Principal / Par value at maturity.
- **r_t**: Annualized spot rate for cash flows arriving at period $t$.
- **T**: Tenor in years remaining.

## Worked Example
Consider a 3-year bond with a $\$1{,}000$ face value, paying an annual coupon of $\$80$ ($8.0\%$). The bond currently trades at $\$950.25$.

Find the YTM ($y$) that satisfies:
$$\$950.25 = \frac{\$80}{(1 + y)^1} + \frac{\$80}{(1 + y)^2} + \frac{\$1{,}080}{(1 + y)^3}$$

- Try $y = 9.0\%$:
  $$\text{PV} = \frac{80}{1.09} + \frac{80}{1.09^2} + \frac{1080}{1.09^3} = 73.39 + 67.33 + 833.96 = \$974.68 \ (> \$950.25 \implies \text{rate too low})$$
- Try $y = 10.0\%$:
  $$\text{PV} = \frac{80}{1.10} + \frac{80}{1.10^2} + \frac{1080}{1.10^3} = 72.73 + 66.12 + 811.42 = \$950.26 \ (\approx \$950.25)$$

The bond's Yield to Maturity is **$10.00\%$**.
Notice that YTM ($10.0\%$) consists of two components:
1. **Current Yield:** $\frac{\$80}{\$950.25} = 8.42\%$ (immediate cash return).
2. **Capital Gain Yield:** Accretion of the discount from $\$950.25$ to $\$1{,}000$ over 3 years $\approx +1.58\%$.

## When to Use
- **When to use:** Evaluating fixed-income yields, comparing debt borrowing costs across competing bank proposals, and marking loan portfolios to market.
- **When not to use / Caveats:** Do not rely on YTM when comparing bonds with drastically different coupon structures (e.g., zero-coupon bonds vs. high-coupon premium bonds) across a steeply sloping yield curve. A high-coupon bond receives its cash flows front-loaded and has a lower duration than a zero-coupon bond of the same maturity. In an upward-sloping yield curve, discounting near-term coupons at a high long-term YTM creates systematic mispricing.

## Notes for Future-Me
YTM is a promised yield, not an expected yield! If a distressed high-yield bond trades at 50 cents on the dollar with a quoted YTM of 28%, that 28% yield is only realized if the company miraculously pays every single coupon on time and repays par at maturity without restructuring. If there is a 40% probability of default and a 30% recovery rate, the **Expected Yield** is far lower than 28%. Never confuse contractual YTM with risk-adjusted expected return.

