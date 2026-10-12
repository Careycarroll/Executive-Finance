# Gamma Curvature & Convexity Risk

## Intuition
Gamma ($\Gamma$) is the second-order derivative of option price with respect to underlying asset price, and the first derivative of Delta with respect to the asset price:
$$\Gamma = \frac{\partial^2 V}{\partial S^2} = \frac{\partial \Delta}{\partial S}$$

Gamma measures the **acceleration and stability of your hedge**:
- **Long Gamma ($\Gamma > 0$):** All long options (calls and puts) have positive gamma. As the stock rises, your delta increases (making you longer); as the stock falls, your delta decreases (making you less long). Gamma automatically works in your favor! In a delta-neutral long straddle, positive gamma allows you to buy low and sell high on every rebalance.
- **Short Gamma ($\Gamma < 0$):** Option sellers (short calls, short puts) have negative gamma. As the stock falls, your position becomes more short; as the stock surges, your position becomes more long. Negative gamma forces you to buy high and sell low, compounding losses during market volatility.

Gamma is strictly positive for vanilla long options and reaches its maximum peak **at-the-money (ATM) close to expiration**, where delta must violently transition between $0$ and $1.0$.

## Formula
\Gamma = \frac{e^{-q T} N'(d_1)}{S \sigma \sqrt{T}} = \frac{e^{-q T} \frac{1}{\sqrt{2\pi}} e^{-\frac{d_1^2}{2}}}{S \sigma \sqrt{T}}

$$\Delta_{\text{new}} \approx \Delta_{\text{old}} + \Gamma \cdot \Delta S$$

$$V_{\text{new}} \approx V_{\text{old}} + \Delta \cdot \Delta S + \frac{1}{2} \Gamma \cdot (\Delta S)^2$$

## Variable Glossary
- **\Gamma**: Gamma curvature ($\partial^2 V / \partial S^2$). Identical for standard European calls and puts with the same strike.
- **N'(d_1)**: Standard normal probability density function evaluated at $d_1$.
- **S**: Current spot price.
- **\sigma**: Annualized volatility.
- **T**: Time to expiration in years.
- **q**: Continuous dividend yield.
- **\Delta S**: Change in underlying stock price.

## Notes for Future-Me
Beware of **"Gamma Pin Risk"** near expiration: when you are short options that are close to the money with only hours or days until expiration ($T \to 0$), the denominator $S \sigma \sqrt{T}$ collapses toward zero, causing Gamma to spike toward infinity! A \$0.50 move in the stock can swing your delta from 0 to 100 in seconds, forcing catastrophic panic hedging in the cash market. Never hold concentrated short near-the-money options through expiration week without hard stop-loss automation.

