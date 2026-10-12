# Greeks: Charm (Delta Bleed / DdeltaDtime)

## Intuition
Standard first-order Greeks treat Delta ($\Delta$) and Theta ($\Theta$) as independent static numbers. In reality, as time passes toward expiration, an option's Delta changes continuously even if the underlying stock price and implied volatility remain completely frozen!

**Charm** (also known as **Delta Bleed** or **DdeltaDtime**) is a second-order cross-Greek that measures the **rate of change of Delta with respect to the passage of time** (or equivalently, the sensitivity of Theta to changes in the underlying price) (Natenberg Ch. 11):
$$\text{Charm} = -\frac{\partial \Delta}{\partial \tau} = \frac{\partial \Delta}{\partial t} = \frac{\partial \Theta}{\partial S}$$

### The Intuitive Mechanics of Delta Bleed
As expiration approaches ($\tau \to 0$), every option must resolve to a terminal Delta of either **$0.00$** (if Out-of-the-Money) or **$\pm 1.00$** (if In-the-Money):
- **Out-of-the-Money (OTM) Options:** An OTM call with a $0.25$ Delta 30 days out will steadily bleed Delta every day if the stock sits still, decaying toward **$0.00$ Delta** at expiration.
- **In-the-Money (ITM) Options:** An ITM call with a $0.75$ Delta 30 days out will steadily gain Delta every day if the stock sits still, converging toward **$1.00$ Delta** at expiration.

## Structure
### Black-Scholes Formula & Expiration Convergence Profile

$$\text{Charm (with respect to time passing } t\text{)} = -e^{-q\tau} \left[ \phi(d_1) \frac{2(r - q)\tau - d_2 \sigma \sqrt{\tau}}{2 \tau \sigma \sqrt{\tau}} \mp q N(\pm d_1) \right]$$

```
How Option Delta Evolves as Time Approaches Expiration (Stock Price Flat)
Delta (Δ)
 1.00 ┼─────────────────────────────────────────── ↗ 1.00 (ITM Call: Δ rises)
      │                                     ↗ ↗
 0.75 ┼──────────────────────────────── ↗ ↗
      │
 0.50 ┼────────────────────────────────────────────────── (ATM Call: Δ ≈ 0.50)
      │
 0.25 ┼──────────────────────────────── ↘ ↘
      │                                     ↘ ↘
 0.00 ┼─────────────────────────────────────────── ↘ 0.00 (OTM Call: Δ bleeds)
      └───────────┬───────────────┬───────────────┬──────► Time Passing (t → T)
               30 Days         15 Days          Expiry
```

| Option Moneyness | Daily Delta Change as Time Passes | Impact on Delta-Neutral Hedger |
|---|---|---|
| **Long OTM Call ($\Delta = +0.25$)** | Delta **Decreases** toward $0.00$ | Position becomes progressively less long over the weekend; hedger must buy underlying shares to stay delta-neutral. |
| **Long ITM Call ($\Delta = +0.75$)** | Delta **Increases** toward $+1.00$ | Position becomes progressively longer delta over the weekend; hedger must sell underlying shares to stay neutral. |
| **Long OTM Put ($\Delta = -0.25$)** | Delta **Moves toward $0.00$** (becomes less negative) | Bearish hedge loses its protective punch every day the market trades sideways! |

## Common Misconceptions
- **Misconception 1: "If I buy OTM puts to hedge my equity portfolio, my hedge ratio stays constant unless the market moves."**  
  *Reality:* Because of **Charm**, an Out-of-the-Money protective put loses Delta every single day that the market trades sideways! A 30-day $5\%$ OTM put starts with a $-0.30$ Delta; after three quiet weeks of flat market prices, its Delta bleeds down to $-0.08$. When a sudden crash occurs in Week 4, your portfolio is barely hedged until the market drops far enough to re-engage the strike.
- **Misconception 2: "Charm is negligible compared to Gamma."**  
  *Reality:* During the final 5 trading days before a major monthly options expiration (OpEx), Charm becomes enormous. Market makers who are short millions of OTM calls (from covered-call ETFs and retail flow) watch those calls bleed Delta toward zero every hour—forcing dealers to systematically unwind (buy back) their short stock hedges, creating the well-documented **"OpEx Charm Drift"** rally in equity indices.

## Notes for Future-Me
Always monitor **Weekend Charm** when managing an options book or institutional equity hedge:
On Friday afternoon, institutional desks calculate their **Monday Morning Delta** (assuming 72 hours of Charm bleed over the weekend). If your portfolio protection relies on short-dated OTM puts, never let them enter the final 14 days to expiration—roll your protective hedges out to 60–90 days before Charm erodes both your Theta value and your Delta protection.
