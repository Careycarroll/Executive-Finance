# Venture Capital Stages & Term Sheet Mechanics

## Intuition
Venture Capital (VC) finances high-growth, early-stage technology and life-science companies characterized by negative cash flows, zero tangible collateral, and extreme power-law outcomes (where $10\%$ of portfolio companies generate $90\%$ of total fund returns).

Because traditional debt covenants and DCF models fail on pre-revenue startups, VC investors manage risk through **Preferred Stock Term Sheet Architecture**:
1. **Valuation & Dilution Mechanics:**
   $$\text{Post-Money Valuation} = \text{Pre-Money Valuation} + \text{New Investment Capital}$$
   $$\text{Investor Ownership \%} = \frac{\text{New Investment Capital}}{\text{Post-Money Valuation}}$$
2. **Convertible Instruments (SAFE / Convertible Notes):** Pre-seed and seed rounds often defer setting an explicit valuation by issuing Simple Agreements for Future Equity (SAFEs), which convert into preferred stock at the next priced round subject to a **Valuation Cap** and/or **Discount Rate**.
3. **Downside Protection via Liquidation Preferences:** Preferred shareholders sit ahead of common stock (founders and employees) in an M&A exit waterfall, guaranteeing VCs recover $1\times$ (or more) of their invested capital before common equity receives a dollar.

## Structure
### Core Term Sheet Clauses & Economic Impact

| Term Sheet Clause | Standard Market Term (Founder-Friendly) | Aggressive Investor Term | Economic Consequence |
|---|---|---|---|
| **Liquidation Preference** | $1\times$ Non-Participating Preferred | $2\times$ Participating Preferred ("Double Dip") | Non-participating forces investor to choose between taking $1\times$ cash back OR converting to common pro-rata. Participating lets investor take $1\times$ off the top AND still take pro-rata share of remaining proceeds! |
| **Anti-Dilution Protection** | Broad-Based Weighted Average | Full Ratchet | Adjusts investor conversion price downward if company raises a future "Down Round" at a lower valuation. Full Ratchet reprices all prior investor shares to the new low price, wiping out founders. |
| **Option Pool Shuffle** | Created Post-Money (shared dilution) | Created Pre-Money ($15\%-20\%$ unallocated pool) | Pre-money option pool expansion comes $100\%$ out of existing founders' equity before new VC capital enters. |
| **Pro-Rata Rights** | Major Investors ($>\$1\text{M}$ check) | Super Pro-Rata ($2\times$ allocation right) | Right to invest in future Series B/C rounds to maintain ownership percentage. |

```
Exit Waterfall: $50M Acquisition on $10M Invested (at $40M Post-Money = 25% VC Ownership)
┌────────────────────────────────────────────────────────┐
│ Case A: 1x Non-Participating Preferred                 │
│ • Option 1 (Take Preference): $10M                     │
│ • Option 2 (Convert to Common): 25% × $50M = $12.5M    │
│ → VC Converts to Common: Receives $12.5M; Founders $37.5M│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Case B: 1x Participating Preferred ("Double Dip")      │
│ • Step 1 (Take 1x Preference off top): $10M to VC      │
│ • Step 2 (Take 25% of remaining $40M): +$10M to VC     │
│ → VC Receives $20.0M (40% of exit!); Founders get $30.0M│
└────────────────────────────────────────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "Achieving a \$1 Billion 'Unicorn' headline valuation guarantees founders are billionaires."**  
  *Reality:* If a company raises late-stage capital at a \$1B valuation by granting investors a $2\times$ liquidation preference or guaranteed IPO ratchets, and later sells for \$400M, the preference stack can consume $100\%$ of the exit proceeds, leaving founders and employee option holders with \$0.
- **Misconception 2: "Post-Money SAFEs do not dilute founders until Series A."**  
  *Reality:* Y Combinator Post-Money SAFEs lock in a fixed percentage of the company immediately upon signing. If a founder raises \$3M on a \$15M post-money SAFE, followed by another \$2M on a \$20M post-money SAFE, the founders have already sold $20\% + 10\% = 30\%$ of the company *before* Series A dilution even begins!
- **Misconception 3: "Employee stock options are equivalent to founder shares."**  
  *Reality:* Founders hold Common Stock; VCs hold Preferred Stock; employees hold Options to purchase Common Stock at a strike price. In modest exits below the preference stack, common stock and options are out-of-the-money.

## Notes for Future-Me
"You set the price, I'll set the terms."
Never obsess over maximizing the headline Pre-Money Valuation at the expense of clean structure. A high valuation paired with Participating Preferred stock, Full-Ratchet anti-dilution, or cumulative dividends is a ticking time bomb. Always prioritize **clean $1\times$ Non-Participating Preferred stock** and Broad-Based Weighted Average anti-dilution—even if it means accepting a $15\%$ lower headline valuation.

