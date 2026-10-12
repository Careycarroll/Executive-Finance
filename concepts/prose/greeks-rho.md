# Greeks: Rho (Interest Rate Sensitivity)

## Intuition
**Rho ($\rho$)** measures the sensitivity of an option's theoretical price to a $1\%$ ($100\text{ bps}$) parallel change in the risk-free interest rate ($r$) (Hull Ch. 19):
$$\rho = \frac{\partial V}{\partial r}$$

In short-dated equity options (expiring in 30 days) during low-interest-rate regimes, Rho is the least discussed of the five primary Black-Scholes Greeks because a $25\text{ bps}$ Fed rate move barely nudges a 1-month option's price.

However, **Rho becomes a dominant pricing driver in two major institutional domains**:
1. **Long-Dated Options (LEAPS) & Executive Stock Options:** Over a 2-to-5 year horizon, the present value of the strike price ($K e^{-rT}$) shifts substantially when interest rates move by $200\text{ bps}$.
2. **Cost-of-Carry Mechanics:** Buying a Call option is a leveraged substitute for buying stock outright for cash. When interest rates rise, holding cash in Treasury bills at $5\%$ while using a Call option to control stock upside becomes much more attractive—driving **Call prices UP** ($\rho_{\text{call}} > 0$) and **Put prices DOWN** ($\rho_{\text{put}} < 0$).

## Structure
### Black-Scholes Mathematical Formulas & Directional Signs

$$\rho_{\text{Call}} = \frac{\partial C}{\partial r} = K \cdot T \cdot e^{-rT} \cdot N(d_2) > 0$$

$$\rho_{\text{Put}} = \frac{\partial P}{\partial r} = -K \cdot T \cdot e^{-rT} \cdot N(-d_2) < 0$$

*(In trading software, Rho is reported per $1\%$ or $0.01$ change in $r$, so the raw derivative above is divided by $100$).*

| Option Position | Rho Sign | Impact of Fed Rate Hike ($+100\text{ bps}$) | Economic Intuition |
|---|---|---|---|
| **Long Call** | **Positive ($+$)** | Option Value **Increases** | Deferring payment of the cash strike price $K$ until expiration $T$ saves more interest ($K e^{-rT}$ drops). |
| **Long Put** | **Negative ($-$)** | Option Value **Decreases** | Waiting until expiration $T$ to receive the cash sale proceeds $K$ incurs a higher opportunity cost of foregone interest. |
| **Deep ITM Options** | **Maximum $\|\rho\|$** | Largest dollar impact ($N(d_2) \to 1$) | Deep ITM options are nearly certain to be exercised, so they carry the full present-value sensitivity of the strike cash flow $K$. |
| **Longer Time ($T$)** | **Scales linearly with $T$** | 2-year LEAPS has $24\times$ the Rho of a 1-month option | Notice the explicit multiplication by $T$ in $K \cdot T \cdot e^{-rT} N(d_2)$. |

## Common Misconceptions
- **Misconception 1: "Higher interest rates increase call option prices, so tech call options will profit when the Fed hikes rates."**  
  *Reality:* Remember *ceteris paribus* (all else equal)! While a $+100\text{ bps}$ rate hike adds positive Rho to a call option if the stock price stays constant, in the real world a surprise Fed rate hike often triggers a $-5\%$ drop in the underlying stock price (Delta loss)! On a 3-month option, the negative Delta impact of a stock sell-off completely overwhelms the tiny positive Rho gain.
- **Misconception 2: "Futures options (like S&P E-mini or Crude Oil options) have the same Rho sign as stock options."**  
  *Reality:* Under the **Black-76 Model** for options on futures contracts, because entering a futures contract requires zero upfront cash outlay (no cost of carry on the underlying), a rise in interest rates simply discounts the future option payoff more heavily! Therefore, for **options on futures**, both Calls and Puts have **negative Rho** ($\rho_{\text{futures call}} = -T \cdot C < 0$)!

## Notes for Future-Me
When valuing **Long-Term Employee Stock Options (ASC 718)**, **M&A Contingent Value Rights**, or **2-Year LEAPS**:
Never ignore Rho during interest rate regime shifts. Moving from a $0.5\%$ zero-rate environment to a $5.0\%$ risk-free rate increases the Black-Scholes value of an at-the-money 3-year Call option by **over $20\%$** even if stock price and implied volatility do not move an inch! Always pull the exact maturity-matched US Treasury Strip yield when pricing multi-year equity derivatives.
