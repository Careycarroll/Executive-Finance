# DuPont Analysis

## Intuition
DuPont analysis deconstructs Return on Equity (ROE) into operational efficiency, asset utilization, and financial leverage. Instead of evaluating ROE in a vacuum, DuPont isolates *how* management generated the return: by commanding strong profit margins, by rapidly turning over its asset base, or by gearing up with borrowed leverage.

## Formula
$$\text{ROE} = \left(\frac{\text{Net Income}}{\text{Sales}}\right) \times \left(\frac{\text{Sales}}{\text{Assets}}\right) \times \left(\frac{\text{Assets}}{\text{Equity}}\right)$$

## Variable Glossary
- **Net Margin** $\left(\frac{\text{Net Income}}{\text{Sales}}\right)$: Operating profitability; cents of profit kept per dollar of revenue.
- **Asset Turnover** $\left(\frac{\text{Sales}}{\text{Assets}}\right)$: Capital efficiency; dollars of revenue generated per dollar of assets deployed.
- **Financial Leverage Multiplier** $\left(\frac{\text{Assets}}{\text{Equity}}\right)$: Leverage degree; ratio of total assets funded per dollar of shareholder equity.

## Worked Example
Company A and Company B both report a 15% ROE:
- **Company A:** Margin = 10%, Turnover = 1.5, Leverage = 1.0 $\implies \text{ROE} = 0.10 \times 1.5 \times 1.0 = 15\%$. (High margin, zero debt).
- **Company B:** Margin = 2%, Turnover = 1.5, Leverage = 5.0 $\implies \text{ROE} = 0.02 \times 1.5 \times 5.0 = 15\%$. (Thin margin, heavy financial leverage).

Company A generates high-quality organic returns; Company B is a highly levered low-margin operator vulnerable to debt rollover shocks.

## When to Use
- **When to use:** Cross-sectional peer comparison and multi-year trend analysis to pinpoint the root driver of ROE inflections.
- **When not to use / Caveats:** Standard DuPont blends operating assets and financial assets inside the denominator. For clean operating alpha analysis, use Penman's RNOA decomposition instead.

## Notes for future-me
Leverage is a double-edged sword: it amplifies ROE on the way up, but drives insolvency on the way down. Never praise an increasing ROE until you verify that Asset Turnover or Profit Margin drove it, not the Equity Multiplier.
