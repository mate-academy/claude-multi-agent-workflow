---
name: api-conventions
description: Conventions for the Express course API (route layout, store access, validation, error shape). Use when adding or reviewing routes, handlers, or tests in this project.
---
# API conventions

Apply these whenever you add or review code in this API.

- **One route file per resource** under `routes/`, exporting an Express router, mounted in `server.js` under its base path.
- **All data access goes through `db/store.js`.** Routes never hold state themselves.
- **Validate input in the route.** Return `400` for bad or missing input and `404` when a record does not exist.
- **Errors are JSON** in the shape `{ "error": "message" }`.
- **Tests** use `node:test`, `assert`, and `supertest`, and call `store.reset()` in `beforeEach` so each test starts from seed data.
- **Docs:** when behaviour of an endpoint changes, update `docs/api.md` too.
