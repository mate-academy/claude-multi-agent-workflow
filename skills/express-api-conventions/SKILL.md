---
name: express-api-conventions
description: Conventions for writing, reviewing and testing routes in a small Express API (status codes, JSON error shape, validation, store access, node:test + supertest tests). Use when adding or changing an Express route, reviewing one, or writing tests for it.
---

# Express API conventions

Apply these rules when you add, change, review or test a route in an Express API like `course-api/`.

## Routes

- One router file per resource in `routes/`, mounted in `server.js` under its base path (`app.use('/users', usersRouter)`).
- Routes hold no state. All reads and writes go through `db/store.js`.
- Parse path IDs with `Number(req.params.id)` and treat `NaN` as "not found" or bad input — never pass it to the store unchecked.

## Status codes and errors

| Situation | Status | Body |
|---|---|---|
| Read OK | 200 | the resource or list |
| Created | 201 | the new resource |
| Missing / malformed input | 400 | `{ "error": "<what is wrong>" }` |
| Record not found | 404 | `{ "error": "<Resource> not found" }` |

Validate input **before** calling the store. Error bodies are always JSON with a single `error` string — no stack traces.

## Tests

- Node's built-in runner: `const test = require('node:test')`, `const assert = require('node:assert')`.
- HTTP calls with `supertest` against `require('../server')` — the app is exported without listening.
- `test.beforeEach(() => store.reset())` so every test starts from the seed data.
- One `test()` per behaviour, titled `METHOD /path <does what>`; assert the status and the key body fields.
- Every route should have at least: one success test, one test per `400` branch, one `404` test when it looks up a record.

## Checklist for a new endpoint

1. Handler in `routes/<resource>.js`, data access through `db/store.js`.
2. Validation returns `400`, missing record returns `404`, both with `{ error }`.
3. Tests for success and each error branch in `tests/<resource>.test.js`.
4. `npm test` and `npm run lint` pass.
5. Document it in `docs/api.md` if the project has one.
