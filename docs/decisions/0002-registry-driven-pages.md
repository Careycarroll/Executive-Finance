# ADR-0002: Registry-driven concept pages

- Status: Accepted
- Date: 2026-08-04
- Deciders: Carey Carroll
- Tags: architecture, content-model, data
- Depends on: ADR-0001

## Context and Problem Statement

ADR-0001 commits the app to a concept-organized structure with roughly 100
concept pages. If each page were hand-authored HTML (as Chapter 1's pages
currently are), then:

- Adding a new concept requires writing new page code, not just content.
- Cross-cutting changes (e.g., "add a `notes-for-future-me` section to every
  Core page") require editing 60+ files.
- The overall shape of the app is not inspectable — you can't easily answer
  "which concepts already exist?" without crawling the filesystem.
- Consistency across pages depends on discipline, not enforcement.

For a personal tool the author will return to years from now, the maintenance
burden of a code-heavy content model is exactly wrong. The tool needs to make
_adding content in the future_ as cheap as possible, and adding content
should not require remembering how the app is built.

The Script-Launcher (Heelworks) repo demonstrated a pattern worth stealing:
tools are declared as entries in a `registry.json` with typed fields, and
the app renders them from that data. Adding a new tool means editing JSON.

## Decision

Make `concepts/registry.json` the **single source of truth** for concept
content. Every concept page is generated at build time from its registry
entry plus a template.

Adding a new concept = adding a JSON entry (+ optionally a prose file if
the concept needs long-form explanation). No new page code required, as
long as the concept uses an existing template and component.

### Registry entry schema

Each entry has the following shape:

```json
{
  "id": "black-scholes",
  "domain": "deriv",
  "title": "Black-Scholes Option Pricing",
  "tier": "core",
  "sources": [
    { "book": "hull", "chapters": ["15"], "primary": true },
    { "book": "natenberg", "chapters": ["5"] },
    { "book": "bodie", "chapters": ["21"] }
  ],
  "template": "interactive",
  "component": "sensitivity-panel",
  "defaults": {
    "spot": 100,
    "strike": 100,
    "rate": 0.05,
    "vol": 0.2,
    "time": 1.0
  },
  "prose_ref": "concepts/prose/black-scholes.md",
  "related": ["put-call-parity", "greeks-delta", "implied-vol"]
}
```

Field definitions:

- `id` (string, required, unique) — kebab-case, used in URLs
- `domain` (enum, required) — `corpfin` | `invest` | `deriv` | `fsa` | `tax`
  | `macro` | `behav` | `risk`
- `title` (string, required) — display title
- `tier` (enum, required) — `core` | `reference`
- `sources` (array, required, min 1) — books that treat this concept; exactly
  one entry must have `"primary": true`
- `template` (enum, required) — `formula` | `explainer` | `interactive`
- `component` (string, optional) — component ID from the toolbox
  (required if `template` is `interactive`)
- `defaults` (object, optional) — default input values for the component
- `prose_ref` (path, optional) — markdown file with long-form content
- `related` (array of ids, optional) — cross-references to other concepts

The JSON schema itself lives at `concepts/schema.json` (JSON Schema
draft-07) and is enforced by the registry validator.

## Consequences

**Positive:**

- Adding a new concept is a JSON edit, not a code change.
- The registry is inspectable: `jq` or a browser JSON viewer answers "what
  concepts exist?" in one command.
- Bulk changes (add a field, rename a domain) are one script away.
- The validator (M2) enforces schema and referential integrity on every PR.
- Enables a future "browse the registry" index page for free.

**Negative:**

- Introduces build-time code-generation, which adds one indirection when
  debugging: "where is this page defined?" → answer: the registry entry +
  template, not a single HTML file.
- Requires committing to the schema before content fill. Schema changes
  during content fill mean touching many entries. Mitigated by keeping the
  schema conservative and using optional fields liberally.
- Prose still lives in separate files (`concepts/prose/*.md`) rather than
  inline in the registry, to avoid JSON escaping pain for anything longer
  than a sentence.

## Alternatives Considered

1. **YAML frontmatter on markdown files, one file per concept.**
   Rejected: harder to validate as a whole, harder to query across concepts,
   and mixes structured data with prose in a way that fights bulk operations.
2. **A database (SQLite committed to the repo).**
   Rejected: overkill for ~100 entries, worse diffs in PRs, requires tooling
   to inspect.
3. **Keep hand-authored HTML per page.**
   Rejected: the whole point of ADR-0001's concept organization is to make
   content addition cheap. Hand-authored pages defeat that.

## References

- ADR-0001: Concept-organized structure
- ADR-0003: Shared component toolbox — defines the component IDs referenced
  from registry entries
- `concepts/schema.json` — the JSON Schema (produced in M2)
- Script-Launcher `registry.json` — pattern source
