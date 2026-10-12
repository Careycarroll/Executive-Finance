# American Options & Early Exercise Mechanics

## Intuition
While a **European Option** can only be exercised on its final expiration date $T$, an **American Option** grants the holder the right to exercise at *any* time on or before expiration ($0 \le t \le T$) (Hull Ch. 11). Almost all exchange-traded single-stock equity options in the United States are American-style, whereas most broad index options (such as SPX) are European-style.

Because an American option includes every right of a European option plus the additional flexibility of early exercise, an American option is **always worth at least as much as its European counterpart**:
$$C_{\text{American}} \ge C_{\text{European}}, \qquad P_{\text{American}} \ge P_{\text{European}}$$

However, exercising an option early is **not** usually optimal! When you exercise an option early, you receive its **Intrinsic Value** ($S - K$ or $K - S$), but you **permanently forfeit all remaining Time Value (Extrinsic Value)** and insurance convexity. Therefore, an informed trader only exercises an American option early when the cash benefit of holding the underlying stock or strike cash outweighs the forfeited time value.

## Structure
### The Three Laws of Optimal Early Exercise

| Option Type | Optimal Early Exercise Rule | Mathematical & Economic Proof |
|---|---|---|
| **1. American Call on Non-Dividend Stock ($D = 0$)** | **NEVER exercise early!** ($C_{\text{Amer}} = C_{\text{Euro}}$) | Since $C \ge S_t - K e^{-r(T-t)} > S_t - K$, the market price of the call is strictly greater than its exercise payoff $S_t - K$. Selling the call in the open market always yields more cash than exercising it! Furthermore, delaying exercise earns interest on the strike cash $K$ and retains downside protection if the stock crashes. |
| **2. American Call on Dividend-Paying Stock ($D > 0$)** | **Exercise only immediately prior to an Ex-Dividend Date** if the dividend exceeds forfeited interest and time value. | On the ex-dividend date, the stock price drops by $D$. It is optimal to exercise right before the ex-dividend date only if $D > K \left(1 - e^{-r\Delta t}\right)$ plus remaining put insurance value. |
| **3. American Put on Any Stock** | **Can be optimal to exercise early at any time** if sufficiently Deep In-The-Money! | A put's maximum payoff is capped at $K$ (if $S \to 0$). If a stock drops to $\$0.50$ on a $\$100$ strike put, the put cannot gain much more intrinsic value, and waiting delays receiving the $\$100$ cash. Exercising immediately collects $\$99.50$ cash today to earn risk-free interest $r \cdot K$. |

$$\text{Early Exercise Premium} = V_{\text{American}} - V_{\text{European}} \ge 0$$

## Common Misconceptions
- **Misconception 1: "If my American call option on a non-dividend tech stock has doubled in value, I should exercise it to lock in profits."**  
  *Reality:* Never exercise an in-the-money call on a non-dividend stock before expiration—**sell the call option in the market instead**! If a \$100 strike call is trading at \$25 while the stock is at \$122, exercising gives you \$22 of equity value and throws \$3.00 of extrinsic time value straight into the trash.
- **Misconception 2: "High interest rates reduce the incentive to exercise American puts early."**  
  *Reality:* High interest rates *increase* the incentive to exercise deep-in-the-money American puts early! Exercising a put hands you cash ($K$) today; when risk-free rates are $5\%+$, getting that cash immediately to invest in Treasury bills is highly valuable.
- **Misconception 3: "Put-Call Parity holds as an exact equality for American options."**  
  *Reality:* Exact Put-Call Parity ($C + K e^{-rT} = P + S_0$) only holds for European options. For American options, it is replaced by inequality bounds: $S_0 - K \le C_{\text{Amer}} - P_{\text{Amer}} \le S_0 - K e^{-rT}$.

## Notes for Future-Me
If you are trading **Covered Calls** or **Vertical Call Spreads** on dividend-paying equities, watch out for **Dividend Assignment Risk**:
If your short call is in-the-money the afternoon before the stock goes ex-dividend, and the remaining extrinsic time value of the corresponding put is less than the upcoming cash dividend ($P_{\text{extrinsic}} < D$), institutional arbitrageurs will **automatically exercise your short call overnight** to capture the dividend! Close or roll in-the-money short calls the day *before* the ex-dividend date to avoid unexpected short-stock dividend liabilities.

