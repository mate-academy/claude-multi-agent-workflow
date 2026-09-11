---
name: express-api-conventions
description: Conventions and checklist for Express API routes — use when adding a new endpoint or resource, changing a route's validation or status codes, deciding between 400 and 404, shaping error responses, or checking that a route change comes with tests and API docs.
---

# Express API conventions

Follow these conventions whenever you add or change a route in an Express API. If the project's `CLAUDE.md` says something different, the project wins.

## Structure

- **One router per resource**: `routes/<resource>.js` exports an `express.Router()`.
- **Mount in `server.js`** under the resource's base path: `app.use('/<resource>', <resource>Router)`.
- **All data access goes through `db/store.js`.** Routes call store helpers and never keep arrays, counters or other state themselves. New data operations become new exported store functions.
- `server.js` exports `app` and only calls `listen()` when `require.main === module`, so tests can import it.

## Request handling

Do things in this order in every handler, and `return` every response:

1. **Validate path params.** An id must be a positive integer written as plain digits: `/^[1-9]\d*$/`. Anything else is bad input and returns `400`. That includes `abc`, `0`, `-1`, `1.0`, `0x1` and `1e0`. Don't pass the raw param straight to `Number()`: `Number('abc')` is `NaN`, which becomes a misleading `404`, and `Number('0x1')` is `1`, which silently loads the wrong record.
2. **Validate the body.** Check that fields are present **and** have the right type. `!name` catches missing or empty values but lets `123` or `{}` through. For string fields, use `typeof x === 'string' && x.trim() !== ''`.
3. **Call the store.**
4. **Respond.**

| Situation | Status | Body |
|---|---|---|
| Read OK | `200` | the resource or array |
| Created | `201` | the created resource |
| Malformed path param (`abc`, `0`, `1.0`, `0x1`) | `400` | `{ "error": "id must be a positive integer" }` |
| Missing or invalid body field | `400` | `{ "error": "<field> is required" }` |
| Well-formed id, no such record | `404` | `{ "error": "<Resource> not found" }` |

- Error bodies are always `{ "error": "message" }`: one key, a human-readable message, no stack traces.
- **`400` means the request is wrong; `404` means the request is valid but the record doesn't exist.** All validation (params, then body) happens before the lookup. A `PUT` with an empty body to a missing id returns `400`.

## Route template

```js
const express = require('express');
const store = require('../db/store');

const router = express.Router();

// Accept only positive integers written as plain digits ("1", "42").
// Returns null for "abc", "0", "-1", "1.0", "0x1", "1e0".
function parseId(raw) {
  return /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

// POST /widgets — create a widget. Requires name.
router.post('/', (req, res) => {
  const { name } = req.body;
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  const widget = store.createWidget({ name });
  return res.status(201).json(widget);
});

// GET /widgets/:id — fetch one widget; 400 for a malformed id, 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }
  const widget = store.getWidget(id);
  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }
  return res.json(widget);
});

module.exports = router;
```

## Tests

Every route change needs tests in `tests/<resource>.test.js` using `node:test`, `node:assert` and `supertest`, with `store.reset()` in `beforeEach`. Cover:

- the success path, checking both status and body
- every `400` branch: missing fields, wrong types, and malformed ids (`abc`, `0`, `1.0`, `0x1`)
- every `404` branch: a well-formed id that doesn't exist (e.g. `999`)
- that the error body has an `error` string
- for writes, that a follow-up `GET` sees the change

## Done checklist

- [ ] Router exported and mounted in `server.js`
- [ ] No state in the route file; new data operations are in `db/store.js` (and `reset()` still restores seed data)
- [ ] Path params validated (`400` when malformed) before any lookup
- [ ] Body checked for both presence and type; every response is `return`ed
- [ ] Status codes and error bodies match the table above
- [ ] Tests cover success, `400` (including malformed ids) and `404`
- [ ] `docs/api.md` updated with the endpoint, body and status codes
- [ ] `npm run lint` and `npm test` pass
