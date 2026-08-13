---
name: express-api-quality
description: Use when asked to review, test, or improve Express API route quality in this repo's course-api app — validation, HTTP status codes, JSON error shape, or db/store.js data-access patterns. Not for unrelated JavaScript, frontend, or non-Express work outside course-api.
---

# Express API quality conventions (course-api)

These are the conventions `course-api` already follows. Use them as the standard when reviewing, testing, or fixing its routes — don't introduce a different style.

## Validation

- Required fields are checked in the route handler before they're used.
- Missing or invalid input returns `400` with a JSON error body — never a silent default, and never a `500` from an unchecked field.

## HTTP status codes

- `200` — successful read or update
- `201` — successful creation (e.g. `POST /users`)
- `400` — bad or missing input
- `404` — the referenced record doesn't exist (e.g. `GET /users/:id` or `PUT /users/:id` for an unknown id)

Status codes should match what `course-api/docs/api.md` documents for that route.

## Error response shape

- Every error body is exactly `{ "error": "message" }` — no extra fields, no arrays, no nested error objects, and no deviation between routes.

## Store / data-access pattern

- All reads and writes go through `course-api/db/store.js`; route handlers never hold or mutate user data directly.
- `store.reset()` restores the seed data — it exists so tests start from a clean, known state. New code should not add state that bypasses `reset()`.

## Tests

- Tests live in `course-api/tests/` and use Node's built-in test runner (`node --test`) with `supertest` against the exported Express `app`.
- `test.beforeEach(() => store.reset())` isolates each test — follow this pattern for any new tests.
- Run the suite with `npm test` from inside `course-api/`.

## Scope

This skill applies to route or store changes under `course-api/routes/`, `course-api/db/store.js`, `course-api/server.js`, and their tests. It does not apply to unrelated JavaScript elsewhere in this repo, frontend code, or work that isn't about this Express API's route quality.
