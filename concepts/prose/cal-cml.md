# Capital Allocation Line and Capital Market Line

## Intuition
Modern portfolio theory proves that an investor's total asset allocation problem separates into two independent decisions (James Tobin’s **Two-Fund Separation Theorem**):
1. **The Technical Portfolio Decision:** Identifying the single optimal tangency portfolio of risky assets that maximizes the Sharpe Ratio, completely independent of individual risk aversion.
2. **The Personal Allocation Decision:** Choosing how to split total wealth between that optimal risky portfolio and the risk-free asset (Treasury bills) based strictly on personal risk tolerance.

The graph of all possible combinations of the risk-free asset and a specific risky portfolio is the **Capital Allocation Line (CAL)**. Its slope is the Sharpe Ratio.

When the risky portfolio chosen is the aggregate **Market Portfolio ($M$)** containing all investable assets in proportion to their market capitalization, the CAL becomes the **Capital Market Line (CML)**. The CML represents the ultimate macroeconomic efficiency frontier: no individual asset or sub-portfolio can lie above the CML.

## Formula
E[R_c] = r_f + \left[ \frac{E[R_p] - r_f}{\sigma_p} \right] \cdot \sigma_c = r_f + \text{Sharpe}_p \cdot \sigma_c

$$\text{Capital Market Line (CML): } E[R_c] = r_f + \left[ \frac{E[R_m] - r_f}{\sigma_m} \right] \cdot \sigma_c$$

## Variable Glossary
- **E[R_c]**: Expected return on the complete combined portfolio (risk-free + risky).
- **\sigma_c**: Volatility (standard deviation) of the complete combined portfolio ($= y \cdot \sigma_p$).
- **r_f**: Risk-free rate of return (zero standard deviation).
- **E[R_p]**: Expected return on the risky portfolio.
- **\sigma_p**: Volatility of the risky portfolio.
- **E[R_m]**: Expected return on the aggregate broad market portfolio.
- **\sigma_m**: Volatility of the aggregate broad market portfolio.
- **y**: Proportion of total wealth allocated to the risky portfolio ($1 - y$ allocated to risk-free asset).
- **\text{Sharpe}_p**: Slope of the CAL ($= \frac{E[R_p] - r_f}{\sigma_p}$).

## Worked Example
An endowment foundation has the following investment parameters:
- Risk-free rate ($r_f$): $4.0\%$
- Tangency Risky Portfolio ($P$): Expected return $E[R_p] = 10.0\%$, annual volatility $\sigma_p = 15.0\%$
- Slope of CAL (Sharpe Ratio):
  $$\text{Sharpe} = \frac{10.0\% - 4.0\%}{15.0\%} = \frac{6.0\%}{15.0\%} = 0.40$$

The board's investment policy mandate specifies a target total portfolio volatility of $\sigma_c = 9.0\%$.

**Step 1: Determine the Risky Weight ($y$)**
$$\sigma_c = y \cdot \sigma_p \implies y = \frac{\sigma_c}{\sigma_p} = \frac{9.0\%}{15.0\%} = 0.60 \ (60\%)$$
The endowment allocates $60\%$ to the optimal risky portfolio and $40\%$ ($1 - 0.60$) to Treasury bills.

**Step 2: Calculate Expected Complete Return**
$$E[R_c] = r_f + \text{Sharpe} \times \sigma_c = 4.0\% + (0.40 \times 9.0\%) = 4.0\% + 3.6\% = 7.60\%$$
Direct check: $(0.40 \times 4.0\%) + (0.60 \times 10.0\%) = 1.6\% + 6.0\% = 7.60\%$.

## When to Use
- **When to use:** Multi-asset endowment allocation, institutional liability-driven investing (LDI), individual wealth planning glidepaths, and evaluating leverage in hedge funds (borrowing at $r_f$ with $y > 1.0$ moves an investor upward along the CAL).
- **When not to use / Caveats:** The CML only prices **fully diversified, complete portfolios**. It cannot price individual stocks or undiversified portfolios because its horizontal axis is total risk ($\sigma$), not systematic risk ($\beta$). For individual stocks, you must use the **Security Market Line (SML)**.

## Notes for Future-Me
Tobin's Separation Theorem is liberating for executive asset management: you do not need to create customized portfolios of 500 different stock picks for every different risk profile in your family office or corporate pension. You find the single best tangency portfolio that maximizes Sharpe Ratio once, and then dial risk up or down simply by blending it with cash or borrowing leverage.

