# Credit Spreads and Default Risk

## Intuition
Unlike sovereign governments that can print reserve currency to satisfy nominal debt obligations, corporate borrowers can default. Lenders demand a premium over default-free government bonds of identical maturity to compensate for this credit risk: this differential is the **Credit Spread**.

Credit spreads reflect two economic components:
1. **Expected Loss ($\text{PD} \times \text{LGD}$):** The actuarial probability of default ($\text{PD}$) multiplied by the loss given default ($\text{LGD} = 1 - \text{Recovery Rate}$).
2. **Credit Risk Premium (Liquidity & Systematic Uncertainty):** An additional return premium demanded by risk-averse investors because defaults cluster during severe macroeconomic recessions when capital is dearest.

Credit spreads are quoted in basis points ($\text{bps}$) over the benchmark Treasury curve and categorized by credit ratings:
- **Investment Grade (AAA down to BBB-):** Low default probability ($\le 0.2\%-0.5\%$ annually), narrow spreads ($80-180\text{ bps}$).
- **High Yield / Speculative / "Junk" (BB+ down to CCC):** Elevated default probability ($2\%-15\%$ annually), wide spreads ($300-800+\text{ bps}$).

## Formula
$$s = y_{\text{corporate}} - y_{\text{treasury}}$$

$$s \approx \lambda \cdot (1 - R) = \text{PD} \cdot \text{LGD}$$

$$y_{\text{corporate}} = r_f + \text{Credit Spread} + \text{Liquidity Premium}$$

## Variable Glossary
- **$s$**: Credit spread (in basis points or decimal).
- **$y_{\text{corporate}}$**: Yield to maturity on corporate bond.
- **$y_{\text{treasury}} / r_f$**: Yield to maturity on benchmark risk-free Treasury of matching maturity.
- **$\lambda / \text{PD}$**: Hazard rate / annualized Probability of Default.
- **$R$**: Expected Recovery Rate in bankruptcy (percentage of par recovered by creditors; historically $\approx 40\%$ for senior unsecured debt).
- **$\text{LGD}$**: Loss Given Default ($= 1 - R$).

## Worked Example
A treasury team is analyzing debt refinancing terms for a $5$-year senior unsecured bond:
- 5-year US Treasury benchmark yield: $4.00\%$
- Company credit rating: **BB** (High Yield)
- Historical annual default probability for BB debt ($\text{PD}$): $2.2\%$ ($0.022$)
- Historical recovery rate for senior unsecured industrial debt in bankruptcy ($R$): $40\%$ ($\text{LGD} = 1 - 0.40 = 60\%$ or $0.60$)
- Credit liquidity & systematic risk premium: $150\text{ bps}$ ($1.50\%$)

**Step 1: Calculate Actuarial Expected Loss Spread**
$$\text{Expected Loss} = \text{PD} \times \text{LGD} = 0.022 \times 0.60 = 0.0132 \ (1.32\% \text{ or } 132\text{ bps})$$

**Step 2: Total Equilibrium Credit Spread**
$$\text{Credit Spread } (s) = 132\text{ bps (Expected Loss)} + 150\text{ bps (Risk Premium)} = 282\text{ bps} \ (2.82\%)$$

**Step 3: Total Required Borrowing Yield**
$$y_{\text{corporate}} = 4.00\% + 2.82\% = 6.82\%$$

The company must pay an annual interest rate of $6.82\%$ on its new notes.

## When to Use
- **When to use:** Sizing corporate debt issuance costs, estimating default probabilities from market prices via the Merton structural model or Credit Default Swaps (CDS), and evaluating counterparty credit risk.
- **When not to use / Caveats:** Do not assume historical average recovery rates apply during industry-wide collapses! When an entire sector experiences simultaneous distress (e.g., energy collapse in 2015, commercial office real estate in 2023), liquidation asset firesales drive recovery rates from the typical $40\%$ down to $10\%-15\%$, causing credit spreads to violently blow out.

## Notes for Future-Me
Watch high-yield credit spreads as the canary in the economic coal mine. In equity bull markets, stock prices can ignore rising corporate leverage for months. But bond investors—who have no upside beyond par and 100% downside—react with ruthless discipline. When the **ICE BofA US High Yield Index Spread** widens past $500\text{ bps}$, credit conditions are tightening; when it blows past $800\text{ bps}$, capital markets are officially frozen. If you need to raise debt capital, do it when spreads are sub-350 bps, not when the credit cycle turns against you.

