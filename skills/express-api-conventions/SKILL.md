---
name: express-api-conventions
description: The house rules for this Express API - how to add or change a route, where state is allowed to live, the required error body shape, which status code each situation gets, and how the tests are written. Load this before adding an endpoint, changing a handler, touching the data store, or writing route tests, so the new code matches the code already here.
---

# Express API conventions

These are the rules the API in this repo already follows. Match them; do not
introduce a second style alongside them.

## Adding a route

1. One file per resource in `routes/`, named after the resource in plural
   (`users.js`, `orders.js`). Each file creates an `express.Router()`, attaches its
   handlers, and exports the router with `module.exports = router`.
2. Mount it in `server.js` under its base path: `app.use('/orders', ordersRouter)`.
   Paths inside the router are relative to that mount, so the collection route is
   `router.get('/')`, not `router.get('/orders')`.
3. Document it in `docs/api.md` in the same pass — method, path, required body
   fields, and every status code it can return. A route that ships undocumented is
   an incomplete change.

## State

All reads and writes go through `db/store.js`. A route never declares its own array,
counter, cache, or module-level `let`. When a route needs an operation the store
does not have, add a named helper to the store and export it, rather than reaching
around it. The point is that swapping the in-memory store for a real database later
touches exactly one file.

Store helpers return the record, or `undefined` when there is nothing to return —
they never send responses and never throw for a missing record. Deciding what a
missing record means is the route's job.

## Status codes

| Situation | Code |
| --- | --- |
| Success | `200` |
| Created a record | `201` with the created record as the body |
| Missing, malformed, or empty input | `400` |
| No record with that id | `404` |

Validate before you touch the store. Check every field the handler reads off
`req.body`, and remember that `Number(req.params.id)` yields `NaN` for a
non-numeric id — that is a `400`, not a `404`. For a partial update, a body with
none of the updatable fields is a `400`.

## Error responses

Every error body is JSON in exactly this shape, with a short human-readable message:

```json
{ "error": "name and email are required" }
```

No bare strings, no empty bodies, no stack traces, no extra envelope fields. Return
on every branch that responds, so a handler can never respond twice.

## Tests

Tests live in `tests/<resource>.test.js` and run on Node's built-in test runner with
`supertest` driving the exported app — `npm test` runs them. Follow the existing
pattern:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

`server.js` only calls `listen()` when it is the main module, so importing it in a
test opens no port. Reset the store before each test with the hook above; never let
one test depend on another's data. Assert on both the status code and the response
body, and keep one behaviour per test. Add no new dependencies — use what
`package.json` already has.

## Before calling a change done

- `npm test` passes.
- `npm run lint` is clean.
- `docs/api.md` matches the routes that now exist.
