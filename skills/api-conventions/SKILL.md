---
name: api-conventions
description: Conventions for course-api and similarly-shaped small Express APIs — route/status/error-shape patterns and test patterns to follow when reviewing routes, writing routes, or writing tests. Use whenever touching files under routes/, db/, or tests/.
---

# API conventions

Reference this whenever reviewing, writing, or testing routes in an Express API shaped like `course-api/`.

## Route conventions

- One route file per resource (`routes/users.js`, `routes/health.js`), mounted in `server.js` under its base path.
- All data access goes through the store module (e.g. `db/store.js`) — routes never hold state directly.
- Validate input in the route:
  - Missing/invalid required fields → `400`
  - Looked-up record not found → `404`
- Error responses are JSON in the shape `{ "error": "message" }`. Success responses return the resource (or array of resources) directly, no wrapper envelope.
- `POST` returns `201` with the created record; `GET`/`PUT` return `200`.

## Test conventions

- Tests live under `tests/`, one file per resource, using Node's built-in `node:test` and `assert`.
- Requests go through `supertest(app)` where `app = require('../server')`.
- `test.beforeEach(() => store.reset())` resets the in-memory store so every test starts from the same seed data.
- Cover the success path, the `400` validation path, and the `404` missing-record path for every route that has them.

## When reviewing or writing new endpoints

Check each new route against this list: validation present, correct status code, correct error shape, goes through the store module, and has a test for the success path plus each error path it can hit.
