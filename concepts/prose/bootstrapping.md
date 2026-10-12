# Bootstrapping the Zero-Coupon Spot Curve

## Intuition
When pricing a multi-year corporate cash flow stream or an interest rate swap, discounting every cash flow at a single Yield to Maturity (YTM) is mathematically imprecise when the yield curve is upward- or downward-sloping. In an arbitrage-free market, a cash flow occurring at Year $t$ must be discounted at the **Zero-Coupon Spot Rate ($z_t$)** specific to that exact maturity $t$ (Bodie Ch. 14; Hull Ch. 4).

However, the US Treasury and sovereign bond markets do not issue liquid zero-coupon bonds at every maturity beyond 1 year—they issue **coupon-bearing bonds**. **Bootstrapping** is the sequential, step-by-step algebraic procedure used to extract implied theoretical zero-coupon spot rates ($z_1, z_2, \dots, z_T$) from observable market prices of coupon-bearing par bonds.

## Structure
### The Sequential Bootstrapping Algorithm

Every coupon bond can be viewed as a portfolio of independent zero-coupon strips. Given known spot rates $z_1, z_2, \dots, z_{T-1}$ for earlier periods and the market price $P_T$ of a $T$-period bond paying coupon $C$ and par value $M$:

$$P_T = \underbrace{\frac{C}{(1 + z_1)^1} + \frac{C}{(1 + z_2)^2} + \cdots + \frac{C}{(1 + z_{T-1})^{T-1}}}_{\text{Discounted at Already-Bootstrapped Spot Rates}} + \frac{C + M}{(1 + z_T)^T}$$

Solving directly for the unknown $T$-period spot rate $z_T$:
$$z_T = \left( \frac{C + M}{P_T - \sum_{t=1}^{T-1} \frac{C}{(1 + z_t)^t}} \right)^{1/T} - 1$$

```
Worked 3-Year Bootstrapping Walkthrough (Annual Coupons, Par = $100)
┌────────────────────────────────────────────────────────┐
│ Observed Market Bonds:                                 │
│ • 1-Year Zero-Coupon Bill: Yield = 4.00% → z_1 = 4.00% │
│ • 2-Year 5.0% Coupon Par Bond: Price = $100.00         │
│ • 3-Year 6.0% Coupon Par Bond: Price = $100.00         │
├────────────────────────────────────────────────────────┤
│ Step 1: Bootstrap 2-Year Spot Rate (z_2)               │
│   100 = 5 / (1.04)^1 + 105 / (1 + z_2)^2               │
│   100 = 4.8077 + 105 / (1 + z_2)^2                     │
│   (1 + z_2)^2 = 105 / 95.1923 = 1.10303                │
│   → z_2 = (1.10303)^(1/2) - 1 = 5.025%                 │
├────────────────────────────────────────────────────────┤
│ Step 2: Bootstrap 3-Year Spot Rate (z_3)               │
│   100 = 6/(1.04)^1 + 6/(1.05025)^2 + 106/(1 + z_3)^3   │
│   100 = 5.7692 + 5.4396 + 106 / (1 + z_3)^3            │
│   (1 + z_3)^3 = 106 / 88.7912 = 1.19381                │
│   → z_3 = (1.19381)^(1/3) - 1 = 6.083%                 │
└────────────────────────────────────────────────────────┘
```

### Extracting Implied Forward Rates ($f_{t-1, t}$)
Once the spot curve is bootstrapped, implied forward interest rates between any two future dates $t_1$ and $t_2$ follow directly:
$$(1 + z_{t_2})^{t_2} = (1 + z_{t_1})^{t_1} \cdot (1 + f_{t_1, t_2})^{t_2 - t_1}$$

## Common Misconceptions
- **Misconception 1: "The Par Yield Curve and the Zero-Coupon Spot Curve are identical."**  
  *Reality:* Because of the **Coupon Effect**, when the yield curve is upward-sloping, the Zero-Coupon Spot Curve lies *above* the Par Coupon Yield Curve ($z_3 = 6.083\% > y_3 = 6.00\%$). When the yield curve is inverted (downward-sloping), the Zero-Coupon Spot Curve lies *below* the Par Yield Curve. They only coincide when the yield curve is completely flat.
- **Misconception 2: "You can price an interest rate swap using standard bond YTM."**  
  *Reality:* Pricing interest rate swaps, cross-currency swaps, or corporate bond spreads over the Treasury curve (the **Z-Spread / Zero-Volatility Spread**) requires discounting each cash flow off the bootstrapped zero-coupon spot curve.

## Notes for Future-Me
In corporate bond issuance and fixed-income analysis, always request the **Z-Spread (Zero-Volatility Spread)** rather than the simplistic nominal **G-Spread** (spread over a single interpolated benchmark Treasury yield). The Z-Spread measures the constant basis-point spread added to every point along the entire bootstrapped Treasury spot curve required to equate the present value of a corporate bond's cash flows to its market price—capturing the full shape of the term structure.
