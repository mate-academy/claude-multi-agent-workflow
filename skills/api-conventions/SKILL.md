---
name: api-conventions
description: Conventions for the Express API in course-api/ - routes, status codes, error shape, and how to write tests. Use when writing or reviewing routes or tests in course-api/.
---

# API conventions (course-api)

## Structure
- server.js creates the app and mounts one router per resource under its base path (/users, /health).
- routes/<resource>.js exports an Express router. One file per resource.
- db/store.js is the only place that holds data. Routes never keep state themselves.

## Responses
- 200 for a successful read or update, 201 for a successful create.
- 400 when input is invalid (missing or wrong-type fields).
- 404 when a record with the given id does not exist.
- Errors are JSON in the shape: { "error": "message" }

## Tests
- Location: course-api/tests/<resource>.test.js
- Tools: node:test, node:assert, supertest against require('../server').
- Call test.beforeEach(() => store.reset()) so every test starts from the seeded data.
- Name tests as 'METHOD /path expected result', for example 'POST /users returns 400 when name is missing'.
- For every endpoint cover: the success case, 400 for invalid input (if it takes input), 404 for a missing id (if it takes an id).
- Run: cd course-api && npm test

## Checklist for a new endpoint
1. Add the handler in routes/<resource>.js, read and write data only through db/store.js.
2. Validate input and return 400 / 404 with { "error": "..." }.
3. Add tests for success, 400 and 404.
4. Run npm test and npm run lint.
