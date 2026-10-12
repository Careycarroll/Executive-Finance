# Forwards vs. Futures Mechanics

## Intro
Forward contracts and futures contracts are the foundational linear derivatives: both represent firm commitments to buy or sell an underlying asset at a specified future date for a predetermined delivery price ($K$).

While economically equivalent at maturity under constant interest rates, their market architecture and risk profiles diverge dramatically:
- **Forward Contracts:** Over-the-counter (OTC) bilateral agreements between two private counterparties. Completely customizable (notional size, tenor, delivery terms), but carry **counterparty credit risk** and are illiquid prior to maturity. Settlement occurs in a single lump-sum cash flow at expiration.
- **Futures Contracts:** Standardized, exchange-traded contracts traded on central exchanges (CME, ICE, Eurex). Counterparty risk is eliminated by the **Central Clearinghouse (CCP)** through mandatory initial margin and daily **mark-to-market** settlement. Any interim price fluctuation generates immediate daily cash variation margin inflows or outflows.

For corporate treasurers, choosing between forwards and futures is a trade-off between **customization without liquidity drag** (OTC forwards) versus **zero credit risk with daily liquidity volatility** (exchange futures).

## Diagram
### Architecture: Over-the-Counter Forwards vs. Exchange-Traded Futures

| Feature | Forward Contract (OTC) | Futures Contract (Exchange) | Executive Takeaway |
|---|---|---|---|
| **Trading Venue** | Bilateral OTC between banks/corporates | Central Exchange (e.g., CME Group) | Forwards are private; futures are public and transparent. |
| **Contract Terms** | 100% Bespoke (any amount, any date) | Standardized lot sizes and fixed expiration cycles | Forwards eliminate basis risk by matching exact operational cash flows. |
| **Credit Risk** | High counterparty default risk | Near-zero (Guaranteed by clearinghouse) | Must evaluate bank credit ratings on long-term OTC forwards. |
| **Cash Settlement** | Single settlement at maturity ($T$) | Daily mark-to-market variation margin | Futures require substantial liquid cash reserves for margin calls. |
| **Secondary Liquidity**| Illiquid (requires negotiated termination) | Highly liquid (close out position anytime) | Futures allow instant dynamic hedging adjustments. |

```
The Futures Daily Mark-to-Market Margin Engine
┌────────────────────────────────────────────────────────┐
│ Initial Margin Deposited (e.g., $10,000 per contract)   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
      ┌───────────────────────────────────────────┐
      │ Daily Settlement Price Announced by CCP   │
      └─────────────────────┬─────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ Price Rises (Gain)    │       │ Price Falls (Loss)    │
│ Excess cash credited  │       │ Cash deducted from    │
│ to margin account     │       │ margin account        │
└───────────────────────┘       └───────────┬───────────┘
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │ Balance < Maint Margin?│
                                └───────────┬───────────┘
                                            │ Yes
                                            ▼
                                ┌───────────────────────┐
                                │ MARGIN CALL: Deposit  │
                                │ cash immediately or   │
                                │ positions liquidated! │
                                └───────────────────────┘
```

## Common Misconceptions
- **Misconception 1: "Because futures are safer than forwards, corporations should always hedge with futures."**
  *Reality:* Daily mark-to-market on futures can trigger a catastrophic corporate liquidity crisis! In 1993, German conglomerate Metallgesellschaft nearly went bankrupt because its massive long oil futures hedges suffered billions in short-term daily margin calls when oil prices crashed, even though its forward retail customer contracts were fully protected long-term. Hedges using futures require immense liquid cash buffers.
- **Misconception 2: "Hedging with forward contracts is free because there is zero upfront premium."**
  *Reality:* While forwards require no upfront option-like cash premium, they embed **credit valuation adjustments (CVA)**, bank bid-ask spreads, and ISDA master agreement collateral lockups.
- **Misconception 3: "Futures prices and forward prices are always mathematically identical."**
  *Reality:* When interest rates are stochastic (variable) and positively correlated with asset prices, long futures contracts are slightly more valuable than forwards because margin gains earn high interest while margin losses are financed at low interest.

## Notes for Future-Me
When structuring currency or commodity hedges for corporate operations, match the instrument to your treasury's liquidity tolerance:
- If your operating cash flows occur on irregular dates (e.g., a \$47.3M equipment payment due on November 17th) and your treasury cannot tolerate daily wire transfers for margin swings, use an **OTC Forward** via an ISDA bank facility.
- If you need to dynamically scale hedges up or down as supply forecasts shift, use **Exchange Futures**, but pre-allocate a dedicated cash credit facility to fund worst-case $3\sigma$ margin call drawdowns.

