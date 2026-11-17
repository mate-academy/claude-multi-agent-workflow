---
name: api-tests
description: Use when writing, adding or fixing tests for an Express API endpoint (e.g. "add tests for PUT /users/:id", "test the 404 case", "why is this supertest test flaky?"). Covers the node:test + supertest pattern, resetting the in-memory store between tests, one test per status code, and asserting the { error } response shape. Not for application code changes or non-HTTP unit tests.
---

# Testing Express API endpoints

These are the conventions the `api-quality` plugin uses for API tests. Follow them whenever you add or change a test for an HTTP endpoint.

## File layout
- One test file per resource: `tests/<resource>.test.js`, next to the existing ones.
- Use Node's built-in runner, not Jest or Mocha:
  ```js
  const test = require('node:test');
  const assert = require('node:assert');
  const request = require('supertest');
  const app = require('../server');
  const store = require('../db/store');

  test.beforeEach(() => store.reset());
  ```
- `server.js` exports the app without calling `listen` when imported, so supertest needs no port.

## What to test
- **One test per status code** a handler can return: the success code (`200`/`201`/`204`), every `400` branch (missing field, empty string, wrong type), and the `404`.
- Name tests `METHOD /path <expected outcome>`, e.g. `'POST /users returns 400 when email is missing'`.
- Use seeded ids (`1`, `2`) for existing records and a large id (`999`) for missing ones. Never rely on records created by another test; `store.reset()` runs before each test.

## What to assert
- Always the status: `assert.equal(res.status, 404)`.
- For errors, the shape: `assert.equal(typeof res.body.error, 'string')`.
- For success, the fields that changed, e.g. `assert.equal(res.body.name, 'Ada L.')`. For creates, also assert that `res.body.id` exists.
- For deletes, assert `204` and then that a follow-up `GET` returns `404`.

## Known bugs
If the correct behaviour differs from what the code currently does, don't write a passing test for the current behaviour. Use `test.todo('<name>')` with a comment describing the expected result, so the bug is recorded but the suite stays green.

## Run
`npm test` runs the whole suite, and `node --test tests/<file>` runs a single file.
