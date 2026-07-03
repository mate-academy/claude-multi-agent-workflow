---
name: api-conventions
description: The conventions of the Express course API — route/status-code rules, the store-only data access rule, and the JSON error shape. Use whenever writing, reviewing, or testing code in course-api/ (routes, db/store.js, server.js, tests) so new code matches the existing contract.
---

# Course API conventions

Apply these when adding, reviewing, or testing code under `course-api/`.

## Architecture
- `server.js` — entry point: creates the Express app, mounts routers, listens on port 3000.
- `routes/` — one file per resource (`users.js`, `health.js`), each exporting an Express router mounted under its base path.
- `db/store.js` — the in-memory data helper. **Every route reads and writes through it**; routes never hold state directly. `store.reset()` restores seed data (used by tests).

## Route rules
- Validate input in the route. Return:
  - `400` on bad or missing input,
  - `404` when a record doesn't exist,
  - `201` on successful create, `200` otherwise.
- Error responses are JSON in the exact shape `{ "error": "message" }`.
- Convert `req.params.id` with `Number(...)` before looking a record up.

## Testing rules
- Node's built-in runner via `npm test` (`node --test`) from inside `course-api/`.
- Drive the app with `supertest`; mirror the style of `tests/users.test.js`.
- Call `store.reset()` before each test so cases start from clean seed data.
- Assert on both status code and JSON body, including the error shape.

## Commands
- `npm run dev` — start the API. `npm test` — run tests. `npm run lint` — ESLint over `server.js routes db tests`.

When new code would break any rule above, prefer matching the convention over introducing a new pattern.
