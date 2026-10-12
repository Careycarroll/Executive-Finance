# Option Strategy: The Collar (Zero-Cost Risk Reversal Hedge)

## Intuition
An executive or institutional portfolio manager holding a large, concentrated equity position often faces a dilemma: they want downside crash insurance (a **Protective Put**), but they do not want to pay $5\%$ to $8\%$ of their portfolio value per year in out-of-pocket cash premiums.

The **Collar Strategy** (Natenberg Ch. 13; Hull Ch. 12) solves this by combining three positions on the same underlying asset and expiration date:
1. **Long 100 Shares of Underlying Stock ($S_0$)**
2. **Long 1 Out-of-the-Money Put (Strike $K_P < S_0$):** Establishes a hard floor on maximum downside loss.
3. **Short 1 Out-of-the-Money Call (Strike $K_C > S_0$):** Caps upside appreciation above $K_C$, using the call premium collected to pay for the protective put!

When the OTM Call strike $K_C$ is selected such that the call premium received exactly equals the put premium paid ($C(K_C) = P(K_P)$), the structure is known as a **Zero-Cost Collar**.

## Structure
### Payoff Mechanics & Greek Profile

$$\text{Terminal Collar Value } (V_T) = S_T + \max(K_P - S_T, 0) - \max(S_T - K_C, 0) - (P_0 - C_0)$$

```
Expiration Payoff Diagram of a Stock Collar
Portfolio Value
     ▲
$115 ┼─────────────────────────────────── ╭─────────  Max Value Cap = K_C ($115)
     │                                  ╱
$100 ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╱─ ─ ─ ─ ─ ─ ─  Initial Stock S_0 ($100)
     │                              ╱
 $90 ┼───────────────────────╯                        Min Value Floor = K_P ($90)
     │
     └───────────────────────┬────────┬───┬─────────► Stock Price at Expiry (S_T)
                         K_P=$90  S_0=$100 K_C=$115
```

| Metric | Mathematical Formula (Zero-Cost Collar) | Worked Example ($S_0 = \$100, K_P = \$90, K_C = \$115$) |
|---|---|---|
| **Net Upfront Premium** | $P_0 - C_0 = \$0$ | Put costs $\$3.50$; Short Call collects $\$3.50 \implies \mathbf{\$0.00}$. |
| **Maximum Downside Loss** | $S_0 - K_P + \text{Net Debit}$ | Capped strictly at $\$100 - \$90 = \mathbf{-\$10.00\text{ (-10\%)}}$, even if stock drops to $\$0$! |
| **Maximum Upside Gain** | $K_C - S_0 - \text{Net Debit}$ | Capped at $\$115 - \$100 = \mathbf{+\$15.00\text{ (+15\%)}}$. |
| **Net Greek Profile** | **Positive Delta** ($+0.30$ to $+0.50$), **Near-Zero Gamma, Theta, and Vega!** | Because you are Long 1 OTM Put and Short 1 OTM Call, $\Gamma, \Theta, \mathcal{V}$ largely cancel out near spot! |

## Common Misconceptions
- **Misconception 1: "A Zero-Cost Collar is completely free."**  
  *Reality:* It costs zero *cash* upfront, but its **opportunity cost** is relinquishing all upside above $K_C$. Furthermore, because of **Negative Equity Volatility Skew** (OTM puts have much higher implied volatility than OTM calls), to get a $10\%$ OTM put for "free," you often have to cap your upside at only $+6\%$ or $+7\%$! Wait to put on collars when skew is relatively flat, or accept a small net debit to keep a wider upside cap.
- **Misconception 2: "Putting a tight collar around a low-basis stock is always tax-free."**  
  *Reality:* Under **IRC Section 1259 (Constructive Sales Rules)**, if an executive puts on a collar that is too tight (eliminating substantially all risk of loss *and* opportunity for gain), the IRS treats the collar as an immediate **Constructive Sale** on Day 1, triggering immediate capital gains tax on the entire unrealized appreciation! Tax counsel generally requires maintaining at least a $15\%–20\%$ band width between $K_P$ and $K_C$ to avoid constructive sale treatment.

## Notes for Future-Me
The Collar is the premier tool for **Executive Concentrated Stock Wealth Management**:
If you hold $\$20\text{M}$ of low-basis company stock after an IPO or M&A lockup and cannot sell shares without triggering massive capital gains taxes or negative insider-selling signals:
1. Structure a **12-Month Wide Collar** (e.g., $85\%$ Put Floor / $120\%$ Call Cap) that complies with IRC §1259 and §1092 (Straddle Rules).
2. Pledge the collared stock—which now has a guaranteed minimum liquidation value of $85\%$—as collateral for a low-interest **Prepaid Variable Forward (PVF)** or securities-backed credit line, unlocking liquid cash at SOFR $+ 100\text{ bps}$ with zero immediate capital gains tax!
