---
name: api-test-conventions
description: How to write tests for a Node.js/Express API that uses node:test and supertest — file layout, store reset, naming, and which cases (happy path, 400, 404) every endpoint needs. Use when asked to write, add, fix or structure tests for an Express endpoint or route (e.g. "add a test for PUT /users/:id", "test the 404 case"). Not for front-end, unit tests of non-HTTP code, or other test frameworks like Jest.
---

# Express API test conventions

Use these conventions for HTTP-level tests in projects whose `package.json` has `"test": "node --test"` and `supertest` in its devDependencies.

## File layout

- One file per resource: `tests/<resource>.test.js` (e.g. `tests/users.test.js` for `routes/users.js`).
- Add to the existing file for that resource rather than starting a new one.

## Skeleton

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');      // server.js exports the app without listening
const store = require('../db/store');

test.beforeEach(() => store.reset()); // every test starts from the seed data
```

- Import the **app**, never a running server. `server.js` only calls `listen()` when it's run directly.
- Always call `store.reset()` in `beforeEach`. Tests must not depend on each other's writes.

## Naming

Name each test `'<METHOD> <path> <expected result>'`, for example:
`'POST /users returns 400 when email is missing'` or `'GET /users/:id returns 404 for a missing user'`.

## Which cases to cover

For every endpoint:

| Case | When | Assert |
|---|---|---|
| Happy path | always | the status (`200`, `201` for create, `204` for delete) and key body fields |
| `400` | the handler validates input | the status, and that `typeof res.body.error === 'string'` |
| `404` | the handler looks up a record by id | the status, and that `res.body.error` is set |

Use ids that clearly don't exist (`999`) for 404 cases. For write endpoints, check the store changed too, e.g. a `GET` after a `POST`.

## Assertions

- Use `assert.equal` for scalars, `assert.deepEqual` for objects, and `assert.ok` for presence.
- Test current behaviour. If a test exposes a bug, report it rather than asserting the buggy output or changing the app.

## Run

`npm test` (and `npm run lint` if the script exists) must pass before you're done.
