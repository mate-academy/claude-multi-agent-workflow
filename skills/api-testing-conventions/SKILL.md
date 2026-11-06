---
name: api-testing-conventions
description: Use when writing or reviewing tests for the Express course API, or when asked how tests in this project should look.
---

# API testing conventions

Tests for the course API follow the pattern already used in `course-api/tests/users.test.js`.

## Setup

- Use Node's built-in runner: `const test = require('node:test');` and `node:assert`.
- Use `supertest` against the exported app: `request(app).get('/users')`. Never start the server on a port.
- Reset state before each test with `test.beforeEach(() => store.reset());` so tests don't depend on each other.

## Naming

Name each test after the request and the outcome: `GET /users/:id returns 404 for a missing user`.

## What to cover for each route

- the success case, with the status code and the shape of the body
- bad input returns `400` with `{ "error": "message" }`
- a missing record returns `404` with `{ "error": "message" }`

Assert on the status code first, then on the body.

## Running

From `course-api/`, `npm test` runs the suite and `npm run lint` lints it. Both must pass before a change is done.
