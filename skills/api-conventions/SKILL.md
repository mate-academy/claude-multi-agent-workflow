---
name: api-conventions
description: The course API's own rules for writing and reviewing routes — input validation and 400s, 404s for missing records, the { "error": "message" } body shape, and going through db/store.js for all state. Use whenever you add, change, or review a route in course-api/ so the code matches the rest of the project.
---

# Course API conventions

These are the conventions the course API is built on. Follow them when you add or
change a route, and check against them when you review one.

## Routes
- One route file per resource, living in `routes/` and exporting an Express router.
- Mount each router in `server.js` under its base path (e.g. `app.use('/users', usersRouter)`).

## Input and status codes
- Validate input in the route. Return **400** when required input is missing or invalid.
- Return **404** when the record being asked for doesn't exist.
- Return **201** when a resource is created.

## Error shape
- Every error response is JSON in the shape `{ "error": "message" }` — one `error`
  key, a human-readable string. Don't return bare strings or a different key.

## Data access
- All reads and writes go through `db/store.js`. Routes never keep state in module
  variables or closures — they call the store helpers (`listUsers`, `getUser`,
  `createUser`, `updateUser`, …).

## Tests
- Tests live in `tests/`, end in `.test.js`, and use Node's built-in runner
  (`node --test`) with `supertest` against the app exported from `server.js`.
- Cover the happy path and the edge cases: missing fields → 400, missing record → 404.

## A quick checklist before you call a route done
- [ ] Bad input returns 400 with `{ "error": ... }`.
- [ ] Missing record returns 404 with `{ "error": ... }`.
- [ ] All state goes through `db/store.js`.
- [ ] There's a test for the happy path and for each error case.
