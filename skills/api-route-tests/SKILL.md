---
name: api-route-tests
description: How to write tests for this Express API's routes with node:test and supertest. Use when asked to write, add or fix tests for an endpoint, route or status code.
---
# Testing an API route

1. **File.** One test file per resource: `tests/<resource>.test.js`.
2. **Setup.**
   ```js
   const test = require('node:test');
   const assert = require('node:assert');
   const request = require('supertest');
   const app = require('../server');
   const store = require('../db/store');

   test.beforeEach(() => store.reset());
   ```
   Never start the server with `listen`; supertest takes the app directly.
3. **Cases.** For every endpoint cover at least:
   - the success case (`200`, or `201` for create) and the returned fields;
   - `404` for an id that doesn't exist;
   - `400` for each required field that's missing or invalid.
4. **Assertions.** Check `res.status` first. For errors, assert `typeof res.body.error === 'string'`. Don't assert on exact error wording unless the docs promise it.
5. **Names.** `'<METHOD> <path> <what happens>'`, e.g. `'PUT /users/:id returns 404 for a missing user'`.
6. **Run.** `npm test` must pass before you finish.
