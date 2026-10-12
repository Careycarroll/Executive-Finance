# Volatility Skew, Smile & Fat Tails

## Intro
The Black-Scholes-Merton model makes a foundational simplifying assumption: that returns follow a log-normal distribution with constant volatility $\sigma$ across all strike prices and maturities.

If this assumption were true, plotting Black-Scholes implied volatility against strike price would yield a perfectly flat horizontal line. In real-world financial markets, however, that line is never flat:
- **The Volatility Smile:** Observed in foreign exchange (FX) markets, where both out-of-the-money puts and out-of-the-money calls trade at higher implied volatilities than at-the-money options, forming a symmetric "U-shaped smile." This reflects **excess kurtosis (fat tails)**: extreme moves in either direction occur far more frequently than a Gaussian normal distribution predicts.
- **The Volatility Skew (Smirk):** Universal in equity index options (S&P 500, Nasdaq) since the **1987 Black Monday crash**. Out-of-the-money puts trade at massive volatility premiums relative to at-the-money options, while out-of-the-money calls trade at a steep discount, creating a downward-sloping "skew" curve.

The equity skew exists because of **crash phobia and financial leverage**: investors fear sudden catastrophic market crashes far more than upside blow-offs, creating unquenchable demand for downside put protection. Furthermore, as stock prices drop, corporate debt leverage mechanically increases, making equity fundamentally riskier and more volatile.

## Diagram
### The Implied Volatility Surface: Smile vs. Skew

```
Implied Volatility (IV)
       ▲
  40%  │   \  (Equity Skew / Smirk)
       │    \
  30%  │     \                      /  (FX Smile)
       │      \                    /
  20%  │       \______  ATM  _____/
       │              \  │  /
  10%  │               \ │ /
       └─────────────────┼─────────────────────────► Strike Price (K)
                      Deep OTM Puts        ATM         Deep OTM Calls
```

### Volatility Profiles by Asset Class

| Market | Volatility Surface Shape | Primary Economic Driver | Executive Implication |
|---|---|---|---|
| **Equities / Equity Indices** | **Downward Skew (Smirk)** | Crash phobia; downside institutional put demand; leverage effect. | Downside put hedges are expensive; selling OTM puts carries extreme tail risk. |
| **Commodities (Oil, Ags)** | **Upward / Inverted Skew** | Supply disruptions; fear of sudden catastrophic price spikes. | Call options trade at a volatility premium over puts. |
| **Currencies (FX)** | **Symmetric Smile** | Sovereign currency devaluation risk; equal probability of two-sided tail jumps. | Straddles and strangles trade rich relative to at-the-money options. |

## Common Misconceptions
- **Misconception 1: "A 10% out-of-the-money put with an IV of 28% is more expensive than an at-the-money put with an IV of 20%."**
  *Reality:* In dollar terms, the OTM put is still cheaper! However, its *implied price per unit of volatility* is higher. The market is charging a premium because it knows returns have fat tails: a $3\sigma$ or $4\sigma$ crash will happen far more often than the 0.13% probability predicted by a normal distribution.
- **Misconception 2: "Volatility skew is an arbitrage opportunity."**
  *Reality:* Selling high-IV OTM puts and buying low-IV ATM puts (ratio spreads) is NOT free arbitrage. It is selling catastrophic disaster insurance. In a true market panic (e.g., March 2020), those cheap-looking short OTM puts will expand in value by $50\times$, bankrupting the fund.
- **Misconception 3: "Skew is static over time."**
  *Reality:* Skew steepens dramatically when markets rise in calm conditions (complacency, putting calls on discount) and flattens during crashes as panic buying hits ATM and OTM options equally.

## Notes for Future-Me
Respect the fat tails: in a Gaussian normal distribution, an $8\sigma$ daily move is mathematically expected once every 3.5 trillion years—yet global markets experience $5\sigma$ to $10\sigma$ crashes every single decade! 

When structuring portfolio hedges, use the skew to your advantage:
- **Avoid buying expensive outright puts:** Buying deep OTM puts guarantees a continuous negative roll bleed because you are paying maximum skew premium.
- **Use Put Spread Collars:** Buy an OTM put spread (selling an even deeper OTM put to fund the purchase), or finance the put by selling an OTM call. Selling high-skew OTM options partially finances your downside protection, immunizing your treasury from skew drag.

