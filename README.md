# Executive-Finance

Personal, interactive finance reference app. Designed to let future-me reload
intuition on any core corporate finance, financial statement analysis,
investments, derivatives, risk, tax, macro, or behavioral finance concept in
about ten minutes — organized by **concept**, driven by **interactive tools**,
with portable Markdown notes written for future-me.

**Live:** https://careycarroll.github.io/Executive-Finance/

## Goal

A long-lived study companion I can return to years from now to refresh core
finance knowledge. Not a portfolio piece, not a public teaching tool — a
personal reference optimized for durability, zero framework churn, and rapid
re-education.

## Coverage (109 Concepts Across 8 Domains)

Organized around **109 canonical concepts** (**72 Core** interactive/formula
pages + **37 Reference** deep-dive explainers), sourced from a 12-book
reference library across 8 domains:

| Domain | Core | Reference | Total | Primary Sources |
| --- | ---: | ---: | ---: | --- |
| **Corporate Finance** (`corpfin`) | 12 | 6 | 18 | Hawawini & Viallet, *Finance for Executives* (6e) |
| **Financial Statement Analysis & Valuation** (`fsa`) | 13 | 6 | 19 | Penman; Easton et al.; Lundholm & Sloan; Horngren |
| **Investments & Fixed Income** (`invest`) | 13 | 5 | 18 | Bodie, Kane & Marcus, *Investments* (13e) |
| **Derivatives & Option Strategies** (`deriv`) | 19 | 15 | 34 | Hull (11e); Natenberg (+ Workbook); Sinclair |
| **Risk Management** (`risk`) | 6 | 1 | 7 | Hull; Hawawini & Viallet; Sinclair |
| **Tax & Business Strategy** (`tax`) | 4 | 3 | 7 | Scholes, Wolfson, Erickson et al. (5e) |
| **Macroeconomics & International** (`macro`) | 3 | 1 | 4 | Bodie, Kane & Marcus; Hawawini & Viallet |
| **Behavioral Finance** (`behav`) | 2 | 0 | 2 | Bodie, Kane & Marcus; Sinclair |
| **Total** | **72** | **37** | **109** | Full bibliography: [`docs/reference/bibliography.md`](docs/reference/bibliography.md) |

In addition to the 109 concept pages:
- **Learn Index (`/pages/learn/`):** Real-time multi-token search (`/` to focus, `Escape` to clear) across titles, domains, book citations, related concepts, and prose content, plus Tier (`Core` / `Reference`) and 8-domain filter pills.
- **Formulas (`/pages/formulas.html`):** All 32 core textbook equations rendered with KaTeX and cross-linked directly to their corresponding interactive concept pages.
- **Glossary (`/pages/glossary.html`):** All 635 textbook glossary terms searchable by keyword and chapter, with every term cross-linked to its corresponding concept page.

## Architecture

- **Stack:** Vite 7 + vanilla ES modules + CSS custom properties + KaTeX,
  deployed as an offline-capable PWA on GitHub Pages.
- **Content model:** Concept pages are generated at build time from
  [`concepts/registry.json`](concepts/registry.json) and Markdown prose files in
  [`concepts/prose/`](concepts/prose/) via [`scripts/generate-pages.js`](scripts/generate-pages.js).
  The Markdown files in `concepts/prose/*.md` use clean headings and KaTeX
  math (`$...$` / `$$...$$`), making them directly portable to an Obsidian vault.
- **Interactive component toolbox (12 shared tools):**
  1. `cash-flow-chart` — TVM, NPV/IRR, DCF, annuities, bond cash flows
  2. `payoff-diagram` — Multi-leg option strategies, put-call parity, spreads, straddles
  3. `sensitivity-panel` — WACC, CAPM, Black-Scholes, DDM, duration, tax shields
  4. `fs-reformulator` — Penman reformulated balance sheet & income statement, DuPont, ROE, EVA
  5. `greeks-visualizer` — Delta, Gamma, Theta, Vega, implied vol & skew profiles
  6. `frontier-plotter` — Efficient frontier, CAL/CML, SML, diversification & factor models
  7. `monte-carlo` — VaR, Expected Shortfall (CVaR), Kelly position sizing, stress testing
  8. `yield-curve` — Term structure, YTM, credit spreads, FX parity, inflation & Fed policy
  9. `lattice-stepper` — Binomial option pricing tree stepper
  10. `multiples-table` — Comparable multiples (EV/EBITDA, P/E, P/B) & valuation football field
  11. `correlation-heatmap` — Multi-asset correlation matrix & portfolio variance
  12. `decision-tree` — Entity choice, capital allocation, swaps & corporate hedging flowcharts
- **Static templates:** `interactive`, `formula`, and `explainer` templates render all 109 registry entries uniformly.

## Repo Layout

```
Executive-Finance/
├── .github/             # CI/CD workflows, PR template, CODEOWNERS
├── docs/
│   ├── decisions/       # ADRs (MADR format, ADR-0001 through ADR-0004)
│   ├── specs/           # concept list, component toolbox, page templates
│   └── reference/       # 12-book bibliography, concept-to-book crosswalk
├── concepts/
│   ├── registry.json    # single source of truth (109 concepts, 12 books)
│   ├── schema.json      # JSON Schema draft-07 enforced on every build/PR
│   └── prose/           # 109 Markdown concept notes (Obsidian-compatible)
├── scripts/
│   ├── validate-registry.js
│   └── generate-pages.js
├── css/
├── js/
│   ├── components/      # shared UI components
│   ├── charts/          # canvas chart primitives
│   ├── tools/           # 12 interactive finance tools
│   ├── templates/       # interactive, formula, explainer templates
│   ├── learn/           # Learn index search/filters, glossary, formulas
│   └── core/            # router & core utilities
├── pages/
│   ├── learn/           # 109 generated concept pages + index.html
│   ├── analyze/         # standalone financial statement & ratio analyzers
│   ├── formulas.html    # 32 cross-linked formulas
│   └── glossary.html    # 635 cross-linked glossary terms
├── public/
│   └── tools/           # browser-importable ES modules for dynamic tool mounting
├── tests/               # 15 Vitest suites (101 tests: schema + golden math + DOM)
└── index.html
```

## Development

```bash
npm install
npm run generate:pages     # generate static HTML concept pages from registry.json
npm run validate:registry  # validate registry.json schema & referential integrity
npm test                   # run all 15 Vitest test suites (101 tests)
npm run dev                # local Vite dev server
npm run build              # validate + generate pages + production Vite build
```

## Decisions

Architectural direction is recorded as ADRs in
[`docs/decisions/`](docs/decisions/). Read those first when returning to the
project after a break.

