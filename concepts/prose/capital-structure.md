# Capital Structure & Modigliani-Miller Theorems

## Intro
Capital structure is the mix of long-term debt and equity financing used by an enterprise to fund its overall operations and growth. The central question in corporate finance is: **Does the choice of capital structure affect the total market value of the firm, and is there an optimal debt-to-equity ratio that minimizes WACC?**

The theoretical foundation was established by Franco Modigliani and Merton Miller (MM, Nobel laureates 1958, 1963):
1. **MM Proposition I (Without Taxes - Irrelevance):** In a frictionless world with perfect capital markets, zero taxes, zero bankruptcy costs, and symmetric information, the total market value of a firm is determined solely by the earning power and risk of its underlying assets, completely independent of how those assets are financed ($V_L = V_U$). Financial leverage merely reshuffles the slices of the pie between debt and equity without changing the size of the pie.
2. **MM Proposition II (Without Taxes - Cost of Equity):** As debt increases, the required return on equity ($r_e$) rises linearly to exactly offset the apparent benefit of cheaper debt: $r_e = r_0 + \frac{D}{E}(r_0 - r_d)$. Consequently, WACC remains perfectly flat across all leverage ratios.
3. **MM Proposition I (With Taxes - Tax Shield):** Because interest payments are tax-deductible while equity dividends are not, debt creates a corporate tax shield. The levered firm value equals the unlevered firm value plus the present value of the debt tax shield ($V_L = V_U + t \cdot D$). In this world without bankruptcy costs, the optimal capital structure would be 100% debt!
4. **Trade-Off Theory (Modern Real World):** In reality, increasing debt elevates the probability of financial distress. The **Static Trade-Off Theory** posits that optimal capital structure balances the marginal tax shield benefit of debt against the marginal expected costs of bankruptcy, debt-holder agency friction, and financial distress.

## Diagram
### The Static Trade-Off Model of Capital Structure

| Leverage Level ($D/E$) | Tax Shield Benefit ($t \cdot D$) | Financial Distress Costs | Impact on WACC | Enterprise Value Impact |
|---|---|---|---|---|
| **Zero Debt (Unlevered)** | Zero | Zero | High (100% Equity Cost) | Baseline $V_U$ |
| **Moderate Debt (Optimal Zone)** | High & Growing | Low (Minimal Default Risk) | **WACC Minimized** | **Value Maximized ($V^*$)** |
| **Excessive Debt (Over-levered)** | Diminishing (Tax Cap §163(j)) | Severe (Covenants, Supplier Freeze, Distress) | WACC Spikes Sharply | Value Destroyed ($V_L < V_U$) |

```
Enterprise Value (V)
       ▲
       │                  Peak Value (V*)
       │                     ┌───┐
       │               . · '       ' · .   Trade-off Curve: Tax Shield vs Distress
       │          . · '                 ' · .
       │     . · '                            ' · .
  V_U  ├─── ' ──────────────────────────────────────  Unlevered Firm Value (Zero Debt)
       │
       │                                     . · '  PV of Financial Distress Costs
       │                               . · '
       │                         . · '
       └─────────────────────────────────────────────► Financial Leverage (D / E)
                            Optimal D*
```

### Key Theories Compared

- **Trade-Off Theory:** Firms identify a target debt-equity ratio balancing tax shields against distress costs. High-profit, asset-heavy firms (utilities, real estate) maintain higher debt capacity than volatile R&D firms.
- **Pecking Order Theory (Myers & Majluf):** Due to asymmetric information, management follows a strict financing hierarchy: (1) Internal cash flow / retained earnings first, (2) Straight debt second, and (3) External equity issuance only as a desperate last resort to avoid market undervaluation signaling.

## Common Misconceptions
- **Misconception 1: "Debt is cheaper than equity, so increasing debt always reduces WACC."**
  *Reality:* Adding debt increases financial leverage risk, driving up the required return on equity ($r_e$) via the Hamada effect. At high leverage, credit spreads explode. WACC only drops until the optimal debt capacity is reached; beyond that point, WACC rises.
- **Misconception 2: "Bankruptcy costs only matter if the firm actually files for Chapter 11."**
  *Reality:* Indirect financial distress costs hit long before formal bankruptcy. High leverage causes talented executives and engineers to jump ship, customers to hesitate signing multi-year contracts for fear of orphan software, and suppliers to shorten payment terms from Net-60 to Cash-on-Delivery, strangling working capital.
- **Misconception 3: "A zero-debt company is the most conservatively and optimally run enterprise."**
  *Reality:* An all-equity firm with stable, predictable operating cash flows leaves substantial tax shields on the table and invites managerial slack (Jensen's Free Cash Flow hypothesis). Moderate leverage imposes capital discipline.

## Notes for Future-Me
When sizing debt capacity for your enterprise or an M&A transaction, do not look at peak-cycle EBITDA multiples (e.g., "banks will lend us $5.5\times$ EBITDA today!"). Size debt against a **trough-cycle stress test**: if revenue contracts by 25% and gross margins compress by 400 basis points, can operating cash flow still cover interest payments by at least $1.5\times$ (Fixed Charge Coverage Ratio)?

Debt is a magnifying glass: it magnifies equity returns on the upside, but it robs management of strategic agility on the downside. The ultimate luxury in a downturn is having dry powder while debt-encumbered competitors are paralyzed by bank covenants.
