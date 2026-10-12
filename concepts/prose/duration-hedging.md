# Duration-Based Hedging & Immunization

## Intro
Financial institutions, corporate pension funds, and insurance companies face a structural balance sheet vulnerability: their liabilities (future annuity payouts, pension payments, deposit withdrawals) and their assets (loans, corporate bonds, mortgage holdings) respond differently to interest rate shocks.

**Balance Sheet Immunization** is the strategic technique of structuring asset portfolios so that their value changes identically to liabilities whenever interest rates shift, locking in a guaranteed rate of return regardless of whether yields rise or fall.

Immunization achieves this by balancing two offsetting forces:
1. **Price Risk:** When interest rates rise, bond asset prices fall (a capital loss).
2. **Reinvestment Risk:** When interest rates rise, interim coupons can be reinvested at higher rates (a compounding gain).

At the exact point where **Portfolio Duration equals Target Liability Horizon ($D^*_A = D^*_L$)**, price risk and reinvestment risk cancel each other out with mathematical precision!

## Diagram
### The Mechanics of Balance Sheet Immunization

```
       Interest Rates Rise (+Δy)                        Interest Rates Fall (-Δy)
┌───────────────────────────────────────┐        ┌───────────────────────────────────────┐
│ Capital Loss on Bond Prices:          │        │ Capital Gain on Bond Prices:          │
│   Existing asset prices drop (-)      │        │   Existing asset prices rise (+)      │
│ Offset By:                            │        │ Offset By:                            │
│ Reinvestment Compounding Gain:        │        │ Reinvestment Compounding Loss:        │
│   Coupons reinvested at higher yields │        │   Coupons reinvested at lower yields  │
├───────────────────────────────────────┤        ├───────────────────────────────────────┤
│ Net Portfolio Value: UNCHANGED (★)    │        │ Net Portfolio Value: UNCHANGED (★)    │
└───────────────────────────────────────┘        └───────────────────────────────────────┘
```

### The Three Golden Rules of Redington Immunization
1. **Duration Matching:** $D_A \cdot V_A = D_L \cdot V_L$ (Dollar duration of assets equals dollar duration of liabilities).
2. **Present Value Sufficiency:** $V_A \ge V_L$ (Assets must fully cover liabilities).
3. **Convexity Dominance:** $\text{Convexity}_A > \text{Convexity}_L$ (Asset convexity must exceed liability convexity, guaranteeing that any non-parallel yield shift benefits the institution).

## Common Misconceptions
- **Misconception 1: "Immunization is a set-it-and-forget-it strategy."**
  *Reality:* Immunization is dynamic! As time passes, asset durations and liability durations decay at different speeds. Furthermore, when interest rates move, duration itself changes (due to convexity). An immunized portfolio must be **periodically rebalanced** back to target duration; otherwise, duration drift leaves the balance sheet nakedly exposed.
- **Misconception 2: "Matching maturity dates is the same as immunizing."**
  *Reality:* Matching final maturity dates does NOT immunize! If a pension liability is due in 10 years, buying a 10-year coupon-paying bond leaves you heavily under-immunized because its duration is only $\approx 7.5\text{ years}$. To immunize a 10-year lump-sum liability, you must buy either a 10-year zero-coupon bond or a portfolio of coupon bonds whose weighted duration is exactly 10.0 years.
- **Misconception 3: "Immunization protects against all yield curve movements."**
  *Reality:* Standard duration-matching assumes **parallel shifts** across the yield curve. If the curve twists (steepens or inverts), classical immunization fails. Multi-factor **Key Rate Duration** matching is required for non-parallel twists.

## Notes for Future-Me
Look at Silicon Valley Bank (SVB) in 2023: they held short-duration demand deposits (liabilities with duration $< 1\text{ year}$) and invested them into 10-year fixed-rate mortgages and Treasuries with durations $> 6\text{ years}$ without interest rate hedges! When the Fed raised rates by 500 bps, their assets crashed by $17\%$, completely wiping out their equity capital and triggering a bank run. Never allow an organization you lead to run unhedged asset-liability duration mismatches to harvest short-term carry.
