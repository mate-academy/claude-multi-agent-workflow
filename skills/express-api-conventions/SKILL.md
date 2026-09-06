---
name: express-api-conventions
description: The conventions this Express API is held to — routing, state through the store, 400/404 rules, and the { "error" } response shape. Use when writing, reviewing, or testing a route, a store helper, or an error path in the course API.
---

# Express API conventions

The rules of record for this codebase. `CLAUDE.md` states them; this skill is how to apply them.

## Layout

| Concern | Lives in | Rule |
| --- | --- | --- |
| App wiring | `server.js` | Creates the app, mounts each router under its base path, listens only when run directly. |
| Requests | `routes/<resource>.js` | One file per resource, exports an Express router. Validation lives here. |
| State | `db/store.js` | The only module that owns data. Every route reads and writes through its helpers. |
| Tests | `tests/<resource>.test.js` | `node:test` + `supertest`, reset the store in `beforeEach`. |

A new resource is three edits: the route file, the mount line in `server.js`, the test file.
If a change needs a fourth place, that is a design smell worth naming.

## Status codes

- `400` — the request is malformed: a required field is missing, or an update names no fields at
  all. Check this **before** calling the store.
- `404` — the request is well-formed but the record does not exist. The store returns `undefined`;
  the route turns that into `404`.
- `201` — a resource was created. Return the created object.
- `200` — everything else that succeeded.

Never let an unknown id fall through to `200` with an empty body, and never let it reach a `500`.

## Error shape

Every failure response, without exception:

```json
{ "error": "name and email are required" }
```

Lowercase, specific, no trailing period, no stack traces, no error codes, no arrays. A client
should be able to read `body.error` and show it. Consistency here is the contract in
`docs/api.md` — breaking it is a bug, not a style choice.

## The id trap

`req.params.id` is always a string. The store compares ids with `===` against numbers:

```js
const user = store.getUser(Number(req.params.id));   // right
const user = store.getUser(req.params.id);           // always undefined → 404 for everything
```

Any new route that looks a record up by id needs the `Number()` conversion. This is the single
most repeated bug in this codebase.

## Writing a route

```js
router.put('/:id', (req, res) => {
  const { name, email } = req.body;
  if (name === undefined && email === undefined) {
    return res.status(400).json({ error: 'name or email is required' });  // validate first
  }
  const user = store.updateUser(Number(req.params.id), { name, email });  // then the store
  if (!user) {
    return res.status(404).json({ error: 'User not found' }); // undefined → 404
  }
  return res.json(user);                                      // one return per path
});
```

Every path ends in an explicit `return`, so no handler can accidentally send twice.

## Before you call it done

- Validation returns `400` and runs before any store call.
- A missing record returns `404` with `{ "error": ... }`.
- Ids are converted with `Number()`.
- The route is mounted in `server.js`.
- `docs/api.md` describes the endpoint's success and failure responses.
- `npm test` and `npm run lint` both pass.
