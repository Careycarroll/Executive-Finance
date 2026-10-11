# Black-Scholes Option Pricing

## Intuition
The Black-Scholes-Merton model prices European options by constructing a continuously rebalanced, risk-free replicating portfolio of the underlying stock and a cash borrowing. Because this delta-hedged portfolio has zero exposure to infinitesimal price movements, it must earn the risk-free rate to prevent arbitrage. The option price depends on five variables: spot price, strike price, risk-free rate, time to maturity, and volatility. Noticeably absent: the expected growth rate (drift) of the underlying stock.

## Formula
C = S_0 N(d_1) - K e^{-r T} N(d_2)

## Variable Glossary
- **C**: European Call Option Price.
- **S_0**: Current Spot Price of the underlying asset.
- **K**: Strike Price of the option.
- **r**: Continuously compounded annual risk-free interest rate.
- **T**: Time to expiration in years.
- **N(x)**: Cumulative standard normal distribution function $\Phi(x)$.
- **d_1**: $\frac{\ln(S_0 / K) + (r + \frac{1}{2}\sigma^2)T}{\sigma \sqrt{T}}$
- **d_2**: $d_1 - \sigma \sqrt{T}$
- **\sigma**: Volatility of logarithmic returns of the underlying asset.

## Notes for future-me
The genius of Black-Scholes is *risk-neutral pricing*. You do not need to estimate the subjective expected return of the stock because you can hedge away the underlying risk using Delta shares $N(d_1)$. In practice, realized returns have fat tails (jump risk) and implied volatility forms a smile/skew across strikes, violating log-normal diffusion assumptions, but BSM remains the ubiquitous quoting convention across global derivatives desks.

