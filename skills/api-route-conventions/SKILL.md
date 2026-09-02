---
name: api-route-conventions
description: >-
  Use when adding, changing, or reviewing an Express route in
  course-api/routes/ — a new resource router, a new handler on an existing
  router, a change to status codes, validation, or error responses. Captures how
  routes in this project are structured so new ones match. Do not use for
  non-route changes (db/store.js internals, server bootstrapping, tests).
---

# course-api route conventions

These rules come from `course-api/CLAUDE.md` and the existing routers
(`routes/users.js`, `routes/health.js`). Every route in `course-api/routes/`
follows all of them.

## Structure

- **One router per resource.** Each file in `routes/` creates a plain
  `express.Router()`, defines its handlers on paths relative to the resource
  base (`/`, `/:id` — never the full `/users` prefix), and ends with
  `module.exports = router`.
- **Mount it once in `server.js`.** Add `app.use('/<resource>', <resource>Router)`
  alongside the existing mounts. A router that is written but not mounted is a
  bug.
- **All data access goes through `db/store.js`.** Routes call the store helpers
  (`listUsers`, `getUser`, `createUser`, `updateUser`, …) and hold no state of
  their own. If a route needs an operation the store doesn't expose, add a
  helper to `db/store.js` rather than reaching around it.

## Request handling

- **Validate input in the route, before touching the store.** Check required
  fields and return `400` with `{ error: '<what is required>' }` when they are
  missing or invalid.
- **Missing record → `404`.** When a store lookup returns nothing, return
  `404` with `{ error: '<Resource> not found' }`. Return early — never fall
  through to a normal response.

## Status codes

| Situation                         | Code  |
| --------------------------------- | ----- |
| Successful GET                    | `200` |
| Successful create (POST)          | `201` |
| Successful update (PUT/PATCH)     | `200` |
| Invalid or missing input          | `400` |
| Record not found                  | `404` |

## Error response shape

Every error response is JSON in exactly this shape:

```json
{ "error": "message" }
```

Key is `error`, value is a human-readable string. No other keys, no bare
strings, no empty bodies. Success responses return the resource (or resource
list) directly as JSON.

## Quick checklist for a new or changed route

1. Plain `express.Router()`, relative paths, `module.exports = router`.
2. Mounted under its base path in `server.js`.
3. Reads and writes only through `db/store.js`.
4. Required fields validated in the route; `400` + `{ error }` on failure.
5. `404` + `{ error }` when the store returns nothing.
6. `200` / `201` on the success paths as per the table above.
7. Add or update the tests in `tests/<resource>.test.js` to match.
