---
name: api-conventions
description: Apply when writing or reviewing Express course-api routes — validation, status codes, store usage, and JSON error shape.
---

# API conventions (course-api)

Use these rules whenever you touch Express routes in this project.

## Routing
- One router file per resource under `routes/`; mount it in `server.js` under its base path.
- All data access goes through `db/store.js` — routes never keep their own state.

## Validation and errors
- Validate input in the route; return `400` with `{ "error": "message" }` on bad input.
- Return `404` with the same error shape when a record is missing.
- Successful creates return `201` with the created resource.

## Tests
- Prefer `node:test` + `assert` + `supertest`.
- Reset the store in `beforeEach` so cases stay independent.
- Cover happy path, validation failure, and not-found for each mutating endpoint.
