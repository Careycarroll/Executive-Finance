# Dynamic Delta Hedging & Rebalancing Costs

## Intuition
The entire theoretical architecture of Black-Scholes-Merton option pricing rests on **continuous dynamic delta hedging**: an option position can be completely replicated or hedged by continuously buying or selling shares of the underlying asset so that the combined portfolio remains **delta-neutral ($\Delta = 0$)** at every instant.

Under continuous rebalancing in a frictionless world with zero transaction costs, the net P&L of a delta-hedged short option position equals zero: the daily Theta collected from time decay exactly offsets the daily Gamma hedging rebalancing costs.

In the real world, however, continuous rebalancing is impossible:
1. **Discrete Rebalancing:** Hedging occurs at discrete intervals (e.g., daily or when delta breaches a threshold bandwidth $\pm 0.05$). Between rebalancing intervals, the portfolio is exposed to **gamma risk**.
2. **Transaction Costs & Bid-Ask Drag:** Every rebalance incurs brokerage commissions, exchange fees, and market impact costs.
3. **Volatility Mispricing:** If an option is sold at an implied volatility $\sigma_{\text{IV}}$ and the trader delta-hedges it to expiration, the trader's ultimate profit or loss is determined strictly by the spread between implied volatility and the **actual realized volatility ($\sigma_{\text{realized}}$)** of the stock:
$$\text{Expected P\&L} \approx \frac{1}{2} \cdot S^2 \cdot \Gamma \cdot (\sigma_{\text{IV}}^2 - \sigma_{\text{realized}}^2) \cdot \Delta t$$

If you sell an option at $30\%$ IV and dynamically delta-hedge it while the stock realizes only $20\%$ volatility, you lock in pure mathematical profit regardless of which direction the stock moves!

## Formula
\Pi_{\text{hedged}} = V - \Delta \cdot S \implies \Delta_{\Pi} = \frac{\partial V}{\partial S} - \Delta = 0

$$\text{1-Step Discrete Hedging Error: } \Delta \Pi \approx \frac{1}{2} S^2 \Gamma \left[ \left(\frac{\Delta S}{S}\right)^2 - \sigma_{\text{IV}}^2 \Delta t \right]$$

$$\text{Leland Adjusted Volatility (Transaction Costs): } \sigma_{\text{adj}}^2 = \sigma^2 \left( 1 \pm k \sqrt{\frac{2}{\pi \sigma^2 \Delta t}} \right)$$

## Variable Glossary
- **\Pi_{\text{hedged}}**: Value of the delta-neutral portfolio (Option $+$ Short Stock).
- **\Delta**: Delta hedge ratio ($N(d_1)$).
- **\Gamma**: Gamma curvature ($\partial \Delta / \partial S$).
- **\sigma_{\text{IV}}**: Implied volatility at which option was traded.
- **\sigma_{\text{realized}}**: Realized volatility experienced during the hedging period.
- **k**: Round-trip transaction cost percentage (bid-ask spread fraction).
- **\Delta t**: Rebalancing frequency interval (e.g., $1/252$ for daily rebalancing).

## Worked Example
An options market-making desk sells 100 contracts of ATM 6-month Call options ($10{,}000$ shares notional) on a stock trading at $S = \$100.00$:
- Option Implied Volatility sold ($\sigma_{\text{IV}}$): $30.0\%$ ($0.30$)
- Initial Delta: $\Delta = 0.50 \implies$ Desk shorts $5{,}000$ shares of stock at $\$100.00$ to achieve initial delta neutrality.
- Initial Gamma: $\Gamma = 0.0266$ per share.

**Scenario A: Stock Moves by Normal Daily Volatility**
Next day, stock rises to $\$102.00$ ($\Delta S = +\$2.00$):
- Call option delta increases by $\Gamma \cdot \Delta S = 0.0266 \times 2 = +0.0532 \implies \Delta_{\text{new}} = 0.5532$.
- The desk is now short $10{,}000 \times 0.5532 = 5{,}532$ shares of delta, but only holds $5{,}000$ short shares of stock.
- **Rebalancing Action:** Desk must short an additional $532$ shares of stock at $\$102.00$ to restore delta neutrality.

**Scenario B: Terminal Realized Outcome**
Over the full 6 months, the desk rebalances daily. The stock experiences mild realized volatility of only $\sigma_{\text{realized}} = 22.0\%$:
- The desk collected option premium priced at $30\%$ IV ($\approx \$8.50$ per share, or $\$85{,}000$).
- Total cumulative dynamic hedging losses (buying high, selling low due to negative gamma) amounted to only $\$48{,}000$ (reflecting the $22\%$ realized variance).
- **Net Trading Desk Profit:** $\$85{,}000 - \$48{,}000 = +\$37{,}000$.

The market maker captured the $8\%$ volatility risk premium through disciplined dynamic replication.

## When to Use
- **When to use:** Option market making, institutional execution of large convertible bond hedges, structuring OTC structured note payoffs, and pricing synthetic exotic options.
- **When not to use / Caveats (Jump Risk & Gaps):** Delta hedging assumes continuous, smooth price paths (Brownian motion). If a stock announces an overnight surprise acquisition or accounting fraud and gaps down by $40\%$ at the opening bell, delta hedging fails completely: your hedge was calibrated for yesterday's price, resulting in massive gap slippage losses.

## Notes for Future-Me
Dynamic hedging is a friction trap: rebalancing too frequently (e.g., every 5 minutes) destroys your edge in broker commissions and bid-ask slippage. Rebalancing too infrequently (e.g., once every two weeks) leaves you nakedly exposed to huge unhedged gamma moves. 

Use **Bandwidth-Based Rebalancing (Whalley-Wilmott bands)** instead of fixed-time rebalancing: only execute a rebalancing trade when your net portfolio delta drifts outside a pre-calculated tolerance band:
$$\text{Rebalance only when: } |\Delta_{\text{current}} - \Delta_{\text{target}}| > \left(\frac{3 k \Gamma S}{2 \gamma}\right)^{1/3}$$
This cuts rebalancing transaction costs by up to $60\%$ without materially degrading hedge quality.

