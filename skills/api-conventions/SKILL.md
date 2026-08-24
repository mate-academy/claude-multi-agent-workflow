---
name: api-conventions
description: Conventions and a review checklist for the course-api Express service — routing layout, validation rules, error shape, and data-access rules. Use whenever reviewing, writing, or testing code under course-api/, so output matches the codebase's existing style instead of inventing new conventions.
---

# course-api conventions

course-api is a small Express service. Every route, store change, or test should follow these rules (mirrors `course-api/CLAUDE.md`):

## Structure
- One route file per resource in `routes/` (e.g. `users.js`), exporting an Express router.
- Each router is mounted in `server.js` under its base path (e.g. `app.use('/users', usersRouter)`).
- All data access goes through `db/store.js` — routes never hold or mutate state directly.

## Validation and errors
- Validate input in the route handler, not in the store.
- Return `400` for bad/missing input, `404` when a requested record doesn't exist.
- Error responses are always JSON shaped as `{ "error": "message" }` — no other error shape.

## Review checklist
When reviewing or writing a route, confirm:
- [ ] Required fields are checked before use, with a `400` on failure.
- [ ] A missing record (by id) returns `404`, not a 200 with empty/null data or an unhandled error.
- [ ] Success responses use the right status code (`200` for reads/updates, `201` for creates).
- [ ] The handler only talks to `db/store.js`, never to a data structure directly.
- [ ] New behavior has a matching test in `course-api/tests/` covering both the happy path and the error path.

## Testing style
- Tests use Node's built-in `node:test` runner plus `supertest` against the exported `app`.
- `test.beforeEach(() => store.reset())` keeps each test isolated on the seeded data.
- Name tests after the endpoint and behavior, e.g. `'PUT /users/:id returns 404 for a missing user'`.
