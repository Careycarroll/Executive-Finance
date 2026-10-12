# Option Strategy: Calendar & Diagonal Spreads

## Intuition
While Vertical Spreads, Butterflies, and Condors trade different strikes within the *same* expiration month, **Calendar Spreads (Horizontal / Time Spreads)** and **Diagonal Spreads** exploit the **Term Structure of Volatility and Differential Theta Decay** across *two different expiration dates* ($T_1 < T_2$) (Natenberg Ch. 14; Hull Ch. 12).

A **Long Calendar Spread** is constructed by:
1. **Selling 1 Near-Term Option (Expiration $T_1$, Strike $K$)**
2. **Buying 1 Longer-Term Option (Expiration $T_2 > T_1$, Same Strike $K$)**

Because Theta decay is proportional to $1 / \sqrt{T}$, the short front-month option ($T_1$) decays much faster than the long back-month option ($T_2$). Simultaneously, because Vega is proportional to $\sqrt{T}$, the long back-month option has significantly more Vega than the short front-month option—creating a unique position that is **simultaneously Long Theta ($+\Theta$) and Long Vega ($+\mathcal{V}$)**!

## Structure
### Payoff Geometry at Front-Month Expiration ($T_1$) & Greek Comparison

```
Payoff Profile of a Long Calendar Spread at Front-Month Expiration (T_1)
    P&L
     ▲
+$3  ┼───────────────────────╭───╮───────────────────────  Max Profit at S_{T1} = K ($100)
     │                      ╱     ╲                        (Short expires $0; Long retains
     │                     ╱       ╲                        full extrinsic time value!)
 $0 ─┼────────────────────┼─────────┼────────────────────► Stock Price at T_1 (S_{T1})
-$2 ─┼─────────────╯     94         106    ╰─────────────  Max Loss = Initial Net Debit (-$2)
                         Strike K=$100
```

| Spread Type | Leg Construction | Net Greek Profile (Near Strike $K$) | Primary Strategic Objective |
|---|---|---|---|
| **Long Calendar Spread (Horizontal)** | Short $(K, T_1)$ + Long $(K, T_2)$ | $\Delta \approx 0, \quad \mathbf{\Theta > 0}, \quad \mathbf{\Gamma < 0}, \quad \mathbf{\mathcal{V} > 0}$ | Range-bound stock through $T_1$ paired with rising overall implied volatility. |
| **Short Calendar Spread** | Long $(K, T_1)$ + Short $(K, T_2)$ | $\Delta \approx 0, \quad \mathbf{\Theta < 0}, \quad \mathbf{\Gamma > 0}, \quad \mathbf{\mathcal{V} < 0}$ | Explosive imminent breakout move OR crush in back-month volatility. |
| **Diagonal Spread ("Poor Man's Covered Call")** | Long Deep ITM $(K_1, T_2)$ + Short OTM $(K_2, T_1)$ | **Directional $\Delta$** ($\pm 0.30$ to $\pm 0.60$), $+\Theta$, $+\mathcal{V}$ | Capital-efficient substitute for Covered Calls using a long-dated LEAPS call as synthetic stock. |

## Common Misconceptions
- **Misconception 1: "A Long Calendar Spread always profits when implied volatility rises."**  
  *Reality:* This is only true for a **parallel shift** in volatility across both months! In the real world, when a sudden market panic or earnings rumor hits, front-month volatility ($\sigma_1$) spikes $3\times$ harder than back-month volatility ($\sigma_2$), driving the term structure into **Backwardation**. Even though your back-month option has a higher raw Vega number, a violent spike in front-month IV relative to back-month IV can cause a Long Calendar Spread to lose money! Always weight your Vega by the term-structure beta (**Weighted Vega**: $\mathcal{V}_w = \mathcal{V} \cdot \sqrt{T_{\text{base}} / T}$).
- **Misconception 2: "You should buy a Long Calendar Spread right before an earnings announcement because IV is high."**  
  *Reality:* Before earnings, front-month IV is massively inflated relative to back-month IV (steep backwardation). If you buy a Calendar before earnings, you are selling elevated front-month vol (good), *unless* the stock makes a huge post-earnings gap outside your tent, where Gamma kills the position. Conversely, never buy a Calendar when front-month IV is elevated if you expect *both* months to crush equally.

## Notes for Future-Me
The two golden rules for trading Calendar and Diagonal Spreads:
1. **Check the Term Structure Slope First:** Only buy Long Calendar Spreads when the Volatility Term Structure is in **Contango** or flat ($\sigma_{\text{front}} \le \sigma_{\text{back}}$), or when you have a specific catalyst (like an earnings date in $T_1$) where front-month IV is $20+\text{ vol points}$ higher than $T_2$ and you expect a smaller-than-implied stock move.
2. **Poor Man's Covered Call Rule:** When structuring a Bullish Call Diagonal (buying a $0.80\Delta$ back-month call and selling a $0.30\Delta$ front-month call), ensure the **Net Debit paid is less than the strike width ($K_2 - K_1$)**. That guarantees you cannot lose money if the stock explodes upward through your short strike!

