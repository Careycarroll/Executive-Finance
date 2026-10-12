# Active vs. Passive Management & Alpha

## Intuition
The debate between **Active Management** (security selection and market timing to beat a benchmark) and **Passive Management** (holding a low-cost market-cap-weighted index portfolio) rests on two mathematical pillars: the **Efficient Market Hypothesis (Bodie Ch. 11)** and **William Sharpe's Arithmetic of Active Management (1991)**.

Sharpe's law requires zero assumptions about market efficiency; it is a pure accounting identity:
1. The market portfolio is the sum of allPassive Investors plus all Active Investors.
2. Since Passive Investors hold the exact market-weight portfolio, they earn the exact gross market return $R_M$.
3. Therefore, in aggregate, **all Active Investors combined must also hold the exact market portfolio and earn the exact gross market return $R_M$ before fees!**
4. Because Active Investors pay substantially higher management fees, trading commissions, bid-ask spreads, and capital gains taxes ($c_{\text{active}} \gg c_{\text{passive}}$), **the average active dollar invested must mathematically underperform the average passive dollar after costs**.

## Structure
### Evaluating Active Portfolio Skill: Alpha, Information Ratio & Grinold's Fundamental Law

$$\text{Jensen's Alpha: } \alpha_P = (R_P - r_f) - \beta_P (R_M - r_f)$$

$$\text{Information Ratio (IR): } \text{IR} = \frac{\alpha_P}{\sigma(e_P)} = \frac{\text{Active Return}}{\text{Tracking Error}}$$

$$\text{Grinold's Fundamental Law of Active Management: } \text{IR} \approx \text{IC} \cdot \sqrt{\text{BR}}$$

| Metric | Definition | Institutional Benchmark |
|---|---|---|
| **Jensen's Alpha ($\alpha_P$)** | Risk-adjusted excess return over the CAPM or multi-factor benchmark. | Positive after fees in $<15\%$ of public equity mutual funds over 10-year horizons. |
| **Tracking Error ($\sigma(e_P)$)** | Standard deviation of the difference between portfolio return and benchmark return ($R_P - R_B$). | Index funds: $<0.05\%$. Core active: $2\%-4\%$. Concentrated high-conviction: $6\%-10\%$. |
| **Information Coefficient ($\text{IC}$)** | Correlation between the manager's forecasted returns and actual realized returns (Skill). | Top-decile quant/fundamental managers achieve $\text{IC} \approx 0.05 - 0.10$. |
| **Breadth ($\text{BR}$)** | Number of independent active investment bets taken per year. | Explains why high-frequency quant funds (low IC, huge Breadth) achieve high IR. |

## Common Misconceptions
- **Misconception 1: "If a manager beat the S&P 500 by 3% per year for 5 years, they have proven alpha."**  
  *Reality:* In 90% of cases, excess return is simply **disguised factor beta** (leverage on high-beta tech stocks, small-cap tilt, or illiquidity premium), not true security-selection alpha! Moreover, $t\text{-stat} = \text{IR} \times \sqrt{T}$. If a manager has an Information Ratio of $0.50$, it takes $T = (2.0 / 0.50)^2 = \mathbf{16\text{ years}}$ of track record to prove at the $95\%$ confidence level ($t = 2.0$) that their performance is skill rather than luck!
- **Misconception 2: "If everyone switches to passive index funds, markets will stop working."**  
  *Reality:* This is the **Grossman-Stiglitz Paradox (1980)**. Markets do not need 90% of participants to be active price-discoverers; a small, hyper-competitive core of institutional hedge funds and informed specialists is sufficient to keep prices near fundamental value.
- **Misconception 3: "Passive indexing works equally well in all asset classes."**  
  *Reality:* While US Large-Cap Equities (S&P 500) are hyper-efficient ($>90\%$ of active funds lose over 15 years), less liquid, fragmented markets with high information asymmetry—such as distressed credit, lower-middle-market private equity, micro-cap equities, and direct real estate—offer structural pockets where skilled active operators generate persistent net alpha.

## Notes for Future-Me
Construct your personal and corporate endowment portfolios using **Core-Satellite Architecture**:
1. **The Core (75%–85% of liquid capital):** Allocate to ultra-low-cost, tax-efficient passive index ETFs (charging $0.03\%-0.07\%$ expense ratios). Never pay a mutual fund manager $1.00\%$ ($100\text{ bps}$) for "closet indexing" (low tracking error to the S&P 500).
2. **The Satellites (15%–25% of capital):** Deploy active risk budgets strictly into private markets, direct operational businesses, or specialized strategies where you possess proprietary informational edge, structural tax advantages, or active governance control.

