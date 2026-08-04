# Page Templates

- Status: Living
- Last updated: 2026-08-04
- Owner: Carey Carroll
- Related ADRs: 0002, 0003

## Purpose

Three page templates cover every concept page in the app. The router selects
a template based on the `template` field in a registry entry.

## Template Contract

Every template takes a resolved registry entry and produces a page. Templates
have three named regions:

1. **Header** — title, tier badge, domain badge, source citations
2. **Body** — template-specific content (formula box / prose / interactive tool)
3. **Footer** — "notes for future-me" section + related-concepts links

Header and footer are identical across all three templates. Only the body
differs.

---

## 1. `formula` Template

**Purpose:** Definition, formula, worked example. No interactivity.

**Body regions:**
- One-sentence intuition ("what this actually means")
- KaTeX-rendered formula
- Variable glossary (each symbol → plain-English meaning)
- Worked numerical example
- "When to use / when not to use"

**Registry fields consumed:**
- `title`, `sources`, `related` (universal)
- `prose_ref` — points to a markdown file with the intuition + example
- No `component` or `defaults` required

**Concept count:** ~40 pages (most Reference-tier pages + Core pages that
don't warrant a tool).

**Examples:** put-call-parity (Reference view), cost-of-debt, deferred-tax,
fx-parity, biases.

---

## 2. `explainer` Template

**Purpose:** Prose-heavy conceptual explanation with optional static diagram.
No live interactivity, but the diagram can be a rendered SVG.

**Body regions:**
- Longer intuition (2–4 paragraphs)
- One static diagram or table (SVG, image, or rendered markdown table)
- "Common misconceptions" callout
- Cross-references (in-line, not just footer)

**Registry fields consumed:**
- `title`, `sources`, `related`
- `prose_ref` — the main content
- Optional `diagram_ref` — path to SVG or image

**Concept count:** ~40 pages.

**Examples:** market-efficiency, capital-structure (conceptual view),
pe-fund-economics, ma-mechanics, prospect-theory.

---

## 3. `interactive` Template

**Purpose:** Body is dominated by a live component from the toolbox.

**Body regions:**
- Short intuition (1–2 paragraphs) above the fold
- **Mounted interactive component** (full-width)
- Below the component: worked example that recreates a specific scenario
  the user can trigger via a "load example" button
- Formula box (collapsed by default; can expand)

**Registry fields consumed:**
- `title`, `sources`, `related`
- `component` — required; component ID from the toolbox
- `defaults` — required; initial config for the component
- `prose_ref` — optional; if omitted, template uses a default explainer stub
- `examples` — optional array of named scenarios that load into the component

**Concept count:** ~55 pages (Core-tier + Greeks + strategies).

**Examples:** black-scholes, npv-irr, efficient-frontier, greeks-delta,
strategy-covered-call, var, wacc, duration.

---

## Shared Elements (All Templates)

### Header

```
+------------------------------------------------------------------+
| Black-Scholes Option Pricing                       [Core] [deriv]|
| Primary: Hull Ch. 15 · also: Natenberg Ch. 5, Bodie Ch. 21      |
+------------------------------------------------------------------+
```

### Footer: Notes for Future-Me

Every page has a "notes for future-me" section, sourced from
`prose_ref` under a `## Notes for future-me` heading. Kept intentionally
informal — this is where future-me writes to future-future-me.

If the section is empty in the prose file, the template renders a subtle
placeholder ("no notes yet"). The M6 content-fill milestone closes when
every Core page has real content here.

### Footer: Related Concepts

Rendered from the `related` array in the registry entry. Each item is a link
to another concept page, labeled with its title and domain badge.

---

## Non-Template Pages

Some pages don't use any of the three templates:

- **Formulas index** (`/formulas`) — already exists, will be extended to
  cross-link to concept pages in M6
- **Glossary** (`/glossary`) — already exists, same
- **Concept index** (`/learn`) — new in M3, generated from registry, grouped
  by domain
- **Bibliography** (`/reference/bibliography`) — new in M3, generated from
  the bibliography reference file

These are one-off pages, not registry-driven.
