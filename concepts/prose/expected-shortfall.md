# Expected Shortfall (CVaR)

## Intuition
Value at Risk (VaR) has a notorious, fatal flaw that was brutally exposed during the 2008 global financial crisis: **VaR tells you the minimum loss threshold on a bad day, but tells you absolutely nothing about how bad the loss will be once that threshold is breached.**

If a bank's 99% 1-day VaR is $\$10{,}000{,}000$, on the 1% of worst days, the bank might lose $\$10.1\text{M}$—or it might lose $\$500{,}000{,}000$ and go bankrupt! VaR is blind to the severity of the tail. Furthermore, mathematically, VaR is **not a coherent risk measure** because it fails the axiom of **subadditivity**: merging two portfolios can sometimes produce a total VaR that is *greater* than the sum of the individual VaRs!

**Expected Shortfall (ES / Conditional VaR / CVaR)** solves both problems:
$$\text{Expected Shortfall} = \text{The expected (average) loss, given that the loss exceeds the VaR threshold}$$

Expected Shortfall answers the critical boardroom question: *"When disaster strikes and we breach our risk threshold, what is our average expected loss?"* In Basel III/IV international banking regulations, global regulators officially replaced VaR with Expected Shortfall as the primary metric for market risk capital requirements.

## Formula
\text{ES}_\alpha = \mathbb{E}\left[ L \mid L \ge \text{VaR}_\alpha \right] = \frac{1}{1 - \alpha} \int_\alpha^1 \text{VaR}_u \, du

$$\text{For a Normal Distribution } L \sim \mathcal{N}(\mu, \sigma): \quad \text{ES}_\alpha = \mu + \sigma \cdot \frac{\phi(z_\alpha)}{1 - \alpha}$$

$$\text{Subadditivity (Coherent Risk Measure): } \text{ES}(A + B) \le \text{ES}(A) + \text{ES}(B)$$

## Variable Glossary
- **\text{ES}_\alpha / \text{CVaR}**: Expected Shortfall at confidence level $\alpha$ (e.g., $97.5\%$ or $99\%$).
- **\text{VaR}_\alpha**: Value at Risk at confidence level $\alpha$.
- **L**: Dollar loss of the portfolio.
- **\alpha**: Confidence level (e.g., $0.975$ or $0.99$).
- **\mu**: Mean portfolio return or expected profit.
- **\sigma**: Standard deviation (volatility) of portfolio returns.
- **z_\alpha**: Standard normal critical cutoff score ($z_{0.975} \approx 1.96$, $z_{0.99} \approx 2.326$).
- **\phi(\cdot)**: Standard normal probability density function.

## Worked Example
A corporate treasury manages a $\$50{,}000{,}000$ liquid investment portfolio with daily return volatility $\sigma = 1.2\%$ ($\$600{,}000$) and expected daily drift $\mu \approx \$0$.

**Step 1: Compute 99% 1-Day VaR (Gaussian)**
$$z_{0.99} = 2.326$$
$$\text{VaR}_{99\%} = 2.326 \times \$600{,}000 = \$1{,}395{,}600$$
The treasury expects losses to exceed $\$1.40\text{M}$ on $1\%$ of trading days (about 2.5 days per year).

**Step 2: Compute 99% 1-Day Expected Shortfall (CVaR)**
Evaluate the standard normal density at $z = 2.326$:
$$\phi(2.326) = \frac{1}{\sqrt{2\pi}} e^{-\frac{2.326^2}{2}} \approx 0.39894 \times e^{-2.705} \approx 0.39894 \times 0.06687 = 0.02668$$
$$\text{Tail Multiplier} = \frac{\phi(z_\alpha)}{1 - \alpha} = \frac{0.02668}{1 - 0.99} = \frac{0.02668}{0.01} = 2.668$$
$$\text{ES}_{99\%} = \$600{,}000 \times 2.668 = \$1{,}600{,}800$$

**Step 3: Fat-Tail Historical Reality Check**
Under actual historical simulation during a stress period (accounting for fat tails and credit defaults), while the 99% VaR threshold was $\$1.40\text{M}$, the average loss on days exceeding that threshold was **$\$2{,}850{,}000$**!
Expected Shortfall captured the $\$2.85\text{M}$ reality, whereas Gaussian VaR hid the true severity of the tail risk.

## When to Use
- **When to use:** Sizing corporate emergency cash reserves, bank regulatory capital adequacy (Basel III/IV Fundamental Review of the Trading Book / FRTB), hedge fund risk parity allocation, and reinsurance loss modeling.
- **When not to use / Caveats:** Expected Shortfall requires substantially more historical simulation data points than VaR because it estimates the *entire shape of the tail distribution*, not just a single percentile point. In small sample sizes, empirical ES estimates have higher estimation variance.

## Notes for Future-Me
"Never measure risk with a ruler that ignores the cliff." If a risk manager reports that a trade has a VaR of \$5M, always ask: *"And what is our Expected Shortfall if the trade blows through that \$5M limit?"* If the Expected Shortfall is \$6M, you have a well-behaved Gaussian position. If the Expected Shortfall is \$85M, you are holding a hidden blow-up machine (like selling naked out-of-the-money puts or writing uncollateralized credit default swaps). Always insist on Expected Shortfall.

