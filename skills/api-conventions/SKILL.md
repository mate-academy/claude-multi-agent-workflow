---
name: api-conventions
description: Reference for course-api's routing, validation, error-shape, and data-access conventions. Load this before reviewing routes, writing tests, or adding new endpoints in course-api so checks and new code match the project's actual rules instead of generic assumptions.
---

# course-api conventions

`course-api/` is a small Express API. Its rules aren't enforced by a linter beyond style, so hold code to these conventions by hand:

## Structure
- `server.js` — entry point; creates the Express app, mounts each router, and starts listening.
- `routes/` — one file per resource (`users.js`, `health.js`, ...), each exporting an Express router mounted in `server.js` under its base path.
- `db/store.js` — the only place in-memory data is read or written. Routes never hold state directly; they always go through `store.js`.

## Request handling
- Validate input in the route handler itself, before touching the store.
- Bad input (missing/malformed fields) → `400`.
- A record that doesn't exist (e.g. `GET /users/999`) → `404`.
- Successful creation → `201`; successful read/update → `200`.

## Error shape
Every error response is JSON in exactly this shape:
```json
{ "error": "message" }
```
No extra fields, no arrays of errors — one message string.

## Tests
- Tests live in `course-api/tests/`, one file per resource (`<resource>.test.js`), using Node's built-in `node:test` and `node:assert`.
- Use `supertest` against the exported `app` from `server.js`.
- `test.beforeEach(() => store.reset())` resets state between tests — always include it in new test files.

Use this reference when reviewing code with `api-reviewer` or writing tests with `test-writer` so findings are grounded in the project's real rules, not assumptions.
