# Long Straddle Strategy

## Intuition
The Long Straddle is the quintessential pure volatility strategy in derivatives trading. It consists of **buying an At-the-Money (ATM) Call option and simultaneously buying an At-the-Money Put option with the exact same strike price ($K$) and expiration date ($T$)**.

The trade is **directionally neutral (Delta $\approx 0$)**: the trader does not care whether the stock moves up or down. Instead, the straddle is a pure bet on **magnitude of movement (large realized volatility)**:
- If the stock makes a massive move upward, the call gains unlimited profit while the put loss is capped at its purchase price.
- If the stock collapses downward, the put gains substantial profit while the call loss is capped at its purchase price.
- **The Enemy of the Straddle is Stagnation:** If the stock stays pinned near the strike price $K$ through expiration, both options lose all time value, resulting in a **$100\%$ total loss of the net premium paid**.

The combined premium paid defines two distinct **Breakeven Points**: the stock must move outside of this breakeven corridor by expiration for the trade to be profitable.

## Formula
$$\text{Net Payoff at Expiration } (T) = \max(0, S_T - K) + \max(0, K - S_T) - (C_0 + P_0) = |S_T - K| - \text{Total Premium}$$

$$\text{Upside Breakeven} = K + (C_0 + P_0)$$

$$\text{Downside Breakeven} = K - (C_0 + P_0)$$

$$\text{Max Profit} = \infty \quad \text{(Unlimited in either extreme direction)}$$

$$\text{Max Loss} = C_0 + P_0 \quad \text{(Occurs if stock closes exactly at strike } K\text{)}$$

## Variable Glossary
- **$K$**: Strike price common to both the call and the put ($K \approx S_0$).
- **$C_0$**: Cash premium paid for the at-the-money Call option.
- **$P_0$**: Cash premium paid for the at-the-money Put option.
- **$C_0 + P_0$**: Total debit paid upfront (total cost of the straddle).
- **$S_T$**: Price of the underlying stock at option expiration.
- **$|S_T - K|$**: Absolute dollar distance of the stock from the strike price at expiration.

## Notes for Future-Me
The straddle market price is the market's collective consensus forecast of the **Expected Move** of the asset over the option's life:
$$\text{Expected Move} \approx 0.85 \times (C_{\text{ATM}} + P_{\text{ATM}}) \approx S_0 \times \frac{\sigma_{\text{IV}}}{\sqrt{252}} \times \sqrt{DTE}$$

Whenever you consider buying a straddle ahead of an earnings release or FDA announcement:
1. Calculate the breakeven move required: if the straddle costs $\$10.00$ on a $\$100.00$ stock, the stock must move by more than $\pm 10.0\%$ just to break even!
2. Review historical earnings moves: if the stock has historically only moved an average of $\pm 5.5\%$ on earnings days over the past 8 quarters, buying the straddle at a $10\%$ implied move is a negative expected value proposition. The market has priced in the event; you are buying overpriced implied volatility.

