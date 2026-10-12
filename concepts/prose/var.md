# Value at Risk (VaR)

## Intuition
Value at Risk (VaR) answers a concrete question for risk managers and regulators: *What is the maximum dollar loss expected over a given time horizon at a specified confidence level?* Rather than expressing risk as an abstract standard deviation ($\sigma$), VaR condenses multi-asset portfolio risk into a single currency metric that senior leadership can understand.

## Formula
$$\text{VaR}_{(1-\alpha), T} = \Pi_0 \times \left( - \mu \Delta t + z_{\alpha} \, \sigma \sqrt{\Delta t} \right)$$

## Variable Glossary
- **$\Pi_0$**: Portfolio current market value.
- **$\alpha$**: Significance level (e.g., $1\%$, implying $99\%$ confidence).
- **$z_{\alpha}$**: Critical value from the standard normal distribution ($z_{0.05} \approx 1.645$, $z_{0.01} \approx 2.326$).
- **$\sigma$**: Annualized portfolio volatility.
- **$\Delta t$**: Holding period in years ($T$).
- **$\mu$**: Expected return (frequently assumed to be zero over daily intervals).

## Worked Example
A trading desk holds a \$10,000,000 equity portfolio with annual volatility $\sigma = 20\%$. What is the 1-day 99% VaR assuming 252 trading days per year?
- **1-Day Volatility:** $\sigma_{1\text{d}} = 0.20 \times \sqrt{\frac{1}{252}} \approx 1.2599\%$
- **99% Normal Quantile:** $z = 2.326$
- **1-Day 99% VaR:** $\$10,000,000 \times (2.326 \times 0.012599) = \$293,053$

There is only a 1% chance that the desk loses more than \$293,053 on any given day under normal conditions.

## When to Use
- **When to use:** Regulatory capital requirements (Basel accords), daily limit-setting, and risk monitoring.
- **When not to use / Caveats:** VaR is completely blind to tail shape beyond the cutoff percentile! It tells you *if* you lose more than \$293k, but not *how much* (could be \$300k or \$5M). For tail severity, use Expected Shortfall (CVaR).

## Notes for future-me
David Li's Gaussian copula and standard parametric VaR failed in 2008 because correlations spike toward 1.0 during liquidity crises and real-world returns have fat tails. Always pair VaR with historical stress testing.
