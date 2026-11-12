---
name: api-conventions
description: Conventions for the Express course API (routes, store access, validation, error format). Use when reviewing or writing route code or tests.
---
# API conventions
- One route file per resource in `routes/`, mounted in `server.js`.
- All data access goes through `db/store.js`; routes never hold state.
- Validate input in the route: `400` for bad input, `404` for missing records.
- Errors are JSON: `{ "error": "message" }`.
- Tests use Node's built-in runner (`npm test`) with supertest.
