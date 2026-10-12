# Net Present Value and Internal Rate of Return

## Intuition
Capital budgeting decisions define the long-term trajectory of an enterprise. The two preeminent metrics for evaluating investment projects are **Net Present Value (NPV)** and **Internal Rate of Return (IRR)**.

- **Net Present Value (NPV):** The dollar amount of economic value created today by undertaking the project. It equals the present value of all expected future cash inflows minus the present value of all initial and subsequent cash outlays, discounted at the project's required opportunity cost of capital ($r$).
  - **Decision Rule:** Accept any project with $\text{NPV} > 0$. If projects are mutually exclusive, choose the project with the highest positive NPV.
- **Internal Rate of Return (IRR):** The annualized discount rate that forces the project's NPV to equal zero. It represents the break-even return rate inherent in the cash flow schedule.
  - **Decision Rule:** Accept if $\text{IRR} > \text{Hurdle Rate } (r)$.

**The Executive Conflict:** While executives often prefer IRR because it communicates a convenient percentage hurdle (e.g., "this venture delivers a 28% IRR!"), NPV is mathematically superior. When choosing between mutually exclusive projects of differing scales or cash flow timing, IRR often yields distorted rankings due to the **reinvestment rate trap** and **scale neglect**. NPV measures absolute shareholder wealth creation in actual currency.

## Formula
\text{NPV} = -C_0 + \sum_{t=1}^T \frac{\text{CF}_t}{(1 + r)^t} = 0 \iff r = \text{IRR}

## Variable Glossary
- **\text{NPV}**: Net Present Value in currency units today.
- **\text{IRR}**: Internal Rate of Return (the discount rate $r^*$ such that $\text{NPV}(r^*) = 0$).
- **C_0**: Initial capital outlay / upfront CapEx at period $0$.
- **\text{CF}_t**: Net cash inflow or outflow generated in period $t$.
- **r**: Opportunity cost of capital (hurdle rate / WACC).
- **T**: Useful economic life or projection horizon of the investment.
- **\text{PI}**: Profitability Index ($= \frac{\text{PV of Inflows}}{C_0} = 1 + \frac{\text{NPV}}{C_0}$), useful for capital rationing.

## Notes for Future-Me
Whenever a finance presentation leads with IRR, put on your skepticism goggles:
1. **The Reinvestment Assumption Trap:** IRR implicitly assumes that all interim cash flows released by the project can be continuously reinvested at that same sky-high IRR until the end of the horizon. If a project has a 45% IRR, it assumes cash released in Year 1 can immediately find another 45% project! In reality, interim cash can only be reinvested at the company's cost of capital (WACC). Use **Modified IRR (MIRR)** or pure NPV to eliminate this fantasy.
2. **The Scale Blindspot:** Would you rather earn a 50% IRR on a \$10,000 marketing pilot (\$5,000 profit) or a 20% IRR on a \$10,000,000 data center expansion (\$2,000,000 net value created)? A manager obsessed with IRR picks the tiny pilot; a CFO maximizing shareholder wealth picks the \$10M project.
3. **Multiple IRRs:** Any project with alternating signs in cash flows (e.g., negative outlay, positive mid-life mining cash flows, followed by huge environmental cleanup outlays at decommissioning) will have multiple real mathematical solutions for IRR, making the metric mathematically meaningless. NPV is monotonic and never suffers from multiple roots.

