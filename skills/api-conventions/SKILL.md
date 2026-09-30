---
name: api-conventions
description: Express API conventions for this project. Use when writing, reviewing or testing routes, validation, or error responses.
---

# API conventions

- One route file per resource in `routes/`; mount it in `server.js` under its base path.
- All data access goes through `db/store.js`; routes never hold state.
- Validate input in the route: return `400` on bad input, `404` when a record is missing.
- Errors are JSON shaped `{ "error": "message" }`.
- Every route needs tests for success, 400 and 404 cases.
