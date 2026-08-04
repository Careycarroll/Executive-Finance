# Concept List

- Status: Living
- Last updated: 2026-08-04
- Owner: Carey Carroll
- Related ADRs: 0001, 0002

## Purpose

The master list of concepts the app covers. Each concept becomes one entry in
`concepts/registry.json` and one page in the app.

## Conventions

- **Tier:** `Core` = deep treatment, usually interactive. `Reference` = short
  page, definition + formula + when-to-use.
- **Primary source** is the book future-me should open first when reloading
  the concept. Other books may also cover it (see crosswalk).
- **Domain codes:** corpfin, invest, deriv, fsa, tax, macro, risk, behav.
- IDs are kebab-case and stable — used in URLs and cross-references.

---

## 1. Foundations (corpfin)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| tvm | Time value of money | Core | Hawawini |
| discount-rate | Discount rates and opportunity cost | Core | Hawawini |
| risk-return | Risk-return tradeoff | Core | Bodie |
| diversification | Diversification and correlation | Core | Bodie |

## 2. Corporate Finance (corpfin)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| fcf | Free cash flow (FCFF vs. FCFE) | Core | Hawawini |
| npv-irr | NPV and IRR | Core | Hawawini |
| wacc | Cost of capital and WACC | Core | Hawawini |
| cost-of-equity | Cost of equity (CAPM, DDM, build-up) | Core | Hawawini |
| cost-of-debt | Cost of debt (after-tax) | Core | Hawawini |
| capital-structure | Capital structure and MM propositions | Core | Hawawini |
| dividend-policy | Dividend policy and payout | Reference | Hawawini |
| working-capital | Working capital management | Core | Hawawini |
| capital-budgeting | Capital budgeting decisions | Core | Hawawini |
| real-options | Real options in capital budgeting | Reference | Hawawini |

## 3. Financial Statement Analysis (fsa)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| reformulated-bs | Reformulated balance sheet | Core | Penman |
| reformulated-is | Reformulated income statement | Core | Penman |
| roe-decomposition | ROE decomposition (Penman-style) | Core | Penman |
| dupont | DuPont analysis | Core | Easton |
| accrual-quality | Accrual quality and earnings management | Core | Penman |
| cash-flow-analysis | Cash flow statement analysis | Core | Easton |
| revenue-recognition | Revenue recognition | Reference | Easton |
| lease-accounting | Lease accounting | Reference | Easton |
| stock-comp | Stock-based compensation | Reference | Easton |
| deferred-tax-fsa | Deferred taxes on the financial statements | Reference | Easton |

## 4. Valuation (fsa)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| dcf | DCF valuation (enterprise vs. equity) | Core | Lundholm/Sloan |
| terminal-value | Terminal value assumptions | Core | Lundholm/Sloan |
| residual-income | Residual income / EVA valuation | Core | Penman |
| ddm | Dividend discount model | Core | Bodie |
| multiples | Relative valuation and multiples | Core | Easton |
| comparables | Selecting comparables | Reference | Easton |
| private-company-val | Private company valuation adjustments | Reference | Lundholm/Sloan |
| valuation-reconciliation | Reconciling valuation methods | Core | Penman |

## 5. Investments & Portfolio Theory (invest)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| efficient-frontier | Efficient frontier | Core | Bodie |
| cal-cml | Capital allocation and capital market lines | Core | Bodie |
| capm | CAPM and beta | Core | Bodie |
| sml | Security market line | Core | Bodie |
| factor-models | Factor models (Fama-French, momentum) | Core | Bodie |
| market-efficiency | Market efficiency (EMH forms) | Core | Bodie |
| active-vs-passive | Active vs. passive and alpha | Reference | Bodie |
| performance-attribution | Performance attribution | Reference | Bodie |
| index-construction | Index construction basics | Reference | Bodie |

## 6. Fixed Income (invest)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| bond-pricing | Bond pricing mechanics | Core | Bodie |
| ytm | Yield to maturity and yield measures | Core | Bodie |
| duration | Macaulay and modified duration | Core | Bodie |
| convexity | Convexity | Core | Bodie |
| duration-hedging | Duration-based hedging | Core | Bodie |
| yield-curve | Yield curve and term structure | Core | Bodie |
| bootstrapping | Bootstrapping the spot curve | Reference | Bodie |
| credit-spreads | Credit spreads and default risk | Core | Bodie |

## 7. Derivatives — Theory (deriv)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| forwards-futures | Forwards vs. futures (mechanics) | Core | Hull |
| futures-pricing | Cost-of-carry and futures pricing | Core | Hull |
| put-call-parity | Put-call parity | Core | Hull |
| binomial-pricing | Binomial option pricing | Core | Hull |
| black-scholes | Black-Scholes model | Core | Hull |
| american-options | American options and early exercise | Reference | Hull |
| swaps-ir | Interest rate swaps | Core | Hull |
| swaps-fx | Currency swaps | Reference | Hull |
| exotic-options | Exotic options overview | Reference | Hull |

## 8. Options — Greeks (deriv)

Each Greek is its own page, reusing the Greeks-visualizer component.

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| greeks-delta | Delta | Core | Hull |
| greeks-gamma | Gamma | Core | Hull |
| greeks-theta | Theta | Core | Hull |
| greeks-vega | Vega | Core | Hull |
| greeks-rho | Rho | Reference | Hull |
| greeks-charm | Charm | Reference | Natenberg |
| greeks-vanna | Vanna | Reference | Natenberg |

## 9. Options — Applied Trading (deriv)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| implied-vol | Implied vs. realized volatility | Core | Natenberg |
| vol-skew | Volatility skew and smile | Core | Natenberg |
| vol-surface | Volatility surface | Reference | Natenberg |
| delta-hedging | Delta hedging in practice | Core | Natenberg |
| gamma-scalping | Gamma scalping | Reference | Natenberg |
| strategy-covered-call | Covered call | Core | Natenberg |
| strategy-protective-put | Protective put | Core | Natenberg |
| strategy-collar | Collar | Reference | Natenberg |
| strategy-straddle | Straddle / strangle | Core | Natenberg |
| strategy-spread-vertical | Vertical spreads (bull/bear) | Core | Natenberg |
| strategy-condor | Iron condor | Reference | Natenberg |
| strategy-butterfly | Butterfly | Reference | Natenberg |
| strategy-calendar | Calendar / diagonal spreads | Reference | Natenberg |
| strategy-ratio | Ratio spreads | Reference | Natenberg |
| position-sizing | Position sizing and Kelly | Core | Sinclair |
| edge-and-ev | Edge and expected value | Core | Sinclair |
| trade-selection | Trade selection rules | Reference | Sinclair |
| exit-rules | Exit rules and trade management | Reference | Sinclair |

## 10. Risk Management (risk)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| var | Value at Risk (VaR) | Core | Hull |
| expected-shortfall | Expected shortfall (CVaR) | Core | Hull |
| monte-carlo | Monte Carlo simulation | Core | Hull |
| scenario-analysis | Scenario analysis and stress testing | Core | Hawawini |
| hedging-fx | Hedging FX exposure | Core | Hawawini |
| hedging-ir | Hedging interest rate exposure | Core | Hull |
| corporate-hedging | Corporate hedging strategy | Reference | Hawawini |

## 11. Business Taxation (tax)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| entity-choice | Entity choice (C-corp, S-corp, LLC, partnership) | Core | Scholes/Wolfson |
| tax-shield | Tax shields and after-tax cost of debt | Core | Scholes/Wolfson |
| deferred-tax | Deferred taxes and NOLs | Core | Scholes/Wolfson |
| tax-comp | Tax-efficient compensation | Core | Scholes/Wolfson |
| ma-tax | M&A tax structuring basics | Reference | Scholes/Wolfson |
| international-tax | Cross-border and transfer pricing | Reference | Scholes/Wolfson |
| tax-clienteles | Tax clienteles and implicit taxes | Reference | Scholes/Wolfson |

## 12. Macro & Rates (macro)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| fed-policy | How the Fed transmits rates | Core-light | external |
| inflation | Real vs. nominal returns | Core | Bodie |
| fx-parity | FX and interest rate parity | Core | Hull |
| balance-of-payments | Balance of payments basics | Reference | external |

## 13. Behavioral (behav)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| prospect-theory | Prospect theory and loss aversion | Core-light | Bodie |
| biases | Common biases (overconfidence, anchoring, recency) | Core-light | Bodie |

## 14. Reference Tier (educational only)

| ID | Title | Tier | Primary Source |
|---|---|---|---|
| ma-mechanics | M&A deal mechanics and accretion/dilution | Reference | external |
| lbo | LBO structure and returns math | Reference | external |
| pe-fund-economics | PE fund economics (2-and-20, waterfalls) | Reference | external |
| vc-mechanics | VC stages and term sheets | Reference | external |
| real-estate-val | Real estate valuation (cap rates, NOI) | Reference | external |

---

## Counts

| Domain | Core | Reference | Total |
|---|---|---|---|
| corpfin (incl. foundations) | 12 | 2 | 14 |
| fsa (incl. valuation) | 12 | 6 | 18 |
| invest (incl. fixed income) | 12 | 5 | 17 |
| deriv (incl. Greeks + strategies) | 15 | 15 | 30 |
| risk | 6 | 1 | 7 |
| tax | 4 | 3 | 7 |
| macro | 2 | 2 | 4 |
| behav | 2 | 0 | 2 |
| reference-only | 0 | 5 | 5 |
| **Total** | **65** | **39** | **104** |

## Interactive vs. Static Split

Per ADR-0003, ~125 pages benefit from interactive components. Since this list
has 104 entries, the effective mapping is roughly:

- ~55 pages with a Core-tier interactive tool
- ~10 pages with a Reference-tier interactive tool (mostly Greeks + strategies)
- ~40 pages using static formula/explainer templates only

The remaining ~20 interactive pages ADR-0003 anticipated come from expected
list growth during M6 content fill.
