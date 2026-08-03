
# Executive-Finance

Personal, interactive finance reference app. Designed to let future-me reload
intuition on any core corporate finance, investments, or derivatives concept
in about ten minutes — organized by **concept**, driven by **interactive
tools**, with notes written for future-me.

**Live:** https://careycarroll.github.io/Executive-Finance/

## Goal

A long-lived study companion I can return to years from now to refresh core
finance knowledge. Not a portfolio piece, not a public teaching tool — a
personal reference optimized for durability and rapid re-education.

## Scope

Organized around **concepts**, not chapters. Content is sourced from a
library of ten reference texts covering four domains:

| Domain                                   | Primary Sources                                        |
| ---------------------------------------- | ------------------------------------------------------ |
| Corporate finance                        | Hawawini & Viallet,*Finance for Executives*          |
| Investments / portfolio theory           | Bodie, Kane & Marcus,*Investments*                   |
| Fixed income & derivatives theory        | Bodie; Hull,*Options, Futures and Other Derivatives* |
| Options trading                          | Natenberg; Sinclair,*Positional Option Trading*      |
| Financial statement analysis & valuation | Penman; Easton; Lundholm & Sloan                       |
| Business taxation                        | Scholes, Wolfson, Erickson et al.                      |

Full bibliography: [`docs/reference/bibliography.md`](docs/reference/bibliography.md).

## Architecture

- **Stack:** Vite 7 + vanilla JS + CSS custom properties, deployed as a PWA
  on GitHub Pages. Chosen for minimal framework churn over a long lifetime.
- **Content model:** Concept pages are generated from
  [`concepts/registry.json`](concepts/registry.json). Adding a new concept
  means editing JSON, not writing new page code.
- **Interactive components:** A shared toolbox of ~12 reusable finance tools
  (Black-Scholes, payoff diagrams, Monte Carlo, efficient frontier, etc.)
  serves ~125 of the ~300 possible concept pages.
- **Static templates:** Formula, explainer, and glossary templates cover the
  remaining pages.

## Repo Layout

```
Executive-Finance/
├── .github/           # workflows, PR template, CODEOWNERS
├── docs/
│   ├── decisions/     # ADRs (MADR format)
│   ├── specs/         # concept list, component toolbox, page templates
│   └── reference/     # bibliography, concept-to-book crosswalk
├── concepts/
│   └── registry.json  # single source of truth for content
├── css/
├── js/
│   ├── components/    # shared UI components
│   ├── charts/        # chart library
│   ├── tools/         # 12 interactive finance tools
│   ├── templates/     # page templates that consume registry entries
│   └── core/
├── pages/
│   ├── learn/
│   ├── analyze/
│   ├── formulas.html
│   └── glossary.html
├── tests/
└── index.html
```

## Development

```bash
npm install
npm run dev              # local dev server
npm run build            # production build
npm run validate:registry
```

## Decisions

Architectural direction is recorded as ADRs in
[`docs/decisions/`](docs/decisions/). Read those first when returning to the
project after a break.
