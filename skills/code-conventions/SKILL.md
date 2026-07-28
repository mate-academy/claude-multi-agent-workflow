---
name: code-conventions
description: Documents course-api's coding conventions (input validation, error shape, data access rules) so reviews and fixes apply one explicit standard instead of ad hoc style. Use when reviewing or fixing code under course-api/.
---

# course-api conventions

Reference these rules when reviewing or fixing anything under
`course-api/`. They come from `course-api/CLAUDE.md` — this skill exists
so both `code-reviewer` and `code-fixer` apply the same standard without
re-deriving it each run.

## Structure

- One route file per resource in `routes/` (e.g. `users.js`, `health.js`),
  each exporting an Express router, mounted in `server.js` under its base
  path.
- All data access goes through `db/store.js`. Routes never hold state
  directly — no module-level arrays or objects in a route file.

## Request handling

- Validate input in the route. Missing or malformed required fields ⇒
  `400`.
- A record that doesn't exist ⇒ `404`.
- Error responses are always JSON shaped like `{ "error": "message" }` —
  never a bare string or an HTML error page.

## What counts as a real finding

Flag: missing validation, wrong status code, error responses that don't
match the `{ "error": "message" }` shape, state held outside
`db/store.js`, and ordinary bugs (unhandled edge cases, logic errors,
missing null checks).

Don't flag: formatting preferences already covered by ESLint, or
naming choices that don't violate an existing convention.
