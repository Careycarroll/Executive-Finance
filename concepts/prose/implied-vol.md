# Implied vs. Realized Volatility

## Intuition
Volatility is the primary driver of option pricing and risk management. However, financial markets operate on two radically different manifestations of volatility:
1. **Realized Volatility ($\sigma_{\text{realized}}$ / Historical Volatility):** The actual, backward-looking statistical standard deviation of asset price returns observed over a historical window (e.g., trailing 30, 60, or 252 trading days). It measures what *actually happened* in the physical world.
2. **Implied Volatility ($\sigma_{\text{implied}}$ / IV):** The forward-looking market consensus expectation of future volatility, derived by **inverting the Black-Scholes formula** from currently observed market option prices. It represents the *price of volatility insurance* demanded by market makers today.

The persistent spread between the two creates the **Volatility Risk Premium (VRP)**:
$$\text{VRP} = \sigma_{\text{implied}} - \sigma_{\text{realized}}$$

Empirical market data shows that across broad equity indices (S&P 500 VIX), implied volatility trades higher than subsequent realized volatility approximately $80\%-85\%$ of the time! Option buyers systematically pay an insurance risk premium to protect against catastrophic tail risk, creating an enduring structural edge for disciplined options sellers.

## Formula
\sigma_{\text{realized}} = \sqrt{\frac{252}{N - 1} \sum_{i=1}^N \left( \ln\left(\frac{S_i}{S_{i-1}}\right) - \bar{r} \right)^2}

$$\text{Implied Volatility: } \sigma_{\text{IV}} \text{ such that } C_{\text{BSM}}(S, K, r, T, \sigma_{\text{IV}}) = C_{\text{market}}$$

$$\text{Expected 1-Day Range} \approx S_0 \cdot \frac{\sigma_{\text{IV}}}{\sqrt{252}} \approx S_0 \cdot \frac{\sigma_{\text{IV}}}{16}$$

## Variable Glossary
- **\sigma_{\text{realized}}**: Annualized realized historical standard deviation of daily logarithmic returns.
- **\sigma_{\text{IV}}**: Annualized Black-Scholes implied volatility.
- **N**: Number of trading days in the calculation window (typically 20, 30, or 60 days).
- **S_i / S_{i-1}**: Consecutive closing prices.
- **\bar{r}**: Mean daily logarithmic return over the sample window.
- **\text{Rule of 16}**: Quick mental math: since $\sqrt{252} \approx 15.87 \approx 16$, dividing annualized IV by 16 gives the expected 1-standard-deviation daily price move in percent!

## Worked Example
A risk manager is evaluating hedging costs for a portfolio holding $\$10{,}000{,}000$ of tech shares trading at $\$200.00$:
- 30-day Realized Volatility ($\sigma_{\text{realized}}$): $20.0\%$ per annum.
- 30-day At-The-Money Option Implied Volatility ($\sigma_{\text{IV}}$): $32.0\%$ per annum.

**Step 1: Calculate the Volatility Risk Premium (VRP)**
$$\text{VRP} = \sigma_{\text{IV}} - \sigma_{\text{realized}} = 32.0\% - 20.0\% = +12.0\% \ (12 \text{ percentage points})$$
Options are pricing in dramatic turbulence that is not currently occurring in daily stock trading.

**Step 2: Rule of 16 Daily Move Translation**
$$\text{Implied Daily Move} = \frac{32.0\%}{16} = \pm 2.0\% \ (\pm \$4.00 \text{ per share})$$
$$\text{Actual Realized Daily Move} = \frac{20.0\%}{16} = \pm 1.25\% \ (\pm \$2.50 \text{ per share})$$

**Strategic Takeaway:**
Buying 30-day put options at a $32\%$ IV to hedge a stock that is moving only $1.25\%$ per day means you are overpaying by nearly $60\%$ for volatility protection. Instead of buying naked puts, the manager should execute a **collar** (buy put funded by selling a call) or sell an out-of-the-money credit spread to capture the elevated VRP.

## When to Use
- **When to use:** Systematic options selling strategies, market making, evaluating whether options are "rich" or "cheap" relative to history via **IV Rank (IVR)** and **IV Percentile (IVP)**, and timing hedge entries.
- **When not to use / Caveats:** Do not assume that high IV is always overpriced. When a genuine geopolitical or credit crisis erupts (e.g., 2008 Lehman collapse, 2020 pandemic), realized volatility explodes from 15% to 80% in days, completely overwhelming implied volatility and wiping out short-volatility funds.

## Notes for Future-Me
Always use **IV Rank** before trading options:
$$\text{IV Rank} = \frac{\text{Current IV} - \text{52-Week Low IV}}{\text{52-Week High IV} - \text{52-Week Low IV}} \times 100$$
- If IV Rank $> 50$: Options are historically expensive. Edge favors **selling premium** (covered calls, iron condors, credit spreads).
- If IV Rank $< 20$: Options are historically cheap. Edge favors **buying premium** (long calls, long straddles, calendar spreads).
Trading without checking IV Rank is like buying real estate without looking at historical comparable prices per square foot.

