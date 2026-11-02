---
name: quality-conventions
description: Use when reviewing or writing Express API code or tests, to apply the project's route, validation, error-response and testing conventions.
---

# Quality conventions

Apply these rules when judging or writing code in an Express API like `course-api/`.

## Routes
- One route file per resource, mounted in `server.js` under its base path.
- All data access goes through `db/store.js`. Routes never hold state.

## Validation and errors
- Validate input in the route; respond `400` for bad input and `404` for a missing record.
- Error bodies are always JSON: `{ "error": "message" }`.

## Tests
- Use Node's built-in test runner with supertest; one test file per resource in `tests/`.
- Every route needs a happy-path test plus a test for each 400 and 404 branch.
- Tests must not depend on each other's data; reset or create what they need.

## Review severity
- **High:** wrong status codes, unvalidated input, state held in routes, crashes.
- **Medium:** inconsistent error shape, missing 404 handling.
- **Low:** naming and minor cleanups.
