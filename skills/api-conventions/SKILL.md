---
name: api-conventions
description: Conventions for course-api route handlers - validation, error shape, store-only data access. Load when reviewing, writing, or testing code under course-api/.
---

# course-api conventions

These are the conventions `course-api/CLAUDE.md` documents for this Express app. Use them as the checklist whenever reviewing, writing, or testing anything under `course-api/`.

- **One route file per resource.** Each resource gets its own file in `course-api/routes/` (e.g. `users.js`, `health.js`), mounted in `course-api/server.js` under its base path. Don't mix resources in one route file.
- **Data access goes through `course-api/db/store.js` only.** Routes never hold state directly or reach into another module's internals — every read/write of data flows through the store's exported functions.
- **Validate input in the route.** Return `400` when required fields are missing or malformed, `404` when a referenced record doesn't exist. Don't let invalid input reach the store layer.
- **Error responses are JSON shaped `{ "error": "message" }`.** Every error path returns this exact shape — no bare strings, no extra top-level fields.
- **Tests use `node:test` + `supertest`**, following the pattern in `course-api/tests/users.test.js`: import the exported `app` (never start a real listener), and call `store.reset()` in a `beforeEach` so tests don't leak state into each other.
- **`course-api/docs/api.md` must stay in sync with the actual routes.** Every endpoint, method, status code, and field documented there should match what the code does — flag drift in either direction.
