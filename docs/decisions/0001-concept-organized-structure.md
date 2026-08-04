# ADR-0001: Concept-organized structure

- Status: Accepted
- Date: 2026-08-04
- Deciders: Carey Carroll
- Tags: architecture, content-model

## Context and Problem Statement

The Executive-Finance app was originally scaffolded as a chapter-by-chapter
interactive companion to a single textbook — Hawawini & Viallet, *Finance for
Executives*, 6e. Chapter 1 was built out with five interactive tools; chapters
2–18 were planned but not started.

Since then, the scope has expanded substantially. The reference library now
spans ten books across four domains:

- **Corporate finance:** Hawawini & Viallet
- **Investments / portfolio theory:** Bodie, Kane & Marcus
- **Derivatives:** Hull; Natenberg (+ Workbook); Sinclair
- **Financial statement analysis & valuation:** Penman; Easton; Lundholm & Sloan
- **Business taxation:** Scholes, Wolfson, Erickson et al.

The original chapter-per-page structure no longer fits the goal. Many concepts
(Black-Scholes, CAPM, WACC, duration, reformulated statements) appear in
multiple books with different depth and framing. A chapter-organized structure
forces either duplicated content across chapters, or an arbitrary
"which book is the spine" decision that ages badly.

The stated purpose of the tool has also sharpened: **a personal, long-lived
interactive reference the author can return to years from now to reload
intuition on any core finance concept in roughly ten minutes.** The audience
is future-me, not students or employers.

## Decision

Organize the app around **concepts**, not chapters or books.

- Each concept gets one page.
- Each concept page cites which books (and chapter sections) treat it, with
  a designated primary source.
- Chapter membership is metadata on a concept, not the organizing principle.
- The concept list itself becomes a spec artifact
  (`docs/specs/concept-list.md`) with ~100 entries, tagged Core or Reference.

## Consequences

**Positive:**
- One canonical page per concept — no duplication across chapters.
- New books can be added as additional sources on existing concept pages
  without restructuring.
- Future-me searches by concept ("what was the intuition on delta hedging?"),
  which matches how re-education actually happens.
- Enables the registry-driven page model in ADR-0002.

**Negative:**
- Loses the "read the textbook alongside" affordance of a chapter-organized
  companion. Mitigated by the concept-to-book crosswalk
  (`docs/reference/concept-to-book-crosswalk.md`).
- Requires deciding, per concept, which book is the primary source. Some
  overlap (Penman vs. Easton vs. Lundholm on FSA) will need judgment calls.
- Chapter 1's existing hardcoded pages need to be retired or migrated to
  the concept model in M3.

**Neutral:**
- The app's URL structure changes from `/learn/ch1/...` to `/learn/<concept-id>`.
  No external users, so no backward-compatibility burden.

## Alternatives Considered

1. **Keep Hawawini as the single spine, treat other books as supplements.**
   Rejected: forces Bodie's portfolio theory and Hull's derivatives depth
   into "supplement" status when they're actually where the interactive
   payoff is highest for future-me's re-education needs.

2. **One section per book, chapter-organized within each.**
   Rejected: massive content duplication (Black-Scholes would live in Hull,
   Bodie, and Natenberg sections simultaneously) and no single canonical
   page to return to.

3. **Two spines — Hawawini for corp finance, Bodie for investments — with
   derivatives as a third section.**
   Rejected: still requires arbitrary decisions on overlap topics (cost of
   capital, risk-return) and doesn't scale to the FSA and tax books.

## References

- `docs/specs/concept-list.md` — the ~100 concepts organized by domain
- `docs/reference/bibliography.md` — the 10-book library
- `docs/reference/concept-to-book-crosswalk.md` — every concept mapped to
  its book chapter(s)
- ADR-0002: Registry-driven concept pages
- ADR-0003: Shared component toolbox
