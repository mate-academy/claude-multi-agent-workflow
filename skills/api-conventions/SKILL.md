---
name: api-conventions
description: Reference for course-api's routing, validation, and error-shape conventions. Load before writing, editing, or reviewing anything in course-api/routes, course-api/db, or course-api/tests so the output matches the project's existing style instead of inventing a new one.
---

# course-api conventions

`course-api` is a small Express API. Its conventions are deliberately narrow — follow them exactly rather than introducing alternatives (a different error shape, a new validation library, a different test runner).

## Routing
- One route file per resource under `routes/` (e.g. `users.js`), exporting an Express `Router`.
- Mount each router in `server.js` under its base path (`app.use('/users', usersRouter)`).
- Route handlers stay thin: parse input, call into `db/store.js`, shape the response. No business logic embedded in the handler beyond that.

## Data access
- All reads and writes go through `db/store.js`. Routes never hold or mutate state directly — no module-level arrays or objects in a route file.
- `store.js` exposes plain functions (`listUsers`, `getUser`, `createUser`, `updateUser`, ...) that routes call by name.

## Validation and errors
- Validate input in the route handler, not in the store.
- Missing/invalid required fields → `400`.
- Record not found by id → `404`.
- Every error response is JSON shaped exactly `{ "error": "message" }` — no extra fields, no nested error objects.
- Successful writes return the affected resource as JSON: `201` for create, `200` for update/read.

## Tests
- `course-api/tests/` uses Node's built-in `node:test` runner with `assert` and `supertest` — not Jest, not Mocha.
- Every test file calls `test.beforeEach(() => store.reset())` so each test starts from the same seed data (`db/store.js`'s `seed()`).
- One `test(...)` per behavior, with a plain-English name describing what it checks.
- Assertions cover both the HTTP status code and the meaningful parts of the response body.

## When something doesn't fit
If a change genuinely needs to deviate from one of these (e.g. a resource that legitimately needs different validation), say so explicitly rather than silently picking a different pattern than the rest of the codebase uses.
