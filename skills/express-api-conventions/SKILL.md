---
name: express-api-conventions
description: Conventions for this Express API — error response shape, status codes, where validation belongs, and how routes talk to the data store. Use when writing or reviewing a route handler, a store function, or an API test, when deciding which status code an endpoint should return, or when judging whether existing API code follows the house style.
---

# Express API conventions

The rules this codebase is held to. Apply them when writing new API code, and
judge existing code against them when reviewing. If a project's own `CLAUDE.md`
contradicts anything here, the project's file wins — read it first.

## Error responses

Every error response is JSON in exactly this shape, and nothing else:

```json
{ "error": "User not found" }
```

- One key, `error`, holding a human-readable sentence.
- Never a bare string, never `{ "message": ... }`, never an empty body.
- The message says what is wrong in the caller's terms, not in the code's terms.
  `"name and email are required"` — not `"validation failed at line 24"`.
- Never leak a stack trace, a SQL fragment, or an internal path to the client.

## Status codes

| Code | When |
|---|---|
| `200` | A successful read or update, with the resource in the body |
| `201` | A successful create, with the newly created resource in the body |
| `400` | The request itself is malformed — missing field, wrong type, bad range |
| `404` | The request is well formed but the record does not exist |
| `500` | Something broke on our side — never used to report bad input |

The distinction between `400` and `404` matters and is easy to get wrong.
`400` means *you asked wrongly*. `404` means *you asked correctly for something
that is not here*. A non-numeric id is `400`. A well-formed id with no matching
record is `404`.

## Where validation belongs

Validation happens **in the route handler, before the store is called**. The
store trusts its inputs; the route is the boundary that makes that safe.

```js
router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = store.createUser({ name, email });
  return res.status(201).json(user);
});
```

Validate presence, then type, then range. Coerce ids with `Number(...)` and
reject the result if it is not a finite number before passing it on.

## Routes and the store

- One route file per resource, exporting an Express router, mounted in
  `server.js` under its base path.
- **All** data access goes through the store module. A route never holds an
  array, a counter, or a cache of its own — if a route keeps state, that state
  belongs in the store.
- The store owns id generation and persistence details. Routes never invent ids.
- A store lookup that finds nothing returns `undefined` — it does not throw and
  it does not know about HTTP. Turning that into a `404` is the route's job.

## Route handler shape

- Return early on every error branch — `return res.status(...).json(...)`.
  Forgetting the `return` causes a second write to the same response.
- The happy path is the last statement in the handler, not nested inside an
  `else`.
- Keep handlers thin. Logic worth more than a few lines belongs in the store or
  a helper, where it can be tested without HTTP.

## Tests

- Tests live in `tests/`, run with the project's own test command, and exercise
  the app through HTTP rather than calling handlers directly.
- One behaviour per test, named after the behaviour — `GET /users/:id returns
  404 for a missing user`, not `test user 2`.
- Assert both the status code and the response body shape. A test that checks
  only the status will not notice that the error key was renamed.
- Cover the failure branches, not only the happy path. Every `400` and `404`
  a handler can produce deserves its own test.
