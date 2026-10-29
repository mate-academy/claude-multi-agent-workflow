---
name: api-conventions
description: Express API conventions for this project (routes, validation, error shape, data access). Use when reviewing, writing or testing API routes.
---
# API conventions

- One route file per resource in `routes/`, mounted in `server.js` under its base path.
- All data access goes through `db/store.js`; routes never hold state.
- Validate input in the route: respond `400` on bad input, `404` when a record is missing.
- Errors are JSON shaped `{ "error": "message" }`.
- Every route needs tests for the success case, bad input (400) and missing record (404).
