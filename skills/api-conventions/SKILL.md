---
name: api-conventions
description: Checklist of this Express API's conventions (input validation, error shape, 404 handling, data-access rules) for reviewing code or writing tests against course-api. Use whenever auditing a route, fixing a bug, or writing a test in course-api/.
---

# API conventions checklist

`course-api/` is a small Express API with a fixed set of conventions (see `course-api/CLAUDE.md`). Use this checklist whenever you review, fix, or test code in that directory — it's what "correct" means for this codebase.

## Structure
- One route file per resource in `course-api/routes/` (`users.js`, `health.js`), mounted in `server.js` under its base path.
- All data access goes through `course-api/db/store.js`. A route file that reads or writes state directly (instead of calling into the store) is a convention violation, not just a style nit.

## Request handling
- Bad input (missing/malformed fields, wrong types) → respond `400`.
- A record that doesn't exist (unknown id, etc.) → respond `404`.
- Every error response body is JSON shaped exactly as `{ "error": "message" }` — no extra fields, no plain-text errors.

## Applying the checklist

**When reviewing (`code-reviewer`)**: for each route handler, confirm input validation exists and returns `400`, missing-record lookups return `404`, error bodies match the `{ "error": "message" }` shape, and the handler goes through `db/store.js` rather than touching state itself. Flag any endpoint that skips one of these as a convention violation, and any status code or response shape not covered by an existing test as a coverage gap.

**When fixing or testing (`test-writer`)**: match this shape exactly — don't invent a different error format or status code even if it "seems more correct." When adding a test, assert both the HTTP status code and the JSON body shape, following the existing style in `course-api/tests/` (Node's built-in test runner + supertest).
