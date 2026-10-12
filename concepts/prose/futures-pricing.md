# Cost of Carry and Futures Pricing

## Intuition
The theoretical price of a forward or futures contract is governed by the **Law of One Price** and the principle of **No-Arbitrage**.

To acquire an asset $T$ years in the future, an investor has two equivalent choices:
1. Buy a forward contract today agreeing to pay $F_0$ at time $T$.
2. Buy the physical asset in the spot market today at $S_0$, store it, insure it, pay storage costs, collect any interim cash yields (dividends or interest), and finance the purchase with debt at interest rate $r$.

Because both strategies result in identical ownership of the asset at time $T$ with zero interim cash requirements, the forward price must equal the spot price plus the net **Cost of Carry**:
$$\text{Futures Price} = \text{Spot Price} + \text{Financing Cost} + \text{Storage Cost} - \text{Interim Income}$$

If the futures price drifts above this no-arbitrage boundary, traders execute **Cash-and-Carry Arbitrage** (borrow cash, buy spot, short futures). If it drops below, they execute **Reverse Cash-and-Carry Arbitrage**.

For physical commodities (oil, wheat, copper), commercial inventory holders receive an implicit benefit from holding physical stock during supply disruptions called the **Convenience Yield ($y$)**. When convenience yield is high, the market shifts into **Backwardation** ($F_0 < S_0$). When storage costs dominate, the market enters **Contango** ($F_0 > S_0$).

## Formula
F_0 = S_0 \cdot e^{(r - q) T} \quad \text{(Financial Assets with Dividend Yield } q\text{)}

$$F_0 = S_0 \cdot e^{(r + u - y) T} \quad \text{(Commodities with Storage Cost } u \text{ and Convenience Yield } y\text{)}$$

$$\text{Basis} = S_t - F_t$$

## Variable Glossary
- **F_0**: Theoretical equilibrium forward/futures price today.
- **S_0**: Spot market price of the underlying asset today.
- **r**: Continuously compounded risk-free financing interest rate.
- **q**: Continuous dividend yield (or foreign risk-free interest rate for currencies).
- **u**: Annualized storage and insurance cost as a percentage of spot price.
- **y**: Annualized convenience yield (benefit of holding physical inventory).
- **T**: Time to contract maturity in years.
- **\text{Basis}**: Spot price minus futures price ($S_t - F_t$). At maturity, basis must converge to zero.

## Worked Example
A corporate treasurer is evaluating an S&P 500 equity index futures hedge with a 6-month maturity ($T = 0.50$):
- Current Index Spot Level ($S_0$): $5{,}000.00$
- Risk-free financing rate ($r$): $5.0\%$ per annum ($0.05$)
- Dividend yield on the index ($q$): $1.5\%$ per annum ($0.015$)

**Step 1: Calculate Net Cost of Carry**
$$\text{Net Carry} = r - q = 0.05 - 0.015 = 0.035 \ (3.5\%)$$

**Step 2: Calculate Theoretical Futures Price**
$$F_0 = 5{,}000 \cdot e^{(0.035 \times 0.50)} = 5{,}000 \cdot e^{0.0175} = 5{,}000 \times 1.01765 = 5{,}088.27$$

The fair futures price is **$5,088.27**.

**Arbitrage Analysis:**
If market makers quote the futures at $\$5{,}110.00$ (overpriced by $\$21.73$):
1. Borrow $\$5{,}000$ at $5\%$.
2. Buy the physical S&P 500 basket at $\$5{,}000$.
3. Sell the 6-month futures contract at $\$5{,}110.00$.
4. Over 6 months, collect $\$37.50$ in dividends while paying $\$125.00$ in interest.
5. At $T = 0.5$, deliver the basket into the contract for $\$5{,}110.00$. Net riskless arbitrage profit: $\$21.73$ per contract. Market arbitrageurs instantly force the price back to $\$5{,}088.27$.

## When to Use
- **When to use:** Index arbitrage, currency forward pricing (Covered Interest Parity: $F = S \frac{1+r_d}{1+r_f}$), sizing commodity supply chain procurement hedges, and calendar roll analysis.
- **When not to use / Caveats:** Do not assume reverse cash-and-carry arbitrage works smoothly on physical commodities during a short squeeze! If you short spot and buy futures, you must borrow physical barrels of oil or bushels of wheat. If physical inventory is locked up in storage, you cannot short spot, allowing futures to trade in deep backwardation without arbitrage correction.

## Notes for Future-Me
Beware the **"Contango Roll Bleed"**: When commodity futures markets are in steep contango ($F_{\text{distant}} > F_{\text{near}}$), an exchange-traded fund or corporate hedging program that rolls expiring contracts month after month is systematically selling cheap expiring contracts and buying more expensive next-month contracts. This negative roll yield quietly destroys $10\%-30\%$ of portfolio value annually, even if the underlying spot commodity price doesn't move! Always audit roll yield before deploying long-term commodity hedges.

