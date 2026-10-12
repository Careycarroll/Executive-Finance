# Valuation Reconciliation & Triangulation

## Intro
No single valuation methodology holds a monopoly on the truth. Discounted Cash Flow (DCF), Residual Operating Income (ReOI), and Comparable Multiples (Comps) each view the enterprise through a distinct analytical lens:
- **DCF:** Anchors on long-term operating cash flows and cost of capital, but is highly sensitive to terminal value growth and discount rate assumptions.
- **Residual Operating Income (ReOI):** Anchors on current audited balance sheet assets, forecasting the duration and magnitude of abnormal economic rents (the competitive moat). Under identical accounting assumptions, DCF and ReOI yield mathematically identical valuations!
- **Comparable Multiples:** Anchors on real-time capital market pricing of peer firms, capturing current market sentiment, but assumes the target is economically identical to the peer average.

**Valuation Reconciliation (Triangulation)** is the executive discipline of synthesizing these diverse methodologies into a coherent, defensible valuation range—typically displayed in a **"Football Field"** chart—to guide M&A bidding, IPO pricing, or strategic fairness opinions.

## Diagram
### The Valuation Football Field Triangulation

```
Valuation Method                      Implied Enterprise Value ($ Millions)
                                 $200M          $300M          $400M          $500M
─────────────────────────────────┼──────────────┼──────────────┼──────────────┼─────────►
1. DCF Valuation (Base WACC)                    ├═════════════════════┤
   ($280M - $420M)                              │                     │
                                                │                     │
2. Residual Operating Income (ReOI)             ├══════════════════┤  │
   ($290M - $395M)                              │                  │  │
                                                │                  │  │
3. Public Comps (Harmonic EV/EBITDA)     ├══════════════════┤      │  │
   ($240M - $350M)                       │                  │      │  │
                                         │                  │      │  │
4. Precedent M&A Transactions                   │       ├═════════════════════════┤
   ($330M - $480M, Control Premium)             │       │                         │
─────────────────────────────────┼──────────────┼──────────────┼──────────────┼─────────►
★ Executive Consensus Target:                   ▲ ── $340M - $370M ── ▲
```

### The Three Pillars of Triangulation

| Methodology | Primary Anchor | Key Vulnerability | Best Used For |
|---|---|---|---|
| **DCF (Enterprise FCFF)** | 5-10 year cash flow projections & WACC | Terminal value assumptions dominate total result. | Standalone intrinsic value independent of market froth. |
| **Residual Income (ReOI)** | Balance sheet Net Operating Assets today ($\text{NOA}_0$) | Requires clean-surplus accounting adjustments. | Cross-checking DCF when terminal growth is contentious. |
| **Trading Multiples** | Current peer market multiples (EV/EBITDA) | Bubbles or market troughs distort entire peer sector. | Realistic near-term IPO or market exit pricing. |
| **Precedent M&A Deals** | Historical transaction prices paid for targets | Includes control premiums and idiosyncratic synergies. | Bidding wars and M&A fairness opinions. |

## Common Misconceptions
- **Misconception 1: "If DCF and Comps disagree by 50%, one of them must be completely wrong."**
  *Reality:* Discrepancies between DCF and Comps reveal market mispricing or flawed assumptions. If DCF says $\$400\text{M}$ while Comps say $\$250\text{M}$, the market either does not believe management's growth forecast, or the target possesses unique intellectual property and margin advantages that the public comps lack.
- **Misconception 2: "Precedent transactions should match public trading comps."**
  *Reality:* Precedent M&A transactions almost always trade at a $25\%-40\%$ premium over public trading comps because corporate acquirers pay a **control premium** and price in buyer-specific cost and revenue synergies.
- **Misconception 3: "A football field chart is just an average of all the methods."**
  *Reality:* Never take a mechanical unweighted average of different valuation methods! If comps are distorted by an artificial industry bubble or if DCF terminal growth is disconnected from reality, averaging them merely averages your errors.

## Notes for Future-Me
When presenting to a board of directors or investment committee, never present a single-point valuation number (e.g., "The company is worth exactly $\$342.5\text{M}$"). Precision is not accuracy. A single number invites endless debate over micro-assumptions. 

Instead, present the **Triangulated Range**:
*"Under intrinsic DCF at an 8.5% WACC, value is $\$320\text{M}-\$380\text{M}$; under peer market trading multiples, value is $\$300\text{M}-\$350\text{M}$; with full control synergies in an M&A auction, precedent deals suggest $\$360\text{M}-\$420\text{M}$. We recommend bidding between $\$330\text{M}$ and $\$350\text{M}$ to capture attractive risk-adjusted upside."*

That framing turns a theoretical accounting debate into an actionable strategic negotiation posture.

