---
name: route-conventions
description: The full checklist behind course-api's conventions (status codes, input validation, error shape, common route bugs, and test coverage expectations). Use when reviewing, writing, or testing an Express route handler in course-api/, as the detailed companion to course-api/CLAUDE.md's summary.
---

`course-api/CLAUDE.md` states the conventions in one line each. This is the
checklist behind them — what to actually look for.

## Status codes

- `200` — successful read/update. `201` — successful create.
- `400` — the request itself is bad: missing required field, wrong type,
  invalid value. Check this _before_ touching `db/store.js`.
- `404` — the request is well-formed but the record doesn't exist. Only
  reachable after an existence check.
- Never let an unhandled error fall through to Express's default `500`
  for a condition the route could have anticipated (missing field, missing
  record). A `500` here is itself a bug.

## Validation

- Validate required fields exist and are the right type before any store
  call — reject with `400` immediately, don't let bad data reach
  `db/store.js` and fail there instead.
- Validate the resource exists (store lookup) before update/delete —
  reject with `404` before mutating anything.
- Don't trust a client-supplied ID's type — coerce/check it explicitly
  rather than letting a loose `==` or implicit coercion paper over a
  string-vs-number mismatch.

## Error shape

Every error response, everywhere, is:

```json
{ "error": "message" }
```

The message should be specific enough to act on ("id is required") without
leaking internals (no stack traces, no raw exception messages).

## Common bugs to check for

- Missing `return` after sending a response — a handler that keeps
  executing (and can send a second response) after `res.json(...)` or
  `res.status(...).send(...)`.
- Mutating `req.body` or a fetched record directly instead of going
  through `db/store.js`.
- An update/delete route that doesn't check the record exists first.
- Off-by-one or wrong-field bugs when mapping request fields to the
  stored shape.

## Test coverage expectations

When writing or updating a test file under `course-api/tests/`:

- Match the existing style: Node's built-in test runner + `supertest`
  against the exported `app` (never start a real listener — `server.js`
  only calls `.listen()` when run directly, so tests can import it safely).
- Cover, at minimum: the main success path, a `400` case (bad/missing
  input), and a `404` case (missing record) for any route that supports
  lookup by ID.
- Each test should assert both the status code and the response body
  shape — a passing status with the wrong body is still a bug.
