# ADR-0003: Shared component toolbox

- Status: Accepted
- Date: 2026-08-04
- Deciders: Carey Carroll
- Tags: architecture, ui, components
- Depends on: ADR-0001, ADR-0002

## Context and Problem Statement

Roughly 125 of the ~100–300 possible concept pages benefit from
**interactivity** — sliders, live charts, payoff diagrams, Monte Carlo
outputs, etc. For a personal reference tool whose value is "reload intuition
in ten minutes," interactivity is often the difference between reading past
a topic and actually re-learning it.

The naive approach — build a bespoke interactive component per concept page
— does not scale. It would mean writing ~125 custom widgets, most of which
are variations on a small number of underlying patterns (a chart with sliders,
a payoff diagram, a Monte Carlo runner).

The Managerial-Accounting repo has already demonstrated the alternative:
a small set of shared components (chart-core, CVP chart, scatter chart,
ROC chart, randomizer, show-work, journal-entry) reused across 24 chapters.
Executive-Finance already inherits chart-core from that lineage.

## Decision

Build a **shared toolbox of ~12 reusable interactive components** that
together serve the ~125 interactive-worthy concept pages. Each component
is data-configurable via a registry entry's `defaults` field and is wired
into pages by the `component` field in the registry.

### The toolbox

Ordered by leverage (concept pages served, roughly):

1. **Cash-flow chart with sliders** (~15 pages) — TVM, NPV, IRR, DCF,
   terminal value, bond pricing, annuities.
2. **Payoff diagram builder, multi-leg** (~25 pages) — every option strategy,
   put-call parity, spreads, straddles, condors.
3. **Sensitivity slider panel** (~20 pages) — WACC, cost of equity/debt,
   Black-Scholes price, DDM, duration/price, tax shield.
4. **Financial statement reformulator** (~10 pages) — reformulated BS/IS,
   ROE decomposition, EVA/residual income, accrual analysis.
5. **Greeks visualizer** (~7 pages) — delta, gamma, theta, vega, rho, charm,
   vanna, each as a separate concept page reusing the same component.
6. **Scatter / frontier plotter** (~8 pages) — efficient frontier, CAL, CML,
   SML, two-asset portfolios, factor exposures.
7. **Monte Carlo runner** (~10 pages) — VaR, expected shortfall, DCF Monte
   Carlo, terminal value distribution, option pricing by simulation.
8. **Yield curve / term structure plotter** (~8 pages) — spot curve, forward
   curve, bootstrapping, parallel shifts, twists.
9. **Binomial / lattice tree stepper** (~6 pages) — binomial option pricing,
   American early exercise, real options, decision trees.
10. **Multiples / comparables table** (~5 pages) — P/E, EV/EBITDA, P/B, PEG,
    precedent transactions, football field valuation.
11. **Correlation heatmap** (~4 pages) — asset correlations, factor loadings,
    sector correlations, portfolio covariance.
12. **Decision tree / flowchart** (~6 pages) — entity choice, tax elections,
    hedging decisions, capital structure choice, trade selection rules.

### Build order (leverage-first)

M4 (Core toolbox — top 4 by leverage):
1, 2, 3, 4 — unlocks ~70 pages.

M5 (Specialist toolbox — remaining 8):
5, 6, 7, 8, 9, 10, 11, 12 — unlocks the remaining ~55.

### Component contract

Every component in the toolbox exposes the same shape:

```js
// js/tools/<component-id>.js
export function create(container, config) {
  // container: DOM element
  // config: merged { ...defaults from registry, ...user overrides }
  // returns { destroy(), update(newConfig) }
}
```

This lets the router mount any component into any concept page uniformly.

### Testing

Per ADR-0004, every component ships with Vitest unit tests using
textbook-sourced golden values (Hull examples for options; Bodie examples
for CAPM/duration; Hawawini for NPV/WACC; Penman for reformulation).

## Consequences

**Positive:**
- ~125 pages built from 12 components, not 125 custom widgets.
- Component development cost is amortized across many pages.
- Uniform look-and-feel across the app without visual-consistency policing.
- New concepts can often reuse an existing component with different
  `defaults` — zero new code.

**Negative:**
- Components must be designed with reuse in mind from day one, which is
  slower than one-off widgets initially.
- Some concepts will strain a component's config surface and require
  extensions. Accepted: extensions are cheaper than parallel components.
- The 12-component target is a design goal, not a hard cap. If a 13th
  emerges from real needs, add it; if two collapse into one, collapse.

## Alternatives Considered

1. **One custom widget per page.**
   Rejected: does not scale, produces inconsistent UX, punishes future-me
   with 125 codebases-in-miniature to maintain.

2. **A single "mega-component" configurable enough to render anything.**
   Rejected: config surface would be unusable, testing would be a nightmare,
   and small changes would risk regressions across unrelated pages.

3. **Adopt a charting library (D3, Chart.js, Highcharts) and skip custom
   components.**
   Rejected: charting library alone doesn't cover payoff diagrams, Monte
   Carlo histograms with slider inputs, or the FS reformulator toggle. And
   framework churn risk over the tool's intended 5–10 year lifespan is real.
   The existing chart-core (already ported from Managerial-Accounting)
   provides the primitives; the toolbox is domain-specific composition on top.

## References

- ADR-0001: Concept-organized structure
- ADR-0002: Registry-driven concept pages
- ADR-0004: Testing strategy
- `docs/specs/component-toolbox.md` — detailed component APIs (produced in M1)
- Managerial-Accounting `js/charts/` and `js/components/` — pattern source
