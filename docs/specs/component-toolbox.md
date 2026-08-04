# Component Toolbox

- Status: Living
- Last updated: 2026-08-04
- Owner: Carey Carroll
- Related ADRs: 0003, 0004

## Purpose

Defines the 12 reusable interactive components that serve the app's
interactive concept pages. Each component is data-configurable via a registry
entry's `defaults` field and follows the component contract in ADR-0003.

## Component Contract

Every component exposes:

```js
// js/tools/<component-id>.js
export function create(container, config) {
  // container: DOM element to mount into
  // config: merged { ...defaults from registry, ...user overrides }
  // returns { destroy(), update(newConfig) }
}
```

## Build Order (Leverage-First)

M4 delivers components 1–4 (~70 pages unlocked).
M5 delivers components 5–12 (~55 pages unlocked).

---

## 1. Cash-Flow Chart (`cash-flow-chart`)

**Purpose:** Visualize a stream of cash flows with adjustable timing, rate,
and growth. Foundation for every TVM-family concept.

**Config:**
```json
{
  "periods": 10,
  "cash_flows": [-1000, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
  "discount_rate": 0.10,
  "growth_rate": 0.00,
  "show_pv": true,
  "show_cumulative": true
}
```

**Concept pages served (~15):** tvm, npv-irr, dcf, terminal-value, fcf,
capital-budgeting, bond-pricing, ddm, ytm, discount-rate.

**Dependencies:** chart-core.

---

## 2. Payoff Diagram Builder (`payoff-diagram`)

**Purpose:** Render payoff at expiry for arbitrary multi-leg option
strategies. Optional current-value curve.

**Config:**
```json
{
  "spot": 100,
  "legs": [
    { "type": "call", "strike": 100, "premium": 5, "qty": 1 },
    { "type": "call", "strike": 110, "premium": 2, "qty": -1 }
  ],
  "show_current_value": true,
  "vol": 0.20,
  "rate": 0.05,
  "time_to_expiry": 0.25
}
```

**Concept pages served (~25):** all `strategy-*` entries, put-call-parity,
delta-hedging, gamma-scalping.

**Dependencies:** chart-core, black-scholes math utility.

---

## 3. Sensitivity Slider Panel (`sensitivity-panel`)

**Purpose:** Generic 1–3 slider driving a single computed output. Simplest
component; highest leverage per line of code.

**Config:**
```json
{
  "inputs": [
    { "id": "rate", "label": "Rate", "min": 0, "max": 0.20, "step": 0.001, "value": 0.05 },
    { "id": "vol",  "label": "Vol",  "min": 0.05, "max": 1.0, "step": 0.01, "value": 0.20 }
  ],
  "compute": "black-scholes-call",
  "output_label": "Call price",
  "output_format": "$0.00"
}
```

The `compute` field references a named function in the math utilities.

**Concept pages served (~20):** wacc, cost-of-equity, cost-of-debt,
capital-structure, black-scholes, ddm, duration, tax-shield, var,
implied-vol.

**Dependencies:** none beyond math utilities.

---

## 4. Financial Statement Reformulator (`fs-reformulator`)

**Purpose:** Toggle between as-reported and reformulated (Penman-style) BS
and IS. Show ROE decomposition update live.

**Config:**
```json
{
  "balance_sheet": [
    { "item": "Cash", "value": 100, "class": "financial" },
    { "item": "Receivables", "value": 200, "class": "operating" }
  ],
  "income_statement": [
    { "item": "Revenue", "value": 1000, "class": "operating" },
    { "item": "Interest expense", "value": 50, "class": "financial" }
  ],
  "show_roe_decomp": true
}
```

**Concept pages served (~10):** reformulated-bs, reformulated-is,
roe-decomposition, dupont, residual-income, valuation-reconciliation.

**Dependencies:** show-work component (from Managerial-Accounting port).

---

## 5. Greeks Visualizer (`greeks-visualizer`)

**Purpose:** Plot a chosen Greek across spot / time / vol. One page per
Greek, all reusing this component.

**Config:**
```json
{
  "greek": "delta",
  "x_axis": "spot",
  "spot_range": [50, 150],
  "strike": 100,
  "rate": 0.05,
  "vol": 0.20,
  "time_to_expiry": 0.25,
  "option_type": "call"
}
```

**Concept pages served (~7):** greeks-delta, greeks-gamma, greeks-theta,
greeks-vega, greeks-rho, greeks-charm, greeks-vanna.

**Dependencies:** chart-core, black-scholes math utility.

---

## 6. Scatter / Frontier Plotter (`frontier-plotter`)

**Purpose:** Two-dimensional scatter for portfolio theory. Efficient frontier,
CAL, CML, SML, two-asset combos.

**Config:**
```json
{
  "assets": [
    { "id": "A", "return": 0.08, "vol": 0.15 },
    { "id": "B", "return": 0.12, "vol": 0.25, "corr_A": 0.30 }
  ],
  "risk_free": 0.03,
  "show_frontier": true,
  "show_cal": true
}
```

**Concept pages served (~8):** efficient-frontier, cal-cml, capm, sml,
factor-models, diversification.

**Dependencies:** chart-core (scatter variant).

---

## 7. Monte Carlo Runner (`monte-carlo`)

**Purpose:** Run N simulated paths and plot outcome histogram + summary stats.

**Config:**
```json
{
  "process": "gbm",
  "s0": 100,
  "drift": 0.05,
  "vol": 0.20,
  "horizon": 1.0,
  "n_paths": 10000,
  "output": "terminal_value",
  "show_percentiles": [5, 50, 95]
}
```

**Concept pages served (~10):** monte-carlo, var, expected-shortfall,
dcf (probabilistic mode), terminal-value, black-scholes (MC pricing).

**Dependencies:** chart-core (histogram variant).

---

## 8. Yield Curve Plotter (`yield-curve`)

**Purpose:** Plot spot / forward / par curves with the ability to apply
parallel shifts and twists.

**Config:**
```json
{
  "tenors": [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
  "rates": [0.045, 0.046, 0.047, 0.048, 0.049, 0.050, 0.051, 0.052, 0.053, 0.054],
  "show_forward": true,
  "shift_bps": 0,
  "twist_bps": 0
}
```

**Concept pages served (~8):** yield-curve, bootstrapping, duration-hedging,
swaps-ir, hedging-ir, credit-spreads.

**Dependencies:** chart-core.

---

## 9. Binomial / Lattice Tree Stepper (`binomial-tree`)

**Purpose:** Step through a binomial pricing tree node-by-node. American
early-exercise decisions highlighted.

**Config:**
```json
{
  "s0": 100,
  "strike": 100,
  "rate": 0.05,
  "vol": 0.20,
  "steps": 5,
  "option_type": "call",
  "exercise_style": "american"
}
```

**Concept pages served (~6):** binomial-pricing, american-options,
real-options.

**Dependencies:** show-work component.

---

## 10. Multiples / Comparables Table (`multiples-table`)

**Purpose:** Editable table of comparables with weighted-average implied
value. Football-field style summary.

**Config:**
```json
{
  "target": { "ebitda": 100, "earnings": 60, "book_value": 400 },
  "comps": [
    { "name": "Peer A", "ev_ebitda": 12, "pe": 20, "pb": 2.5 },
    { "name": "Peer B", "ev_ebitda": 10, "pe": 18, "pb": 2.0 }
  ],
  "weights": { "ev_ebitda": 0.5, "pe": 0.3, "pb": 0.2 }
}
```

**Concept pages served (~5):** multiples, comparables, ma-mechanics,
private-company-val, valuation-reconciliation.

**Dependencies:** none.

---

## 11. Correlation Heatmap (`correlation-heatmap`)

**Purpose:** N×N correlation grid with color-coded cells.

**Config:**
```json
{
  "assets": ["SPY", "TLT", "GLD", "VNQ"],
  "matrix": [
    [1.00, -0.30, 0.10, 0.60],
    [-0.30, 1.00, 0.20, -0.10],
    [0.10, 0.20, 1.00, 0.15],
    [0.60, -0.10, 0.15, 1.00]
  ]
}
```

**Concept pages served (~4):** diversification, factor-models,
efficient-frontier (advanced view).

**Dependencies:** chart-core.

---

## 12. Decision Tree / Flowchart (`decision-tree`)

**Purpose:** Rules-based flowchart with clickable nodes. Used for choice
problems: entity selection, tax elections, hedging decisions.

**Config:**
```json
{
  "nodes": [
    { "id": "start", "question": "Multiple owners?", "yes": "q2", "no": "sole-prop" },
    { "id": "q2", "question": "Need liability protection?", "yes": "llc", "no": "gp" }
  ],
  "outcomes": {
    "sole-prop": "Sole proprietorship",
    "llc": "LLC",
    "gp": "General partnership"
  }
}
```

**Concept pages served (~6):** entity-choice, ma-tax, corporate-hedging,
capital-structure, trade-selection, exit-rules.

**Dependencies:** none.

---

## Total Leverage

| Component | Pages Served |
|---|---|
| 1. Cash-flow chart | 15 |
| 2. Payoff diagram | 25 |
| 3. Sensitivity panel | 20 |
| 4. FS reformulator | 10 |
| 5. Greeks visualizer | 7 |
| 6. Frontier plotter | 8 |
| 7. Monte Carlo | 10 |
| 8. Yield curve | 8 |
| 9. Binomial tree | 6 |
| 10. Multiples table | 5 |
| 11. Correlation heatmap | 4 |
| 12. Decision tree | 6 |
| **Total** | **124** |

## Shared Dependencies

- **chart-core** — foundational chart primitives, already ported from
  Managerial-Accounting. Used by components 1, 2, 5, 6, 7, 8, 11.
- **show-work** — step-by-step reveal, already ported. Used by 4, 9.
- **math utilities** (`js/lib/finance-math/`) — Black-Scholes, binomial,
  bond pricing, duration, VaR. Built during M4 alongside first components
  that need them.
