# Covered Call Strategy

## Intuition
The Covered Call (Buy-Write) is one of the most widely deployed yield-enhancement strategies in equity portfolio management. It consists of **owning shares of an underlying stock while simultaneously selling (writing) an Out-of-the-Money (OTM) Call option against those identical shares**.

The strategy converts uncertain future upside appreciation into immediate, certain cash income today:
- **Downside Buffer:** The cash premium collected from selling the call provides a modest downside cushion against stock price declines.
- **Capped Upside:** In exchange for the upfront cash premium, the investor forfeits all future stock appreciation above the strike price ($K$).
- **Maximum Profit:** Reached when the stock closes at or above the strike price at expiration.
- **Maximum Loss:** Substantial (the stock can collapse to zero), cushioned only by the option premium collected.

By Put-Call Parity ($S - c = K e^{-rT} - p$), a covered call is **synthetically identical to a Short Cash-Secured Put**! Both strategies share the identical asymmetric risk-reward profile: capped upside, full downside risk, and positive Theta.

## Formula
\text{Net Payoff at Expiration } (T) = S_T - S_0 + C_0 - \max(0, S_T - K)

$$\text{Max Profit} = (K - S_0) + C_0 \quad \text{(Achieved when } S_T \ge K\text{)}$$

$$\text{Breakeven Stock Price} = S_0 - C_0$$

$$\text{Max Loss} = S_0 - C_0 \quad \text{(Occurs if stock drops to } \$0\text{)}$$

## Variable Glossary
- **S_0**: Initial purchase price of the underlying stock.
- **S_T**: Stock price at option expiration.
- **K**: Strike price of the written call option ($K > S_0$ for OTM covered call).
- **C_0**: Cash premium collected upfront per share for selling the call option.
- **\text{Breakeven}**: The price below which the overall combined position incurs net losses.

## Notes for Future-Me
Beware the **"Winner Forfeiture & Loser Concentration Trap"**: 
Covered calls sound great in marketing brochures ("generate 8% annual dividend yield on your stock portfolio!"), but the strategy suffers from severe negative skewness.
- When your stock picks are massive winners (surging +40% on breakthrough product news), your calls are exercised, and your upside is capped at +5%.
- When your stock picks are disastrous losers (crashing -50% on scandal or bankruptcy), you keep the tiny \$3.00 call premium, but absorb the entire brutal \$50 loss!

Over long market cycles, unmanaged covered calls systematically underperform simple buy-and-hold investing because you sell away your right-tail compounders while retaining all your left-tail disasters. 

**Rule for Future-Me:** Only sell covered calls on mature, low-beta cash cows (utilities, consumer staples) with high implied volatility (IV Rank $> 60$), where you are genuinely willing to part with the stock at the strike price. Never sell covered calls on high-conviction, secular compounders.

