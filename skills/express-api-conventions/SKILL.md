---
name: express-api-conventions
description: Conventions for writing and testing routes in this Express API (status codes, error shape, store access, supertest test style). Use when adding or changing a route, or writing tests for one.
---
# Express API conventions

## Routes
- One file per resource in `routes/`, exporting an `express.Router()`; mount it in `server.js` under its base path.
- Never keep state in a route. Read and write only through `db/store.js`.
- Validate input at the top of the handler:
  - bad or missing input → `400`;
  - record not found → `404`;
  - created → `201` with the new record; otherwise `200`.
- Every error body is JSON shaped `{ "error": "message" }`.
- Parse ids with `Number(req.params.id)` and reject `NaN` with `400`.

## Tests
Use Node's built-in runner and supertest:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users/abc returns 400', async () => {
  const res = await request(app).get('/users/abc');
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});
```

- Name each test `METHOD /path <condition> returns <status>`.
- Assert the status first, then the body shape. For errors, assert `res.body.error` is present.
- One file per resource: `tests/<resource>.test.js`.
- Run with `npm test`; lint with `npm run lint`.
