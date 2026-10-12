# Interest Rate Swaps and Comparative Advantage

## Intuition
An Interest Rate Swap (IRS) is a bilateral derivative agreement in which two parties exchange periodic interest rate cash flows based on a specified **notional principal amount**, without ever exchanging the principal itself.

The classic vanilla structure is a **Fixed-for-Floating Swap**:
- **Party A (Fixed Payer / Floating Receiver):** Pays a predetermined fixed interest rate ($R_{\text{swap}}$) and receives a floating reference rate (e.g., SOFR, EURIBOR).
- **Party B (Floating Payer / Fixed Receiver):** Pays the floating reference rate and receives the fixed rate.

Interest rate swaps serve two primary executive purposes:
1. **Asset-Liability Management (ALM):** Converting floating-rate corporate bank debt (e.g., SOFR $+ 150\text{ bps}$) into synthetic fixed-rate debt to immunize the firm against central bank rate hikes.
2. **Exploiting Comparative Advantage:** Companies with disparate credit ratings often face different credit spreads in the fixed vs. floating debt markets. By borrowing in the market where they possess a comparative advantage and swapping with a counterparty, both firms lower their borrowing costs.

Because a swap is essentially a portfolio of forward rate agreements (FRAs), the **Par Swap Rate** is the fixed rate that sets the net present value of the swap to exactly zero at inception.

## Formula
$$V_{\text{swap}} = B_{\text{floating}} - B_{\text{fixed}} \quad \text{(For Fixed Payer)}$$

$$R_{\text{swap}} = \frac{1 - P(0, T_N)}{\sum_{i=1}^N \Delta t_i \cdot P(0, T_i)}$$

$$\text{Net Payment}_i = \text{Notional} \cdot \left[ R_{\text{floating}, i-1} - R_{\text{fixed}} \right] \cdot \Delta t_i$$

## Variable Glossary
- **$R_{\text{swap}}$**: Par swap rate (the fixed rate that sets initial swap value to zero).
- **$P(0, T_i)$**: Discount factor for cash flows maturing at payment date $T_i$ ($= e^{-r_i T_i}$).
- **$B_{\text{floating}}$**: Value of a floating-rate bond (which resets to par value $100\%$ on every reset date).
- **$B_{\text{fixed}}$**: Value of a fixed-rate bond paying coupon $R_{\text{swap}}$.
- **$\Delta t_i$**: Accrual period day-count fraction (e.g., $0.25$ for quarterly payments).
- **$\text{Notional}$**: Principal balance used solely to compute interest payments (not exchanged).

## Worked Example
Company AAA (high-grade credit) and Company BBB (speculative-grade credit) need $\$100{,}000{,}000$ in 5-year debt.
- **Company AAA** prefers floating-rate debt to match its floating-rate receivables.
- **Company BBB** prefers fixed-rate debt to avoid rate hike volatility.

**Market Borrowing Quotes Available:**
| Entity | Fixed Rate Market | Floating Rate Market | Quality Spread Differential (QSD) |
|---|---|---|---|
| **Company AAA** | $5.0\%$ | SOFR $+ 0.30\%$ | — |
| **Company BBB** | $7.0\%$ | SOFR $+ 1.10\%$ | — |
| **Credit Spread** | $2.0\%$ ($200\text{ bps}$) | $0.80\%$ ($80\text{ bps}$) | **Net Spread Arbitrage = $120\text{ bps}$** |

Notice: AAA has an absolute advantage in both markets, but a **comparative advantage in fixed borrowing** (it saves $200\text{ bps}$ in fixed vs only $80\text{ bps}$ in floating).

**Swap Structure (with Financial Intermediary taking 20 bps):**
1. AAA issues fixed debt at $5.0\%$.
2. BBB issues floating debt at SOFR $+ 1.10\%$.
3. They enter an interest rate swap where AAA pays SOFR to BBB, and BBB pays $5.50\%$ fixed to AAA:
   - **AAA’s Net Cost:** Pays $5.0\%$ fixed $+$ pays SOFR $-$ receives $5.50\%$ fixed $= \text{SOFR} - 0.50\%$ (saves $80\text{ bps}$ compared to borrowing direct at SOFR $+ 0.30\%$).
   - **BBB’s Net Cost:** Pays SOFR $+ 1.10\%$ $+$ pays $5.50\%$ fixed $-$ receives SOFR $= 6.60\%$ fixed (saves $40\text{ bps}$ compared to borrowing direct at $7.0\%$).

Both parties save substantial interest expense through synthetic transformation.

## When to Use
- **When to use:** Hedging floating-rate corporate credit facilities (term loans), liability immunization for pension funds and life insurers, locking in funding rates for multi-year capital projects, and yield enhancement.
- **When not to use / Caveats:** Swaps eliminate interest rate risk, but create **Counterparty Credit Risk** and **Mark-to-Market Collateral Risk**. If rates move sharply in your favor, your swap has positive market value, but if your bank counterparty defaults (e.g., Lehman Brothers 2008), your hedge vanishes. Always use cleared swaps (CME/LCH) or mandate bilateral CSA daily collateral margining.

## Notes for Future-Me
Beware the **"Termination Breakage Fee"**: When a company enters a 10-year swap paying 5% fixed and interest rates crash to 2%, the swap has an enormous negative mark-to-market liability. If management decides to refinance or pay off the underlying bank loan early (e.g., during an M&A acquisition sale), the bank will demand an immediate cash "breakage fee" equal to the millions of dollars in negative swap value! Never enter a long-dated swap on debt that might be retired or refinanced early without negotiating flexible prepayment or novation clauses.

