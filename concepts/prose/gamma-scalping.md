# Gamma Scalping (Dynamic Long-Gamma Trading)

## Intuition
When you buy an At-the-Money Straddle (or delta-hedged option), you hold a **Long Gamma ($+\Gamma$)** and **Short Theta ($-\Theta$)** position. Every day that passes costs you a fixed "rent" in time decay (Theta), while every volatile swing in the underlying asset price allows you to profit from convexity (Gamma).

**Gamma Scalping** (Natenberg Ch. 16; Sinclair Ch. 3) is the systematic institutional practice of dynamically trading the underlying stock or futures contract against a long-gamma option position to **buy low and sell high repeatedly**, harvesting realized volatility to out-earn the daily Theta time decay bill.

## Structure
### The Fundamental P&L Equation of Gamma Scalping

Over a discrete time interval $\Delta t$, the net Profit & Loss of a continuously delta-hedged option position is governed by the difference between **Realized Variance ($\sigma_{\text{realized}}^2$)** and **Implied Variance ($\sigma_{\text{implied}}^2$)**:

$$\text{Daily Hedged P\&L} \approx \frac{1}{2} \Gamma S^2 (\Delta S / S)^2 + \Theta \Delta t = \frac{1}{2} \Gamma_{\text{dollar}} \left( \sigma_{\text{realized}}^2 - \sigma_{\text{implied}}^2 \right) \Delta t$$

```
The Mechanical Buy-Low / Sell-High Loop of Gamma Scalping
┌────────────────────────────────────────────────────────┐
│ Step 1: Initial Delta-Neutral Setup (Spot = $100)      │
│ • Buy 10 ATM Straddles (Total Δ = 0, Γ = +100/pt)      │
│ • Daily Theta Rent Bill: -$250 / day                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Step 2: Stock Rallies to $103 (+3 points)              │
│ • Positive Gamma pushes Option Delta to +300 shares    │
│ • Action: SELL 300 shares at $103 to restore Δ = 0     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Step 3: Stock Mean-Reverts Back to $100 (-3 points)    │
│ • Option Delta drops back to 0; you are still short 300│
│ • Action: BUY BACK 300 shares at $100 to restore Δ = 0 │
│ → Locked-In Scalp Profit: 300 × ($103 - $100)/2 = +$450│
│ → Net Profit After -$250 Theta Rent = +$200!           │
└────────────────────────────────────────────────────────┘
```

### Calculating the Daily Breakeven Move
Because Black-Scholes links Theta and Gamma via $\Theta \approx -\frac{1}{2} \Gamma S^2 \sigma_{\text{IV}}^2$, the daily percentage stock move required just to pay for your daily Theta decay is:
$$\text{Daily Breakeven Move (\%)} \approx \frac{\sigma_{\text{implied}}}{\sqrt{252}} \approx \frac{\sigma_{\text{implied}}}{15.87}$$
*(Example: If Implied Volatility is $32\%$, the underlying stock must move approximately $32\% / 16 = \mathbf{2.0\%\text{ per day}}$ for your Gamma scalps to break even against Theta decay!)*

## Common Misconceptions
- **Misconception 1: "Gamma scalping is free money as long as the stock moves back and forth."**  
  *Reality:* Gamma scalping only profits if **Realized Volatility exceeds the Implied Volatility** you paid when buying the options ($\sigma_{\text{realized}} > \sigma_{\text{implied}}$). If you buy options at $40\%$ IV ($2.5\%$/day breakeven move) and the stock chops back and forth by only $1.2\%$/day, your scalping gains will recover less than a quarter of your daily Theta bleed!
- **Misconception 2: "Re-hedging Delta every 5 minutes maximizes Gamma scalping profits."**  
  *Reality:* In the presence of bid-ask spreads and commissions, hedging too frequently bleeds capital on transaction friction and whipsaws. Professional volatility traders hedge on **Delta-band thresholds** (e.g., only rebalance when net portfolio Delta exceeds $\pm 0.15\Delta$ or when the stock moves by $1.0\times$ the daily implied move), not on fixed clock intervals.

## Notes for Future-Me
Never initiate a Long Gamma scalping book unless two conditions hold simultaneously:
1. **Valuation Edge:** Implied Volatility is trading at a verified discount to forecasted Realized Volatility ($\sigma_{\text{IV}} < \hat{\sigma}_{\text{RV}}$).
2. **Low Bid-Ask Friction:** The underlying asset is an ultra-liquid futures contract or ETF (e.g., ES, NQ, SPY, QQQ) where delta-hedging execution costs less than 1 basis point per trade.
If the stock gaps strongly in one direction without mean-reverting, remember that letting your Delta run slightly before hedging captures convex trend profits, whereas hedging too early leaves you under-participating in a breakout.
