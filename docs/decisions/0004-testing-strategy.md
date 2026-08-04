# ADR-0004: Testing strategy

- Status: Accepted
- Date: 2026-08-04
- Deciders: Carey Carroll
- Tags: testing, quality
- Depends on: ADR-0002, ADR-0003

## Context and Problem Statement

Executive-Finance is a personal, long-lived reference tool. The author will
return to it years from now — potentially after long gaps — to reload
intuition on finance concepts. Testing decisions must serve **that** goal,
not the goals that shape a typical production codebase (regression coverage
for a shipping product, protection against a large contributor pool, etc.).

Two specific risks matter most for this project:

1. **Silent math errors.** If a Black-Scholes implementation is subtly wrong,
   future-me will re-learn incorrect intuition. Wrong finance math is worse
   than no tool.
2. **Registry drift.** The `concepts/registry.json` is the app's backbone
   (ADR-0002). If entries can be added with missing fields, broken source
   references, or unknown component IDs, the app degrades silently.

Testing that doesn't address those two risks is optional. Testing that does
address them is essential.

## Decision

Adopt a **three-tier testing philosophy**, in strict priority order. Higher
tiers are non-negotiable; lower tiers are opportunistic.

### Tier 1 — Data integrity (registry validation)

- Runs on every PR via `pr-validate.yml`.
- Validates `concepts/registry.json` against `concepts/schema.json`.
- Enforces referential integrity: `sources[].book` refers to real entries in
  the bibliography; `component` refers to a real toolbox component; `related`
  refers to real concept IDs; no duplicate `id` values.
- Non-negotiable. A failing validator blocks merge.

### Tier 2 — Finance math unit tests

- Runs on every PR via `pr-validate.yml`.
- Every interactive tool in the toolbox (ADR-0003) has unit tests using
  **textbook-sourced golden values**.
- Each test cites its source in a comment:
  `// Hull Ch. 15 Example 15.6 — expected 4.76`.
- Preferred sources by domain:
  - Options / derivatives → Hull worked examples
  - Portfolio / CAPM → Bodie worked examples
  - NPV / WACC / capital budgeting → Hawawini worked examples
  - FSA / reformulation → Penman worked examples
  - Fixed income → Bodie worked examples
- Non-negotiable for any tool that ships. A component without golden tests
  does not get wired into a concept page.

### Tier 3 — UI smoke tests

- Runs on every PR via `pr-validate.yml` (optional; may be added mid-M3).
- 1–2 tests per component: "does it render without throwing?"
- Playwright headless, kept intentionally shallow.
- Opportunistic. Failing smoke tests block merge; missing smoke tests do not.

### Explicitly not adopted

- **Coverage targets.** A metric that punishes not writing tests for prose
  and static templates. Not appropriate for a content-heavy personal tool.
- **End-to-end user flow tests.** Overkill for a solo app with no user
  accounts, no persistence, no external services.
- **Visual regression tests.** Maintenance cost exceeds benefit.
- **Mutation testing.** Same.

### Tooling

- **Vitest** as the test runner (Vite-native, minimal config, Jest-like API).
  Wired in during M2 when the registry validator gets its real implementation.
- **Playwright** for UI smoke tests, added in M3 when there is actual UI to
  smoke-test.
- **JSON Schema (Ajv)** for registry validation, invoked from a plain Node
  script (`tests/validate-registry.js`).

## Consequences

**Positive:**
- Future-me can refactor a Black-Scholes implementation in 2029 and know
  immediately if it broke. The textbook citation in the test comment lets
  future-me verify by opening the book.
- The registry can grow to hundreds of entries without decaying, because
  every PR that touches it must pass the validator.
- Test suite stays small enough to run in seconds. No incentive to skip it.

**Negative:**
- Adds a fixed cost to every new toolbox component (must ship with golden
  tests). Accepted: this is the whole point.
- Requires deriving textbook examples by hand into the test fixtures.
  Accepted: doing this once, with a citation, is exactly the discipline the
  tool is trying to enforce on itself.

## Alternatives Considered

1. **No tests, rely on manual verification.**
   Rejected: manual verification does not survive multi-year gaps. Future-me
   will have forgotten what "correct" looks like.

2. **High coverage target (e.g., 80%).**
   Rejected: coverage on prose and template code is meaningless; the metric
   would encourage bad tests rather than the ones that matter.

3. **Property-based testing (fast-check) for finance math.**
   Considered but deferred. Golden values from textbooks are cheaper and
   more legible for the "reload intuition" goal. Property tests may be added
   later for numerical stability checks (e.g., "IV solver converges for all
   reasonable inputs") if numerical bugs surface.

## References

- ADR-0002: Registry-driven concept pages — defines the schema that Tier 1
  enforces
- ADR-0003: Shared component toolbox — defines the components that Tier 2
  tests
- `tests/validate-registry.js` — Tier 1 implementation (real version lands
  in M2)
- `docs/reference/bibliography.md` — source citations for Tier 2 golden values
