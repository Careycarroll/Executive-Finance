# Convexity and Second-Order Price Approximation

## Intuition
Modified Duration is a linear tangent line approximation to the bond price-yield curve. However, the actual mathematical relationship between bond price and yield is non-linear and bowed toward the origin: it is strictly **convex**.

**Convexity** is the second derivative of bond price with respect to interest rates (the curvature). It captures how duration itself changes as yields shift:
$$\text{Convexity} = \frac{1}{P} \frac{d^2 P}{dy^2}$$

Convexity is an asymmetric positive gift to bondholders:
- When interest rates rise, price falls by **less** than linear duration predicts.
- When interest rates fall, price rises by **more** than linear duration predicts.

All else being equal, a bond or portfolio with higher convexity outperforms an otherwise identical portfolio with lower convexity in both rising and falling interest rate regimes! For this reason, positive convexity commands a price premium in the capital markets (investors accept lower baseline yields for higher convexity).

## Formula
$$\text{Convexity} = \frac{1}{P \cdot (1 + y)^2} \sum_{t=1}^T \frac{t(t + 1) \cdot \text{CF}_t}{(1 + y)^t}$$

$$\frac{\Delta P}{P} \approx -D^* \cdot \Delta y + \frac{1}{2} \cdot \text{Convexity} \cdot (\Delta y)^2$$

## Variable Glossary
- **$\text{Convexity}$**: Measure of the curvature of the bond price-yield function.
- **D^***: Modified Duration.
- **$\Delta y$**: Change in yield to maturity (in decimal, e.g. $+0.02$ for $+200\text{ bps}$).
- **$\frac{\Delta P}{P}$**: Percentage change in bond price.
- **$\text{CF}_t$**: Cash flow at period $t$.
- **$P$**: Current bond price.

## Worked Example
A treasury portfolio holds a 20-year bond with the following metrics:
- Modified Duration ($D^*$): $12.0\text{ years}$
- Convexity: $200.0$
- Yield shock: Suppose the Federal Reserve implements an aggressive $200\text{ bps}$ ($+0.02$) interest rate hike.

**Step 1: First-Order Duration Effect**
$$\text{Duration Effect} = -D^* \cdot \Delta y = -12.0 \times (+0.02) = -0.24 \ (-24.0\%)$$

**Step 2: Second-Order Convexity Adjustment**
$$\text{Convexity Effect} = \frac{1}{2} \cdot \text{Convexity} \cdot (\Delta y)^2 = \frac{1}{2} \times 200.0 \times (0.02)^2 = 100.0 \times 0.0004 = +0.04 \ (+4.0\%)$$

**Step 3: Total Estimated Price Change**
$$\frac{\Delta P}{P} \approx -24.0\% + 4.0\% = -20.0\%$$

Notice the critical distinction: linear duration alone predicted a catastrophic $-24.0\%$ crash, but positive convexity cushioned the loss by $+4.0\%$, limiting the actual decline to $-20.0\%$.

## When to Use
- **When to use:** Stress testing corporate balance sheets against large macroeconomic rate shocks ($\ge 100-300\text{ bps}$), pricing fixed income derivatives, and managing mortgage-backed securities (MBS) portfolios.
- **When not to use / Caveats (Negative Convexity):** Beware of callable bonds and residential mortgage-backed securities! When rates fall, homeowners refinance and corporate issuers call high-coupon debt, capping the upside. In these assets, convexity flips to **negative convexity**—the price drops faster when rates rise, but fails to appreciate when rates fall!

## Notes for Future-Me
"Positive convexity is an insurance policy; negative convexity is selling insurance for nickels in front of a steamroller." Whenever someone pitches a high-yielding structured debt product that offers "an extra 80 bps of yield," check its embedded options. 99% of the time, that extra yield comes from shorting convexity (e.g., selling embedded prepayment options to borrowers). If rates spike, negative convexity accelerates your losses. Never chase yield into an asset with negative convexity without a dedicated hedging desk.

