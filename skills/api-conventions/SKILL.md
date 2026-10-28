---
name: api-conventions
description: Use when writing, reviewing, or testing Express API routes to check them against the project's route, validation, and error-shape conventions.
---

# API conventions

- One route file per resource in `routes/`, exporting an Express router, mounted in `server.js` under its base path.
- All data access goes through `db/store.js`; routes never hold state.
- Validate input in the route and return `400` on bad input; return `404` when a record is missing.
- Error responses are JSON: `{ "error": "message" }`.

## Review checklist
- [ ] Every handler validates required body fields before touching the store
- [ ] Missing records return 404, bad input returns 400, creates return 201
- [ ] Every error body is `{ "error": "..." }`
- [ ] No module-level state in route files

## Test template
```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /things/:id returns 404 for a missing thing', async () => {
  const res = await request(app).get('/things/999');
  assert.equal(res.status, 404);
});
```
