# concepts/

Data layer for the Executive-Finance app. Everything here is JSON consumed
by the router, templates, and validator.

## Files

| File | Purpose |
|---|---|
| `schema.json` | JSON Schema (draft-07) for `registry.json`. Contract per ADR-0002. |
| `registry.json` | The concept list. One entry = one page. Populated over M2-M6. |
| `books.json` | Bibliography as data. Machine-readable version of `docs/reference/bibliography.md`. |
| `crosswalk.json` | Concept-to-book mapping. Derived from `sources[]` on each registry entry — kept as a separate file for fast lookup and to power the crosswalk view. |
| `prose/` | (Coming in M3) Markdown files referenced by `prose_ref` fields. |

## Rules

1. **Schema wins.** If `registry.json` diverges from the markdown in
   `docs/reference/`, the JSON is canonical. Update the markdown from the JSON,
   not the other way around.
2. **No hand edits without validation.** Run `npm run validate:registry`
   before committing. CI enforces this on every PR.
3. **`external` is the only book ID that can appear in `sources[]` without
   being present in `books.json`.** Reserved for Reference-tier pages sourced
   from online material.
4. **IDs are stable.** Once a concept ID ships, it's a URL. Renames require
   redirects — avoid them.

## Adding a new concept

1. Add a JSON entry to `concepts` in `registry.json`
2. If it uses an interactive component, ensure `component` and `defaults` are set
3. If it needs long-form prose, create `prose/<id>.md` and set `prose_ref`
4. Run `npm run validate:registry`
5. Commit

No template code changes required for concepts that reuse an existing
component and template. That's the point.
