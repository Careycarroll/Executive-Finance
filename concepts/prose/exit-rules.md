# Disciplined Exit Rules & Trade Management

## Intuition
In quantitative derivatives trading, **entry selection generates your potential edge, but exit discipline determines your realized survival and Sharpe Ratio** (Sinclair Ch. 6). Because options possess non-linear Gamma and time-dependent Theta/Vega profiles, the risk-reward characteristics of an option position at Day 25 are radically different from the day you entered it.

Moreover, human behavioral biases (**Prospect Theory**, the **Disposition Effect**, and **Sunk Cost Escalation**) peak once a trade is live. Professional trading desks eliminate emotional improvisation by pre-committing to **four objective exit rules before the trade is ever entered**:
1. **Profit-Target Exit:** Capturing the majority of expected value before tail Gamma/Theta risk turns unfavorable.
2. **Time-Stop Exit:** Exiting before expiration-week Gamma and Pin Risk explode.
3. **Thesis-Invalidation Exit:** Closing immediately when the underlying volatility or catalyst premise disappears.
4. **Risk-Limit / Stop-Loss Exit:** Enforcing hard portfolio drawdown caps.

## Structure
### Institutional Exit Protocol by Strategy Class

| Strategy Class | Profit Target Rule | Time-Stop Rule | Loss / Adjustment Rule | Mathematical Rationale |
|---|---|---|---|---|
| **Short Premium (Condors, Credit Spreads, Strangles)** | Close at **$50\% - 65\%$ of Max Credit** | Exit at **$14 - 21\text{ DTE}$** (Days to Expiration) | Close if loss reaches **$1.5\times - 2.0\times$ initial credit**, or roll untested side to cut Delta. | Once $50\%$ of credit is captured, you are risking $\$85$ to make the last $\$15$ while short Gamma explodes in the final 14 days! |
| **Long Volatility / Event Straddles** | Close immediately upon **Realized Vol Spike** or **IV Expansion** | Exit **before the final 30% of holding period** | Cut if catalyst passes without move (Thesis Invalidation). | Theta decay accelerates non-linearly ($\propto 1/\sqrt{\tau}$); holding stagnant long options into final 2 weeks guarantees rapid bleed. |
| **Directional Vertical Spreads** | Close at **$70\% - 80\%$ of Max Spread Width** | Exit **$3 - 5\text{ days}$ prior to expiry** | Close if underlying breaches technical/fundamental support. | At $80\%$ of max value, a deep ITM vertical spread has flipped from **Long Gamma to Short Gamma**—you now have $4\times$ downside risk for tiny remaining upside! |

```
The Gamma-Theta Risk Inversion in the Final 14 Days to Expiration
Risk / Reward Ratio
     ▲
     │                                            ╱ ╱  Gamma Explosion Zone!
     │                                         ╱ ╱     (Tiny stock move wipes out
     │                                      ╱ ╱         30 days of accumulated Theta)
     │    Sweet Spot Harvesting Zone     ╱ ╱
     │   (45 DTE down to 21 DTE)      ╱ ╱
     └───────────┬──────────────────┬─────────────────► Time to Expiration
              45 DTE             21 DTE            0 DTE (Expiry)
                                    ▲
                        MANDATORY TIME-STOP EXIT
```

## Common Misconceptions
- **Misconception 1: "Rolling a losing short option out and down turns a loser into a winner."**  
  *Reality:* "Rolling" is not a magical accounting eraser—it is **two separate transactions**: (1) Closing a losing trade for a realized cash loss, and (2) Opening a brand-new trade in the next expiration month! Before rolling any losing option, ask: *"If I had zero position in this stock today and $100\% cash, would I enter this new trade right now?"* If the answer is no, do not roll—close the position and move on.
- **Misconception 2: "Placing tight automated stop-market orders on options protects capital."**  
  *Reality:* Options market makers widen bid-ask spreads dramatically during momentary market flashes. A resting `Stop-Market` order on a multi-leg option spread will routinely get triggered by a temporary phantom quote spike and filled at the worst possible illiquid price. Trigger your stops off the **underlying liquid stock/futures price** or **implied volatility level**, and execute exits using limit orders near mid-price.

## Notes for Future-Me
Memorize the **"Last Nickel Trap"**:
More options portfolios have blown up trying to squeeze the last $\$0.10$ out of a winning short option in expiration week than from almost any other mistake.
- If you sold an option or spread for $\$2.00$ and it is now trading at $\$0.25$ with 10 days left to expiration, you have already won $87.5\%$ of the maximum possible profit.
- Keeping that position open for the next 10 days means taking on maximum expiration Gamma risk just to earn $\$0.025$ per day. **Buy it back for $\$0.25$, free up 100% of your buying power margin, and redeploy into a fresh 45-day cycle.**
