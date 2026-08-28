---
name: api-conventions
description: Reference the conventions course-api's routes, store, and tests follow. Load this before writing, editing, or reviewing anything under course-api/ — adding an endpoint, changing validation, or writing a test — so new code matches what's already there instead of introducing a one-off pattern.
---

# course-api conventions

course-api is a small Express service. These are its established conventions — apply them rather than inventing new ones.

## Routes

- One route file per resource in `routes/` (`users.js`, `health.js`), mounted under its base path in `server.js`.
- Validate input in the route itself:
  - missing/invalid input → `400` with `{ "error": "message" }`
  - record not found → `404` with `{ "error": "message" }`
- Never leak internals (stack traces, raw exceptions) in an error response.
- Routes never hold state directly — all reads and writes go through `db/store.js`.

## Data access

- `db/store.js` is the only place that touches the in-memory data. If a route needs a new query or mutation, add a function there rather than reaching into the store's internals from a route.

## Tests

- Tests live in `tests/`, one file per resource, using Node's built-in `node:test` + `node:assert`, with `supertest` to drive the Express app.
- Every test file resets state first: `test.beforeEach(() => store.reset())`.
- Cover, per endpoint: the success path, the `400` validation path, and the `404` missing-record path — see `tests/users.test.js` for the existing pattern to follow.
- Run with `npm test` (from `course-api/`); lint with `npm run lint`.

## When something doesn't fit

If a change genuinely needs to deviate from one of these (e.g. an endpoint with no natural "missing record" case), say so explicitly rather than silently skipping the convention.
