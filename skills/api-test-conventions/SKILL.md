---
name: api-test-conventions
description: Conventions for writing tests in the course-api Express project (node:test, supertest, store reset, documented status codes and error shape). Use when adding or editing files under course-api/tests/.
---

# course-api test conventions

Source of truth: course-api/docs/api.md (contract) and course-api/CLAUDE.md (conventions). When they disagree with the current code, the contract wins, and the disagreement is reported, not silently matched.

## Stack
- Runner: Node's built-in `node:test` with `node:assert`. Run with `npm test` in course-api/.
- HTTP: `supertest` against `require('../server')`. server.js exports the app and does not listen when required.
- Lint: `npm run lint` covers `tests/`. Keep the file ESLint-clean (no unused variables).

## Structure
- One file per resource under course-api/tests/, for example `users.test.js`.
- Start the file with `test.beforeEach(() => store.reset())`, using `require('../db/store')`. Each test starts from the seed data.
- Name each test after the behaviour: `POST /users returns 400 when email is missing`.

## Assertions
- Check the status code first, then the body.
- Error responses must match the documented shape `{ "error": "message" }`. Assert `res.body.error` is a string when the contract documents an error.
- `404` is for a missing record. `400` is for bad input. Use the code the contract names; do not infer a different one.
- Do not assert on incidental details the contract does not promise (exact ids for new records, timestamps, uptime values).

## What not to do
- Do not change an expected value to match a current bug.
- Do not delete or weaken an existing assertion to get a green run.
- Do not edit files outside course-api/tests/ while writing tests.
