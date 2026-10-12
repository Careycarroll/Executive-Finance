# Theta Time Decay

## Intuition
Options are wasting assets with a finite lifespan. Every calendar day that passes without a move in the underlying asset reduces the option’s remaining time value. **Theta ($\Theta$)** measures the rate of decay of an option’s theoretical value with the passage of time:
$$\Theta = \frac{\partial V}{\partial t}$$

For long options, Theta is strictly negative: holding options costs money each day (**time decay bleed**). For option sellers, Theta is positive: the seller collects premium decay as the clock runs down toward expiration.

**The Fundamental Theta-Gamma Tradeoff:**
In an efficient market, there is no free lunch. The Black-Scholes partial differential equation reveals that in a delta-neutral portfolio, **Theta and Gamma are exact economic opposites**:
$$\Theta + \frac{1}{2} \sigma^2 S^2 \Gamma + r S \Delta = r V$$

To earn positive Theta (collecting daily time decay income by selling options), you MUST accept negative Gamma (catastrophic tail risk if the stock makes an explosive move). Conversely, to own positive Gamma (long convexity), you MUST pay Theta rent every single day.

## Formula
$$\Theta_{\text{call}} = -\frac{S \sigma e^{-q T} N'(d_1)}{2 \sqrt{T}} - r K e^{-r T} N(d_2) + q S e^{-q T} N(d_1)$$

$$\Theta_{\text{put}} = -\frac{S \sigma e^{-q T} N'(d_1)}{2 \sqrt{T}} + r K e^{-r T} N(-d_2) - q S e^{-q T} N(-d_1)$$

$$\text{1-Day Dollar Theta} \approx \frac{\Theta_{\text{annual}}}{365}$$

## Variable Glossary
- **$\Theta$**: Theta decay per year (typically divided by 252 or 365 to express decay per calendar day).
- **$S$**: Current spot price.
- **$K$**: Strike price.
- **$\sigma$**: Annualized implied volatility.
- **$T$**: Time to expiration in years.
- **$r$**: Risk-free interest rate.
- **$q$**: Dividend yield.
- **$N'(d_1)$**: Standard normal probability density function.

## Notes for Future-Me
Time decay is non-linear! For at-the-money options, Theta decays at a rate proportional to $1 / \sqrt{T}$. This means decay is slow and gentle when the option has 9 months remaining, but accelerates like an avalanche during the final **30 to 45 days** before expiration. 

When designing systematic options selling strategies (e.g., covered calls or iron condors), the sweet spot for maximum Theta decay per unit of gamma risk is **30 to 45 days to expiration (DTE)**, rolling or closing the position around 14 to 21 DTE before exponential gamma risk takes over.

