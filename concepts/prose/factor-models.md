# Factor Models (Fama-French Multi-Factor Asset Pricing)

## Intro
While the single-factor CAPM was a monumental theoretical breakthrough, decades of empirical market data revealed that single-factor market beta fails to explain why certain categories of stocks consistently outperform or underperform over long horizons.

Eugene Fama and Kenneth French (1992, 1993, 2015) revolutionized quantitative asset pricing by demonstrating that stock returns are driven by multiple systematic risk dimensions:
1. **The Fama-French 3-Factor Model:**
   - **Market Factor ($\text{MKT} - r_f$):** Broad equity market risk premium.
   - **Size Factor ($\text{SMB}$ - Small Minus Big):** Historical return premium of small-cap companies over large-cap companies.
   - **Value Factor ($\text{HML}$ - High Minus Low):** Historical return premium of high book-to-market (value) stocks over low book-to-market (growth) stocks.
2. **The Carhart 4-Factor Extension (1997):** Added **Momentum ($\text{WML}$ / $\text{UMD}$ - Winners Minus Losers)**, capturing the tendency of past 12-month winning stocks to continue outperforming in the near term.
3. **The Fama-French 5-Factor Model (2015):** Added **Robust Operating Profitability ($\text{RMW}$)** and **Conservative Investment ($\text{CMA}$)** factors.

Factor models provide the analytical foundation for modern quantitative investing ("Smart Beta"), risk parity, and forensic style-drift analysis of asset managers.

## Diagram
### Anatomy of the Multi-Factor Landscape

```
                        ┌──────────────────────────────────────────────┐
                        │      Total Asset Expected Return E[R_i]      │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
┌───────────────────────────────┐                             ┌─────────────────────────────────┐
│     Risk-Free Baseline (r_f)  │                             │ Systematic Factor Risk Premia   │
└───────────────────────────────┘                             └────────────────┬────────────────┘
                                                                               │
         ┌─────────────────────┬─────────────────────┬─────────────────────────┴──────────┐
         ▼                     ▼                     ▼                                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                ┌──────────────────┐
│  Market Factor   │  │   Size Factor    │  │   Value Factor   │                │ Momentum / Qual  │
│   (MKT - r_f)    │  │     (SMB)        │  │     (HML)        │                │   (WML / RMW)    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤                ├──────────────────┤
│ Sensitivity: β_m │  │ Sensitivity: s_i │  │ Sensitivity: h_i │                │ Sensitivity: m_i │
│ Captures broad   │  │ Premium earned by│  │ Premium earned by│                │ Premium earned by│
│ macroeconomic    │  │ holding less     │  │ buying cheap book│                │ trend persistence│
│ growth & cycles. │  │ liquid small-caps│  │ assets vs growth.│                │ & high ROIC.     │
└──────────────────┘  └──────────────────┘  └──────────────────┘                └──────────────────┘
```

### The Fama-French Regression Specification
$$R_i - r_f = \alpha_i + \beta_i (R_m - r_f) + s_i \cdot \text{SMB} + h_i \cdot \text{HML} + m_i \cdot \text{WML} + \epsilon_i$$

## Common Misconceptions
- **Misconception 1: "Factor premiums are guaranteed free returns."**
  *Reality:* Factor premiums exist because they represent **undiversifiable systematic risk**! Value stocks (high HML exposure) carry higher returns because they are often distressed, capital-intensive companies vulnerable to debt default during economic recessions. Small caps carry higher returns because they lack access to commercial paper credit facilities during credit freezes.
- **Misconception 2: "An active fund manager with 15% annual returns has great stock-picking skill."**
  *Reality:* When you run a 4-factor regression on most high-performing mutual funds, their apparent "alpha" collapses to zero! Their outperformance was simply a hidden mechanical bet on small-cap value (high $s_i$ and $h_i$) or momentum ($m_i$). Investors shouldn't pay 1.5% management fees for passive factor exposures that can be bought in an ETF for 8 basis points.
- **Misconception 3: "Factors work consistently every year."**
  *Reality:* Factors suffer multi-year drawdowns. Between 2010 and 2020, the Value factor (HML) underperformed Growth by historic margins as ultra-low interest rates favored long-duration tech equities. Factor investing requires decade-long holding horizons.

## Notes for Future-Me
Whenever evaluating an external money manager or private equity general partner, run a **Factor Attribution Analysis** on their historical track record. If their excess returns disappear after controlling for SMB (size) and HML (value), you are not paying for proprietary stock-picking genius—you are paying 2-and-20 fees for a leveraged small-cap value index fund! Insist on paying incentive fees only on **True Multi-Factor Alpha ($\alpha$)** that persists after stripping out all known risk factors.
