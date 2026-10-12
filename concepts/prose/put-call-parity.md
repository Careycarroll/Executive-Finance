# Put-Call Parity and Synthetic Equivalence

## Intuition
Put-Call Parity is one of the most elegant and fundamental equilibrium laws in derivatives finance, proven by Hans Stoll in 1969. It establishes a static mathematical equality between the prices of European call options, European put options, the underlying stock, and a risk-free zero-coupon bond sharing the identical strike price ($K$) and expiration date ($T$).

The intuition rests on **Portfolio Equivalence**:
- **Portfolio A (Fiduciary Call):** Buy one European Call ($c$) and invest the present value of the strike ($K e^{-rT}$) in a risk-free bond.
- **Portfolio B (Protective Put):** Buy one share of underlying stock ($S$) and buy one European Put ($p$).

At expiration ($T$):
- If $S_T > K$: Portfolio A call pays $S_T - K$ and the bond matures at $K$, giving total payoff $S_T$. Portfolio B put expires worthless, leaving the stock worth $S_T$.
- If $S_T \le K$: Portfolio A call expires worthless, and the bond matures at $K$. Portfolio B put exercises, allowing the investor to sell the stock for $K$.

In every possible future state of the world, both portfolios have the exact same terminal payoff: $\max(S_T, K)$. Under the Law of One Price, they must cost the exact same amount today:
$$c + K e^{-rT} = p + S_0$$

This relationship allows traders to construct **synthetic positions**: any asset in the formula can be replicated synthetically using the other three.

## Formula
c + K \cdot e^{-r T} = p + S_0

$$\text{Synthetic Stock: } S_0 = c - p + K \cdot e^{-r T}$$

$$\text{Synthetic Call: } c = p + S_0 - K \cdot e^{-r T}$$

$$\text{Synthetic Put: } p = c - S_0 + K \cdot e^{-r T}$$

## Variable Glossary
- **c**: European Call option price today.
- **p**: European Put option price today.
- **S_0**: Current spot market price of the underlying asset.
- **K**: Strike price common to both options.
- **r**: Continuously compounded risk-free interest rate.
- **T**: Time to expiration in years.
- **K e^{-rT}**: Present value of the strike price payable at expiration.

## Worked Example
A proprietary trading desk observes the following 1-year European option quotes on a non-dividend paying stock:
- Stock Spot Price ($S_0$): $\$100.00$
- Strike Price ($K$): $\$100.00$
- Risk-free rate ($r$): $5.0\%$ ($e^{-0.05 \times 1} = 0.95123 \implies \text{PV}(K) = \$95.12$)
- Market Call Price ($c$): $\$12.00$
- Market Put Price ($p$): Suppose the market quotes the put at $\$6.00$.

**Step 1: Check Put-Call Parity Balance**
$$\text{Left Side (Call + Bond)} = c + K e^{-rT} = \$12.00 + \$95.12 = \$107.12$$
$$\text{Right Side (Put + Stock)} = p + S_0 = \$6.00 + \$100.00 = \$106.00$$

**Step 2: Exploit Arbitrage Discrepancy**
The Left Side is overpriced relative to the Right Side by $\$1.12$!
**Arbitrage Trade Structure:**
1. Sell the expensive assets: Short 1 Call ($+\$12.00$) and borrow $\$95.12$ at $5\%$ ($+\$95.12$). Total cash inflow: $+\$107.12$.
2. Buy the cheap assets: Buy 1 Put ($-\$6.00$) and buy 1 share of Stock ($-\$100.00$). Total cash outflow: $-\$106.00$.
3. **Immediate Riskless Upfront Cash Profit:** $\$107.12 - \$106.00 = +\$1.12$.

At expiration $T$:
- If $S_T = \$120$: Short call is exercised against you ($-\$20$), stock is worth $+\$120$, put is worthless, repay loan principal and interest ($-\$100$). Net cash flow: $-20 + 120 - 100 = \$0$.
- If $S_T = \$80$: Short call expires worthless, put is exercised ($+\$20$), sell stock for $\$80$, repay loan ($-\$100$). Net cash flow: $0 + 20 + 80 - 100 = \$0$.

The arbitrageur locks in $\$1.12$ upfront with absolute zero net payoff risk at maturity.

## When to Use
- **When to use:** Option market making, checking options pricing integrity, creating synthetic short stock when borrowing shares is impossible or expensive ("hard-to-borrow" rebate fees), and conversions/reversals arbitrage.
- **When not to use / Caveats (American Options):** Strict put-call parity equality ONLY holds for **European-style options**. For American options (which can be exercised prior to expiration), early exercise rights on puts (or calls on dividend-paying stocks) break the strict equality, turning parity into inequality bounds:
$$S_0 - K \le C - P \le S_0 - K e^{-rT}$$

## Notes for Future-Me
Synthetic equivalence is the ultimate weapon against execution friction. If you need to short a stock that has a brutal $15\%$ borrow fee, do not short the physical stock. Synthetically create the short by buying an at-the-money Put and selling an at-the-money Call ($S_{\text{synth}} = c - p$). The synthetic short gives you identical delta exposure and dollar-for-dollar downside participation without borrowing shares.

