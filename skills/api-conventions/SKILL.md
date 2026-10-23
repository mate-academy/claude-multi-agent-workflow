---
name: api-conventions
description: Express API conventions for this project: route layout, validation, status codes, and error shape. Use when writing, reviewing, or testing API routes or deciding how an endpoint should respond.
---

# API conventions

- One route file per resource in `routes/`; mount it in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never hold state.
- Validate input in the route. Return `400` on bad input and `404` when a record is missing.
- Errors are JSON shaped `{ "error": "message" }`.
- Every route needs tests for the success case, a `400` case where input is accepted, and a `404` case where an id is used.
- Run `npm test` and `npm run lint` from the API directory before calling work done.
