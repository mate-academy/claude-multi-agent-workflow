---
name: course-api-tests
description: "How to write tests for course-api in the house style: node:test, node:assert and supertest, one file per resource in course-api/tests, store.reset() before each test, flat test() cases, covering success, 400 for bad input and 404 for missing records. Use when adding, writing or fixing tests in course-api."
---

# Writing tests for course-api

1. Put tests in `course-api/tests/`, one file per resource, named `<resource>.test.js` (for example `users.test.js`).
2. Start the file with these imports:
   ```js
   const test = require('node:test');
   const assert = require('node:assert');
   const request = require('supertest');
   const app = require('../server');
   const store = require('../db/store');
   ```
3. Reset the in-memory data before every test: `test.beforeEach(() => store.reset());`
4. Write flat `test()` cases, with no `describe` blocks. Name each one `'METHOD /path does something'`, for example `'GET /users/:id returns 404 for a missing user'`.
5. Make each test `async`, call the app with `request(app)` (`.get`, `.post`, `.put`, with `.send({...})` for bodies), and check results with `assert.equal` and `assert.ok`.
6. For each endpoint, cover:
   - success: the right status (`200` or `201`) and the key fields in `res.body`
   - `400` for bad input, such as missing required fields (the route returns `{ "error": "..." }`)
   - `404` for a missing record, such as id `999`
7. Run the suite with `npm test` from `course-api/` and make sure everything passes before you finish.
