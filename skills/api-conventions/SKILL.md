---
name: api-conventions
description: The conventions of this Express course API. Use when adding a new route, resource, or HTTP method, when fixing audit findings, or when writing or changing API tests — so changes land in the house style.
---

# Conventions of the course API

Apply all of these whenever you touch code under `course-api/`.

## Routes

- One file per resource in `routes/`, exporting an Express router (`module.exports = router`), mounted in `server.js` under its base path.
- Each handler has a one-line comment: `// METHOD /path — what it does.`
- All data access goes through `db/store.js` — routes never hold state. Missing store operations get added to `db/store.js` as named functions in the existing style.
- Convert id params with `Number(req.params.id)` before calling the store.

## Validation and errors

- Validate input first. Bad input → `400`; missing record → `404`.
- Every error response is JSON of exactly the shape `{ "error": "message" }`.
- Success returns `200` with the record, `201` on create.

## Tests

- `tests/<resource>.test.js` with `node:test`, `node:assert`, and `supertest` against `require('../server')`.
- Start the file with `test.beforeEach(() => store.reset());`.
- Cover the success path and every error status a handler can return.
- `npm test` must pass before you finish.

## Docs

- Keep `docs/api.md` in sync: every endpoint documented in the existing format.
