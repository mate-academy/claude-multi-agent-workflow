---
name: api-test-conventions
description: Conventions for writing tests for an Express API with node:test and supertest — use when adding, fixing, or reviewing tests in tests/*.test.js, or when asked "how should I test this endpoint?".
---

# API test conventions

Use these rules whenever you write or edit tests for an Express API in this style (e.g. `course-api/`).

## Stack
- Runner: Node's built-in `node:test` (`npm test` → `node --test`). No Jest/Mocha.
- Assertions: `node:assert`.
- HTTP: `supertest` against the exported `app` from `server.js` — never call `app.listen()` in tests.

## File layout
- One file per resource: `tests/<resource>.test.js` (e.g. `tests/users.test.js`).
- Reset state before every test so tests are independent:

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());
```

## Writing a test
- One behaviour per `test(...)`; name it as `"<METHOD> <path> <expected outcome>"`,
  e.g. `'POST /users returns 400 when email is missing'`.
- Always assert the status code first, then the body.
- For error responses assert the JSON shape: `assert.ok(res.body.error)`.

## What to cover for each endpoint
| Case | Expected |
|---|---|
| Happy path | 200 / 201 with the record |
| Missing required field(s) | 400 + `{ error }` |
| Unknown id | 404 + `{ error }` |
| Non-numeric id (`/users/abc`) | 404 (or 400 if the route validates) |
| Partial update (PUT with one field) | other fields unchanged |

## Known-bug policy
If a correct test fails because the app is wrong, mark it `{ todo: 'reason' }` instead of
weakening the assertion, and report it.
