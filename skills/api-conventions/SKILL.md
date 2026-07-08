---
name: api-conventions
description: Use when reviewing, writing, or fixing code in course-api — a checklist of the project's Express conventions (routing, validation, error shape, data access) plus common bug patterns to watch for. Load this before judging whether a route or module in course-api is correct.
---

# course-api conventions

Reference checklist for anything touching `course-api/`. Any review or fix should be checked against this before being called done.

## Structure

- One route file per resource in `routes/` (e.g. `users.js`), mounted under its base path in `server.js`.
- All data access goes through `db/store.js`. Routes never hold state directly or reach into another route's data.

## Input handling

- Validate input in the route itself, not in `db/store.js`.
- Return `400` for bad/missing input (wrong type, missing required field).
- Return `404` when a requested record doesn't exist.
- Every error response body is JSON shaped exactly as `{ "error": "message" }` — no extra fields, no plain-text errors.

## Common bugs to check for

- A route that reads `req.body` or `req.params` without validating shape before passing it to `db/store.js`.
- A `404` case that's missing entirely (e.g. `GET /users/:id` returning `undefined` instead of a 404).
- Status codes that don't match the convention above (e.g. `500` used for a validation failure that should be `400`).
- Async route handlers that don't handle rejected promises (unhandled rejection instead of a JSON error response).
- Unused variables or parameters that aren't `req`/`res`/`next` (flagged by this repo's ESLint config).

## Verifying a fix

From `course-api/`:
- `npm run lint` — must pass with no errors.
- `npm test` — must pass; add or update a test in `tests/` if the fix changes route behavior.
