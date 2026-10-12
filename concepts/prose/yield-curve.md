# Yield Curve and Term Structure of Interest Rates

## Intuition
The yield curve plots the relationship between bond yields and their maturities for bonds of identical credit quality (typically benchmark sovereign US Treasuries). It is the single most watched macroeconomic thermometer in global finance, anchoring borrowing costs for mortgages, corporate loans, and equity discount rates.

The curve takes four classic shapes:
1. **Normal (Upward Sloping):** Longer maturities command higher yields. Investors require a term premium to lock up capital over long horizons due to inflation uncertainty and interest rate risk. Reflects healthy economic expansion.
2. **Flat:** Short-term rates equal long-term rates. Typically signals an economic transition or policy inflection.
3. **Inverted (Downward Sloping):** Short-term rates exceed long-term rates. The bond market is forecasting aggressive future central bank rate cuts to fight an imminent economic contraction. Historically, a sustained **10Y minus 2Y Treasury curve inversion** has preceded every US recession over the past six decades with remarkable reliability.
4. **Humped:** Intermediate rates (2Y to 5Y) peak above both short-term bills and 30-year long bonds.

## Formula
(1 + y_n)^n = (1 + y_1) \cdot (1 + f_{1,2}) \cdot (1 + f_{2,3}) \dots (1 + f_{n-1,n})

$$\text{Implied Forward Rate: } f_{n,n+1} = \frac{(1 + y_{n+1})^{n+1}}{(1 + y_n)^n} - 1$$

$$\text{10Y - 2Y Spread} = y_{10} - y_2$$

## Variable Glossary
- **y_n**: Spot rate / yield to maturity on an $n$-year zero-coupon bond.
- **f_{n,n+1}**: 1-year forward interest rate starting at year $n$ and ending at year $n+1$.
- **y_{10} - y_2**: The benchmark 10-year minus 2-year yield spread (recession warning indicator).
- **\text{Pure Expectations Hypothesis}**: Assumes forward rates reflect market consensus of future spot rates ($f_{t,t+1} = E[y_{t+1}]$).
- **\text{Liquidity Preference Theory}**: Assumes forward rates exceed expected spot rates by an upward-sloping liquidity/term premium.

## Notes for Future-Me
When the yield curve inverts, do not panic and freeze all business operations immediately: the historical lag between curve inversion and the actual onset of recession averages **12 to 18 months**. In fact, equities frequently rally during the early months of an inversion! 

The true danger zone is the **"Re-Steepening Trap"**: when the yield curve un-inverts and rapidly steepens because the central bank begins emergency short-term rate cuts. That rapid un-inversion is when the real-economy recession hits corporate earnings. When you see the curve invert, use that 12-month window to refinance short-term debt into fixed long-term paper, stretch cash cushions, and prune marginal projects.

