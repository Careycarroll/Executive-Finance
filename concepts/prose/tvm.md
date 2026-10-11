# Time Value of Money

## Intuition
A dollar received today is worth more than a dollar received tomorrow because a dollar today can be invested to earn a positive return, and because inflation erodes future purchasing power. Every valuation model across corporate finance and investments is built on this foundation: converting cash flows across disparate points in time into a common denominator today.

## Formula
PV = \sum_{t=1}^{T} \frac{CF_t}{(1 + r)^t}

## Variable Glossary
- **PV**: Present Value — the current worth of a future stream of cash flows discounted at rate $r$.
- **CF_t**: Cash Flow at time $t$ — the nominal dollar amount expected at period $t$.
- **r**: Discount Rate / Opportunity Cost of Capital — the expected rate of return for an investment of equivalent risk.
- **t**: Period index ($1, 2, \dots, T$).
- **T**: Terminal period of the horizon.

## Worked Example
Suppose an investment promises to pay \$1,000 in 1 year, \$2,000 in 2 years, and \$3,000 in 3 years. If the relevant opportunity cost of capital is 8% ($r = 0.08$):
- $PV_1 = \frac{1000}{1.08^1} = \$925.93$
- $PV_2 = \frac{2000}{1.08^2} = \$1,714.68$
- $PV_3 = \frac{3000}{1.08^3} = \$2,381.50$
- **Total PV** $= 925.93 + 1714.68 + 2381.50 = \$5,022.11$

If the asset is offered for less than \$5,022.11 today, it generates positive economic net present value (NPV).

## When to Use
- **When to use:** Whenever comparing capital allocations, pricing securities (bonds, annuities, mortgages), or analyzing capital expenditure decisions.
- **When not to use / Caveats:** Do not use a constant single discount rate $r$ when the term structure of interest rates is sharply upward-sloping or inverted; use tenor-specific spot rates $\left(r_t\right)$ or forward rates instead.

## Notes for future-me
Always remember: discounting is division by $(1+r)^t$, compounding is multiplication by $(1+r)^t$. If you ever find yourself struggling to build intuition on complex structured products or exotic debt schedules, collapse the problem back into discrete cash flow streams and discount them period by period.
