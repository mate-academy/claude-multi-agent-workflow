---
name: express-route-conventions
description: Use when writing, changing or reviewing an HTTP route, handler or resource in an Express API that follows the one-router-per-resource, store-only-data-access and JSON-error conventions. Not for general questions or non-route code.
---

# Express route conventions

1. One route file per resource under `routes/`, exporting an Express router; mount it in `server.js` under its base path.
2. All data access goes through `db/store.js`; routes never hold state.
3. Validate input in the route; return `400` on bad input and `404` when a record is missing.
4. Error responses are JSON shaped `{ "error": "message" }`.
5. Add a supertest test in `tests/` for the happy path and each error case, and document the endpoint in `docs/api.md`.
