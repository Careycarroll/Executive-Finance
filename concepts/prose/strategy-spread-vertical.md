# Vertical Spreads (Bull and Bear Spreads)

## Intuition
A vertical spread involves buying and selling options of the same class (calls or puts) and same expiration date, but at different strike prices. Vertical spreads define both maximum profit and maximum risk up front. Instead of buying naked options and fighting relentless time decay (negative Theta) and volatility crush, a vertical spread finances a portion of the long option premium by selling a further out-of-the-money option.

In a **Bull Call Spread**, you buy a lower strike call $K_1$ and sell a higher strike call $K_2$. You cap your upside above $K_2$ in exchange for a significantly reduced upfront net debit and lower breakeven hurdle. In a **Bear Put Spread**, you buy a higher strike put $K_2$ and sell a lower strike put $K_1$, profiting from moderate downside while capping risk to the net premium paid.

## Formula
$$\text{Max Profit (Debit Spread)} = (K_2 - K_1) - \text{Net Debit}$$

$$\text{Max Loss} = \text{Net Debit Paid}$$

$$\text{Breakeven (Bull Call)} = K_1 + \text{Net Debit}$$

## Variable Glossary
- **$K_1$**: Lower strike price.
- **$K_2$**: Higher strike price.
- **Net Debit**: Upfront cost paid to establish the spread ($\text{Premium Paid} - \text{Premium Received}$).
- **Width**: Spread width between strikes ($K_2 - K_1$).

## Structure
At expiration, the payoff profile forms a kinked piecewise curve:
- Below $K_1$: Both options expire worthless; loss is capped at the Net Debit.
- Between $K_1$ and $K_2$: The long call gains dollar-for-dollar, passing breakeven at $K_1 + \text{Net Debit}$.
- Above $K_2$: The short call offsets any additional gains from the long call, locking in Max Profit.

Before expiration ($T > 0$), the current market value follows a smooth curve driven by Black-Scholes pricing. As time elapses ($T \to 0$), the curve tightens toward the sharp expiration kink.

## Notes for future-me
Directional betting with naked long options is a negative expected value game for most retail traders because implied volatility is systematically priced at a premium over realized volatility (the Volatility Risk Premium). Vertical spreads soften this drag. When implied volatility is high, vertical spreads are far more resilient to volatility crush than outright long calls or puts because the short leg is also short Vega, insulating your position against sudden IV collapse.
