# Binomial Option Pricing Model

## Intuition
The Cox-Ross-Rubinstein (CRR, 1979) Binomial Option Pricing Model is a discrete-time lattice framework that models the price evolution of an underlying asset over a discrete number of steps until option expiration.

At each step $\Delta t$, the underlying stock price $S$ can only move to one of two possible values:
- Upward to $S \cdot u$ (with risk-neutral probability $p$)
- Downward to $S \cdot d$ (with risk-neutral probability $1 - p$)

The breakthrough of the binomial model is that **it does not require knowing the actual expected drift or return of the stock**. Because a delta-hedged portfolio of stock and options is risk-free over each infinitesimal interval, the option can be priced by discounting its expected payoff using **risk-neutral probabilities ($p$)** at the risk-free rate ($r$).

Unlike the continuous Black-Scholes-Merton formula—which can only price European options—the binomial tree works **backwards through time** (backward induction) from terminal expiration back to time zero. At every single intermediate node, the model checks whether the intrinsic early-exercise value exceeds the continuation value:
$$\text{Option Value at Node} = \max\left( \text{Immediate Exercise Payoff}, \ e^{-r \Delta t} [p f_u + (1 - p) f_d] \right)$$

This makes the binomial tree the industry standard for pricing **American options**, employee stock option grants, callable bonds, and real investment options with staged management flexibility.

## Formula
u = e^{\sigma \sqrt{\Delta t}}, \quad d = \frac{1}{u} = e^{-\sigma \sqrt{\Delta t}}

$$p = \frac{e^{(r - q)\Delta t} - d}{u - d}$$

$$f = e^{-r \Delta t} \left[ p \cdot f_u + (1 - p) \cdot f_d \right]$$

## Variable Glossary
- **u**: Up-factor multiplier ($> 1$).
- **d**: Down-factor multiplier ($< 1$).
- **\Delta t**: Length of each time step in years ($T / N$).
- **\sigma**: Annualized volatility of the underlying asset.
- **r**: Continuously compounded annual risk-free interest rate.
- **q**: Continuous dividend yield.
- **p**: Risk-neutral probability of an upward step.
- **f_u, f_d**: Option values at the subsequent upper and lower nodes.
- **f**: Option value at the current node.

## Notes for Future-Me
As the number of time steps $N$ increases toward infinity ($N \to \infty$), the discrete binomial tree converges asymptotically to the continuous Black-Scholes-Merton formula. However, for American put options, early exercise is optimal when the option is deep in-the-money and the time value of money on receiving the strike cash today exceeds the probability of further stock declines. 

Always look for the **"Early Exercise Frontier"**: if you are pricing executive stock options or private company warrants that allow pre-vest exercise, a simple Black-Scholes formula will undervalue American puts and overvalue employee options subject to early forfeiture. Use a 50-step binomial lattice for production valuation.

