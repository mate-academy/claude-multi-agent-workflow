---
name: api-conventions
description: The correctness and style conventions for course-api (an Express API) — validation, status codes, error shape, and data-access rules. Use this whenever reviewing, fixing, or writing code in course-api/, to check whether a route follows the repo's conventions or to know what convention to follow when writing new code.
---

# course-api conventions

`course-api/` is a small Express API. Code in it follows these rules; check against them when reviewing or writing route code.

## Structure

- One route file per resource, under `routes/` (e.g. `users.js`, `health.js`), each exporting an Express router.
- Mount each router in `server.js` under its base path (e.g. `app.use('/users', usersRouter)`).
- All data access goes through `db/store.js` — route handlers never hold or mutate state directly; they call into the store.

## Request handling

- Validate input in the route handler. Return `400` when required fields are missing or malformed.
- Return `404` when a requested record doesn't exist (e.g. `GET /users/:id` for an unknown id).
- On success, return the resource (or list) as JSON with the appropriate status code (`200` for reads/updates, `201` for creates).

## Error shape

Every error response is JSON in exactly this shape:

```json
{ "error": "message" }
```

No extra fields, no arrays of errors — one message string under `error`.

## Checking a route against these rules

When reviewing or fixing a route handler, confirm:
1. Required fields are validated before use, with a `400` on failure.
2. Missing records produce a `404`, not a crash or an empty `200`.
3. Every error path returns `{ "error": "..." }`, nothing else.
4. The handler reads/writes only through `db/store.js`.
