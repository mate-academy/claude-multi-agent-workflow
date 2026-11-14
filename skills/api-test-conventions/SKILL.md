---
name: api-test-conventions
description: How to write and structure tests for a small Express API using Node's built-in test runner and supertest. Use when writing, extending or reviewing API tests, adding tests for a new route, or deciding what a route's tests must cover.
---

# API test conventions

Use these rules for any test of an Express API in this repo (for example `course-api/`). They keep tests fast, isolated and consistent with the existing suite.

## Stack

- Runner: Node's built-in `node:test` (`npm test` runs `node --test`). No Jest or Mocha.
- Assertions: `node:assert`.
- HTTP: `supertest` against the exported `app`. Never call `app.listen()` in a test. `server.js` only listens when run directly.

## File layout

- One test file per resource: `tests/<resource>.test.js` (e.g. `tests/users.test.js`).
- Standard header:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

- `store.reset()` in `beforeEach` is required. Tests must never depend on each other's data.

## What every route needs

For each route, write one test per outcome it can return:

| Outcome | Example |
|---------|---------|
| Happy path | `GET /users/1` returns `200` and the user |
| Created | `POST /users` returns `201` with an `id` |
| Bad input | missing or empty fields return `400` with `{ error }` |
| Missing record | unknown id returns `404` with `{ error }` |
| Odd input | non-numeric id (`/users/abc`), empty strings, extra fields |

## Writing each test

- Name it `'<METHOD> <path> <expected result>'`, e.g. `'PUT /users/:id returns 400 when body is empty'`.
- One behavior per test.
- Always assert the status code. Then assert the part of the body that proves the behavior. For errors, assert `typeof res.body.error === 'string'`.
- For writes, read the record back (through the API or `store`) to confirm the change stuck.
- Use `async`/`await` with supertest. Don't use `done` callbacks.

## When a test exposes a bug

Don't weaken the assertion to make it pass. Keep the correct expectation and mark the test as a todo so the suite stays green:

```js
test('POST /users returns 400 for an empty name', { todo: 'bug: empty string passes validation' }, async () => {
  // ...
});
```

Then report the bug. Fixing source code is a separate change.

## Before you finish

Run `npm test` from the API folder and confirm everything passes (todos allowed).
