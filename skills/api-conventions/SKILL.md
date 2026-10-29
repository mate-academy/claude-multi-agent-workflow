---
name: api-conventions
description: Conventions and review checklist for Express APIs with one route file per resource and an in-memory store. Use when writing or changing routes, handlers, store helpers or tests, or when asked whether code follows the project's API conventions (convenciones de la API).
---

# API conventions

Apply these rules whenever you add or change code in the API (the `course-api/` folder in this repo is the reference implementation).

## Structure

- One route file per resource in `routes/`, exporting an Express router.
- Mount every router in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never keep state.
- `server.js` only listens when run directly (`require.main === module`) and always exports `app`, so tests can import it.

## Requests and responses

- Validate input inside the route. Bad input returns `400`; a missing record returns `404`; a successful create returns `201`.
- Convert path ids with `Number(req.params.id)` before calling the store.
- Every error response is JSON shaped `{ "error": "message" }` — never plain text, never a different key.
- Return from the handler (`return res.status(...).json(...)`) so no code runs after a response is sent.

## Tests

- Use `node:test`, `node:assert` and `supertest` against `require('../server')`.
- Call `store.reset()` in `test.beforeEach` so each test starts from the seed data.
- Every route needs at least: the happy path, a `404` for a missing record, and a `400` for bad input where the route validates.

## Quick review checklist

1. Does each handler validate before touching the store?
2. Is every status code the one listed above?
3. Does any route hold state or bypass `db/store.js`?
4. Does every new route have a matching test?
5. Does `npm test` and `npm run lint` pass in the API folder?
