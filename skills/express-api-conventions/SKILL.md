---
name: express-api-conventions
description: House conventions for small Express REST APIs and their tests — route layout, validation, status codes, error shape, store access, and the node:test + supertest test pattern. Use when writing, reviewing, or testing Express routes, or when adding an endpoint to a project like course-api.
---

# Express API conventions

Apply these rules when you write, review, or test Express route code. If the project has its own `CLAUDE.md`, it wins where the two disagree.

## Layout

- One router file per resource in `routes/` (e.g. `routes/users.js`), exporting an `express.Router()`.
- Mount every router in `server.js` under its base path: `app.use('/users', usersRouter)`.
- `server.js` exports `app` and only calls `listen()` when `require.main === module`, so tests can import it without opening a port.

## Data access

- All reads and writes go through the data helper (e.g. `db/store.js`). Route files hold no state.
- The store exposes a `reset()` used by tests to restore seed data.

## Input validation and status codes

| Situation | Status | Body |
|-----------|--------|------|
| Created | `201` | the created record |
| Read / updated OK | `200` | the record or list |
| Missing or invalid input (incl. non-numeric `:id`) | `400` | `{ "error": "<what is wrong>" }` |
| Record not found | `404` | `{ "error": "<Thing> not found" }` |

- Validate in the route, before calling the store.
- Parse ids with `Number(req.params.id)` and reject `NaN` / non-integers with `400`.
- Check presence with `=== undefined`, not truthiness, when `0` or `""` could be valid; reject empty strings explicitly when they are not.
- Every error body is exactly `{ "error": "message" }` — no other keys, no plain-text errors.

## Tests

Tests use Node's built-in runner and supertest. Copy this shape:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('POST /users returns 400 when email is missing', async () => {
  const res = await request(app).post('/users').send({ name: 'Grace' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'name and email are required' });
});
```

- One behaviour per test; name it `METHOD /path <expected outcome>`.
- Assert the status **and** the body shape (for errors, the `error` key).
- Every endpoint should have at least: one happy-path test, one `400` test per validation rule, and one `404` test if it takes an `:id`.
- Run with `npm test`; lint with `npm run lint`.
