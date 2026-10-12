# Vega Volatility Exposure

## Intuition
Unlike classical financial assets whose prices are driven primarily by directional movement and interest rates, options derived from non-linear payoffs are intensely sensitive to market expectations of future turbulence. **Vega ($\nu$)** measures the sensitivity of an option’s theoretical price to changes in the underlying asset’s **implied volatility ($\sigma$)**:
$$\nu = \frac{\partial V}{\partial \sigma}$$

Vega is strictly positive for all standard European and American long options (both calls and puts). An increase in volatility expands the dispersion of future terminal stock prices, increasing the probability of ending deep in-the-money while the option's downside remains strictly capped at zero.

Vega reaches its maximum peak **at-the-money (ATM)** and scales directly with the square root of time to expiration ($\sqrt{T}$). A 1-year option has far greater vega than a 1-week option because implied volatility has more time to compound over a multi-month horizon.

## Formula
$$\nu = S e^{-q T} \sqrt{T} N'(d_1) = S e^{-q T} \sqrt{T} \frac{1}{\sqrt{2\pi}} e^{-\frac{d_1^2}{2}}$$

$$\text{Price Impact: } \Delta V \approx \nu \cdot \Delta\sigma$$

$$\text{1-Point Vega} = \frac{\nu}{100} \quad \text{(Dollar change per } 1.0\% \text{ move in IV)}$$

## Variable Glossary
- **$\nu$**: Vega sensitivity ($\partial V / \partial \sigma$). Identical for calls and puts with the same strike and maturity.
- **$S$**: Current spot price of the underlying asset.
- **$\sigma$**: Annualized implied volatility.
- **$T$**: Time to expiration in years.
- **$q$**: Continuous dividend yield.
- **$N'(d_1)$**: Standard normal probability density function.
- **$\Delta\sigma$**: Change in implied volatility (e.g., $+0.05$ for $+5$ percentage points of IV).

## Notes for Future-Me
Beware the **"Earnings Volatility Crush"**: Before major corporate catalyst events (earnings releases, FDA drug trials, Supreme Court patent rulings), implied volatility spikes dramatically as market participants bid up option protection. At this moment, options trade with massive implied volatility (e.g., IV jumps from 30% to 90%). 

The morning after the announcement, uncertainty resolves, and IV collapses back to 30% instantly. If you bought an out-of-the-money call option, the stock could surge by 5%, but your option will LOSE 60% of its value because the catastrophic loss from **Vega crush** completely overwhelms the directional gain from **Delta**! Never buy naked long options immediately prior to binary corporate catalyst announcements.

