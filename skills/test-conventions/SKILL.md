---
name: test-conventions
description: The house style for writing tests in this repo's course-api — the test runner, the HTTP-test setup, isolation, naming, and what to assert. Load before adding or reviewing a test file so new tests match the ones already there.
---

# Test conventions — course-api

The API under `course-api/` uses Node's built-in test runner. Match the existing suite in
`course-api/tests/users.test.js` exactly.

## Stack

- **Runner:** `node:test` (`const test = require('node:test')`). Run with `npm test`
  (`node --test`) from `course-api/`.
- **Assertions:** `node:assert` — `assert.equal`, `assert.ok`, `assert.deepEqual`. No Chai,
  no Jest.
- **HTTP:** `supertest` against the exported app: `const app = require('../server')`.
  `server.js` only calls `listen()` when run directly, so tests import it without opening a port.

## Isolation

- Reset shared state before every test: `test.beforeEach(() => store.reset())`, where
  `store = require('../db/store')`. `reset()` restores the two seed users.
- Never let one test depend on another's writes. Each test starts from the seed.

## File layout

- One test file per resource: `tests/<resource>.test.js`. Add to the existing file if the
  resource already has one; create the file if it doesn't.
- No shared helpers file yet — keep each test self-contained.

## Naming and shape

- Test name = the behaviour under test, in the form `METHOD /path <expectation>`:
  - `GET /users returns the seeded list`
  - `POST /users creates a user`
  - `PUT /users/:id returns 404 for a missing user`
- One behaviour per test. Assert the status code first, then the body.
- For error cases, assert both the status and the `{ error: '...' }` shape.

## Coverage expectations

For every route, cover:

- the happy path (correct status, correct body);
- each validation branch (`400` — missing or wrong-typed fields);
- the missing-record branch (`404`) where the route looks a record up.

## Rules

- Tests never import or modify route code to pass. If a test can only pass by changing a
  route, the route is wrong — report it, don't paper over it.
- No network, no timers, no sleeps. Every test is synchronous request/response.
