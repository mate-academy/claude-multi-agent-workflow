---
name: api-test-conventions
description: How to write tests for this Express API with node:test and supertest. Use when asked to write, add, or fix a test for an endpoint or route, or to cover a status code or error case.
---

# Writing endpoint tests

1. **File.** One file per resource: `tests/<resource>.test.js`. If the file already exists, add to it.
2. **Imports.** Use exactly:
   ```js
   const test = require('node:test');
   const assert = require('node:assert');
   const request = require('supertest');
   const app = require('../server');
   const store = require('../db/store');

   test.beforeEach(() => store.reset());
   ```
3. **Naming.** `test('<METHOD /path> <expected behaviour>', async () => { ... })`, e.g. `POST /users returns 400 when email is missing`.
4. **Coverage per endpoint.** Write one success test, plus one test for every error status the route can return (400, 404, ...).
5. **Assertions.**
   - Always assert `res.status` first.
   - On success, assert the fields of `res.body` that matter.
   - On errors, assert `typeof res.body.error === 'string'`. The error shape is `{ "error": "message" }`.
6. **Isolation.** Never depend on another test's state. Start from the seed data that `store.reset()` restores.
7. **Run.** Run `npm test` and confirm it passes before reporting.
