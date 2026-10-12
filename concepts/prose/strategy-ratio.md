# Option Strategy: Ratio Spreads & Backspreads

## Intuition
While standard Vertical Spreads buy and sell an equal number of contracts ($1 \times 1$), **Ratio Spreads** buy and sell an **unequal number of contracts** (typically $1 \times 2$ or $2 \times 3$) on the same expiration date to exploit Steep Volatility Skew (Natenberg Ch. 14; Sinclair Ch. 4):

1. **Front Ratio Spread ($1 \times 2$ Ratio Vertical):** **Buy 1 closer-to-the-money option ($K_1$)** and **Sell 2 further Out-of-the-Money options ($K_2$)** for a net credit or zero cost. If the stock moves moderately toward $K_2$, you earn maximum profit; if the stock goes the wrong way, you lose nothing (if entered for a credit); **but if the stock blows violently past $K_2$, you carry 1 naked short option with uncapped tail risk!**
2. **Backspread ($2 \times 1$ Reverse Ratio):** **Sell 1 closer-to-the-money option ($K_1$)** and **Buy 2 further Out-of-the-Money options ($K_2$)**. Caps loss in a narrow zone around $K_2$ while delivering explosive, unlimited Long Gamma / Long Vega convexity if a violent breakout or crash occurs.

## Structure
### Payoff Comparison: $1 \times 2$ Put Ratio Spread vs. $1 \times 2$ Call Backspread

```
Expiration Payoff of a 1x2 Put Ratio Spread (Long 1 $95 Put / Short 2 $90 Puts for +$1.00 Credit)
    P&L
     ▲
+$6  ┼───────────────────▲────────────────────────────────  Max Profit at S_T = K_2 ($90):
     │                  ╱ ╲                                 ($95 - $90) + $1 Credit = +$6.00
+$1  ─────────────────┼───┼─────────► Stock Price (S_T)   Above $95: Keep +$1.00 Credit!
     │               ╱     $95
 $0 ─┼──────────────┼─────────────────────────────────────  Downside Breakeven = $84.00
     │             ╱ $84  $90
     │            ↙ (Uncapped Naked Short Put Risk below $84!)
```

| Strategy Archetype | Construction (Example) | Greek Profile | Ideal Volatility Skew Regime |
|---|---|---|---|
| **Put Ratio Spread ($1 \times 2$)** | Buy 1 $95\text{P}$ / Sell 2 $90\text{P}$ (for Net Credit) | $-\Gamma, \quad +\Theta, \quad -\mathcal{V}$ | **Steep Negative Put Skew:** The two $90$ Puts trade at much higher IV than the $95$ Put, funding the spread for a credit! |
| **Call Ratio Spread ($1 \times 2$)** | Buy 1 $105\text{C}$ / Sell 2 $110\text{C}$ (for Net Credit) | $-\Gamma, \quad +\Theta, \quad -\mathcal{V}$ | **Commodity / Call Skew:** Overpriced upside calls finance a moderate bullish participation zone. |
| **Call Backspread ($1 \times 2$)** | Sell 1 $100\text{C}$ / Buy 2 $105\text{C}$ (for Zero Cost) | $+\Gamma, \quad -\Theta, \quad +\mathcal{V}$ | **Low Implied Vol + Flat Skew:** Cheap upside convexity with zero loss if the market crashes downward. |
| **Put Backspread ($1 \times 2$)** | Sell 1 $100\text{P}$ / Buy 2 $95\text{P}$ | $+\Gamma, \quad -\Theta, \quad +\mathcal{V}$ | **Pre-Crisis Complacency:** Portfolio crash tail hedge that costs nothing if the stock rallies above $100$. |

## Common Misconceptions
- **Misconception 1: "A Put Ratio Spread entered for a net credit is a low-risk trade because you can't lose if the stock goes up."**  
  *Reality:* While you keep the $\$1.00$ credit if the stock rallies, below the lower breakeven ($2 K_2 - K_1 - \text{Credit}$) you are **naked short a put**! During a market crash or overnight bankruptcy gap, a $1 \times 2$ Put Ratio Spread suffers catastrophic losses combined with exploding implied volatility (short Vega). Only enter a Put Ratio Spread if you are **100% willing and capitalized to take physical ownership of the stock** at the effective breakeven price ($K_{\text{eff}} = \$84$).
- **Misconception 2: "Backspreads are better than buying naked calls or puts."**  
  *Reality:* In a $1 \times 2$ Call Backspread (Short 1 $100\text{C}$ / Long 2 $105\text{C}$), there is a **"Valley of Death"** right at $S_T = \$105$ where you suffer maximum loss ($\$5.00$). If the stock rallies gently and pins at $\$105$ on expiration day, your directional call was right—yet you lose the maximum possible amount on the trade!

## Notes for Future-Me
How institutional equity managers use the **Stock Repair Strategy (a $1 \times 2$ Call Ratio Spread)**:
Suppose you bought 100 shares of a high-quality stock at $\$100$, and it dropped to $\$80$ ($-\$20$ unrealized loss). Instead of waiting years for a $+25\%$ rally back to $\$100$ or doubling down with new cash:
1. Keep your 100 shares at $\$80$.
2. **Buy 1 ATM $\$80$ Call** and **Sell 2 OTM $\$90$ Calls** for **$\$0.00$ net cost** (a $1 \times 2$ Call Ratio Spread).
3. Because you already own 100 shares of stock, the extra short $\$90$ Call is **100% covered** (zero naked upside risk!).
4. Now, if the stock merely recovers halfway to **$\$90$**, you earn $\$10$ on your stock plus $\$10$ on your $\$80/\$90$ call spread—**breaking even completely at $\$90$ instead of $\$100$** for zero out-of-pocket cash!

