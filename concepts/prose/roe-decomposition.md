# ROE Decomposition (Penman-Style)

## Intuition
While traditional 3-stage or 5-stage DuPont analysis decomposes Return on Equity (ROE) using accounting ratios, it fundamentally conflates **operating leverage** with **financial leverage** because its asset turnover and leverage ratios lump operating assets (factories, inventory) together with financing assets (cash) and financing liabilities (debt).

Stephen Penman’s advanced ROE decomposition cleanly separates the firm into two distinct economic engines:
1. **The Operating Engine ($\text{RNOA}$):** Return on Net Operating Assets ($\text{NOPAT} / \text{NOA}$). This measures how productively management creates operating profits from real business capital.
2. **The Financing Engine ($\text{SPREAD} \times \text{FLEV}$):** The financial leverage booster. If the operating engine earns a higher return than the after-tax cost of borrowing ($\text{RNOA} > \text{NBC}$), then taking on net financial leverage ($\text{FLEV}$) magnifies equity returns. However, if operating returns slip below borrowing costs ($\text{RNOA} < \text{NBC}$), leverage brutally penalizes equity holders.

## Formula
\text{ROE} = \text{RNOA} + (\text{FLEV} \cdot \text{SPREAD}) = \text{RNOA} + \left( \frac{\text{NFO}}{\text{CSE}} \cdot [\text{RNOA} - \text{NBC}] \right)

$$\text{RNOA} = \text{Operating Profit Margin (OPM)} \times \text{Asset Turnover (ATO)} = \frac{\text{NOPAT}}{\text{Sales}} \times \frac{\text{Sales}}{\text{NOA}}$$

## Variable Glossary
- **\text{ROE}**: Return on Common Shareholders' Equity ($\text{Net Income} / \text{CSE}$).
- **\text{RNOA}**: Return on Net Operating Assets ($\text{NOPAT} / \text{NOA}$).
- **\text{NOA}**: Net Operating Assets ($\text{Operating Assets} - \text{Operating Liabilities}$).
- **\text{NOPAT}**: Net Operating Profit After Tax.
- **\text{NFO}**: Net Financial Obligations ($\text{Financial Debt} - \text{Financial Cash Assets}$).
- **\text{CSE}**: Common Shareholders' Equity (Book value of equity, where $\text{NOA} - \text{NFO} = \text{CSE}$).
- **\text{FLEV}**: Financial Leverage Ratio ($\text{NFO} / \text{CSE}$).
- **\text{NBC}**: Net Borrowing Cost ($\text{Net Financing Expense} / \text{NFO}$).
- **\text{SPREAD}**: The operating-financing spread ($\text{RNOA} - \text{NBC}$).

## Worked Example
A manufacturing company reports the following balance sheet and operating metrics:
- Net Operating Assets ($\text{NOA}$): $\$1{,}000{,}000{,}000$
- Net Financial Obligations ($\text{NFO}$): $\$400{,}000{,}000$
- Common Shareholders' Equity ($\text{CSE}$): $\$600{,}000{,}000$ ($\text{NOA} - \text{NFO}$)
- Annual NOPAT: $\$140{,}000{,}000$
- After-tax Net Financing Expense ($\text{NFE}$): $\$24{,}000{,}000$
- Net Income to Common: $\$116{,}000{,}000$ ($\$140\text{M} - \$24\text{M}$)

**Step 1: Compute Base Operating Return (RNOA)**
$$\text{RNOA} = \frac{\$140{,}000{,}000}{\$1{,}000{,}000{,}000} = 14.0\%$$

**Step 2: Compute Net Borrowing Cost (NBC)**
$$\text{NBC} = \frac{\$24{,}000{,}000}{\$400{,}000{,}000} = 6.0\%$$

**Step 3: Compute Financial Leverage (FLEV) and SPREAD**
$$\text{FLEV} = \frac{\$400{,}000{,}000}{\$600{,}000{,}000} = 0.667$$
$$\text{SPREAD} = \text{RNOA} - \text{NBC} = 14.0\% - 6.0\% = +8.0\%$$

**Step 4: Decompose ROE**
$$\text{ROE} = \text{RNOA} + (\text{FLEV} \times \text{SPREAD}) = 14.0\% + (0.667 \times 8.0\%) = 14.0\% + 5.33\% = 19.33\%$$

Check against direct calculation: $\frac{\$116\text{M}}{\$600\text{M}} = 19.33\%$.
The operating core generated $14.0\%$ ROE; smart, accretive debt leverage delivered the remaining $+5.33\%$ equity kicker.

## When to Use
- **When to use:** Deep forensic financial statement analysis, evaluating Private Equity LBO operating value creation vs financial leverage contribution, and benchmarking multi-division conglomerate return on capital.
- **When not to use / Caveats:** Do not apply to pure financial institutions (commercial banks, broker-dealers) where borrowing and lending ARE the primary operating activities rather than financing activities.

## Notes for Future-Me
Penman’s decomposition prevents you from overpaying for levered "high-ROE" companies. If two competing targets both boast a 20% ROE:
- Target A has an RNOA of 18% with almost zero debt ($\text{FLEV} = 0.1$).
- Target B has an RNOA of only 8% but is loaded to the gills with cheap debt ($\text{FLEV} = 3.0$, borrowing at 4% after-tax $\implies \text{ROE} = 8\% + 3 \times [8\% - 4\%] = 20\%$).

Target A is an operational powerhouse with pricing power and massive untapped debt capacity. Target B is a mediocre operation teetering on a leverage tightrope: a tiny 2% margin dip collapses its RNOA to 6%, turning its spread razor-thin and threatening debt covenants!

