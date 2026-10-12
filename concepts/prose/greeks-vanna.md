# Greeks: Vanna (Volatility-Spot Cross-Sensitivity)

## Intuition
In real-world financial markets, underlying asset prices ($S$) and implied volatility ($\sigma$) are strongly correlated—especially in equity indices, where market sell-offs trigger immediate spikes in the VIX ("Spot Down, Vol Up").

**Vanna** is the pivotal second-order cross-Greek that links directional risk and volatility risk (Natenberg Ch. 11; Hull Ch. 19). By Young's Theorem on mixed partial derivatives, Vanna has two mathematically identical interpretations:
1. **The sensitivity of Delta ($\Delta$) to a change in Implied Volatility ($\sigma$):** How much your directional exposure shifts when volatility expands or contracts.
2. **The sensitivity of Vega ($\mathcal{V}$) to a change in the Underlying Price ($S$):** How much your volatility exposure changes as the underlying asset moves.

$$\text{Vanna} = \frac{\partial \Delta}{\partial \sigma} = \frac{\partial \mathcal{V}}{\partial S} = \frac{\partial^2 V}{\partial S \, \partial \sigma}$$

### Why Vanna Intuition Matters
Imagine holding an Out-of-the-Money (OTM) Call with strike $K = \$120$ when the stock is at $\$100$.
- If Implied Volatility is **very low ($10\%$)**, the stock has almost no chance of reaching $\$120$, so the call's Delta is near **$0.02$**.
- If Implied Volatility **spikes to $60\%$**, the probability cone widens dramatically—now $\$120$ is well within reach, so the call's Delta jumps toward **$0.40$**!
Thus, **rising volatility pulls the Delta of OTM and ITM options toward $0.50$**, while **falling volatility pushes the Delta of OTM options toward $0.00$ and ITM options toward $1.00$**.

## Structure
### Black-Scholes Formula & Sign Profile Across Moneyness

$$\text{Vanna} = -e^{-q\tau} \cdot \phi(d_1) \cdot \frac{d_2}{\sigma} = \frac{\mathcal{V}}{S} \left( 1 - \frac{d_1}{\sigma \sqrt{\tau}} \right)$$

```
Vanna Profile Across Strike Moneyness (Long Option Position)
Vanna
  +  │         ╭───────╮
     │        ╱         ╲         OTM Calls (S < K, d2 < 0):
     │       ╱           ╲        Vanna is POSITIVE (+)
  0 ─┼──────┼─────────────┼──────┬────────────────────────► Spot Price (S)
     │                   Strike  │        ╲           ╱
     │                    (ATM)  │         ╲         ╱
  -  │                           │          ╰───────╯
                                    ITM Calls / OTM Puts (S > K, d2 > 0):
                                    Vanna is NEGATIVE (-)
```

| Option Position | Moneyness | Vanna Sign | What Happens When Implied Vol Drops ($\Delta \sigma < 0$)? |
|---|---|---|---|
| **Long OTM Call** ($S < K$) | Out-of-the-Money | **Positive ($+$)** | Call Delta **drops** toward $0.00$. |
| **Long OTM Put** ($S > K$) | Out-of-the-Money | **Negative ($-$)** | Put Delta becomes **less negative** (moves from $-0.30$ toward $0.00$). |
| **At-The-Money** ($S \approx K$) | At-the-Money | **Near Zero ($\approx 0$)** | Delta stays anchored near $\pm 0.50$ regardless of vol shifts. |

## Common Misconceptions
- **Misconception 1: "If I buy an OTM Put to hedge a stock market crash, my Delta depends only on how far the S&P 500 falls."**  
  *Reality:* When the S&P 500 drops $-5\%$, implied volatility (VIX) typically surges $+10$ points simultaneously. Because an OTM Put has negative Vanna ($\partial \Delta / \partial \sigma < 0$), the volatility spike makes the put's Delta **much more negative**, supercharging your downside protection! Conversely, when the market recovers and VIX crushes downward, Vanna rapidly drains the put's negative Delta.
- **Misconception 2: "Vanna is only relevant for exotic barrier options."**  
  *Reality:* While Vanna is the primary driver of the **Volatility Skew (Smile)** in exotic pricing (via the Vanna-Volga method), Vanna flows from massive institutional S&P 500 OTM put hedging are one of the largest drivers of equity market rallies after macroeconomic events (such as FOMC meetings or CPI releases). When an event passes and implied volatility crushes, dealers who are short OTM puts must buy back billions in short S&P 500 futures hedges ("The Vanna Rally").

## Notes for Future-Me
Understand the link between **Vanna and the Volatility Skew**:
- Why do equity index OTM puts trade at a massive implied volatility premium over OTM calls (Negative Skew)? Because spot and volatility are negatively correlated ($\rho_{S,\sigma} \approx -0.75$).
- In a market sell-off, long OTM puts benefit from both **Gamma** (spot falling) and **Vanna** (vol spiking simultaneously). Market makers charge a steeper implied volatility price upfront for OTM puts to compensate for this adverse Vanna-Gamma covariance.
