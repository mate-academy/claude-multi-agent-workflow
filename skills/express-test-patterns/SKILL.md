---
name: express-test-patterns
description: Conventions and edge cases for writing node:test + supertest tests against this project's Express API. Use when adding, reviewing, or fixing tests under course-api/tests/ so new tests match the existing style and actually cover the behavior the routes promise.
---

# Express test patterns for course-api

This project tests routes with Node's built-in `node:test` runner and `supertest`, against the in-memory store in `db/store.js`. Follow these patterns so new tests read like the existing ones.

## Structure

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /users returns the seeded list', async () => {
  const res = await request(app).get('/users');
  assert.equal(res.status, 200);
});
```

- Always reset the store in `test.beforeEach` — tests must not depend on order or leak state.
- One `test(...)` per behavior, named as `METHOD /path — what it asserts`.
- Assert both the status code and the meaningful parts of the response body — a status-only test is not enough.

## What to cover for every route

For each route (existing or new), write tests for:

1. **Happy path** — valid input, expected status (`200`/`201`), expected body shape.
2. **Missing/invalid input** — the project convention is `400` with `{ "error": "message" }`; test every required field being absent, not just all of them at once.
3. **Missing record** — `404` with `{ "error": "message" }` when an id doesn't exist (use an id like `999` that `store.reset()` never seeds).
4. **Type edge cases** — non-numeric ids in `:id` params, empty string fields, extra unexpected fields in the body.
5. **Side effects** — a `POST`/`PUT` test should also confirm the change is visible on a follow-up `GET`, not just trust the response body.

## What NOT to do

- Don't mock `db/store.js` — it's in-memory and fast; test through the real store so a broken store bug would actually fail a test.
- Don't restructure or rename existing passing tests just to add a new one nearby.
- Don't weaken an assertion to make a newly-written test pass — if a test fails because the route is actually broken, that's a bug to report, not a test to soften.
