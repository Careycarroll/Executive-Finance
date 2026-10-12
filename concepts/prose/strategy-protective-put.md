# Protective Put Strategy

## Intuition
The Protective Put (Portfolio Insurance) is the quintessential risk management strategy in institutional equity management. It consists of **holding a long position in an underlying stock or portfolio while simultaneously purchasing a Put option on that same asset**.

The strategy acts exactly like a homeowners casualty insurance policy:
- **Catastrophic Floor:** The strike price ($K$) of the put establishes a strictly guaranteed price floor below which portfolio losses cannot fall, regardless of how severe the market crash.
- **Uncapped Upside:** If the stock appreciates, the investor retains 100% of the upside gains, minus only the upfront insurance deductible cost (the put premium $P_0$).
- **Maximum Loss:** Strictly capped at $(S_0 - K) + P_0$.

By Put-Call Parity ($S + p = c + K e^{-rT}$), a protective put is **synthetically identical to a Long Call Option plus cash in a risk-free bond**! Both positions deliver an identical asymmetric payoff: bounded downside protection combined with unlimited upside participation.

## Formula
$$\text{Net Payoff at Expiration } (T) = S_T - S_0 - P_0 + \max(0, K - S_T)$$

$$\text{Floor Portfolio Value} = K - P_0 \quad \text{(Guaranteed minimum value at } T\text{)}$$

$$\text{Max Loss} = (S_0 - K) + P_0 \quad \text{(Occurs if } S_T \le K\text{)}$$

$$\text{Breakeven Stock Price} = S_0 + P_0$$

## Variable Glossary
- **$S_0$**: Initial purchase price of the underlying stock.
- **$S_T$**: Stock price at option expiration.
- **$K$**: Strike price of the protective put option ($K \le S_0$).
- **$P_0$**: Cash premium paid upfront per share to purchase the put option.
- **$\text{Breakeven}$**: Stock price needed at expiration to recover the initial stock cost plus the insurance premium paid.

## Notes for Future-Me
Beware of **"Continuous Insurance Bleed"**: 
Buying protective puts rolling month after month sounds safe, but due to the persistent **equity volatility skew**, out-of-the-money puts trade at steep implied volatility premiums. If an institutional manager buys 3-month rolling 10% OTM puts continuously over a 10-year bull market, the cumulative drag from paying put premiums will destroy $30\%-50\%$ of total fund returns!

**Smart Insurance Architecture:**
Instead of paying cash out-of-pocket for naked protective puts, structure a **Zero-Cost Collar**:
1. Own the underlying equity portfolio ($S_0$).
2. Buy an Out-of-the-Money Put ($K_{\text{put}} = 90\%$ of spot) for downside protection.
3. Sell an Out-of-the-Money Call ($K_{\text{call}} = 110\%$ of spot) where the cash collected from the call *exactly equals* the cash spent on the put!
This immunizes the portfolio against bear market crashes with zero net cash outlay from the treasury, in exchange for agreeing to cap upside gains during the hedging window.

