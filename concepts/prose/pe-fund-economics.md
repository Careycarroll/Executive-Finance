# Private Equity Fund Economics (2-and-20 & Waterfalls)

## Intuition
Institutional private equity and venture capital funds operate as closed-end limited partnerships governed by a Private Placement Memorandum (PPM) and a Limited Partnership Agreement (LPA). The partnership unites two parties:
- **Limited Partners (LPs):** Institutional asset owners (pension funds, university endowments, sovereign wealth funds, family offices) who commit capital and take zero operational management role.
- **General Partner (GP):** The fund sponsor and management team who source, execute, govern, and exit portfolio investments.

Fund economics center on the classic **"2-and-20"** remuneration model:
1. **Management Fees (typically 1.5% to 2.0% per annum):** Charged initially on **committed capital** during the active 5-year investment period, then stepping down to **net invested capital** (or actively managed assets) during the harvesting period. Funds operate daily overhead, salaries, and due diligence.
2. **Carried Interest ("Carry", typically 20%):** The GP's share of net portfolio investment profits, paid only after LPs have received their initial capital back plus a negotiated benchmark rate of return known as the **Preferred Return (Hurdle Rate)**, traditionally $8.0\%$ compounded annually.

## Structure
### The Four-Tier Distribution Waterfall (European / Whole-Fund Model)

$$\text{Total Distributable Cash Outflow to Partners}$$

```
Institutional Distribution Waterfall Mechanics
┌────────────────────────────────────────────────────────┐
│ Tier 1: Return of Capital (100% to LPs)                │
│ • LPs receive 100% of distributions until all drawn     │
│   capital across the entire fund is fully returned.    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 2: Preferred Return (100% to LPs)                 │
│ • LPs receive 100% of cash until they achieve their    │
│   contractual Hurdle Rate (e.g., 8.0% annualized IRR). │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 3: GP Catch-Up (typically 80% to GP / 20% to LP)  │
│ • Once LPs achieve 8% IRR, cash flows preferentially to│
│   the GP until GP carry equals 20% of total profits.   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Tier 4: Carried Interest Split (80% LP / 20% GP)       │
│ • All residual portfolio profits distributed 80/20 in   │
│   perpetuity across all remaining fund exits.          │
└───────────────────────────┬────────────────────────────┘
```

| Waterfall Style | Calculation Methodology | Risk Profile & Clawback Exposure |
|---|---|---|
| **European Waterfall (Whole-Fund)** | LPs receive all drawn capital and hurdle returns across all deals before GP receives any carry. | Highly LP-friendly. GP receives carry later in fund life, but clawback risk is minimized. |
| **American Waterfall (Deal-by-Deal)** | Carried interest calculated and distributed on each individual profitable deal exit. | GP-friendly (earlier carry payments). High clawback risk if later deals suffer catastrophic losses. |

### The Private Equity J-Curve
In early fund years (Years 1–3), net fund returns are negative because management fees and transaction organizational costs are paid immediately while portfolio companies take years to implement operational turnaround initiatives and harvest liquidity.

## Common Misconceptions
- **Misconception 1: "Management fees are calculated on the fund's current asset value."**  
  *Reality:* Unlike public mutual funds that charge fees on daily Net Asset Value (NAV), PE funds charge management fees on **total committed capital** for the first 5 years. If LPs commit \$1,000M, the GP collects \$20M annually, even if only \$100M of capital has been deployed in Year 1!
- **Misconception 2: "The GP catch-up is an unfair extra bonus."**  
  *Reality:* Without a catch-up tier, the GP would only receive 20% of profits *above* the 8% hurdle. The catch-up is designed so that once the hurdle threshold is crossed, the GP earns 20% of **all total profits from dollar one**, restoring true 80/20 overall profit sharing.
- **Misconception 3: "Carried interest cannot be taken back once distributed."**  
  *Reality:* Under strict LP agreements, all funds feature a mandatory **Clawback Provision**. If a GP collects carry on early successful exits, but later portfolio companies collapse such that total fund return drops below the 8% hurdle, the GP must physically wire back millions in previous carry to make LPs whole.

## Notes for Future-Me
When reviewing alternative investment allocations or negotiating private equity partnerships:
1. **Insist on European Waterfalls:** Institutional LPs should always mandate whole-fund European waterfalls over deal-by-deal American waterfalls to avoid chasing GPs for clawbacks 10 years later.
2. **Scrutinize Fee Offsets:** Ensure the LP agreement mandates a **100% Management Fee Offset** for any monitoring fees, director fees, or transaction advisory fees charged directly to portfolio companies by the GP.
3. **Verify GP Commitment ("Skin in the Game"):** Ensure the GP commits at least $2\%$ to $5\%$ of personal cash capital into the fund alongside LPs so management suffers real financial pain if the portfolio underperforms.
