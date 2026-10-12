# Macaulay and Modified Duration

## Intuition
A bond's maturity date states when the final principal is repaid, but it tells an executive very little about how sensitive the bond's market value is to interest rate swings. A 30-year bond paying a massive 10% coupon returns most of its cash flows in early years, making it far less volatile than a 30-year zero-coupon bond that pays nothing until year 30.

Frederick Macaulay (1938) solved this by introducing **Duration**:
1. **Macaulay Duration ($D_{\text{Mac}}$):** The weighted-average time (in years) until a bond's cash flows are received, where the weights are the present values of each cash flow divided by the total bond price.
2. **Modified Duration ($D^*$):** The first derivative of bond price with respect to yield. It measures the **percentage change in bond price for a 100 basis point (1%) shift in yield-to-maturity**:
   $$\frac{\Delta P}{P} \approx -D^* \cdot \Delta y$$

If a bond portfolio has a Modified Duration of $7.5\text{ years}$, a $100\text{ bps}$ ($+1.0\%$) rise in market interest rates causes an immediate $\approx 7.5\%$ drop in the portfolio's market value.

## Formula
$$D_{\text{Mac}} = \frac{\sum_{t=1}^T t \cdot \frac{\text{CF}_t}{(1 + y)^t}}{P} = \sum_{t=1}^T t \cdot w_t$$

$$D^* = \frac{D_{\text{Mac}}}{1 + \frac{y}{k}}$$

$$\frac{\Delta P}{P} \approx -D^* \cdot \Delta y$$

$$\text{Dollar Duration (DV01)} = D^* \cdot P \cdot 0.0001$$

## Variable Glossary
- **$D_{\text{Mac}}$**: Macaulay Duration in years.
- **D^***: Modified Duration (interest rate elasticity).
- **$\text{CF}_t$**: Cash flow received at period $t$.
- **$y$**: Annualized Yield to Maturity.
- **$k$**: Compounding frequency per year ($k = 1$ annual, $k = 2$ semi-annual).
- **$P$**: Total current price of the bond.
- **$w_t$**: Weight of period $t$ cash flow ($= \frac{\text{PV}(\text{CF}_t)}{P}$).
- **$\text{DV01} / \text{PV01}$**: Dollar value of a basis point (dollar change in bond price for a 1 basis point $[0.01\%]$ move in yield).

## Notes for Future-Me
Duration is a linear first-order approximation. For tiny rate movements ($\pm 10-25\text{ bps}$), duration predicts price changes with near-flawless accuracy. But because the price-yield curve is convex (curved upward), for large interest rate shocks ($\ge 150-200\text{ bps}$), duration systematically underestimates price gains when rates fall and overestimates price drops when rates rise!

To price large interest rate shocks accurately, always combine Modified Duration with **Convexity**:
$$\frac{\Delta P}{P} \approx -D^* \cdot \Delta y + \frac{1}{2} \cdot \text{Convexity} \cdot (\Delta y)^2$$
Without the convexity adjustment, corporate hedging programs will over-hedge rate hikes and leave portfolios under-protected.

