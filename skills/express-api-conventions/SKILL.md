---
name: express-api-conventions
description: House conventions for the course-api Express app — route layout, store contract, validation, status codes, and error shape. Use when reviewing, writing, or testing routes in course-api/.
---

# Express API conventions (course-api)

These are the house rules the `api-reviewer` and `test-author` agents both check code
against. They're distilled from `course-api/CLAUDE.md`, `routes/users.js`, and
`db/store.js`.

## Layout
- One route file per resource under `routes/` (e.g. `users.js`, `health.js`), each
  exporting an Express `Router`.
- Every router is mounted in `server.js` under its base path — a route file that exists but
  isn't mounted is a bug.
- All data access goes through `db/store.js`. Routes never hold state directly; they only
  call store helpers.

## Store contract (`db/store.js`)
- `listUsers()` — returns the full array.
- `getUser(id)` — returns the matching user object or `undefined`.
- `createUser({ name, email })` — assigns the next id, pushes, returns the new user.
- `updateUser(id, fields)` — returns the updated user, or `undefined` if no match.
- `reset()` — restores seed data; called by `test.beforeEach` in every test file.

## Request handling
- Route params that are ids must be coerced with `Number(req.params.id)` before any store
  lookup — comparing a string param to a numeric id always misses.
- Validate required fields first; return `400` with a JSON body before touching the store.
- After validating, look the record up; return `404` if the store returns nothing.
- Successful creates return `201` with the created object; other successful responses
  return `200`.

## Error shape
- Every error response body is exactly `{ "error": "message" }` — no extra fields, no
  arrays, no nested objects.

## Testing
- Tests live in `course-api/tests/`, use `node:test` + `node:assert` + `supertest` against
  the exported `app`.
- `test.beforeEach(() => store.reset())` at the top of every test file.
- One `test(...)` per behaviour, one focused assertion cluster per test.
