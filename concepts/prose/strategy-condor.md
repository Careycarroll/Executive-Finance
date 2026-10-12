# Option Strategy: The Iron Condor

## Intuition
A Short Strangle (selling a naked OTM Put and a naked OTM Call) profits when the underlying asset remains range-bound and implied volatility contracts, but exposes the trader to unlimited catastrophic tail risk if the market crashes or explodes upward.

The **Iron Condor** (Natenberg Ch. 13) is a four-legged, **defined-risk, delta-neutral income and short-volatility strategy**. It constructs a Short Strangle and immediately caps both tail risks by purchasing further Out-of-the-Money wings—combining a **Bull Put Credit Spread** below the market with a **Bear Call Credit Spread** above the market on the same expiration date:
1. **Buy 1 Further OTM Put ($K_1$):** Downside catastrophe insurance wing.
2. **Sell 1 OTM Put ($K_2 > K_1$):** Lower boundary of the profit zone.
3. **Sell 1 OTM Call ($K_3 > S_0$):** Upper boundary of the profit zone.
4. **Buy 1 Further OTM Call ($K_4 > K_3$):** Upside catastrophe insurance wing.

## Structure
### Payoff Geometry & Risk-Reward Equations

Assuming equal wing widths ($W = K_2 - K_1 = K_4 - K_3$) and initial Net Credit received ($C_{\text{net}}$):

```
Expiration Payoff Diagram of a Short Iron Condor
    P&L
     ▲
 +$2 ┼─────────────╭───────────────────╮─────────────  Max Profit = Net Credit (+$2)
     │            ╱                     ╲
  $0 ┼───────────┼───────────────────────────┼───────► Underlying Price at Expiry (S_T)
     │          ╱  K_2               K_3  ╲
 -$3 ┼─────────╯                           ╰─────────  Max Loss = Wing Width - Credit (-$3)
             K_1                           K_4
             ├───┤                       ├───┤
           Put Spread                 Call Spread
           (Width $5)                 (Width $5)
```

| Strategy Parameter | Formula | Worked Example ($S_0 = \$100$; Strikes $85/90/110/115$, Credit $=\$2.00$) |
|---|---|---|
| **Maximum Profit** | $\text{Net Credit Received } (C_{\text{net}})$ | **$\$2.00$** per share (achieved if $\$90 \le S_T \le \$110$ at expiry). |
| **Maximum Loss** | $\text{Wing Width } (W) - C_{\text{net}}$ | $\$5.00 - \$2.00 = \mathbf{\$3.00}$ per share (if $S_T \le \$85$ or $S_T \ge \$115$). |
| **Lower Breakeven** | $K_2 - C_{\text{net}}$ | $\$90 - \$2.00 = \mathbf{\$88.00}$. |
| **Upper Breakeven** | $K_3 + C_{\text{net}}$ | $\$110 + \$2.00 = \mathbf{\$112.00}$. |
| **Greek Profile (Inside Tent)** | $\Delta \approx 0, \quad \mathbf{\Theta > 0}, \quad \mathbf{\Gamma < 0}, \quad \mathbf{\mathcal{V} < 0}$ | Positive time decay (collects rent daily); loses when volatility spikes or spot breaks out. |

## Common Misconceptions
- **Misconception 1: "Because an Iron Condor consists of two vertical spreads with $5 width each, my broker requires $10 of margin."**  
  *Reality:* The underlying stock **cannot be below $\$85$ and above $\$115$ at the exact same time** on expiration day! Because only one side can ever lose at expiration, options exchanges only require margin for **one single wing width** ($W = \$5.00$), minus the $\$2.00$ credit collected, resulting in a maximum capital requirement of just **$\$3.00$**!
- **Misconception 2: "You should hold an Iron Condor all the way to expiration day to collect 100% of the credit."**  
  *Reality:* Holding a short Iron Condor into the final week before expiration is a notorious retail mistake. In the final 7 days, **Gamma explodes**: a $1.5\%$ afternoon move in the stock can swing the Condor from $+80\%$ profit to $-100\%$ max loss, and **Pin Risk** between $K_1$ and $K_2$ can leave you assigned on 100 shares of stock over the weekend with your protective wing expired! Professional traders systematically take profits at **$50\%$ of max credit** or exit at 14–21 days to expiration.

## Notes for Future-Me
How to structure high-expectancy Iron Condors:
1. **Enter Only When IV Rank Is High ($>50$th Percentile):** You are net short Vega ($\mathcal{V} < 0$). Entering when implied volatility is elevated gives you a structural tailwind as volatility mean-reverts downward, allowing you to hit $50\%$ profit in half the time.
2. **Respect Skew When Selecting Strikes:** Select short strikes by **Option Delta** (e.g., selling the $16\Delta$ Put and the $16\Delta$ Call for an $\approx 68\%$ probability of profit), not by equal dollar distance from spot. Because of negative equity skew, the $16\Delta$ Put will be much further below spot than the $16\Delta$ Call is above spot.

