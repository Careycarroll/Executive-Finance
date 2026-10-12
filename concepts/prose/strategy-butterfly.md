# Option Strategy: The Butterfly Spread

## Intuition
The **Long Butterfly Spread** (Natenberg Ch. 13; Hull Ch. 12) is a classic three-strike, four-option neutral strategy designed to generate a high reward-to-risk ratio when the trader expects the underlying asset to pin near a specific target price ($K_2$) with declining volatility.

Conceptually, a Long Butterfly is the simultaneous combination of a **Bull Spread** and a **Bear Spread** sharing the same center short strike $K_2$ (or equivalently, a Short Straddle at $K_2$ hedged with tight Long Strangle wings at $K_1$ and $K_3$):
1. **Buy 1 Lower-Strike Option ($K_1 = K_2 - W$)**
2. **Sell 2 Center-Strike Options ($K_2$, the "Body")**
3. **Buy 1 Upper-Strike Option ($K_3 = K_2 + W$, equidistant wing)**

Because Put-Call Parity links calls and puts of the same strikes, a **Long Call Butterfly**, a **Long Put Butterfly**, and an **Iron Butterfly** with identical strikes have the exact same theoretical payoff diagram!

## Structure
### Payoff Geometry & Risk-Reward Equations

For a Long Call Butterfly with equidistant wing width $W = K_2 - K_1 = K_3 - K_2$ entered for a small Net Debit ($D_{\text{net}}$):

```
Expiration Payoff Diagram of a Long Butterfly Spread
    P&L
     ▲
+$4  ┼───────────────────────▲───────────────────────  Max Profit = W - Debit (+$4.00)
     │                      ╱ ╲                        at S_T = K_2 ($100)
     │                     ╱   ╲
 $0 ─┼────────────────────┼─────┼────────────────────► Underlying Price at Expiry (S_T)
-$1 ─┼─────────────╯     96     104    ╰─────────────  Max Loss = Net Debit (-$1.00)
                 K_1=$95  K_2=$100  K_3=$105
```

| Strategy Parameter | Formula | Worked Example ($95 / 100 / 105$ Call Fly for $\$1.00$ Debit) |
|---|---|---|
| **Net Initial Cost (Max Loss)** | $D_{\text{net}} = C(K_1) - 2C(K_2) + C(K_3)$ | **$\$1.00$** per share (strictly capped if $S_T \le \$95$ or $S_T \ge \$105$). |
| **Maximum Profit** | $\text{Wing Width } (W) - D_{\text{net}}$ | $\$5.00 - \$1.00 = \mathbf{\$4.00}$ per share ($4:1$ reward-to-risk at $S_T = \$100$). |
| **Lower Breakeven** | $K_1 + D_{\text{net}}$ | $\$95 + \$1.00 = \mathbf{\$96.00}$. |
| **Upper Breakeven** | $K_3 - D_{\text{net}}$ | $\$105 - \$1.00 = \mathbf{\$104.00}$. |
| **Greek Profile (Near $K_2$)** | $\Delta \approx 0, \quad \mathbf{\Theta > 0}, \quad \mathbf{\Gamma < 0}, \quad \mathbf{\mathcal{V} < 0}$ | Earns positive Theta and short-Vega profit near the body $K_2$; flips to positive Gamma/negative Theta outside the wings! |

## Common Misconceptions
- **Misconception 1: "A $4:1$ reward-to-risk ratio means the Butterfly starts doubling in value two weeks before expiration."**  
  *Reality:* Because the Long Options at $K_1$ and $K_3$ decay at almost the same rate as the Short Options at $K_2$ early in the trade, a Butterfly's mark-to-market price barely moves until the **final 5 to 10 days before expiration**! Do not buy 60-day Butterflies expecting rapid Theta profits; Butterflies are inherently short-dated pin-targeting vehicles.
- **Misconception 2: "Call Butterflies and Put Butterflies require the same cash outlay."**  
  *Reality:* When targeting a price *below* current spot ($K_2 < S_0$), using **Out-of-the-Money Puts** (a Put Butterfly) avoids dealing with wide bid-ask spreads and early-exercise assignment risk on Deep In-the-Money Calls. Always build your Butterfly using **Out-of-the-Money options** (Put Fly for downside targets; Call Fly for upside targets; Iron Fly for ATM targets).

## Notes for Future-Me
Use **Directional OTM Butterflies** as a low-cost alternative to Vertical Spreads when Implied Volatility is extremely high:
- If a stock is at $\$100$ ahead of an earnings report with $80\%$ IV, buying a $\$105/\$110$ Bull Call Spread is expensive due to elevated Vega.
- Instead, buying a **$100 / 110 / 120$ OTM Call Butterfly** sells two units of overpriced $110$ volatility, cutting your upfront cost by $60\%$ while delivering up to $6\times-8\times$ payoff if the stock rallies moderately to your $\$110$ target and volatility crushes after earnings!
