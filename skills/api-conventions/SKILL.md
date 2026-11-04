---
name: api-conventions
description: Use when adding or changing an Express route in course-api, to follow the project's routing, validation, error and testing conventions.
---

# API conventions checklist

- One route file per resource in `routes/`, exporting a router, mounted in `server.js` under its base path.
- All data access goes through `db/store.js`; routes never hold state.
- Validate input in the route: `400` for bad input, `404` for a missing record.
- Errors are JSON: `{ "error": "message" }`.
- Every route gets tests in `tests/`.

## Test template

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /things/:id returns 404 for a missing record', async () => {
  const res = await request(app).get('/things/999');
  assert.equal(res.status, 404);
});
```
