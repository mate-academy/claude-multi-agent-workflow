---
name: api-test-conventions
description: Conventions for writing tests in the course-api Express project. Use when adding or editing files in course-api/tests.
---

# API test conventions

- Use the built-in Node test runner: `const test = require('node:test');` and `const assert = require('node:assert');`.
- Call the API over HTTP with supertest: `const request = require('supertest');` and the exported `app` from `../server`.
- Reset the data store before each test the same way the existing tests in `tests/users.test.js` do, so every test starts from the seeded data.
- Use flat top-level `test()` calls, no `describe` blocks.
- Name each test as a short sentence: method, path and expected outcome, for example `GET /users/:id returns 404 for a missing user`.
- One request per test; assert the status code first, then the body.
- Cover success, not-found (404) and invalid-input cases for every endpoint.
- Never leave `test.only` or `debugger` in committed tests.
- Run everything with `npm test` inside `course-api`.
