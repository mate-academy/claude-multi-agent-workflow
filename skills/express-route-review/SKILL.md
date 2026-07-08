---
name: express-route-review
description: Use when adding, changing, or reviewing an Express route/endpoint in course-api/ (routes/*.js) — covers how to structure the router, validate input, handle missing records, and shape error responses so it matches the rest of the API. Not for unrelated JS changes or non-HTTP code.
---

# Express route conventions (course-api)

Every route in `course-api/routes/` follows the same shape — match it exactly.

## Structure

- One file per resource in `routes/`, exporting an `express.Router()`.
- Mount the router in `server.js` under its base path.
- Routes never hold state directly. All reads/writes go through the helpers
  in `db/store.js` — add a new helper there rather than mutating data in the
  route.

## Validation and status codes

- Bad or missing input → `400`.
- A record that doesn't exist → `404`, never a crash.
- Successful reads/updates → `200`; successful creates → `201`.

## Error shape

Every error response is JSON in exactly this shape:

```json
{ "error": "message" }
```

Match the terse, lowercase phrasing already used — no stack traces, no
nested error objects.

## Tests

Tests live in `tests/`, use Node's built-in `node:test` + `supertest` against
the exported `app`, and call `store.reset()` in `test.beforeEach` so each
test starts from the seeded data.
