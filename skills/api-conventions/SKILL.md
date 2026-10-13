---
name: api-conventions
description: The Express API conventions for this project (routing, data access, validation, error shape, tests). Use when adding or changing a route, writing API tests, or judging whether code follows house style.
---

# API conventions

Follow these when writing or reviewing code in the course API.

## Structure
- One route file per resource in `routes/`, exporting an Express router, mounted in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never hold state themselves.

## Behaviour
- Validate input in the route; respond `400` on bad input.
- Respond `404` when a requested record does not exist.
- Errors are JSON shaped `{ "error": "message" }`, never plain text.

## Tests
- Node's built-in runner (`node --test`) with supertest, in `tests/<resource>.test.js`.
- Cover the happy path, a `400` case and a `404` case for every endpoint.

## Before finishing
- `npm run lint` and `npm test` must both pass.
