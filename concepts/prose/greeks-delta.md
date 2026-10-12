# Delta Sensitivity & Directional Hedge Ratio

## Intuition
Delta ($\Delta$) is the premier first-order Greek in options finance. It measures the rate of change of an option’s theoretical price with respect to changes in the price of the underlying asset:
$$\Delta = \frac{\partial V}{\partial S}$$

Delta serves three critical executive functions:
1. **Directional Sensitivity:** If a call option has a delta of $+0.60$, a $\$1.00$ increase in the underlying stock price produces an immediate $\$0.60$ increase in the option price.
2. **Hedge Ratio:** To create a delta-neutral (directionally immunized) portfolio, an option seller must buy $\Delta$ shares of the underlying stock for every call option sold.
3. **Rough Probability of Expiring In-the-Money:** In risk-neutral pricing, call delta $\Delta_{\text{call}} = N(d_1)$ is approximately equal to the risk-neutral probability that the option will finish in-the-money at expiration ($N(d_2)$).

Delta ranges strictly between:
- **Call Options:** $0.0 \le \Delta_{\text{call}} \le +1.0$ (Deep OTM calls approach $0$; ATM calls $\approx 0.50$; Deep ITM calls approach $+1.0$).
- **Put Options:** $-1.0 \le \Delta_{\text{put}} \le 0.0$ (Deep OTM puts approach $0$; ATM puts $\approx -0.50$; Deep ITM puts approach $-1.0$).

## Formula
$$\Delta_{\text{call}} = e^{-q T} N(d_1), \quad \Delta_{\text{put}} = -e^{-q T} N(-d_1) = \Delta_{\text{call}} - e^{-q T}$$

$$d_1 = \frac{\ln(S / K) + \left(r - q + \frac{\sigma^2}{2}\right) T}{\sigma \sqrt{T}}$$

$$\text{Position Delta} = \sum_{i=1}^n \text{Qty}_i \cdot \text{Multiplier}_i \cdot \Delta_i$$

## Variable Glossary
- **$\Delta$**: Delta sensitivity ($\partial V / \partial S$).
- **$S$**: Current spot price of the underlying asset.
- **$K$**: Strike price.
- **$r$**: Risk-free interest rate.
- **$q$**: Continuous dividend yield.
- **$\sigma$**: Annualized volatility.
- **$T$**: Time to expiration in years.
- **$N(\cdot)$**: Cumulative standard normal distribution function.
- **$d_1$**: Black-Scholes normalized log-moneyness parameter.

## Notes for Future-Me
Never treat delta as static! Delta changes constantly as the stock moves (governed by **Gamma**) and as time passes (governed by **Charm**). A portfolio that is delta-neutral today at 9:30 AM will develop a significant directional bias by 3:00 PM if the market moves or if implied volatility shifts. 

When managing large corporate share repurchases or executive option grants, monitor **Dollar Delta**:
$$\text{Dollar Delta} = \Delta \times S \times \text{Number of Shares}$$
This reveals your true net economic equity exposure in actual dollars, preventing executives from being lulled into complacency by abstract option contract counts.

