---
name: express-api-conventions
description: The house rules for adding or changing an Express route in this project — where the file goes, how input is validated, which status code each outcome gets, the JSON error shape, and how data access goes through the store module. Use before writing or editing anything under routes/, db/, or the server entry point, and when reviewing a route someone else wrote.
---

# Express API conventions

These are the rules the `course-api` codebase already follows. Match them; do not
introduce a second way of doing the same thing.

## Layout

- One route file per resource, in `routes/<resource>.js`, exporting an
  `express.Router()`.
- Mount it in `server.js` under its base path: `app.use('/users', usersRouter)`.
  A route file that is never mounted is dead code.
- All data access goes through `db/store.js`. Routes never hold state, never
  reach into arrays directly, and never import another route's internals.
- The entry point only listens when it is run directly, so tests can import the
  app without opening a port. Keep that guard.

## Status codes

| Outcome | Code |
| --- | --- |
| Read succeeded | `200` |
| Resource created | `201`, with the created object as the body |
| Update succeeded | `200`, with the updated object |
| Body is missing or unusable | `400` |
| The id in the path matches no record | `404` |

`400` is about the **body**: a required field is missing, or a value sent cannot
be stored. `404` is about the **id**: nothing matches it.

A non-numeric id is deliberately a `404` in this project, not a `400` —
`Number('abc')` is `NaN`, `NaN` matches no record, and "no such user" is the
honest answer. Keep that behaviour. If a route has a specific reason to tell the
two apart, validate the id explicitly with `Number.isInteger()` and document the
`400` in `docs/api.md` in the same change.

## Errors

Every error response is exactly this shape:

```js
return res.status(400).json({ error: 'name and email are required' });
```

- One `error` key, holding a plain string. No second key, no nested object, no
  stack trace, no error code — a caller reads `res.body.error` and nothing else.
- The message names what was wrong with the request, not what the server did
  internally.
- Match the wording style already in the file you are editing. The codebase has
  both `'name and email are required'` and `'User not found'` — casing is not a
  defect, so do not report it as one.
- Always `return` the `res.*` call. A missing `return` lets the handler fall
  through and send a second response.

## Validating input

Validate in the route, before touching the store:

- Required fields on create: check each one is present *and* usable. `!name`
  catches `undefined` and `''` together, which is what you want here.
- Partial updates: two checks, not one. Reject with `400` when *every*
  updatable field is absent, so a caller can send just `name` — and separately
  validate each field that *is* present, to the same standard `POST` holds it
  to. A field present but empty is bad input, not an omission; letting it through
  writes `{ "name": "" }` into the record and returns `200`.
- Path ids: `Number(req.params.id)` yields `NaN` for a non-numeric segment, and
  `NaN` matches nothing in the store — so it falls through to `404`. If a route
  needs to distinguish "not a number" from "no such record", check
  `Number.isInteger()` explicitly and return `400`.

## Tests

- `node:test` with `node:assert`, `supertest` for requests, no other runner.
- `test.beforeEach(() => store.reset())` so each test starts from the seed data.
- Every route gets, at minimum: the happy path, the `400` path, and the `404`
  path.
- Assert the body, not just the status. For errors, assert `res.body.error`.

## Documentation

`docs/api.md` is part of the contract. Adding, removing, or changing an
endpoint's method, path, required fields, or status codes means editing that
file in the same change — not later.
