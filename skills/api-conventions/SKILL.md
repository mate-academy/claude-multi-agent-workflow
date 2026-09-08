---
name: api-conventions
description: Summarizes course-api's coding conventions — route/store separation, input validation, error shape, and test style — for quick reference during review or when writing new routes or tests.
---

# course-api conventions

Reference summary of the conventions in `course-api/CLAUDE.md`, for quick lookup without re-reading the source.

## Structure
- One route file per resource in `routes/`, mounted in `server.js` under its base path.
- All data access goes through `db/store.js` — routes never hold or mutate state directly.

## Request handling
- Validate input in the route; return `400` on bad or missing input.
- Return `404` when a requested record doesn't exist.
- Every error response is JSON shaped exactly `{ "error": "message" }`.

## Tests
- `node:test` + `supertest`, one file per resource in `tests/`.
- `test.beforeEach(() => store.reset())` so each test starts from the seeded state.
- Assertions via `assert.equal` / `assert.ok` — no other assertion library.

## Linting
- ESLint flat config (`eslint.config.js`); `npm run lint` from `course-api/`.
