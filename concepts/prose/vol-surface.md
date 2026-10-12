# The Implied Volatility Surface

## Intuition
Under the theoretical Black-Scholes model, implied volatility ($\sigma_{\text{IV}}$) is assumed to be a single constant number across all strike prices ($K$) and all expiration dates ($T$). In real-world derivatives markets, this assumption is completely false.

The **Implied Volatility Surface** is the three-dimensional mapping of implied volatility $\sigma_{\text{IV}}(K, T)$ plotted across two independent axes (Natenberg Ch. 19; Hull Ch. 20):
1. **The Strike / Moneyness Axis (Vertical Skew / Smile):** For a fixed expiration $T$, how implied volatility varies across strikes ($K / S_0$ or Option Delta).
2. **The Expiration Axis (Horizontal Term Structure):** For a fixed moneyness (e.g., At-the-Money $50\Delta$), how implied volatility varies across time to maturity ($30\text{D}, 60\text{D}, 180\text{D}, 1\text{Y}$).

Institutional options desks do not trade individual option prices in isolation—they trade the shape, slope, and curvature of the Volatility Surface.

## Structure
### The Two Dimensions of the Volatility Surface

```
3D Implied Volatility Surface: σ(K, T)
   Implied Vol (σ)
     ▲
 40% │   ╲
     │    ╲  30-Day Skew (Steepest curvature near expiry)
 30% │     ╲       ╲
     │      ╲       ╲  180-Day Skew (Flatter due to mean reversion)
 20% │       ╰───────╰───────────────
     │      80%     100%    120%  ► Strike Moneyness (K / S)
     └────────────────────────────► Time to Maturity (T)
```

| Surface Dimension | Calm Contango Regime ("Normal") | Crisis Backwardation Regime ("Panic") | Economic & Order-Flow Driver |
|---|---|---|---|
| **Term Structure ($\partial \sigma / \partial T$)** | **Upward-Sloping:** Front-month IV ($14\%$) $<$ Back-month IV ($19\%$). | **Inverted (Backwardation):** Front-month IV ($45\%$) $\gg$ Back-month IV ($26\%$). | Near-term macro panic spikes front-month options; long-term volatility mean-reverts toward historical averages ($18\%-20\%$). |
| **Equity Skew ($\partial \sigma / \partial K$)** | **Negative Put Skew:** OTM Puts trade $5-8\text{ vol pts}$ above ATM Calls. | **Extreme Put Skew:** OTM Puts trade $15+\text{ vol pts}$ above ATM. | Institutional crash-protection demand + leverage effect (stock drop increases debt-to-equity ratio and real vol). |
| **Commodity / FX Smile** | **Symmetric Smile or Positive Call Skew** | **Steep Right-Tail Call Skew** | Supply shocks (droughts, wars, pipeline freezes) cause violent *upward* price spikes in oil, wheat, and gold. |

### Dupire Local Volatility & Arbitrage-Free Surface Constraints
For a volatility surface to be free of static arbitrage:
1. **No Calendar Spread Arbitrage:** Total implied variance $w(K, T) = \sigma_{\text{IV}}^2(K, T) \cdot T$ must be strictly non-decreasing with expiration $T$ along constant forward-moneyness lines.
2. **No Butterfly Arbitrage:** The risk-neutral probability density $\frac{\partial^2 C}{\partial K^2} \ge 0$ must remain non-negative at every strike, limiting how steeply the skew can curve.

## Common Misconceptions
- **Misconception 1: "If 30-day volatility jumps +5 points, 1-year LEAPS volatility will also jump +5 points."**  
  *Reality:* Volatility mean-reverts! Because of the **Square-Root-of-Time Rule on Variance shocks**, a $1\text{ point}$ move in 1-year implied volatility normally corresponds to a $\sqrt{12} \approx 3.5\text{ point}$ move in 1-month implied volatility. Long-dated Vega is far more stable than front-month Vega.
- **Misconception 2: "Sticky-Strike and Sticky-Delta mean the same thing."**  
  *Reality:* When the underlying stock moves, how does the surface shift? Under **Sticky-Strike**, each fixed strike $K$ keeps its exact old IV. Under **Sticky-Delta (Sticky-Moneyness)**, the IV curve shifts horizontally *with* the spot price so that a $50\Delta$ ATM option always keeps the same ATM volatility. Understanding whether a market is trading Sticky-Strike or Sticky-Delta determines how you must adjust your Delta hedge!

## Notes for Future-Me
Before entering any multi-leg option strategy, inspect where the current Volatility Surface sits relative to its 1-year historical percentile:
- **Steep Contango + Low ATM Vol:** Ideal regime for **Calendar Spreads** or **Long Diagonal Spreads** (selling slightly elevated back-month vol or buying cheap front-month gamma).
- **Inverted Backwardation + Extreme Skew:** Never buy naked front-month OTM puts at the height of a panic—you are paying peak implied volatility and peak skew simultaneously. Use **Put Ratio Spreads** or **Collars** to sell the overpriced skew leg to fund your protection.

