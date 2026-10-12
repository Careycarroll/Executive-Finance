# Efficient Frontier

## Intuition
The Efficient Frontier is the cornerstone of Modern Portfolio Theory (MPT), developed by Harry Markowitz in 1952. It represents the set of optimal portfolios in expected return–volatility space that offer the **highest possible expected return for a given level of risk**, or equivalently, the **lowest possible risk (variance) for a targeted expected return**.

Portfolios located below the frontier are economically sub-optimal because an investor could achieve higher returns with the exact same volatility, or lower volatility with the same return, simply by adjusting portfolio weights. The leftmost point on the frontier is the **Minimum Variance Portfolio (MVP)**.

When a risk-free asset is introduced, a straight line tangent to the Efficient Frontier—the **Capital Allocation Line (CAL)**—dominates the curved frontier. The single point of tangency identifies the **Optimal Risky Portfolio (Tangency Portfolio)**, which maximizes the Sharpe Ratio.

## Formula
\min_{\mathbf{w}} \frac{1}{2} \mathbf{w}^T \mathbf{\Sigma} \mathbf{w} \quad \text{subject to} \quad \mathbf{w}^T \mathbf{E}[R] = \mu_p, \quad \mathbf{w}^T \mathbf{1} = 1

$$\text{For a 2-Asset Portfolio: } \sigma_p = \sqrt{w_1^2 \sigma_1^2 + w_2^2 \sigma_2^2 + 2 w_1 w_2 \sigma_1 \sigma_2 \rho_{1,2}}$$

$$\text{Tangency Portfolio: } \max_{\mathbf{w}} \text{Sharpe} = \frac{\mathbf{w}^T \mathbf{E}[R] - r_f}{\sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}}}$$

## Variable Glossary
- **\mathbf{w}**: Vector of portfolio weights assigned to each asset ($w_1, w_2, \dots, w_N$), summing to $1.0$.
- **\mathbf{\Sigma}**: Covariance matrix of asset returns.
- **\mathbf{E}[R]**: Vector of expected asset returns.
- **\mu_p**: Target expected portfolio return.
- **\sigma_p**: Standard deviation of the portfolio (volatility).
- **\rho_{1,2}**: Correlation coefficient between asset 1 and asset 2.
- **r_f**: Risk-free rate of return.
- **\text{Sharpe}**: Reward-to-volatility ratio at the tangency point.

## Notes for Future-Me
Markowitz mean-variance optimization has famously been called an "error maximizer" by Richard Michaud. Because the algorithm takes expected returns and covariance estimates literally, it aggressively over-allocates capital to assets with the highest historical return estimates and lowest estimated correlations—which are precisely the assets most plagued by historical estimation error!

In corporate treasury and endowment asset allocation, never run unconstrained MPT. Always apply **Black-Litterman shrinkage priors**, impose strict asset allocation weight constraints (e.g., maximum 25% in any single private asset class), or resample the covariance matrix via Monte Carlo simulation to avoid extreme, fragile allocations.

