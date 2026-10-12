# Scenario Analysis & Stress Testing

## Intro
While sensitivity analysis tests what happens when one single variable moves in isolation (e.g., "what happens to project NPV if unit sales fall by 10%?"), the real economic world never moves in isolated variables. When a macroeconomic recession strikes, sales volume collapses, customer collection times blow out, credit borrowing spreads spike, and supplier raw material costs fluctuate simultaneously.

**Scenario Analysis** and **Reverse Stress Testing** evaluate the resilience of an enterprise across correlated, cohesive states of the world:
1. **Scenario Analysis:** Constructs internally consistent narratives of future states (Base Case, Bull Case, Bear Case / Stagflation, Tech Disruption) where all operational and financial variables shift simultaneously in an economically realistic manner.
2. **Reverse Stress Testing (Pre-Mortem Analysis):** Instead of asking *"what happens if GDP drops 2%?"*, the executive team starts with the catastrophic endpoint: *"What specific combination of events would break our bank covenants, wipe out our equity, or force an emergency dilutive down-round?"* Once the breaking point is identified, leadership assesses how likely that scenario is and implements preventative structural hedges.

## Diagram
### The Three Core Modes of Uncertainty Modeling

| Methodology | Nature of Input Variables | Key Executive Question Answered | Primary Limitation |
|---|---|---|---|
| **Sensitivity Analysis** | Single variable shifted in isolation ($\pm 10\%$). | Which individual parameter is the most sensitive driver of our NPV? | Unrealistic; ignores correlations between economic variables. |
| **Scenario Analysis** | Multi-variable correlated bundles (Bull / Base / Bear). | How does the entire enterprise hold up under coherent economic regimes? | Captures only a handful of discrete scenarios chosen by humans. |
| **Monte Carlo** | Thousands of simulated joint probability paths. | What is the complete continuous probability distribution of outcomes? | Complex; requires rigorous estimation of joint distributions and copulas. |

```
Reverse Stress Testing Framework (Pre-Mortem)
┌────────────────────────────────────────────────────────┐
│ Catastrophic Threshold: Net Debt / EBITDA > 4.5x       │
│ (Bank Debt Covenant Breach & Revolver Freeze)          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
              Work Backwards to Identify Causes:
┌────────────────────────────────────────────────────────┐
│ • Scenario A: 25% Revenue Drop + Gross Margin down 300 bps │
│ • Scenario B: 15% Revenue Drop + Benchmark SOFR rises to 7%│
│ • Scenario C: Key Customer Bankruptcy (35% uncollected A/R)│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
               Executive Mitigating Actions Taken TODAY:
┌────────────────────────────────────────────────────────┐
│ 1. Refinance short-term bank line into 7-year fixed bond│
│ 2. Purchase credit insurance on top 3 customer accounts│
│ 3. Insert operational flexibility clauses into CapEx   │
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "The Base Case in our spreadsheet is what will actually happen."**
  *Reality:* The probability that reality matches your Base Case spreadsheet is zero. The Base Case is merely a reference baseline. Corporate survival is determined by whether the enterprise can comfortably withstand the **Bear Case** without permanent impairment of capital.
- **Misconception 2: "Our Bear Case models a 10% revenue decline, so we are being conservative."**
  *Reality:* In modern technology and financial cycles, severe recessions and competitive disruptions do not produce gentle 10% declines—they produce $30\%-60\%$ revenue drops combined with complete debt market freezes (e.g., 2008, 2020, 2022 tech pullback). If your Bear Case doesn't hurt your feelings when you read it, it is not a Bear Case.
- **Misconception 3: "Scenario analysis is only for the finance department."**
  *Reality:* Scenario analysis is an operational strategy exercise. If the Bear Case requires cutting $20\%$ of operating expenses within 60 days to avoid covenant breach, the executive team must pre-draft the exact operational playbook ahead of time.

## Notes for Future-Me
Conduct a mandatory **"Pre-Mortem"** before approving any major M&A acquisition or transformative capital project:
Assemble the leadership team and declare: *"It is now three years in the future. The acquisition has been an unmitigated disaster: we took a massive \$150M goodwill write-down, our CFO resigned, and our stock price was cut in half. Spend the next 20 minutes writing down the exact sequence of events that caused this failure."*

This psychological framing instantly breaks corporate cheerleading and groupthink, unlocking deep, candid operational insights that no standard base-case pitch deck would ever reveal.
