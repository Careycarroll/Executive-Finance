# Monte Carlo Simulation in Financial Modeling

## Intuition
Deterministic financial models (such as static DCF spreadsheets) rely on single-point estimates: 8% revenue growth, 22% operating margin, 9% discount rate. This creates a dangerous illusion of precision, hiding the vast multi-dimensional cone of uncertainty that surrounds real-world corporate performance.

**Monte Carlo Simulation** (invented by Stanislaw Ulam and John von Neumann in 1946) replaces static single-point inputs with **probability distributions**. By simulating thousands (or millions) of randomly generated paths using pseudo-random sampling, the model transforms a single deterministic outcome into a comprehensive **probability distribution of terminal outcomes**.

In quantitative corporate finance and derivatives pricing, Monte Carlo simulation is indispensable for:
1. **Pricing Path-Dependent Exotic Derivatives:** Asian options (average price), barrier options (knock-in/knock-out), and multi-asset rainbow options where closed-form analytical formulas do not exist.
2. **Capital Budgeting Risk Analysis:** Generating probability distributions of project NPV and IRR, allowing leadership to see the exact probability of losing capital ($\mathbb{P}(\text{NPV} < 0)$).
3. **Enterprise Value at Risk (VaR & CVaR):** Modeling complex portfolios with non-linear derivatives and correlated macroeconomic factors.

Under **Geometric Brownian Motion (GBM)**, asset price paths are modeled continuously with a deterministic drift $\mu$ and stochastic random walk $\sigma \sqrt{\Delta t} \epsilon$.

## Formula
$$S_{t+\Delta t} = S_t \cdot \exp\left[ \left(\mu - \frac{\sigma^2}{2}\right) \Delta t + \sigma \sqrt{\Delta t} \cdot \epsilon \right], \quad \epsilon \sim \mathcal{N}(0, 1)$$

$$\text{Simulation Standard Error: } \text{SE} = \frac{\sigma_{\text{sim}}}{\sqrt{M}}$$

$$\text{Antithetic Variates (Variance Reduction): } \hat{f} = \frac{f(\epsilon) + f(-\epsilon)}{2}$$

## Variable Glossary
- **$S_t$**: Asset price at time step $t$.
- **$\mu$**: Expected annual drift rate (under risk-neutral pricing, $\mu = r - q$).
- **$\sigma$**: Annualized volatility of returns.
- **$\Delta t$**: Discrete time increment ($T / N$).
- **$\epsilon$**: Standard normally distributed random variable with mean $0$ and variance $1$.
- **$M$**: Number of independent simulated paths.
- **$\text{SE}$**: Standard error of the simulation estimate, decaying at rate $1 / \sqrt{M}$.

## Notes for Future-Me
Beware of **"Garbage In, Gaussian Out"**: 
The most common mistake in corporate Monte Carlo models is assuming that all input variables are normally distributed and statistically independent! In reality:
1. **Correlations Collapse in Crises:** If you model oil prices, currency rates, and customer demand as independent distributions, your model will never simulate a real-world supply chain shock where all three variables crash simultaneously! Always use **Cholesky decomposition** to enforce a correlation matrix across random variables.
2. **Convergence Speed:** Because the standard error decays with $1 / \sqrt{M}$, quadrupling the number of paths ($4\times$) only cuts your estimation error in half ($2\times$). To achieve high precision without burning computing hours, use variance reduction techniques: **antithetic variates**, **control variates**, or **quasi-random low-discrepancy Sobol sequences**.

