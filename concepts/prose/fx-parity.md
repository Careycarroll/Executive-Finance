# Foreign Exchange Parity Conditions

## Intuition
International financial economics establishes four interrelated equilibrium conditions that link foreign exchange spot rates, forward contracts, nominal interest rates, and inflation rates across sovereign borders:

1. **Covered Interest Rate Parity (CIRP):** A strict no-arbitrage condition stating that the return on a domestic risk-free deposit must exactly equal the return on a foreign risk-free deposit covered against currency risk via a forward exchange contract. If CIRP is violated, international banks execute riskless **Covered Interest Arbitrage** until prices realign.
2. **Uncovered Interest Rate Parity (UIRP):** The proposition that the expected percentage change in the spot exchange rate over a given horizon equals the nominal interest rate differential between the two countries. Under UIRP, investing in a high-yielding foreign currency yields zero expected excess return because the currency is expected to depreciate by an amount exactly matching its yield advantage. (In empirical reality, UIRP routinely fails over short-to-medium horizons, creating the profitable yet crash-prone **FX Carry Trade**).
3. **Purchasing Power Parity (PPP):** Founded on the **Law of One Price (LOOP)**:
   - **Absolute PPP:** A basket of identical goods should cost the exact same amount when converted into a common currency ($S = P_d / P_f$).
   - **Relative PPP (RPPP):** The expected rate of currency depreciation between two countries equals the difference in their national inflation rates ($\Delta S / S \approx \pi_d - \pi_f$). High-inflation currencies steadily depreciate to maintain real terms-of-trade balance.
4. **The Fisher Effect & International Fisher Effect (IFE):** Combines Relative PPP with the Fisher relationship ($i = r + \pi$), asserting that nominal interest rate differentials reflect expected long-run inflation differentials.

## Formula
\text{Covered Interest Parity (Exact): } \frac{F_0}{S_0} = \frac{1 + r_d \cdot (T/360)}{1 + r_f \cdot (T/360)} \implies F_0 = S_0 \cdot \frac{1 + r_d \cdot (T/360)}{1 + r_f \cdot (T/360)}

$$\text{Forward Premium / Discount (Linear): } \frac{F_0 - S_0}{S_0} \approx (r_d - r_f) \cdot \frac{T}{360}$$

$$\text{Relative Purchasing Power Parity: } \frac{\mathbb{E}[S_T] - S_0}{S_0} \approx \pi_d - \pi_f$$

$$\text{Uncovered Interest Rate Parity: } \frac{\mathbb{E}[S_T] - S_0}{S_0} = r_d - r_f$$

## Variable Glossary
- **S_0**: Spot exchange rate (domestic units per one unit of foreign currency, e.g., USD per EUR).
- **F_0**: Forward exchange rate for settlement at tenor $T$.
- **\mathbb{E}[S_T]**: Expected future spot exchange rate at time $T$.
- **r_d**: Domestic risk-free annualized interest rate (e.g., SOFR / US Treasury rate).
- **r_f**: Foreign risk-free annualized interest rate (e.g., EURIBOR / German Bund rate).
- **\pi_d / \pi_f**: Domestic and foreign expected inflation rates.
- **T**: Tenor of the contract or investment horizon in days (using money market count conventions, e.g., Actual/360).

## Worked Example
A corporate treasurer analyzes a 1-year foreign exchange exposure between the US Dollar (USD, domestic) and the Euro (EUR, foreign):
- Current Spot Rate ($S_0$): $\$1.1000$ per €1.00
- US 1-year risk-free deposit rate ($r_d$): $5.00\%$
- Eurozone 1-year risk-free deposit rate ($r_f$): $3.00\%$
- US expected inflation ($\pi_d$): $3.00\%$
- Eurozone expected inflation ($\pi_f$): $1.80\%$

**Step 1: Calculate the Exact 1-Year Forward Rate under CIRP**
$$F_0 = S_0 \times \left( \frac{1 + r_{\text{USD}}}{1 + r_{\text{EUR}}} \right) = 1.1000 \times \left( \frac{1 + 0.050}{1 + 0.030} \right) = 1.1000 \times \left( \frac{1.050}{1.030} \right) = 1.1000 \times 1.019417 = \$1.1214 \text{ per } €1.00$$

**Step 2: Forward Premium Analysis**
$$\text{Forward Premium on EUR} = \frac{1.1214 - 1.1000}{1.1000} = +1.94\% \approx 5.00\% - 3.00\% = +2.00\%$$
Because the Euro interest rate is lower than the US Dollar interest rate ($r_{\text{EUR}} < r_{\text{USD}}$), the Euro trades at a **forward premium** ($F_0 > S_0$).

**Step 3: Covered Arbitrage Test**
If a market maker quotes a 1-year forward rate of $\$1.1350$ (overpriced EUR forward):
1. Borrow $\$1,100,000$ USD at $5.0\%$.
2. Convert at spot into $€1,000,000$.
3. Invest $€1,000,000$ at $3.0\%$ to yield $€1,030,000$ in 1 year.
4. Sell $€1,030,000$ forward at $\$1.1350$, locking in $\$1,169,050$ USD.
5. Repay USD borrowing principal + interest: $\$1,100,000 \times 1.05 = \$1,155,000$.
6. **Riskless Arbitrage Profit:** $\$1,169,050 - \$1,155,000 = \$14,050$.
Arbitrage forces market quotes back to the theoretical CIRP rate of $\$1.1214$.

**Step 4: Long-Term Currency Forecast under Relative PPP**
Over a multi-year horizon, expected Euro appreciation driven by inflation differential:
$$\frac{\mathbb{E}[\Delta S]}{S} \approx \pi_{\text{USD}} - \pi_{\text{EUR}} = 3.00\% - 1.80\% = +1.20\% \text{ per year}$$

## When to Use
- **When to use:** Pricing foreign currency forward contracts and cross-currency swaps, designing global treasury funding programs, and evaluating long-run exchange rate trajectories in multi-currency DCF cross-border valuation models.
- **When not to use / Caveats (Cross-Currency Basis Spread):** While CIRP theoretically holds by arbitrage, since the 2008 financial crisis, real-world markets exhibit a persistent **Cross-Currency Basis Spread** ($\text{basis} \ne 0$). Banks face balance sheet regulatory constraints (Basel III leverage ratios) and asymmetric global demand for USD funding, causing forward rates to diverge from pure CIRP.

## Notes for Future-Me
Distinguish cleanly between **Tactical Treasury Horizons (0–12 months)** and **Strategic DCF Valuation Horizons (5–10 years)**:
1. **Short-Term (0–12 Months):** Base your commercial hedges strictly on **Covered Interest Parity (Forward Rates)**. Never rely on Uncovered Interest Parity or economist forecasts to predict short-term currency moves—currencies routinely deviate from "fair value" for years due to speculative carry flows.
2. **Long-Term Strategic Modeling (5–10 Years):** When modeling a foreign subsidiary's cash flows in a DCF model, **Relative PPP is your anchor**. If a foreign country has a 12% annual inflation rate while the US has 2%, do not assume stable nominal exchange rates in your 10-year model! Depreciate the foreign currency by approximately $10\%$ per year in your cash flow model, or discount nominal foreign currency cash flows using the local foreign discount rate.
