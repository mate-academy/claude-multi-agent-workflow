---
name: express-api-conventions
description: Load before writing or changing an Express route handler, a store function, or a supertest test in this codebase — gives the house templates and pre-merge checklist so new code matches existing conventions instead of re-deriving them.
---

# Express API conventions

This project (`course-api/`, and any Express service that follows the same shape) has a small,
consistent set of conventions. Use these templates instead of guessing a shape.

## Route handler template

```js
router.get('/:id', (req, res) => {
  const record = store.getThing(Number(req.params.id));
  if (!record) {
    return res.status(404).json({ error: 'Thing not found' });
  }
  return res.json(record);
});

router.post('/', (req, res) => {
  const { field } = req.body;
  if (!field) {
    return res.status(400).json({ error: 'field is required' });
  }
  const record = store.createThing({ field });
  return res.status(201).json(record);
});
```

Rules encoded above:
- Validate input in the route; bad input is `400`, a missing record is `404`.
- Error bodies are always `{ "error": "message" }` — never a bare string, never a stack trace.
- All reads and writes go through the store module (e.g. `db/store.js`); a route never holds
  its own state.
- A store function that returns a collection must return a **copy**, not a live reference —
  callers should not be able to mutate internal state by mutating the return value.

## Test template

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('METHOD /path/:id returns 404 for a missing record', async () => {
  const res = await request(app).get('/things/999');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Thing not found');
});
```

One `test(...)` per outcome branch, reset the store in `beforeEach`, assert both status and the
shape of the body — not just status.

## Pre-merge checklist

- [ ] Every new/changed route validates input and returns `400` on bad input.
- [ ] Every id-lookup route returns `404` when the record is missing.
- [ ] Every error response is `{ "error": "message" }` via `res.status(...).json(...)`.
- [ ] No route reads or writes state outside the store module.
- [ ] Every new outcome branch has a matching test.
- [ ] `npm test` and `npm run lint` both pass from the API's own directory.
