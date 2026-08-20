---
name: api-conventions
description: Use before reviewing, writing, or editing any route in course-api/ — summarizes the Express API's conventions for routing, data access, validation, and error shape so changes stay consistent with the rest of the codebase.
---

# API conventions (course-api)

Reference this before touching anything under `course-api/routes/`, `course-api/db/`, or `course-api/tests/`.

## Routing
- One route file per resource (e.g. `users.js`, `health.js`), each exporting an Express router.
- Mount every router in `server.js` under its base path — a route file that isn't mounted is dead code.

## Data access
- All reads and writes go through `db/store.js`. Route handlers never hold or mutate state directly.

## Validation and status codes
- Return `400` when required input is missing or malformed.
- Return `404` when the requested record doesn't exist.
- Only return `2xx` once validation and the lookup both succeed.

## Error responses
- Every error body is JSON in the shape `{ "error": "message" }` — no other keys, no plain-text errors.

## Tests
- Tests live in `course-api/tests/` and run via Node's built-in test runner (`npm test`).
- New or changed routes should get a passing test for both the success path and the validation/`404` path.
