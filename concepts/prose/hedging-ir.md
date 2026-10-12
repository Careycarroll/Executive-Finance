# Interest Rate Risk Management & Duration Gaps

## Intuition
Enterprises and financial institutions face structural interest rate risk across two interrelated domains:
1. **Net Interest Income Sensitivity (Earnings at Risk):** The short-term impact of rate swings on annual accounting net interest margin, governed by the **Repricing Gap**:
   $$\text{GAP} = \text{Rate-Sensitive Assets (RSA)} - \text{Rate-Sensitive Liabilities (RSL)}$$
   When $\text{GAP} > 0$ (asset-sensitive), rising interest rates expand net interest income. When $\text{GAP} < 0$ (liability-sensitive), rising interest rates compress margins.
2. **Economic Value of Equity (EVE Sensitivity):** The long-term impact of rate swings on the total net worth of the institution, governed by the **Duration Gap ($DG$)**:
   $$\text{Duration Gap} = D_A - \left(\frac{L}{A}\right) \cdot D_L$$

If an institution's assets have longer duration than its liabilities ($DG > 0$), a sudden spike in interest rates destroys asset values faster than liabilities decline, creating a severe drain on equity capital.

Treasury teams manage interest rate risk using three primary tools:
- **Interest Rate Swaps (IRS):** Swapping floating-rate bank credit facility interest for fixed-rate payments.
- **Interest Rate Caps & Collars:** Purchasing an interest rate cap sets a ceiling on maximum floating borrowing costs while preserving downside savings if rates fall.
- **Eurodollar / SOFR Futures:** Adjusting portfolio duration dynamically using exchange-traded interest rate contracts.

## Formula
\Delta \text{EVE} \approx -\left[ D_A - \left(\frac{L}{A}\right) \cdot D_L \right] \cdot A \cdot \Delta y = -DG \cdot A \cdot \Delta y

$$\text{Number of Swap Contracts to Immunize: } N^* = \frac{DG \cdot A}{D_{\text{swap}} \cdot V_{\text{swap}}}$$

$$\text{Annual Net Interest Income Impact: } \Delta \text{NII} = \text{GAP} \cdot \Delta y$$

## Variable Glossary
- **\Delta \text{EVE}**: Change in Economic Value of Equity (market value of net worth).
- **DG**: Duration Gap ($D_A - \frac{L}{A} D_L$).
- **D_A / D_L**: Modified duration of total assets and total liabilities.
- **A / L**: Market value of total assets and total liabilities.
- **\Delta y**: Parallel interest rate shift across the yield curve.
- **\text{NII}**: Net Interest Income ($\text{Interest Revenues} - \text{Interest Expenses}$).
- **\text{GAP}**: Dollar volume of assets maturing/repricing within 1 year minus liabilities repricing within 1 year.

## Worked Example
A regional financial institution reports the following balance sheet metrics:
- Total Assets ($A$): $\$1{,}000{,}000{,}000$ with asset duration $D_A = 5.0\text{ years}$
- Total Liabilities ($L$): $\$900{,}000{,}000$ with liability duration $D_L = 1.5\text{ years}$
- Total Equity Capital: $\$100{,}000{,}000$ (Equity-to-Assets ratio $= 10\%$)
- Interest Rate Shock: Central bank raises benchmark rates by $+200\text{ bps}$ ($\Delta y = +0.02$).

**Step 1: Calculate the Duration Gap ($DG$)**
$$DG = D_A - \left(\frac{L}{A}\right) D_L = 5.0 - \left(\frac{\$900\text{M}}{\$1{,}000\text{M}}\right) \times 1.5 = 5.0 - (0.90 \times 1.5) = 5.0 - 1.35 = +3.65\text{ years}$$

**Step 2: Calculate Economic Value of Equity Impact**
$$\Delta \text{EVE} \approx -DG \cdot A \cdot \Delta y = -3.65 \times \$1{,}000{,}000{,}000 \times (+0.02) = -\$73{,}000{,}000$$

**Catastrophic Balance Sheet Evaluation:**
A $+200\text{ bps}$ rate hike wipes out **$\$73,000,000$ of the bank’s $\$100,000,000$ equity capital** ($73\%$ of net worth eliminated overnight!).
To immunize the balance sheet ($DG \to 0$), the treasurer must either shorten asset duration (selling long bonds, originating floating loans) or enter a pay-fixed / receive-floating interest rate swap portfolio with notional value of $\$73\text{M} / \Delta y$.

## When to Use
- **When to use:** Corporate debt issuance structuring (floating vs. fixed mix), bank asset-liability committee (ALCO) oversight, commercial real estate mortgage debt hedging, and pension liability matching.
- **When not to use / Caveats:** Duration gaps assume parallel shifts across the yield curve. If the short end of the curve spikes by 300 bps while the 10-year yield stays flat (curve inversion), standard duration gap models fail to predict earnings compression. Multi-bucket key-rate duration analysis is required.

## Notes for Future-Me
"The cost of hedging is an insurance premium; the cost of unhedged leverage is bankruptcy." 
When corporate borrowing rates are at cyclical lows (e.g., 2%–3%), CEOs are tempted to stay on floating bank revolvers because floating rates are 50 bps cheaper than 10-year fixed bonds. This is the ultimate penny-wise, pound-foolish mistake: you save 50 bps in good times, and when rates spike to 7%, your entire operating cash flow is consumed by interest debt service! Always lock in long-term fixed rates or buy interest rate caps when rates are historically low.
